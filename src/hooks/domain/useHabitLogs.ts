/**
 * useHabitLogs - Domain hook for habit log analysis and state tracking
 * 
 * Responsibilities:
 * - Query logs for specific dates/habits
 * - Calculate completion statistics
 * - Determine current state of habits for display
 * - Provide state-based styling helpers
 * 
 * This hook is UI-agnostic and contains NO JSX, DOM, or side effects.
 * All data mutations are delegated to the data layer.
 */

import { useMemo, useCallback } from 'react';
import { HabitLog, HabitState } from '@/types';

interface UseHabitLogsParams {
  habitLogs: HabitLog[];
}

interface DateRangeStats {
  done: number;
  missed: number;
  skipped: number;
  total: number;
  completionRate: number;
}

interface UseHabitLogsResult {
  /** Get log for a specific habit on a specific date */
  getLogForDate: (habitId: string, date: string) => HabitLog | undefined;
  /** Get current state for a habit on a date (defaults to 'pending') */
  getStateForDate: (habitId: string, date: string) => HabitState;
  /** Get all logs for a habit */
  getLogsForHabit: (habitId: string) => HabitLog[];
  /** Get all logs for a specific date */
  getLogsForDate: (date: string) => HabitLog[];
  /** Get logs for a habit within a date range */
  getLogsInRange: (habitId: string, startDate: string, endDate: string) => HabitLog[];
  /** Calculate stats for a habit over a date range */
  getStatsForRange: (habitId: string, dates: string[]) => DateRangeStats;
  /** Get CSS class for state color */
  getStateColorClass: (state: HabitState) => string;
  /** Check if habit was completed on a date */
  isCompletedOnDate: (habitId: string, date: string) => boolean;
  /** Count consecutive done days (for streak calculation reference) */
  countConsecutiveDone: (habitId: string, upToDate: string) => number;
}

export function useHabitLogs({ habitLogs }: UseHabitLogsParams): UseHabitLogsResult {
  /**
   * Create a map for O(1) lookup by habitId and date
   */
  const logMap = useMemo(() => {
    const map = new Map<string, HabitLog>();
    habitLogs.forEach(log => {
      map.set(`${log.habitId}:${log.date}`, log);
    });
    return map;
  }, [habitLogs]);

  /**
   * Get log for a specific habit on a specific date
   */
  const getLogForDate = useCallback((habitId: string, date: string): HabitLog | undefined => {
    return logMap.get(`${habitId}:${date}`);
  }, [logMap]);

  /**
   * Get current state for a habit on a date
   */
  const getStateForDate = useCallback((habitId: string, date: string): HabitState => {
    const log = getLogForDate(habitId, date);
    return log?.state || 'pending';
  }, [getLogForDate]);

  /**
   * Get all logs for a specific habit
   */
  const getLogsForHabit = useCallback((habitId: string): HabitLog[] => {
    return habitLogs.filter(log => log.habitId === habitId);
  }, [habitLogs]);

  /**
   * Get all logs for a specific date
   */
  const getLogsForDate = useCallback((date: string): HabitLog[] => {
    return habitLogs.filter(log => log.date === date);
  }, [habitLogs]);

  /**
   * Get logs for a habit within a date range (inclusive)
   */
  const getLogsInRange = useCallback((habitId: string, startDate: string, endDate: string): HabitLog[] => {
    return habitLogs.filter(log => 
      log.habitId === habitId && 
      log.date >= startDate && 
      log.date <= endDate
    );
  }, [habitLogs]);

  /**
   * Calculate statistics for a habit over a list of dates
   */
  const getStatsForRange = useCallback((habitId: string, dates: string[]): DateRangeStats => {
    let done = 0;
    let missed = 0;
    let skipped = 0;

    dates.forEach(date => {
      const log = getLogForDate(habitId, date);
      if (log) {
        if (log.state === 'done') done++;
        else if (log.state === 'missed') missed++;
        else if (log.state === 'skipped') skipped++;
      }
    });

    const total = done + missed + skipped;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return { done, missed, skipped, total, completionRate };
  }, [getLogForDate]);

  /**
   * Get CSS class for state color (ring/background styling)
   */
  const getStateColorClass = useCallback((state: HabitState): string => {
    switch (state) {
      case 'done':
        return 'ring-2 ring-success bg-success/10';
      case 'missed':
        return 'ring-2 ring-destructive bg-destructive/10';
      case 'skipped':
        return 'ring-2 ring-muted-foreground bg-muted/50';
      default:
        return '';
    }
  }, []);

  /**
   * Check if a habit was completed on a specific date
   */
  const isCompletedOnDate = useCallback((habitId: string, date: string): boolean => {
    const log = getLogForDate(habitId, date);
    return log?.state === 'done';
  }, [getLogForDate]);

  /**
   * Count consecutive done days for a habit up to a specific date
   * Useful for streak verification/calculation
   */
  const countConsecutiveDone = useCallback((habitId: string, upToDate: string): number => {
    const habitLogs = getLogsForHabit(habitId)
      .filter(log => log.date <= upToDate && log.state === 'done')
      .sort((a, b) => b.date.localeCompare(a.date)); // Most recent first

    if (habitLogs.length === 0) return 0;

    let count = 0;
    let expectedDate = new Date(upToDate);

    for (const log of habitLogs) {
      const logDate = new Date(log.date);
      const diff = Math.floor((expectedDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff === 0 || diff === 1) {
        count++;
        expectedDate = logDate;
      } else {
        break;
      }
    }

    return count;
  }, [getLogsForHabit]);

  return {
    getLogForDate,
    getStateForDate,
    getLogsForHabit,
    getLogsForDate,
    getLogsInRange,
    getStatsForRange,
    getStateColorClass,
    isCompletedOnDate,
    countConsecutiveDone,
  };
}
