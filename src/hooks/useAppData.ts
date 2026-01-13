import { useLocalStorage } from './useLocalStorage';
import { Habit, HabitLog, Goal, Task, Settings, Category } from '@/types';
import { useEffect } from 'react';

const defaultSettings: Settings = {
  theme: 'light',
  startOfDay: '06:00',
  weekStartDay: 0,
  defaultReminderTime: '09:00',
  streakReminders: true,
  dailySummary: true,
  showStreaks: true,
  notificationsEnabled: false,
};

export function useAppData() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('habits', []);
  const [habitLogs, setHabitLogs] = useLocalStorage<HabitLog[]>('habitLogs', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [settings, setSettings] = useLocalStorage<Settings>('settings', defaultSettings);
  const [customCategories, setCustomCategories] = useLocalStorage<Category[]>('customCategories', []);

  // Generate unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Get today's date string
  const getTodayString = () => new Date().toISOString().split('T')[0];

  // Habit functions
  const addHabit = (habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'bestStreak' | 'archived'>) => {
    const newHabit: Habit = {
      ...habit,
      id: generateId(),
      createdAt: new Date().toISOString(),
      currentStreak: 0,
      bestStreak: 0,
      archived: false,
    };
    setHabits([...habits, newHabit]);
    return newHabit;
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(habits.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const archiveHabit = (id: string) => {
    updateHabit(id, { archived: true });
  };

  const logHabit = (habitId: string, state: 'done' | 'skipped' | 'missed', date?: string) => {
    const dateStr = date || getTodayString();
    const existingLog = habitLogs.find(l => l.habitId === habitId && l.date === dateStr);
    
    if (existingLog) {
      setHabitLogs(habitLogs.map(l => 
        l.id === existingLog.id ? { ...l, state } : l
      ));
    } else {
      const newLog: HabitLog = {
        id: generateId(),
        habitId,
        date: dateStr,
        state,
      };
      setHabitLogs([...habitLogs, newLog]);
    }

    // Update streak
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      if (state === 'done' || state === 'skipped') {
        const newStreak = habit.currentStreak + (state === 'done' ? 1 : 0);
        updateHabit(habitId, {
          currentStreak: newStreak,
          bestStreak: Math.max(habit.bestStreak, newStreak),
        });
      } else if (state === 'missed') {
        updateHabit(habitId, { currentStreak: 0 });
      }
    }
  };

  const getHabitLogForDate = (habitId: string, date: string) => {
    return habitLogs.find(l => l.habitId === habitId && l.date === date);
  };

  // Goal functions
  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'completed' | 'currentProgress' | 'linkedHabitIds' | 'linkedTaskIds'>) => {
    const newGoal: Goal = {
      ...goal,
      id: generateId(),
      createdAt: new Date().toISOString(),
      completed: false,
      currentProgress: 0,
      linkedHabitIds: [],
      linkedTaskIds: [],
      autoTrack: goal.autoTrack ?? true,
    };
    setGoals([...goals, newGoal]);
    return newGoal;
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(goals.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  // Link habit to goal
  const linkHabitToGoal = (habitId: string, goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal && !goal.linkedHabitIds.includes(habitId)) {
      updateGoal(goalId, { linkedHabitIds: [...goal.linkedHabitIds, habitId] });
      updateHabit(habitId, { linkedGoalId: goalId });
    }
  };

  // Link task to goal
  const linkTaskToGoal = (taskId: string, goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal && !goal.linkedTaskIds.includes(taskId)) {
      updateGoal(goalId, { linkedTaskIds: [...goal.linkedTaskIds, taskId] });
      updateTask(taskId, { linkedGoalId: goalId });
    }
  };

  // Auto-track goal progress based on linked habits and tasks
  const calculateGoalProgress = (goal: Goal): number => {
    if (!goal.autoTrack) return goal.currentProgress;
    
    const linkedHabitsProgress = goal.linkedHabitIds.length > 0
      ? goal.linkedHabitIds.reduce((sum, habitId) => {
          const habit = habits.find(h => h.id === habitId);
          const todayLog = habitLogs.find(l => l.habitId === habitId && l.date === getTodayString());
          return sum + (todayLog?.state === 'done' ? 1 : 0);
        }, 0) / goal.linkedHabitIds.length
      : 0;

    const linkedTasksProgress = goal.linkedTaskIds.length > 0
      ? goal.linkedTaskIds.reduce((sum, taskId) => {
          const task = tasks.find(t => t.id === taskId);
          if (!task) return sum;
          if (task.type === 'one-time') return sum + (task.completed ? 1 : 0);
          return sum + (task.completedDates.includes(getTodayString()) ? 1 : 0);
        }, 0) / goal.linkedTaskIds.length
      : 0;

    const totalItems = goal.linkedHabitIds.length + goal.linkedTaskIds.length;
    if (totalItems === 0) return goal.currentProgress;

    const habitsWeight = goal.linkedHabitIds.length / totalItems;
    const tasksWeight = goal.linkedTaskIds.length / totalItems;

    return Math.round((linkedHabitsProgress * habitsWeight + linkedTasksProgress * tasksWeight) * 100);
  };

  // Update all auto-track goals
  useEffect(() => {
    goals.forEach(goal => {
      if (goal.autoTrack && !goal.completed) {
        const newProgress = calculateGoalProgress(goal);
        if (newProgress !== goal.currentProgress) {
          setGoals(prev => prev.map(g => 
            g.id === goal.id ? { ...g, currentProgress: newProgress } : g
          ));
        }
      }
    });
  }, [habitLogs, tasks]);

  // Category functions
  const addCustomCategory = (category: Category) => {
    setCustomCategories([...customCategories, category]);
  };

  const removeCustomCategory = (id: string) => {
    setCustomCategories(customCategories.filter(c => c.id !== id));
  };

  // Task functions
  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedDates'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString(),
      completed: false,
      completedDates: [],
    };
    setTasks([...tasks, newTask]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const completeTask = (id: string, date?: string) => {
    const dateStr = date || getTodayString();
    const task = tasks.find(t => t.id === id);
    if (task) {
      if (task.type === 'one-time') {
        updateTask(id, { completed: true });
      } else {
        const completedDates = task.completedDates.includes(dateStr)
          ? task.completedDates.filter(d => d !== dateStr)
          : [...task.completedDates, dateStr];
        updateTask(id, { completedDates });
      }
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Get tasks for today
  const getTasksForDate = (date: string) => {
    return tasks.filter(t => {
      if (t.type === 'daily') return true;
      if (t.type === 'one-time' && !t.completed) return true;
      if (t.type === 'monthly' && t.dates?.includes(date)) return true;
      return false;
    });
  };

  // Export/Import data
  const exportData = (format: 'json' | 'csv' = 'json') => {
    const data = {
      habits,
      habitLogs,
      goals,
      tasks,
      settings,
      customCategories,
      exportedAt: new Date().toISOString(),
    };
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tracker-backup-${getTodayString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV export for habits
      const habitsCsv = [
        ['Name', 'Category', 'Difficulty', 'Frequency', 'Current Streak', 'Best Streak', 'Created At'].join(','),
        ...habits.map(h => [
          `"${h.name}"`,
          h.category,
          h.difficulty,
          h.frequency,
          h.currentStreak,
          h.bestStreak,
          h.createdAt
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([habitsCsv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habits-export-${getTodayString()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const importData = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.habits) setHabits(data.habits);
      if (data.habitLogs) setHabitLogs(data.habitLogs);
      if (data.goals) setGoals(data.goals);
      if (data.tasks) setTasks(data.tasks);
      if (data.settings) setSettings(data.settings);
      if (data.customCategories) setCustomCategories(data.customCategories);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  };

  // Restore archived habit
  const restoreHabit = (id: string) => {
    updateHabit(id, { archived: false });
  };

  // Clear all data
  const clearAllData = () => {
    setHabits([]);
    setHabitLogs([]);
    setGoals([]);
    setTasks([]);
    setCustomCategories([]);
    setSettings(defaultSettings);
  };

  return {
    // Data
    habits: habits.filter(h => !h.archived),
    archivedHabits: habits.filter(h => h.archived),
    habitLogs,
    goals,
    tasks,
    settings,
    customCategories,
    // Habit functions
    addHabit,
    updateHabit,
    archiveHabit,
    logHabit,
    getHabitLogForDate,
    // Goal functions
    addGoal,
    updateGoal,
    deleteGoal,
    linkHabitToGoal,
    linkTaskToGoal,
    calculateGoalProgress,
    // Task functions
    addTask,
    updateTask,
    completeTask,
    deleteTask,
    getTasksForDate,
    // Category functions
    addCustomCategory,
    removeCustomCategory,
    // Settings
    setSettings,
    // Data management
    exportData,
    importData,
    restoreHabit,
    clearAllData,
    getTodayString,
  };
}
