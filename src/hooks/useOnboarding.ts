/**
 * useOnboarding - First-time user onboarding tour
 * 
 * Manages:
 * - Tour state (current step, visibility)
 * - Persistence of completion status
 * - Tour navigation
 */

import { useState, useEffect, useCallback } from 'react';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Habitix! 🎉',
    description: 'Build better habits, achieve your goals, and track your progress. Let\'s take a quick tour!',
    position: 'center',
  },
  {
    id: 'habits',
    title: 'Track Your Habits',
    description: 'Create daily, weekly, or monthly habits. Mark them as done, skipped, or missed. Build streaks!',
    position: 'center',
  },
  {
    id: 'goals',
    title: 'Set SMART Goals',
    description: 'Create goals with deadlines, track progress as percentage, numbers, or milestones. Link habits to goals!',
    position: 'center',
  },
  {
    id: 'tasks',
    title: 'Manage Tasks',
    description: 'Add one-time or recurring tasks. Link them to goals to auto-track progress.',
    position: 'center',
  },
  {
    id: 'analytics',
    title: 'View Your Progress',
    description: 'See completion rates, streaks, heatmaps, and consistency scores. Stay motivated!',
    position: 'center',
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🚀',
    description: 'Start by creating your first habit. Tap the + button on the Habits page to begin!',
    position: 'center',
  },
];

const ONBOARDING_KEY = 'habitix_onboarding_completed';

interface UseOnboardingResult {
  isActive: boolean;
  currentStep: number;
  currentStepData: OnboardingStep;
  totalSteps: number;
  progress: number;
  start: () => void;
  next: () => void;
  previous: () => void;
  skip: () => void;
  complete: () => void;
  reset: () => void;
}

export function useOnboarding(): UseOnboardingResult {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Check if onboarding should show on mount
  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      // Delay showing onboarding to let the page load
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const start = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const next = useCallback(() => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      complete();
    }
  }, [currentStep]);

  const previous = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skip = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsActive(false);
  }, []);

  const complete = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsActive(false);
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(ONBOARDING_KEY);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return {
    isActive,
    currentStep,
    currentStepData: ONBOARDING_STEPS[currentStep],
    totalSteps: ONBOARDING_STEPS.length,
    progress,
    start,
    next,
    previous,
    skip,
    complete,
    reset,
  };
}
