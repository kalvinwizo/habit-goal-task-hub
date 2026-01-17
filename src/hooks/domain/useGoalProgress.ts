/**
 * useGoalProgress - Domain hook for goal progress calculation and updates
 * 
 * Responsibilities:
 * - Calculate auto-tracked progress from linked habits/tasks
 * - Validate progress updates
 * - Generate progress history for visualization
 * - Handle milestone completion logic
 * 
 * This hook is UI-agnostic and contains NO JSX, DOM, or side effects.
 * All data mutations are delegated to the data layer.
 */

import { useMemo, useCallback } from 'react';
import { Goal, GoalMilestone, Habit, Task, HabitLog } from '@/types';
import { format, subDays, differenceInDays, parseISO } from 'date-fns';

interface UseGoalProgressParams {
  goal: Goal;
  linkedHabits?: Habit[];
  linkedTasks?: Task[];
  habitLogs?: HabitLog[];
}

interface ProgressHistoryPoint {
  date: string;
  value: number;
}

interface UseGoalProgressResult {
  /** Current progress percentage (0-100) */
  progressPercentage: number;
  /** Raw progress value */
  progressValue: number;
  /** Target value (for numeric/checklist) */
  targetValue: number;
  /** Auto-calculated progress from linked items */
  autoCalculatedProgress: number;
  /** Whether auto-tracking is enabled */
  isAutoTracking: boolean;
  /** Progress history for charts */
  progressHistory: ProgressHistoryPoint[];
  /** Validate a progress update value */
  validateProgressUpdate: (value: number) => { valid: boolean; error?: string };
  /** Calculate new progress after milestone toggle */
  calculateMilestoneProgress: (milestones: GoalMilestone[]) => number;
  /** Get progress contribution from habits */
  getHabitContribution: () => number;
  /** Get progress contribution from tasks */
  getTaskContribution: () => number;
}

export function useGoalProgress({ 
  goal, 
  linkedHabits = [], 
  linkedTasks = [],
  habitLogs = []
}: UseGoalProgressParams): UseGoalProgressResult {
  
  /**
   * Calculate progress percentage based on tracking type
   */
  const { progressPercentage, progressValue, targetValue } = useMemo(() => {
    let percentage = goal.currentProgress;
    let value = goal.currentProgress;
    let target = 100;

    if (goal.trackingType === 'checklist' && goal.milestones) {
      const completed = goal.milestones.filter(m => m.completed).length;
      target = goal.milestones.length;
      value = completed;
      percentage = target > 0 ? Math.round((completed / target) * 100) : 0;
    } else if (goal.trackingType === 'numeric' && goal.targetValue) {
      target = goal.targetValue;
      value = goal.currentProgress;
      percentage = Math.min(100, Math.round((value / target) * 100));
    }

    return { progressPercentage: percentage, progressValue: value, targetValue: target };
  }, [goal]);

  /**
   * Calculate progress contribution from linked habits
   */
  const getHabitContribution = useCallback((): number => {
    if (linkedHabits.length === 0) return 0;
    
    // Calculate based on completion rate of linked habits (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = format(subDays(today, 30), 'yyyy-MM-dd');
    const todayStr = format(today, 'yyyy-MM-dd');
    
    let totalCompletions = 0;
    let totalExpected = 0;

    linkedHabits.forEach(habit => {
      const logs = habitLogs.filter(l => 
        l.habitId === habit.id && 
        l.date >= thirtyDaysAgo && 
        l.date <= todayStr
      );
      
      const done = logs.filter(l => l.state === 'done').length;
      totalCompletions += done;
      
      // Expected based on frequency (simplified)
      if (habit.frequency === 'daily') {
        totalExpected += 30;
      } else if (habit.frequency === 'weekly' || habit.frequency === 'specific') {
        totalExpected += (habit.specificDays?.length || 1) * 4;
      } else if (habit.frequency === 'monthly') {
        totalExpected += habit.monthlyDates?.length || 1;
      }
    });

    if (totalExpected === 0) return 0;
    return Math.round((totalCompletions / totalExpected) * 100);
  }, [linkedHabits, habitLogs]);

  /**
   * Calculate progress contribution from linked tasks
   */
  const getTaskContribution = useCallback((): number => {
    if (linkedTasks.length === 0) return 0;
    
    // For one-time tasks: count completed
    const oneTimeTasks = linkedTasks.filter(t => t.type === 'one-time');
    const completedOneTimes = oneTimeTasks.filter(t => t.completed).length;
    
    // For recurring tasks: check if completed today
    const recurringTasks = linkedTasks.filter(t => t.type !== 'one-time');
    const today = format(new Date(), 'yyyy-MM-dd');
    const completedRecurring = recurringTasks.filter(t => 
      t.completedDates.includes(today)
    ).length;

    const totalTasks = linkedTasks.length;
    const totalCompleted = completedOneTimes + (recurringTasks.length > 0 ? completedRecurring : 0);

    return totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
  }, [linkedTasks]);

  /**
   * Auto-calculated progress from linked items
   */
  const autoCalculatedProgress = useMemo(() => {
    if (!goal.autoTrack) return goal.currentProgress;
    
    const habitContrib = getHabitContribution();
    const taskContrib = getTaskContribution();
    
    // Weighted average if both exist
    const hasHabits = linkedHabits.length > 0;
    const hasTasks = linkedTasks.length > 0;
    
    if (hasHabits && hasTasks) {
      return Math.round((habitContrib + taskContrib) / 2);
    } else if (hasHabits) {
      return habitContrib;
    } else if (hasTasks) {
      return taskContrib;
    }
    
    return goal.currentProgress;
  }, [goal, linkedHabits, linkedTasks, getHabitContribution, getTaskContribution]);

  /**
   * Generate progress history for charts
   */
  const progressHistory = useMemo((): ProgressHistoryPoint[] => {
    const today = new Date();
    const createdDate = parseISO(goal.createdAt);
    const daysSinceCreation = Math.min(differenceInDays(today, createdDate), 30);
    
    return Array.from({ length: daysSinceCreation + 1 }, (_, i) => {
      const date = format(subDays(today, daysSinceCreation - i), 'yyyy-MM-dd');
      // Linear interpolation for visualization
      const value = Math.round((i / Math.max(daysSinceCreation, 1)) * progressPercentage);
      return { date, value };
    });
  }, [goal.createdAt, progressPercentage]);

  /**
   * Validate a progress update value
   */
  const validateProgressUpdate = useCallback((value: number): { valid: boolean; error?: string } => {
    if (goal.trackingType === 'percentage') {
      if (value < 0 || value > 100) {
        return { valid: false, error: 'Percentage must be between 0 and 100' };
      }
    } else if (goal.trackingType === 'numeric') {
      if (value < 0) {
        return { valid: false, error: 'Value cannot be negative' };
      }
      if (goal.targetValue && value > goal.targetValue * 2) {
        return { valid: false, error: 'Value seems too high' };
      }
    }
    return { valid: true };
  }, [goal]);

  /**
   * Calculate new progress after milestone toggle
   */
  const calculateMilestoneProgress = useCallback((milestones: GoalMilestone[]): number => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
  }, []);

  return {
    progressPercentage,
    progressValue,
    targetValue,
    autoCalculatedProgress,
    isAutoTracking: goal.autoTrack,
    progressHistory,
    validateProgressUpdate,
    calculateMilestoneProgress,
    getHabitContribution,
    getTaskContribution,
  };
}
