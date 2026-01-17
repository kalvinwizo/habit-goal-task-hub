/**
 * AppContext - Central application state and data provider
 * 
 * This context provides:
 * - All application data (habits, goals, tasks, settings)
 * - Data mutation functions (CRUD operations)
 * - User authentication state
 * 
 * Architecture:
 * - Data layer: useCloudSync handles persistence to Supabase
 * - Business logic: Domain hooks (useHabits, useGoals, etc.) handle calculations
 * - UI components: Consume context and domain hooks, render only
 * 
 * Usage:
 * ```tsx
 * const { habits, logHabit, getTodayString } = useApp();
 * const { todayHabits } = useHabits({ habits, archivedHabits: [] });
 * ```
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useCloudSync } from '@/hooks/useCloudSync';
import { useAuth } from '@/hooks/useAuth';

type AppContextType = ReturnType<typeof useCloudSync> & { 
  user: ReturnType<typeof useAuth>['user'];
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const appData = useCloudSync();
  
  return (
    <AppContext.Provider value={{ ...appData, user: auth.user }}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook to access the app context
 * 
 * Returns the data layer (useCloudSync) which provides:
 * - habits, archivedHabits, habitLogs
 * - goals, tasks
 * - settings, customCategories
 * - CRUD functions for all entities
 * - Data export/import utilities
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
