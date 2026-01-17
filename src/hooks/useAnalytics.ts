/**
 * useAnalytics - Domain hook for analytics and statistics calculations
 * 
 * Responsibilities:
 * - Calculate daily, weekly, and monthly statistics
 * - Generate chart-ready data structures
 * - Compute habit and goal performance metrics
 * - Provide streak and consistency calculations
 * 
 * This hook is UI-agnostic and contains NO JSX, DOM, or side effects.
 */

import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { format, subDays, differenceInDays, parseISO } from 'date-fns';
import { useHabitLogs } from './domain/useHabitLogs';
import { useGoals } from './domain/useGoals';

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
  
  // Use domain hooks for log queries
  const habitLogsHook = useHabitLogs({ habitLogs });
  const goalsHook = useGoals({ goals, habits, tasks });

  /**
   * Generate date ranges for different time periods
   */
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

  /**
   * Daily completion stats for charts
   */
  const dailyStats = useMemo((): DailyStats[] => {
    return dateRanges.last30Days.map(date => {
      const logsForDate = habitLogsHook.getLogsForDate(date);
      return {
        date,
        done: logsForDate.filter(l => l.state === 'done').length,
        skipped: logsForDate.filter(l => l.state === 'skipped').length,
        missed: logsForDate.filter(l => l.state === 'missed').length,
        total: logsForDate.length,
      };
    });
  }, [habitLogsHook, dateRanges.last30Days]);

  /**
   * Individual habit statistics
   */
  const habitStats = useMemo((): HabitStats[] => {
    return habits.map(habit => {
      const stats7 = habitLogsHook.getStatsForRange(habit.id, dateRanges.last7Days);
      const stats30 = habitLogsHook.getStatsForRange(habit.id, dateRanges.last30Days);

      // Daily data for the last 7 days
      const dailyData = dateRanges.last7Days.map(date => {
        const state = habitLogsHook.getStateForDate(habit.id, date);
        return { date, state: state === 'pending' ? null : state };
      });

      // Consistency = done / (done + missed), skipped doesn't count against
      const consistencyDenominator = stats30.done + stats30.missed;
      const consistencyScore = consistencyDenominator > 0 
        ? Math.round((stats30.done / consistencyDenominator) * 100) 
        : 100;

      return {
        habitId: habit.id,
        habitName: habit.name,
        category: habit.category,
        completion7Days: Math.min(100, Math.round((stats7.done / 7) * 100)),
        completion30Days: Math.min(100, Math.round((stats30.done / 30) * 100)),
        currentStreak: habit.currentStreak,
        bestStreak: habit.bestStreak,
        missedCount: stats30.missed,
        skippedCount: stats30.skipped,
        consistencyScore,
        dailyData,
      };
    });
  }, [habits, habitLogsHook, dateRanges]);

  /**
   * Goal statistics
   */
  const goalStats = useMemo((): GoalStats[] => {
    return goals.map(goal => {
      const { percentage } = goalsHook.calculateProgress(goal);
      const { daysRemaining, isOverdue } = goalsHook.getTimeStatus(goal);

      // Generate progress history
      const createdDate = parseISO(goal.createdAt);
      const today = new Date();
      const daysSinceCreation = Math.min(differenceInDays(today, createdDate), 30);
      const progressHistory = Array.from({ length: daysSinceCreation + 1 }, (_, i) => {
        const date = format(subDays(today, daysSinceCreation - i), 'yyyy-MM-dd');
        const value = Math.round((i / Math.max(daysSinceCreation, 1)) * percentage);
        return { date, value };
      });

      return {
        goalId: goal.id,
        title: goal.title,
        progress: percentage,
        daysRemaining,
        isOverdue,
        trackingType: goal.trackingType,
        progressHistory,
      };
    });
  }, [goals, goalsHook]);

  /**
   * Overall aggregated statistics
   */
  const overallStats = useMemo(() => {
    const today = getTodayString();
    
    // Habit stats
    const totalHabits = habits.length;
    const activeHabits = habits.filter(h => !h.archived).length;
    const totalCurrentStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
    const bestStreak = Math.max(...habits.map(h => h.bestStreak), 0);
    
    // 7-day performance using domain hook
    let done7 = 0, missed7 = 0, skipped7 = 0;
    habits.forEach(habit => {
      const stats = habitLogsHook.getStatsForRange(habit.id, dateRanges.last7Days);
      done7 += stats.done;
      missed7 += stats.missed;
      skipped7 += stats.skipped;
    });
    const total7 = done7 + missed7 + skipped7;
    const completionRate7 = total7 > 0 ? Math.round((done7 / total7) * 100) : 0;

    // 30-day performance
    let done30 = 0, missed30 = 0;
    habits.forEach(habit => {
      const stats = habitLogsHook.getStatsForRange(habit.id, dateRanges.last30Days);
      done30 += stats.done;
      missed30 += stats.missed;
    });
    const total30 = done30 + missed30;
    const completionRate30 = total30 > 0 ? Math.round((done30 / total30) * 100) : 0;

    // Consistency score
    const consistencyScore = (done7 + missed7) > 0 
      ? Math.round((done7 / (done7 + missed7)) * 100) 
      : 100;

    // Goals - using domain hook
    const avgGoalProgress = goalsHook.activeGoals.length > 0
      ? Math.round(goalsHook.activeGoals.reduce((sum, g) => 
          sum + goalsHook.calculateProgress(g).percentage, 0) / goalsHook.activeGoals.length)
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
      activeGoals: goalsHook.activeGoals.length,
      completedGoals: goalsHook.completedGoals.length,
      avgGoalProgress,
      tasksToday: tasksToday.length,
      tasksCompletedToday,
    };
  }, [habits, tasks, dateRanges, getTodayString, habitLogsHook, goalsHook]);

  /**
   * Streak history for charts
   */
  const streakHistory = useMemo(() => {
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

  /**
   * Task completion trend for charts
   */
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
