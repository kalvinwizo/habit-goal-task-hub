import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <main className="min-h-screen pb-24 pt-6 px-4 max-w-lg mx-auto">
      {children}
    </main>
  );
}
