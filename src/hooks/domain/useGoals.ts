/**
 * useGoals - Domain hook for goal-related business logic
 * 
 * Responsibilities:
 * - Filter goals by status (active/completed)
 * - Calculate goal progress based on tracking type
 * - Determine time-based metrics (days remaining, overdue status)
 * - Provide goal sorting and prioritization
 * 
 * This hook is UI-agnostic and contains NO JSX, DOM, or side effects.
 * All data mutations are delegated to the data layer.
 */

import { useMemo, useCallback } from 'react';
import { Goal, Habit, Task } from '@/types';
import { differenceInDays, differenceInMilliseconds } from 'date-fns';

interface UseGoalsParams {
  goals: Goal[];
  habits?: Habit[];
  tasks?: Task[];
}

interface GoalProgress {
  percentage: number;
  current: number;
  target: number;
  label: string;
}

interface GoalTimeStatus {
  daysRemaining: number;
  isOverdue: boolean;
  timeProgress: number;
  status: 'on-track' | 'behind' | 'overdue' | 'completed';
}

interface UseGoalsResult {
  /** Active (non-completed) goals */
  activeGoals: Goal[];
  /** Completed goals */
  completedGoals: Goal[];
  /** Get the primary/most urgent goal */
  primaryGoal: Goal | null;
  /** Calculate progress for a goal */
  calculateProgress: (goal: Goal) => GoalProgress;
  /** Get time-based status for a goal */
  getTimeStatus: (goal: Goal) => GoalTimeStatus;
  /** Get linked habits for a goal */
  getLinkedHabits: (goal: Goal) => Habit[];
  /** Get linked tasks for a goal */
  getLinkedTasks: (goal: Goal) => Task[];
  /** Sort goals by urgency (deadline + progress) */
  sortByUrgency: (goals: Goal[]) => Goal[];
  /** Filter goals by category */
  filterByCategory: (goals: Goal[], category: string) => Goal[];
  /** Check if a goal is behind schedule */
  isBehindSchedule: (goal: Goal) => boolean;
}

export function useGoals({ goals, habits = [], tasks = [] }: UseGoalsParams): UseGoalsResult {
  /**
   * Active (non-completed) goals
   */
  const activeGoals = useMemo(() => {
    return goals.filter(g => !g.completed);
  }, [goals]);

  /**
   * Completed goals
   */
  const completedGoals = useMemo(() => {
    return goals.filter(g => g.completed);
  }, [goals]);

  /**
   * Calculate progress for a goal based on its tracking type
   */
  const calculateProgress = useCallback((goal: Goal): GoalProgress => {
    let percentage = goal.currentProgress;
    let current = goal.currentProgress;
    let target = 100;
    let label = `${goal.currentProgress}%`;

    if (goal.trackingType === 'checklist' && goal.milestones) {
      const completed = goal.milestones.filter(m => m.completed).length;
      target = goal.milestones.length;
      current = completed;
      percentage = target > 0 ? Math.round((completed / target) * 100) : 0;
      label = `${completed}/${target} milestones`;
    } else if (goal.trackingType === 'numeric' && goal.targetValue) {
      target = goal.targetValue;
      current = goal.currentProgress;
      percentage = Math.min(100, Math.round((current / target) * 100));
      label = `${current}/${target}`;
    }

    return { percentage, current, target, label };
  }, []);

  /**
   * Get time-based status for a goal
   */
  const getTimeStatus = useCallback((goal: Goal): GoalTimeStatus => {
    const now = new Date();
    const targetDate = new Date(goal.targetDate);
    const createdDate = new Date(goal.createdAt);
    
    const daysRemaining = differenceInDays(targetDate, now);
    const isOverdue = daysRemaining < 0;
    
    // Calculate time progress (how much time has elapsed)
    const totalDuration = differenceInMilliseconds(targetDate, createdDate);
    const elapsed = differenceInMilliseconds(now, createdDate);
    const timeProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

    // Determine status
    let status: GoalTimeStatus['status'] = 'on-track';
    if (goal.completed) {
      status = 'completed';
    } else if (isOverdue) {
      status = 'overdue';
    } else {
      const progress = calculateProgress(goal).percentage;
      if (timeProgress > progress + 10) {
        status = 'behind';
      }
    }

    return { daysRemaining, isOverdue, timeProgress, status };
  }, [calculateProgress]);

  /**
   * Check if a goal is behind schedule
   */
  const isBehindSchedule = useCallback((goal: Goal): boolean => {
    const { timeProgress } = getTimeStatus(goal);
    const { percentage } = calculateProgress(goal);
    return timeProgress > percentage;
  }, [getTimeStatus, calculateProgress]);

  /**
   * Get the primary (most urgent) active goal
   */
  const primaryGoal = useMemo(() => {
    if (activeGoals.length === 0) return null;
    
    return activeGoals.sort((a, b) => {
      const statusA = getTimeStatus(a);
      const statusB = getTimeStatus(b);
      
      // Overdue goals first
      if (statusA.isOverdue && !statusB.isOverdue) return -1;
      if (!statusA.isOverdue && statusB.isOverdue) return 1;
      
      // Then by days remaining
      if (statusA.daysRemaining !== statusB.daysRemaining) {
        return statusA.daysRemaining - statusB.daysRemaining;
      }
      
      // Then by progress (lower progress = more urgent)
      return calculateProgress(a).percentage - calculateProgress(b).percentage;
    })[0];
  }, [activeGoals, getTimeStatus, calculateProgress]);

  /**
   * Get linked habits for a goal
   */
  const getLinkedHabits = useCallback((goal: Goal): Habit[] => {
    return habits.filter(h => goal.linkedHabitIds.includes(h.id));
  }, [habits]);

  /**
   * Get linked tasks for a goal
   */
  const getLinkedTasks = useCallback((goal: Goal): Task[] => {
    return tasks.filter(t => goal.linkedTaskIds.includes(t.id));
  }, [tasks]);

  /**
   * Sort goals by urgency
   */
  const sortByUrgency = useCallback((goalList: Goal[]): Goal[] => {
    return [...goalList].sort((a, b) => {
      const statusA = getTimeStatus(a);
      const statusB = getTimeStatus(b);
      
      // Overdue first
      if (statusA.isOverdue && !statusB.isOverdue) return -1;
      if (!statusA.isOverdue && statusB.isOverdue) return 1;
      
      // Behind schedule second
      const behindA = isBehindSchedule(a);
      const behindB = isBehindSchedule(b);
      if (behindA && !behindB) return -1;
      if (!behindA && behindB) return 1;
      
      // Then by days remaining
      return statusA.daysRemaining - statusB.daysRemaining;
    });
  }, [getTimeStatus, isBehindSchedule]);

  /**
   * Filter goals by category
   */
  const filterByCategory = useCallback((goalList: Goal[], category: string): Goal[] => {
    if (!category || category === 'all') return goalList;
    return goalList.filter(g => g.category === category);
  }, []);

  return {
    activeGoals,
    completedGoals,
    primaryGoal,
    calculateProgress,
    getTimeStatus,
    getLinkedHabits,
    getLinkedTasks,
    sortByUrgency,
    filterByCategory,
    isBehindSchedule,
  };
}
