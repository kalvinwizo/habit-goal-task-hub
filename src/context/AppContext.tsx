import React, { createContext, useContext, ReactNode } from 'react';
import { useCloudSync } from '@/hooks/useCloudSync';
import { useAuth } from '@/hooks/useAuth';

type AppContextType = ReturnType<typeof useCloudSync> & { user: ReturnType<typeof useAuth>['user'] };

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

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
