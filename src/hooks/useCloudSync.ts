import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Habit, HabitLog, Goal, Task, Settings, Category } from '@/types';
import { toast } from 'sonner';

// Type helpers for database conversions
interface DbHabit {
  id: string;
  user_id: string;
  name: string;
  category: string;
  difficulty: string;
  frequency: string;
  evaluation_type: string;
  specific_days: number[] | null;
  monthly_dates: number[] | null;
  reminder_times: string[] | null;
  notes: string | null;
  archived: boolean;
  current_streak: number;
  best_streak: number;
  linked_goal_id: string | null;
  target_numeric_value: number | null;
  target_timer_value: number | null;
  checklist_items: unknown;
  created_at: string;
}

interface DbHabitLog {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  state: string;
  numeric_value: number | null;
  timer_value: number | null;
  checklist_progress: string[] | null;
}

interface DbGoal {
  id: string;
  user_id: string;
  title: string;
  why: string | null;
  target_date: string;
  tracking_type: string;
  current_progress: number;
  target_value: number | null;
  milestones: unknown;
  linked_habit_ids: string[] | null;
  linked_task_ids: string[] | null;
  completed: boolean;
  category: string | null;
  auto_track: boolean;
  reminder_times: string[] | null;
  created_at: string;
}

interface DbTask {
  id: string;
  user_id: string;
  title: string;
  type: string;
  dates: string[] | null;
  monthly_dates: number[] | null;
  linked_goal_id: string | null;
  completed: boolean;
  completed_dates: string[] | null;
  category: string | null;
  numeric_value: number | null;
  target_numeric_value: number | null;
  reminder_times: string[] | null;
  created_at: string;
}

interface DbSettings {
  id: string;
  theme: string;
  start_of_day: string;
  week_start_day: number;
  default_reminder_time: string;
  streak_reminders: boolean;
  daily_summary: boolean;
  show_streaks: boolean;
  notifications_enabled: boolean;
}

interface DbCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
}

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

export function useCloudSync() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const getTodayString = () => new Date().toISOString().split('T')[0];

  // Convert DB habit to app habit
  const dbToHabit = (db: DbHabit): Habit => ({
    id: db.id,
    name: db.name,
    category: db.category,
    difficulty: db.difficulty as Habit['difficulty'],
    frequency: db.frequency as Habit['frequency'],
    evaluationType: db.evaluation_type as Habit['evaluationType'],
    specificDays: db.specific_days || undefined,
    monthlyDates: db.monthly_dates || undefined,
    reminderTimes: db.reminder_times || undefined,
    notes: db.notes || undefined,
    archived: db.archived,
    createdAt: db.created_at,
    currentStreak: db.current_streak,
    bestStreak: db.best_streak,
    linkedGoalId: db.linked_goal_id || undefined,
    targetNumericValue: db.target_numeric_value || undefined,
    targetTimerValue: db.target_timer_value || undefined,
    checklistItems: db.checklist_items as Habit['checklistItems'],
  });

  // Convert DB habit log to app habit log
  const dbToHabitLog = (db: DbHabitLog): HabitLog => ({
    id: db.id,
    habitId: db.habit_id,
    date: db.date,
    state: db.state as HabitLog['state'],
    numericValue: db.numeric_value || undefined,
    timerValue: db.timer_value || undefined,
    checklistProgress: db.checklist_progress || undefined,
  });

  // Convert DB goal to app goal
  const dbToGoal = (db: DbGoal): Goal => ({
    id: db.id,
    title: db.title,
    why: db.why || undefined,
    targetDate: db.target_date,
    trackingType: db.tracking_type as Goal['trackingType'],
    currentProgress: db.current_progress,
    targetValue: db.target_value || undefined,
    milestones: db.milestones as Goal['milestones'],
    linkedHabitIds: db.linked_habit_ids || [],
    linkedTaskIds: db.linked_task_ids || [],
    completed: db.completed,
    createdAt: db.created_at,
    category: db.category || undefined,
    autoTrack: db.auto_track,
    reminderTimes: db.reminder_times || undefined,
  });

  // Convert DB task to app task
  const dbToTask = (db: DbTask): Task => ({
    id: db.id,
    title: db.title,
    type: db.type as Task['type'],
    dates: db.dates || undefined,
    monthlyDates: db.monthly_dates || undefined,
    linkedGoalId: db.linked_goal_id || undefined,
    completed: db.completed,
    completedDates: db.completed_dates || [],
    createdAt: db.created_at,
    category: db.category || undefined,
    numericValue: db.numeric_value || undefined,
    targetNumericValue: db.target_numeric_value || undefined,
    reminderTimes: db.reminder_times || undefined,
  });

  // Convert DB settings to app settings
  const dbToSettings = (db: DbSettings): Settings => ({
    theme: db.theme as Settings['theme'],
    startOfDay: db.start_of_day,
    weekStartDay: db.week_start_day,
    defaultReminderTime: db.default_reminder_time,
    streakReminders: db.streak_reminders,
    dailySummary: db.daily_summary,
    showStreaks: db.show_streaks,
    notificationsEnabled: db.notifications_enabled,
  });

  // Convert DB category to app category
  const dbToCategory = (db: DbCategory): Category => ({
    id: db.id,
    name: db.name,
    color: db.color,
    isPreset: false,
  });

  // Fetch all data from cloud
  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setSyncing(true);
      
      const [habitsRes, logsRes, goalsRes, tasksRes, settingsRes, categoriesRes] = await Promise.all([
        supabase.from('habits').select('*').order('created_at', { ascending: false }),
        supabase.from('habit_logs').select('*').order('date', { ascending: false }),
        supabase.from('goals').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('settings').select('*').maybeSingle(),
        supabase.from('custom_categories').select('*'),
      ]);

      if (habitsRes.data) setHabits(habitsRes.data.map(dbToHabit));
      if (logsRes.data) setHabitLogs(logsRes.data.map(dbToHabitLog));
      if (goalsRes.data) setGoals(goalsRes.data.map(dbToGoal));
      if (tasksRes.data) setTasks(tasksRes.data.map(dbToTask));
      if (settingsRes.data) setSettings(dbToSettings(settingsRes.data));
      if (categoriesRes.data) setCustomCategories(categoriesRes.data.map(dbToCategory));
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // HABIT FUNCTIONS
  const addHabit = async (habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'bestStreak' | 'archived'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('habits')
      .insert([{
        user_id: user.id,
        name: habit.name,
        category: habit.category,
        difficulty: habit.difficulty,
        frequency: habit.frequency,
        evaluation_type: habit.evaluationType,
        specific_days: habit.specificDays,
        monthly_dates: habit.monthlyDates,
        reminder_times: habit.reminderTimes,
        notes: habit.notes,
        linked_goal_id: habit.linkedGoalId,
        target_numeric_value: habit.targetNumericValue,
        target_timer_value: habit.targetTimerValue,
        checklist_items: JSON.parse(JSON.stringify(habit.checklistItems || null)),
      }])
      .select()
      .single();

    if (error) {
      toast.error('Failed to create habit');
      return null;
    }

    const newHabit = dbToHabit(data);
    setHabits(prev => [newHabit, ...prev]);
    return newHabit;
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty;
    if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
    if (updates.evaluationType !== undefined) dbUpdates.evaluation_type = updates.evaluationType;
    if (updates.specificDays !== undefined) dbUpdates.specific_days = updates.specificDays;
    if (updates.monthlyDates !== undefined) dbUpdates.monthly_dates = updates.monthlyDates;
    if (updates.reminderTimes !== undefined) dbUpdates.reminder_times = updates.reminderTimes;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.archived !== undefined) dbUpdates.archived = updates.archived;
    if (updates.currentStreak !== undefined) dbUpdates.current_streak = updates.currentStreak;
    if (updates.bestStreak !== undefined) dbUpdates.best_streak = updates.bestStreak;
    if (updates.linkedGoalId !== undefined) dbUpdates.linked_goal_id = updates.linkedGoalId;
    if (updates.targetNumericValue !== undefined) dbUpdates.target_numeric_value = updates.targetNumericValue;
    if (updates.targetTimerValue !== undefined) dbUpdates.target_timer_value = updates.targetTimerValue;
    if (updates.checklistItems !== undefined) dbUpdates.checklist_items = updates.checklistItems;

    const { error } = await supabase
      .from('habits')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update habit');
      return;
    }

    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const archiveHabit = async (id: string) => {
    await updateHabit(id, { archived: true });
  };

  const restoreHabit = async (id: string) => {
    await updateHabit(id, { archived: false });
  };

  // Log habit with proper date lock - key function for preventing streak inflation
  const logHabit = async (habitId: string, state: 'done' | 'skipped' | 'missed', date?: string) => {
    if (!user) return;

    const dateStr = date || getTodayString();
    const existingLog = habitLogs.find(l => l.habitId === habitId && l.date === dateStr);
    const habit = habits.find(h => h.id === habitId);

    if (!habit) return;

    // If already done today, don't allow any changes (date lock)
    if (existingLog?.state === 'done' && state === 'done') {
      toast.info('Already completed today!');
      return;
    }

    const previousState = existingLog?.state;

    if (existingLog) {
      // Update existing log
      const { error } = await supabase
        .from('habit_logs')
        .update({ state })
        .eq('id', existingLog.id);

      if (error) {
        toast.error('Failed to update log');
        return;
      }

      setHabitLogs(prev => prev.map(l => 
        l.id === existingLog.id ? { ...l, state } : l
      ));
    } else {
      // Create new log
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({
          user_id: user.id,
          habit_id: habitId,
          date: dateStr,
          state,
        })
        .select()
        .single();

      if (error) {
        toast.error('Failed to log habit');
        return;
      }

      setHabitLogs(prev => [dbToHabitLog(data), ...prev]);
    }

    // Update streak only for NEW completions (not updates)
    let newStreak = habit.currentStreak;
    let newBestStreak = habit.bestStreak;

    if (state === 'done' && previousState !== 'done') {
      // Only increment streak for new completion
      newStreak = habit.currentStreak + 1;
      newBestStreak = Math.max(habit.bestStreak, newStreak);
    } else if (state === 'missed') {
      // Reset streak on miss
      newStreak = 0;
    }
    // Skipped: no change to streak

    if (newStreak !== habit.currentStreak || newBestStreak !== habit.bestStreak) {
      await updateHabit(habitId, { 
        currentStreak: newStreak, 
        bestStreak: newBestStreak 
      });
    }
  };

  const getHabitLogForDate = (habitId: string, date: string) => {
    return habitLogs.find(l => l.habitId === habitId && l.date === date);
  };

  // GOAL FUNCTIONS
  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'completed' | 'currentProgress' | 'linkedHabitIds' | 'linkedTaskIds'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('goals')
      .insert([{
        user_id: user.id,
        title: goal.title,
        why: goal.why,
        target_date: goal.targetDate,
        tracking_type: goal.trackingType,
        target_value: goal.targetValue,
        milestones: JSON.parse(JSON.stringify(goal.milestones || null)),
        category: goal.category,
        auto_track: goal.autoTrack ?? false,
        reminder_times: goal.reminderTimes,
      }])
      .select()
      .single();

    if (error) {
      toast.error('Failed to create goal');
      return null;
    }

    const newGoal = dbToGoal(data);
    setGoals(prev => [newGoal, ...prev]);
    return newGoal;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.why !== undefined) dbUpdates.why = updates.why;
    if (updates.targetDate !== undefined) dbUpdates.target_date = updates.targetDate;
    if (updates.trackingType !== undefined) dbUpdates.tracking_type = updates.trackingType;
    if (updates.currentProgress !== undefined) dbUpdates.current_progress = updates.currentProgress;
    if (updates.targetValue !== undefined) dbUpdates.target_value = updates.targetValue;
    if (updates.milestones !== undefined) dbUpdates.milestones = updates.milestones;
    if (updates.linkedHabitIds !== undefined) dbUpdates.linked_habit_ids = updates.linkedHabitIds;
    if (updates.linkedTaskIds !== undefined) dbUpdates.linked_task_ids = updates.linkedTaskIds;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.autoTrack !== undefined) dbUpdates.auto_track = updates.autoTrack;
    if (updates.reminderTimes !== undefined) dbUpdates.reminder_times = updates.reminderTimes;

    const { error } = await supabase
      .from('goals')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update goal');
      return;
    }

    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete goal');
      return;
    }

    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const linkHabitToGoal = async (habitId: string, goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal && !goal.linkedHabitIds.includes(habitId)) {
      await updateGoal(goalId, { linkedHabitIds: [...goal.linkedHabitIds, habitId] });
      await updateHabit(habitId, { linkedGoalId: goalId });
    }
  };

  const linkTaskToGoal = async (taskId: string, goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal && !goal.linkedTaskIds.includes(taskId)) {
      await updateGoal(goalId, { linkedTaskIds: [...goal.linkedTaskIds, taskId] });
      await updateTask(taskId, { linkedGoalId: goalId });
    }
  };

  // TASK FUNCTIONS
  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedDates'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: task.title,
        type: task.type,
        dates: task.dates,
        monthly_dates: task.monthlyDates,
        linked_goal_id: task.linkedGoalId,
        category: task.category,
        numeric_value: task.numericValue,
        target_numeric_value: task.targetNumericValue,
        reminder_times: task.reminderTimes,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create task');
      return null;
    }

    const newTask = dbToTask(data);
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.dates !== undefined) dbUpdates.dates = updates.dates;
    if (updates.monthlyDates !== undefined) dbUpdates.monthly_dates = updates.monthlyDates;
    if (updates.linkedGoalId !== undefined) dbUpdates.linked_goal_id = updates.linkedGoalId;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.completedDates !== undefined) dbUpdates.completed_dates = updates.completedDates;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.numericValue !== undefined) dbUpdates.numeric_value = updates.numericValue;
    if (updates.targetNumericValue !== undefined) dbUpdates.target_numeric_value = updates.targetNumericValue;
    if (updates.reminderTimes !== undefined) dbUpdates.reminder_times = updates.reminderTimes;

    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update task');
      return;
    }

    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const completeTask = async (id: string, date?: string) => {
    const dateStr = date || getTodayString();
    const task = tasks.find(t => t.id === id);
    if (task) {
      if (task.type === 'one-time') {
        await updateTask(id, { completed: true });
      } else {
        const completedDates = task.completedDates.includes(dateStr)
          ? task.completedDates.filter(d => d !== dateStr)
          : [...task.completedDates, dateStr];
        await updateTask(id, { completedDates });
      }
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete task');
      return;
    }

    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const getTasksForDate = (date: string) => {
    return tasks.filter(t => {
      if (t.type === 'daily') return true;
      if (t.type === 'one-time' && !t.completed) return true;
      if (t.type === 'monthly' && t.dates?.includes(date)) return true;
      return false;
    });
  };

  // SETTINGS FUNCTIONS
  const updateSettings = async (updates: Partial<Settings>) => {
    if (!user) return;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
    if (updates.startOfDay !== undefined) dbUpdates.start_of_day = updates.startOfDay;
    if (updates.weekStartDay !== undefined) dbUpdates.week_start_day = updates.weekStartDay;
    if (updates.defaultReminderTime !== undefined) dbUpdates.default_reminder_time = updates.defaultReminderTime;
    if (updates.streakReminders !== undefined) dbUpdates.streak_reminders = updates.streakReminders;
    if (updates.dailySummary !== undefined) dbUpdates.daily_summary = updates.dailySummary;
    if (updates.showStreaks !== undefined) dbUpdates.show_streaks = updates.showStreaks;
    if (updates.notificationsEnabled !== undefined) dbUpdates.notifications_enabled = updates.notificationsEnabled;

    const { error } = await supabase
      .from('settings')
      .update(dbUpdates)
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to update settings');
      return;
    }

    setSettings(prev => ({ ...prev, ...updates }));
  };

  // CATEGORY FUNCTIONS
  const addCustomCategory = async (category: Omit<Category, 'id' | 'isPreset'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('custom_categories')
      .insert({
        user_id: user.id,
        name: category.name,
        color: category.color,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add category');
      return;
    }

    setCustomCategories(prev => [...prev, dbToCategory(data)]);
  };

  const removeCustomCategory = async (id: string) => {
    const { error } = await supabase
      .from('custom_categories')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to remove category');
      return;
    }

    setCustomCategories(prev => prev.filter(c => c.id !== id));
  };

  // DATA EXPORT/IMPORT
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

  return {
    // State
    habits: habits.filter(h => !h.archived),
    archivedHabits: habits.filter(h => h.archived),
    habitLogs,
    goals,
    tasks,
    settings,
    customCategories,
    loading,
    syncing,
    // Habit functions
    addHabit,
    updateHabit,
    archiveHabit,
    restoreHabit,
    logHabit,
    getHabitLogForDate,
    // Goal functions
    addGoal,
    updateGoal,
    deleteGoal,
    linkHabitToGoal,
    linkTaskToGoal,
    // Task functions
    addTask,
    updateTask,
    completeTask,
    deleteTask,
    getTasksForDate,
    // Settings
    setSettings: updateSettings,
    // Category functions
    addCustomCategory,
    removeCustomCategory,
    // Data management
    exportData,
    getTodayString,
    refetch: fetchData,
  };
}
