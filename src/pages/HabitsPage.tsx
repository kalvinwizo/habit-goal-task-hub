import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { HabitCard } from '@/components/habits/HabitCard';
import { CreateHabitDialog } from '@/components/habits/CreateHabitDialog';
import { HabitFiltersComponent, HabitFilters } from '@/components/habits/HabitFilters';
import { useApp } from '@/context/AppContext';
import { Habit } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Archive, Repeat } from 'lucide-react';

export default function HabitsPage() {
  const { habits, archivedHabits, updateHabit, customCategories } = useApp();
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [filters, setFilters] = useState<HabitFilters>({
    categories: [],
    difficulties: [],
    frequencies: [],
  });

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Filter habits for today
  const todayDayIndex = new Date().getDay();
  const todayDayOfMonth = new Date().getDate();
  
  const todaysHabits = habits.filter(habit => {
    // Time filter
    let showToday = false;
    if (habit.frequency === 'daily') showToday = true;
    else if (habit.frequency === 'weekly') showToday = true;
    else if (habit.frequency === 'specific') showToday = habit.specificDays?.includes(todayDayIndex) ?? false;
    else if (habit.frequency === 'monthly') showToday = habit.monthlyDates?.includes(todayDayOfMonth) ?? false;
    
    if (!showToday) return false;

    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(habit.category)) return false;
    // Difficulty filter
    if (filters.difficulties.length > 0 && !filters.difficulties.includes(habit.difficulty)) return false;
    // Frequency filter
    if (filters.frequencies.length > 0 && !filters.frequencies.includes(habit.frequency)) return false;
    
    return true;
  });

  const unarchiveHabit = (id: string) => {
    updateHabit(id, { archived: false });
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Habits" 
        subtitle={`${todayName}, ${todayDate}`}
        action={
          <div className="flex items-center gap-2">
            <HabitFiltersComponent 
              filters={filters} 
              onFiltersChange={setFilters}
              customCategories={customCategories.map(c => c.name)}
            />
            <CreateHabitDialog />
          </div>
        }
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
