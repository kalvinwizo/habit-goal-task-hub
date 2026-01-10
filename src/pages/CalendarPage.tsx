import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/context/AppContext';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, isSameDay } from 'date-fns';
import { Repeat, CheckSquare, Target, Check, X, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CalendarPage() {
  const { habits, habitLogs, tasks, goals, getHabitLogForDate, getTodayString } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : getTodayString();
  const selectedDayOfWeek = selectedDate ? selectedDate.getDay() : new Date().getDay();
  const selectedDayOfMonth = selectedDate ? selectedDate.getDate() : new Date().getDate();

  // Get items for selected date
  const dayHabits = useMemo(() => {
    return habits.filter(habit => {
      if (habit.frequency === 'daily') return true;
      if (habit.frequency === 'weekly') return true;
      if (habit.frequency === 'specific') {
        return habit.specificDays?.includes(selectedDayOfWeek);
      }
      if (habit.frequency === 'monthly') {
        return habit.monthlyDates?.includes(selectedDayOfMonth);
      }
      return false;
    });
  }, [habits, selectedDayOfWeek, selectedDayOfMonth]);

  const dayTasks = useMemo(() => {
    return tasks.filter(t => {
      if (t.completed && t.type === 'one-time') return false;
      if (t.type === 'daily') return true;
      if (t.type === 'one-time') return true;
      if (t.type === 'monthly') {
        return t.dates?.includes(selectedDateStr) || t.monthlyDates?.includes(selectedDayOfMonth);
      }
      return false;
    });
  }, [tasks, selectedDateStr, selectedDayOfMonth]);

  // Get dates with activity for calendar highlighting
  const datesWithActivity = useMemo(() => {
    const dates: Record<string, { habits: number; tasks: number; completed: number }> = {};
    
    habitLogs.forEach(log => {
      if (!dates[log.date]) dates[log.date] = { habits: 0, tasks: 0, completed: 0 };
      dates[log.date].habits++;
      if (log.state === 'done') dates[log.date].completed++;
    });

    tasks.forEach(task => {
      task.completedDates.forEach(date => {
        if (!dates[date]) dates[date] = { habits: 0, tasks: 0, completed: 0 };
        dates[date].tasks++;
        dates[date].completed++;
      });
    });

    return dates;
  }, [habitLogs, tasks]);

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'done':
        return <Check className="w-4 h-4 text-success" />;
      case 'skipped':
        return <SkipForward className="w-4 h-4 text-warning" />;
      case 'missed':
        return <X className="w-4 h-4 text-destructive" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />;
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Calendar" 
        subtitle="View your schedule"
      />

      {/* Calendar */}
      <div className="card-elevated p-4 mb-6">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className={cn("p-0 pointer-events-auto w-full")}
          modifiers={{
            hasActivity: (date) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              return !!datesWithActivity[dateStr];
            },
          }}
          modifiersStyles={{
            hasActivity: {
              fontWeight: 'bold',
            },
          }}
          components={{
            DayContent: ({ date }) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const activity = datesWithActivity[dateStr];
              return (
                <div className="relative w-full h-full flex items-center justify-center">
                  <span>{format(date, 'd')}</span>
                  {activity && activity.completed > 0 && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-success" />
                  )}
                </div>
              );
            },
          }}
        />
      </div>

      {/* Selected Date Details */}
      <div className="space-y-4">
        <h3 className="font-semibold">
          {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Today'}
        </h3>

        <Tabs defaultValue="habits" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="habits" className="flex items-center gap-2">
              <Repeat className="w-4 h-4" />
              Habits ({dayHabits.length})
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Tasks ({dayTasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="habits" className="space-y-2">
            {dayHabits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Repeat className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No habits scheduled for this day</p>
              </div>
            ) : (
              dayHabits.map(habit => {
                const log = getHabitLogForDate(habit.id, selectedDateStr);
                const state = log?.state || 'pending';

                return (
                  <div key={habit.id} className="card-elevated p-3 flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                      {getStatusIcon(state)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{habit.name}</p>
                      <p className="text-xs text-muted-foreground">{habit.category}</p>
                    </div>
                    {habit.currentStreak > 0 && (
                      <span className="text-xs text-primary font-medium">
                        🔥 {habit.currentStreak}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-2">
            {dayTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tasks scheduled for this day</p>
              </div>
            ) : (
              dayTasks.map(task => {
                const isCompleted = task.type === 'one-time' 
                  ? task.completed 
                  : task.completedDates.includes(selectedDateStr);

                return (
                  <div key={task.id} className={`card-elevated p-3 flex items-center gap-3 ${isCompleted ? 'opacity-60' : ''}`}>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                      {isCompleted ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{task.type}</p>
                    </div>
                    {task.linkedGoalId && (
                      <Target className="w-4 h-4 text-primary" />
                    )}
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
