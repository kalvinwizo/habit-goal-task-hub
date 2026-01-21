/**
 * usePremium - Freemium tier management hook
 * 
 * Manages:
 * - Free tier limits (3 habits, 2 goals)
 * - Premium feature gating
 * - Upgrade prompts
 */

import { useMemo } from 'react';
import { Habit, Goal } from '@/types';

// Free tier limits
export const FREE_LIMITS = {
  habits: 3,
  goals: 2,
} as const;

// Premium features
export const PREMIUM_FEATURES = {
  unlimitedHabits: 'Unlimited Habits',
  unlimitedGoals: 'Unlimited Goals',
  advancedAnalytics: 'Advanced Analytics',
  heatmaps: 'Calendar Heatmaps',
  goalSharing: 'Goal Sharing',
  cloudSync: 'Cloud Sync',
  widgets: 'Home Screen Widgets',
} as const;

interface UsePremiumParams {
  habits: Habit[];
  goals: Goal[];
  isPremium?: boolean;
}

interface UsePremiumResult {
  isPremium: boolean;
  canAddHabit: boolean;
  canAddGoal: boolean;
  habitsRemaining: number;
  goalsRemaining: number;
  habitCount: number;
  goalCount: number;
  isFeatureAvailable: (feature: keyof typeof PREMIUM_FEATURES) => boolean;
  getUpgradeMessage: (feature: keyof typeof PREMIUM_FEATURES) => string;
  limits: typeof FREE_LIMITS;
}

export function usePremium({ 
  habits, 
  goals, 
  isPremium = false  // Can be connected to subscription status later
}: UsePremiumParams): UsePremiumResult {
  
  // Count active (non-archived) habits
  const habitCount = useMemo(() => 
    habits.filter(h => !h.archived).length, 
    [habits]
  );
  
  // Count active goals
  const goalCount = useMemo(() => 
    goals.filter(g => !g.completed).length, 
    [goals]
  );

  // Check if user can add more habits
  const canAddHabit = useMemo(() => 
    isPremium || habitCount < FREE_LIMITS.habits,
    [isPremium, habitCount]
  );

  // Check if user can add more goals
  const canAddGoal = useMemo(() => 
    isPremium || goalCount < FREE_LIMITS.goals,
    [isPremium, goalCount]
  );

  // Calculate remaining slots
  const habitsRemaining = useMemo(() => 
    isPremium ? Infinity : Math.max(0, FREE_LIMITS.habits - habitCount),
    [isPremium, habitCount]
  );

  const goalsRemaining = useMemo(() => 
    isPremium ? Infinity : Math.max(0, FREE_LIMITS.goals - goalCount),
    [isPremium, goalCount]
  );

  // Check if a premium feature is available
  const isFeatureAvailable = (feature: keyof typeof PREMIUM_FEATURES): boolean => {
    if (isPremium) return true;
    
    // Some features are available in free tier
    const freeFeatures: (keyof typeof PREMIUM_FEATURES)[] = [
      'cloudSync', // Basic cloud sync is free
    ];
    
    return freeFeatures.includes(feature);
  };

  // Get upgrade message for a feature
  const getUpgradeMessage = (feature: keyof typeof PREMIUM_FEATURES): string => {
    const featureName = PREMIUM_FEATURES[feature];
    return `Upgrade to Premium to unlock ${featureName}`;
  };

  return {
    isPremium,
    canAddHabit,
    canAddGoal,
    habitsRemaining,
    goalsRemaining,
    habitCount,
    goalCount,
    isFeatureAvailable,
    getUpgradeMessage,
    limits: FREE_LIMITS,
  };
}
