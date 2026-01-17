/**
 * useTasks - Domain hook for task-related business logic
 * 
 * Responsibilities:
 * - Filter tasks by date and type
 * - Determine task completion status
 * - Provide task display helpers
 * 
 * This hook is UI-agnostic and contains NO JSX, DOM, or side effects.
 * All data mutations are delegated to the data layer.
 */

import { useMemo, useCallback } from 'react';
import { Task, TaskType } from '@/types';
import { format } from 'date-fns';

interface UseTasksParams {
  tasks: Task[];
}

interface UseTasksResult {
  /** All tasks */
  allTasks: Task[];
  /** Daily recurring tasks */
  dailyTasks: Task[];
  /** One-time tasks */
  oneTimeTasks: Task[];
  /** Monthly recurring tasks */
  monthlyTasks: Task[];
  /** Get tasks for a specific date */
  getTasksForDate: (date: Date | string) => Task[];
  /** Get today's tasks */
  todayTasks: Task[];
  /** Check if a task is completed for a date */
  isCompletedForDate: (task: Task, date: string) => boolean;
  /** Get completion status display */
  getCompletionStatus: (task: Task, date?: string) => { completed: boolean; label: string };
  /** Get task type label */
  getTypeLabel: (type: TaskType) => string;
  /** Filter incomplete one-time tasks */
  incompleteTasks: Task[];
  /** Get tasks linked to a goal */
  getTasksForGoal: (goalId: string) => Task[];
  /** Sort tasks by completion status */
  sortByCompletion: (tasks: Task[], date?: string) => Task[];
}

export function useTasks({ tasks }: UseTasksParams): UseTasksResult {
  const today = format(new Date(), 'yyyy-MM-dd');

  /**
   * Daily recurring tasks
   */
  const dailyTasks = useMemo(() => {
    return tasks.filter(t => t.type === 'daily');
  }, [tasks]);

  /**
   * One-time tasks
   */
  const oneTimeTasks = useMemo(() => {
    return tasks.filter(t => t.type === 'one-time');
  }, [tasks]);

  /**
   * Monthly recurring tasks
   */
  const monthlyTasks = useMemo(() => {
    return tasks.filter(t => t.type === 'monthly');
  }, [tasks]);

  /**
   * Incomplete one-time tasks
   */
  const incompleteTasks = useMemo(() => {
    return tasks.filter(t => t.type === 'one-time' && !t.completed);
  }, [tasks]);

  /**
   * Check if a task is completed for a specific date
   */
  const isCompletedForDate = useCallback((task: Task, date: string): boolean => {
    if (task.type === 'one-time') {
      return task.completed;
    }
    return task.completedDates.includes(date);
  }, []);

  /**
   * Get tasks scheduled for a specific date
   */
  const getTasksForDate = useCallback((date: Date | string): Task[] => {
    const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const dayOfMonth = dateObj.getDate();

    return tasks.filter(task => {
      switch (task.type) {
        case 'daily':
          return true;
        case 'one-time':
          // Show incomplete one-time tasks
          return !task.completed;
        case 'monthly':
          // Check if day of month matches
          return task.monthlyDates?.includes(dayOfMonth) ?? false;
        default:
          return false;
      }
    });
  }, [tasks]);

  /**
   * Today's tasks
   */
  const todayTasks = useMemo(() => {
    return getTasksForDate(new Date());
  }, [getTasksForDate]);

  /**
   * Get completion status for display
   */
  const getCompletionStatus = useCallback((task: Task, date?: string): { completed: boolean; label: string } => {
    const dateStr = date || today;
    const completed = isCompletedForDate(task, dateStr);
    
    let label = completed ? 'Completed' : 'Pending';
    if (task.type === 'daily' && completed) {
      label = 'Done today';
    } else if (task.type === 'monthly' && completed) {
      label = 'Completed this cycle';
    }

    return { completed, label };
  }, [today, isCompletedForDate]);

  /**
   * Get human-readable task type label
   */
  const getTypeLabel = useCallback((type: TaskType): string => {
    const labels: Record<TaskType, string> = {
      daily: 'Daily',
      'one-time': 'One-time',
      monthly: 'Monthly',
    };
    return labels[type] || type;
  }, []);

  /**
   * Get tasks linked to a specific goal
   */
  const getTasksForGoal = useCallback((goalId: string): Task[] => {
    return tasks.filter(t => t.linkedGoalId === goalId);
  }, [tasks]);

  /**
   * Sort tasks by completion status (incomplete first)
   */
  const sortByCompletion = useCallback((taskList: Task[], date?: string): Task[] => {
    const dateStr = date || today;
    return [...taskList].sort((a, b) => {
      const aCompleted = isCompletedForDate(a, dateStr);
      const bCompleted = isCompletedForDate(b, dateStr);
      if (aCompleted === bCompleted) return 0;
      return aCompleted ? 1 : -1;
    });
  }, [today, isCompletedForDate]);

  return {
    allTasks: tasks,
    dailyTasks,
    oneTimeTasks,
    monthlyTasks,
    getTasksForDate,
    todayTasks,
    isCompletedForDate,
    getCompletionStatus,
    getTypeLabel,
    incompleteTasks,
    getTasksForGoal,
    sortByCompletion,
  };
}
