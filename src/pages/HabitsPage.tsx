import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { HabitCard } from '@/components/habits/HabitCard';
import { CreateHabitDialog } from '@/components/habits/CreateHabitDialog';
import { useApp } from '@/context/AppContext';
import { Habit } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Archive, Repeat } from 'lucide-react';

export default function HabitsPage() {
  const { habits, archivedHabits, updateHabit } = useApp();
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Filter habits for today
  const todayDayIndex = new Date().getDay();
  const todaysHabits = habits.filter(habit => {
    if (habit.frequency === 'daily') return true;
    if (habit.frequency === 'weekly') return true; // Show weekly habits every day, user decides when to complete
    if (habit.frequency === 'specific') {
      return habit.specificDays?.includes(todayDayIndex);
    }
    return false;
  });

  const unarchiveHabit = (id: string) => {
    updateHabit(id, { archived: false });
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Habits" 
        subtitle={`${todayName}, ${todayDate}`}
        action={<CreateHabitDialog />}
      />

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Repeat className="w-4 h-4" />
            Today ({todaysHabits.length})
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Archived ({archivedHabits.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-3">
          {todaysHabits.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Repeat className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No habits for today</p>
              <p className="text-sm mt-1">Create your first habit to get started</p>
            </div>
          ) : (
            todaysHabits.map(habit => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                onEdit={setEditingHabit}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-3">
          {archivedHabits.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Archive className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No archived habits</p>
              <p className="text-sm mt-1">Archived habits will appear here</p>
            </div>
          ) : (
            archivedHabits.map(habit => (
              <div key={habit.id} className="card-elevated p-4 fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{habit.name}</h3>
                    <p className="text-xs text-muted-foreground">{habit.category}</p>
                  </div>
                  <button
                    onClick={() => unarchiveHabit(habit.id)}
                    className="text-sm text-primary hover:underline"
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {editingHabit && (
        <CreateHabitDialog 
          editHabit={editingHabit} 
          onClose={() => setEditingHabit(null)} 
        />
      )}
    </PageContainer>
  );
}
