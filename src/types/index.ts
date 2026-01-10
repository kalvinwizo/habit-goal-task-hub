// Habit Types
export type HabitFrequency = 'daily' | 'weekly' | 'specific';
export type HabitDifficulty = 'easy' | 'medium' | 'hard';
export type HabitState = 'done' | 'skipped' | 'missed' | 'pending';

export interface Habit {
  id: string;
  name: string;
  category: string;
  difficulty: HabitDifficulty;
  frequency: HabitFrequency;
  specificDays?: number[]; // 0-6 for Sunday-Saturday
  reminderTimes?: string[];
  notes?: string;
  archived: boolean;
  createdAt: string;
  currentStreak: number;
  bestStreak: number;
  linkedGoalId?: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  state: HabitState;
}

// Goal Types
export type GoalTrackingType = 'percentage' | 'numeric' | 'checklist';

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  why?: string;
  targetDate: string;
  trackingType: GoalTrackingType;
  currentProgress: number; // 0-100 for percentage, actual count for numeric
  targetValue?: number; // For numeric tracking
  milestones?: GoalMilestone[];
  linkedHabitIds: string[];
  linkedTaskIds: string[];
  completed: boolean;
  createdAt: string;
}

// Task Types
export type TaskType = 'daily' | 'one-time' | 'monthly';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  dates?: string[]; // For monthly tasks - specific dates
  linkedGoalId?: string;
  completed: boolean;
  completedDates: string[]; // Track completion per date for recurring
  createdAt: string;
}

// Settings Types
export interface Settings {
  theme: 'light' | 'dark';
  startOfDay: string; // HH:mm
  weekStartDay: number; // 0-6
  defaultReminderTime: string;
  streakReminders: boolean;
  dailySummary: boolean;
  showStreaks: boolean;
}

// Analytics Types
export interface HabitAnalytics {
  habitId: string;
  completionRate7Days: number;
  completionRate30Days: number;
  currentStreak: number;
  bestStreak: number;
  missedCount: number;
  skippedCount: number;
  consistencyScore: number;
}

export interface GoalAnalytics {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  overallProgress: number;
}
