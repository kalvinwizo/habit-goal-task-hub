import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { format, subDays, differenceInDays, parseISO } from 'date-fns';

export interface DailyStats {
  date: string;
  done: number;
  skipped: number;
  missed: number;
  total: number;
}

export interface HabitStats {
  habitId: string;
  habitName: string;
  category: string;
  completion7Days: number;
  completion30Days: number;
  currentStreak: number;
  bestStreak: number;
  missedCount: number;
  skippedCount: number;
  consistencyScore: number;
  dailyData: { date: string; state: string | null }[];
}

export interface GoalStats {
  goalId: string;
  title: string;
  progress: number;
  daysRemaining: number;
  isOverdue: boolean;
  trackingType: string;
  progressHistory: { date: string; value: number }[];
}

export function useAnalytics() {
  const { habits, habitLogs, goals, tasks, getTodayString } = useApp();

  const dateRanges = useMemo(() => {
    const today = new Date();
    return {
      last7Days: Array.from({ length: 7 }, (_, i) => 
        format(subDays(today, 6 - i), 'yyyy-MM-dd')
      ),
      last30Days: Array.from({ length: 30 }, (_, i) => 
        format(subDays(today, 29 - i), 'yyyy-MM-dd')
      ),
      last90Days: Array.from({ length: 90 }, (_, i) => 
        format(subDays(today, 89 - i), 'yyyy-MM-dd')
      ),
    };
  }, []);

  // Daily completion stats for charts
  const dailyStats = useMemo((): DailyStats[] => {
    return dateRanges.last30Days.map(date => {
      const logsForDate = habitLogs.filter(l => l.date === date);
      return {
        date,
        done: logsForDate.filter(l => l.state === 'done').length,
        skipped: logsForDate.filter(l => l.state === 'skipped').length,
        missed: logsForDate.filter(l => l.state === 'missed').length,
        total: logsForDate.length,
      };
    });
  }, [habitLogs, dateRanges.last30Days]);

  // Individual habit statistics
  const habitStats = useMemo((): HabitStats[] => {
    return habits.map(habit => {
      const logs7 = habitLogs.filter(l => 
        l.habitId === habit.id && dateRanges.last7Days.includes(l.date)
      );
      const logs30 = habitLogs.filter(l => 
        l.habitId === habit.id && dateRanges.last30Days.includes(l.date)
      );

      const done7 = logs7.filter(l => l.state === 'done').length;
      const done30 = logs30.filter(l => l.state === 'done').length;
      const missed30 = logs30.filter(l => l.state === 'missed').length;
      const skipped30 = logs30.filter(l => l.state === 'skipped').length;

      // Daily data for the last 7 days
      const dailyData = dateRanges.last7Days.map(date => {
        const log = habitLogs.find(l => l.habitId === habit.id && l.date === date);
        return { date, state: log?.state || null };
      });

      return {
        habitId: habit.id,
        habitName: habit.name,
        category: habit.category,
        completion7Days: Math.min(100, Math.round((done7 / 7) * 100)),
        completion30Days: Math.min(100, Math.round((done30 / 30) * 100)),
        currentStreak: habit.currentStreak,
        bestStreak: habit.bestStreak,
        missedCount: missed30,
        skippedCount: skipped30,
        consistencyScore: (done30 + missed30) > 0 
          ? Math.round((done30 / (done30 + missed30)) * 100) 
          : 100,
        dailyData,
      };
    });
  }, [habits, habitLogs, dateRanges]);

  // Goal statistics
  const goalStats = useMemo((): GoalStats[] => {
    const today = new Date();
    
    return goals.map(goal => {
      const targetDate = parseISO(goal.targetDate);
      const daysRemaining = differenceInDays(targetDate, today);
      
      // Calculate progress based on tracking type
      let progress = goal.currentProgress;
      if (goal.trackingType === 'checklist' && goal.milestones) {
        const completed = goal.milestones.filter(m => m.completed).length;
        progress = goal.milestones.length > 0 
          ? Math.round((completed / goal.milestones.length) * 100) 
          : 0;
      } else if (goal.trackingType === 'numeric' && goal.targetValue) {
        progress = Math.min(100, Math.round((goal.currentProgress / goal.targetValue) * 100));
      }

      // Generate progress history (simulated based on creation date)
      const createdDate = parseISO(goal.createdAt);
      const daysSinceCreation = Math.min(differenceInDays(today, createdDate), 30);
      const progressHistory = Array.from({ length: daysSinceCreation + 1 }, (_, i) => {
        const date = format(subDays(today, daysSinceCreation - i), 'yyyy-MM-dd');
        // Linear interpolation for visualization
        const value = Math.round((i / Math.max(daysSinceCreation, 1)) * progress);
        return { date, value };
      });

      return {
        goalId: goal.id,
        title: goal.title,
        progress,
        daysRemaining,
        isOverdue: daysRemaining < 0,
        trackingType: goal.trackingType,
        progressHistory,
      };
    });
  }, [goals]);

  // Overall statistics
  const overallStats = useMemo(() => {
    const today = getTodayString();
    
    // Habit stats
    const totalHabits = habits.length;
    const activeHabits = habits.filter(h => !h.archived).length;
    const totalCurrentStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
    const bestStreak = Math.max(...habits.map(h => h.bestStreak), 0);
    
    // 7-day performance
    const logs7Days = habitLogs.filter(l => dateRanges.last7Days.includes(l.date));
    const done7 = logs7Days.filter(l => l.state === 'done').length;
    const missed7 = logs7Days.filter(l => l.state === 'missed').length;
    const skipped7 = logs7Days.filter(l => l.state === 'skipped').length;
    const total7 = done7 + missed7 + skipped7;
    const completionRate7 = total7 > 0 ? Math.round((done7 / total7) * 100) : 0;

    // 30-day performance
    const logs30Days = habitLogs.filter(l => dateRanges.last30Days.includes(l.date));
    const done30 = logs30Days.filter(l => l.state === 'done').length;
    const missed30 = logs30Days.filter(l => l.state === 'missed').length;
    const total30 = logs30Days.length;
    const completionRate30 = total30 > 0 ? Math.round((done30 / total30) * 100) : 0;

    // Consistency score (done vs done+missed, skipped doesn't affect)
    const consistencyScore = (done7 + missed7) > 0 
      ? Math.round((done7 / (done7 + missed7)) * 100) 
      : 100;

    // Goals
    const activeGoals = goals.filter(g => !g.completed);
    const completedGoals = goals.filter(g => g.completed);
    const avgGoalProgress = activeGoals.length > 0
      ? Math.round(activeGoals.reduce((sum, g) => sum + g.currentProgress, 0) / activeGoals.length)
      : 0;

    // Tasks
    const tasksToday = tasks.filter(t => {
      if (t.type === 'daily') return true;
      if (t.type === 'one-time' && !t.completed) return true;
      return false;
    });
    const tasksCompletedToday = tasks.filter(t => 
      t.completed || t.completedDates.includes(today)
    ).length;

    return {
      totalHabits,
      activeHabits,
      totalCurrentStreak,
      bestStreak,
      done7,
      missed7,
      skipped7,
      completionRate7,
      completionRate30,
      consistencyScore,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      avgGoalProgress,
      tasksToday: tasksToday.length,
      tasksCompletedToday,
    };
  }, [habits, habitLogs, goals, tasks, dateRanges, getTodayString]);

  // Streak history (for chart)
  const streakHistory = useMemo(() => {
    // Create a timeline of max streaks per day (simplified view)
    return dateRanges.last30Days.map(date => {
      const totalActiveStreaks = habits.reduce((sum, h) => {
        const logsBeforeDate = habitLogs.filter(l => 
          l.habitId === h.id && l.date <= date && l.state === 'done'
        ).length;
        return sum + Math.min(logsBeforeDate, h.currentStreak);
      }, 0);
      
      return {
        date,
        streak: Math.min(totalActiveStreaks, habits.reduce((s, h) => s + h.currentStreak, 0)),
      };
    });
  }, [habits, habitLogs, dateRanges.last30Days]);

  // Task completion trend
  const taskCompletionTrend = useMemo(() => {
    return dateRanges.last7Days.map(date => {
      const completed = tasks.filter(t => t.completedDates.includes(date)).length;
      return { date, completed };
    });
  }, [tasks, dateRanges.last7Days]);

  return {
    dailyStats,
    habitStats,
    goalStats,
    overallStats,
    streakHistory,
    taskCompletionTrend,
    dateRanges,
  };
}
