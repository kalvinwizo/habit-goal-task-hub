/**
 * useHabits - Domain hook for habit-related business logic
 * 
 * Responsibilities:
 * - Filter habits by schedule (today, weekly, monthly)
 * - Calculate which habits are due on a given date
 * - Provide habit display helpers (frequency labels, difficulty classes)
 * 
 * This hook is UI-agnostic and contains NO JSX, DOM, or side effects.
 * All data mutations are delegated to the data layer (useCloudSync via AppContext).
 */

import { useMemo, useCallback } from 'react';
import { Habit } from '@/types';

interface UseHabitsParams {
  habits: Habit[];
  archivedHabits: Habit[];
}

interface UseHabitsResult {
  /** Active (non-archived) habits */
  activeHabits: Habit[];
  /** Archived habits */
  archivedHabits: Habit[];
  /** Get habits scheduled for a specific date */
  getHabitsForDate: (date: Date) => Habit[];
  /** Get habits scheduled for today */
  todayHabits: Habit[];
  /** Check if a habit is scheduled for a given date */
  isHabitScheduledFor: (habit: Habit, date: Date) => boolean;
  /** Get human-readable frequency label */
  getFrequencyLabel: (habit: Habit) => string;
  /** Get difficulty CSS class name */
  getDifficultyClass: (difficulty: Habit['difficulty']) => string;
  /** Filter habits by category */
  filterByCategory: (habits: Habit[], category: string) => Habit[];
  /** Sort habits by streak (descending) */
  sortByStreak: (habits: Habit[]) => Habit[];
  /** Sort habits by difficulty */
  sortByDifficulty: (habits: Habit[], order?: 'asc' | 'desc') => Habit[];
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DIFFICULTY_ORDER = { easy: 1, medium: 2, hard: 3 };

export function useHabits({ habits, archivedHabits }: UseHabitsParams): UseHabitsResult {
  /**
   * Check if a habit is scheduled for a specific date
   */
  const isHabitScheduledFor = useCallback((habit: Habit, date: Date): boolean => {
    if (habit.archived) return false;
    
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();

    switch (habit.frequency) {
      case 'daily':
        return true;
      case 'weekly':
        // Weekly habits default to the creation day if no specific days set
        return habit.specificDays?.includes(dayOfWeek) ?? false;
      case 'specific':
        return habit.specificDays?.includes(dayOfWeek) ?? false;
      case 'monthly':
        return habit.monthlyDates?.includes(dayOfMonth) ?? false;
      default:
        return false;
    }
  }, []);

  /**
   * Get all habits scheduled for a specific date
   */
  const getHabitsForDate = useCallback((date: Date): Habit[] => {
    return habits.filter(habit => isHabitScheduledFor(habit, date));
  }, [habits, isHabitScheduledFor]);

  /**
   * Habits scheduled for today
   */
  const todayHabits = useMemo(() => {
    return getHabitsForDate(new Date());
  }, [getHabitsForDate]);

  /**
   * Get human-readable frequency label for a habit
   */
  const getFrequencyLabel = useCallback((habit: Habit): string => {
    switch (habit.frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'specific':
        if (habit.specificDays && habit.specificDays.length > 0) {
          return habit.specificDays.map(d => DAYS_OF_WEEK[d]).join(', ');
        }
        return 'Specific days';
      case 'monthly':
        if (habit.monthlyDates && habit.monthlyDates.length > 0) {
          return habit.monthlyDates.map(d => d.toString()).join(', ');
        }
        return 'Monthly';
      default:
        return '';
    }
  }, []);

  /**
   * Get CSS class for difficulty level
   */
  const getDifficultyClass = useCallback((difficulty: Habit['difficulty']): string => {
    const classes: Record<Habit['difficulty'], string> = {
      easy: 'difficulty-easy',
      medium: 'difficulty-medium',
      hard: 'difficulty-hard',
    };
    return classes[difficulty] || '';
  }, []);

  /**
   * Filter habits by category
   */
  const filterByCategory = useCallback((habitList: Habit[], category: string): Habit[] => {
    if (!category || category === 'all') return habitList;
    return habitList.filter(h => h.category === category);
  }, []);

  /**
   * Sort habits by current streak (descending)
   */
  const sortByStreak = useCallback((habitList: Habit[]): Habit[] => {
    return [...habitList].sort((a, b) => b.currentStreak - a.currentStreak);
  }, []);

  /**
   * Sort habits by difficulty
   */
  const sortByDifficulty = useCallback((habitList: Habit[], order: 'asc' | 'desc' = 'asc'): Habit[] => {
    return [...habitList].sort((a, b) => {
      const diff = DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
      return order === 'asc' ? diff : -diff;
    });
  }, []);

  return {
    activeHabits: habits,
    archivedHabits,
    getHabitsForDate,
    todayHabits,
    isHabitScheduledFor,
    getFrequencyLabel,
    getDifficultyClass,
    filterByCategory,
    sortByStreak,
    sortByDifficulty,
  };
}
