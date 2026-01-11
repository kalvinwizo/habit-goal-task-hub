// Category Types
export interface Category {
  id: string;
  name: string;
  color: string;
  isPreset: boolean;
}

export const PRESET_CATEGORIES: Category[] = [
  { id: 'health', name: 'Health', color: 'hsl(142, 76%, 36%)', isPreset: true },
  { id: 'work', name: 'Work', color: 'hsl(221, 83%, 53%)', isPreset: true },
  { id: 'personal', name: 'Personal', color: 'hsl(262, 83%, 58%)', isPreset: true },
  { id: 'finance', name: 'Finance', color: 'hsl(45, 93%, 47%)', isPreset: true },
  { id: 'learning', name: 'Learning', color: 'hsl(199, 89%, 48%)', isPreset: true },
  { id: 'relationships', name: 'Relationships', color: 'hsl(350, 89%, 60%)', isPreset: true },
];

// Habit Types
export type HabitFrequency = 'daily' | 'weekly' | 'specific' | 'monthly';
export type HabitDifficulty = 'easy' | 'medium' | 'hard';
export type HabitState = 'done' | 'skipped' | 'missed' | 'pending';

export interface Habit {
  id: string;
  name: string;
  category: string;
  difficulty: HabitDifficulty;
  frequency: HabitFrequency;
  specificDays?: number[]; // 0-6 for Sunday-Saturday
  monthlyDates?: number[]; // 1-31 for specific dates of month
  reminderTimes?: string[];
  notes?: string;
  archived: boolean;
  createdAt: string;
  currentStreak: number;
  bestStreak: number;
  linkedGoalId?: string;
  numericValue?: number; // For numeric tracking
  targetNumericValue?: number; // Target for numeric habits
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  state: HabitState;
  numericValue?: number; // Actual value logged
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
  category?: string;
  autoTrack: boolean; // Auto-track progress from linked items
  reminderTimes?: string[]; // Multiple reminder times
}

// Task Types
export type TaskType = 'daily' | 'one-time' | 'monthly';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  dates?: string[]; // For monthly tasks - specific dates
  monthlyDates?: number[]; // 1-31 for recurring monthly tasks
  linkedGoalId?: string;
  completed: boolean;
  completedDates: string[]; // Track completion per date for recurring
  createdAt: string;
  category?: string;
  numericValue?: number; // For numeric contribution to goals
  targetNumericValue?: number;
  reminderTimes?: string[]; // Multiple reminder times
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
  notificationsEnabled: boolean;
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
