import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/context/AppContext';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { Calendar, Target, CheckSquare, Repeat, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function DashboardPage() {
  const { habits, habitLogs, goals, tasks, settings, getTodayString } = useApp();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: settings.weekStartDay as 0 | 1 | 2 | 3 | 4 | 5 | 6 })
  );

  const today = getTodayString();
  const todayDate = new Date();

  // Generate week days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  // Get habits for a specific date
  const getHabitsForDate = (date: Date) => {
    const dayIndex = date.getDay();
    const dateOfMonth = date.getDate();
    
    return habits.filter(habit => {
      if (habit.frequency === 'daily') return true;
      if (habit.frequency === 'weekly') return true;
      if (habit.frequency === 'specific') {
        return habit.specificDays?.includes(dayIndex);
      }
      if (habit.frequency === 'monthly') {
        return habit.monthlyDates?.includes(dateOfMonth);
      }
      return false;
    });
  };

  // Get habit completion status for date
  const getHabitStatus = (habitId: string, dateStr: string) => {
    const log = habitLogs.find(l => l.habitId === habitId && l.date === dateStr);
    return log?.state || 'pending';
  };

  // Get tasks for date
  const getTasksForDate = (dateStr: string) => {
    const dateOfMonth = parseISO(dateStr).getDate();
    return tasks.filter(t => {
      if (t.completed && t.type === 'one-time') return false;
      if (t.type === 'daily') return true;
      if (t.type === 'one-time') return true;
      if (t.type === 'monthly') {
        return t.dates?.includes(dateStr) || t.monthlyDates?.includes(dateOfMonth);
      }
      return false;
    });
  };

  // Calculate daily stats
  const getDayStats = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayHabits = getHabitsForDate(date);
    const dayTasks = getTasksForDate(dateStr);
    
    const completedHabits = dayHabits.filter(h => getHabitStatus(h.id, dateStr) === 'done').length;
    const completedTasks = dayTasks.filter(t => 
      t.type === 'one-time' ? t.completed : t.completedDates.includes(dateStr)
    ).length;

    return {
      totalHabits: dayHabits.length,
      completedHabits,
      totalTasks: dayTasks.length,
      completedTasks,
      completion: dayHabits.length + dayTasks.length > 0 
        ? Math.round(((completedHabits + completedTasks) / (dayHabits.length + dayTasks.length)) * 100)
        : 0,
    };
  };

  // Overall stats
  const activeGoals = goals.filter(g => !g.completed);
  const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  const goToThisWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: settings.weekStartDay as 0 | 1 | 2 | 3 | 4 | 5 | 6 }));
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Dashboard" 
        subtitle={format(todayDate, 'EEEE, MMMM d')}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card-elevated p-3 text-center">
          <div className="flex items-center justify-center w-8 h-8 mx-auto rounded-lg bg-primary/10 text-primary mb-2">
            <Repeat className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold">{habits.length}</p>
          <p className="text-xs text-muted-foreground">Habits</p>
        </div>
        <div className="card-elevated p-3 text-center">
          <div className="flex items-center justify-center w-8 h-8 mx-auto rounded-lg bg-accent/10 text-accent-foreground mb-2">
            <Target className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold">{activeGoals.length}</p>
          <p className="text-xs text-muted-foreground">Active Goals</p>
        </div>
        <div className="card-elevated p-3 text-center">
          <div className="flex items-center justify-center w-8 h-8 mx-auto rounded-lg bg-warning/10 text-warning mb-2">
            <Flame className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold">{totalStreak}</p>
          <p className="text-xs text-muted-foreground">Total Streak</p>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigateWeek('prev')}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <button 
          onClick={goToThisWeek}
          className="text-sm font-medium hover:text-primary transition-colors"
        >
          {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
        </button>
        <Button variant="ghost" size="icon" onClick={() => navigateWeek('next')}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Weekly Calendar View */}
      <div className="card-elevated p-4 mb-6">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const stats = getDayStats(day);
            const isToday = isSameDay(day, todayDate);
            const isPast = day < todayDate && !isToday;

            return (
              <div 
                key={index}
                className={`text-center p-2 rounded-xl transition-colors ${
                  isToday 
                    ? 'bg-primary text-primary-foreground' 
                    : isPast 
                      ? 'bg-muted/50' 
                      : 'bg-muted/30'
                }`}
              >
                <p className={`text-xs font-medium mb-1 ${isToday ? '' : 'text-muted-foreground'}`}>
                  {format(day, 'EEE')}
                </p>
                <p className={`text-lg font-bold mb-2 ${isToday ? '' : ''}`}>
                  {format(day, 'd')}
                </p>
                
                {/* Completion indicator */}
                <div className="space-y-1">
                  <div className={`h-1.5 rounded-full ${isToday ? 'bg-primary-foreground/30' : 'bg-muted'}`}>
                    <div 
                      className={`h-full rounded-full transition-all ${
                        isToday ? 'bg-primary-foreground' : stats.completion > 0 ? 'bg-success' : 'bg-muted'
                      }`}
                      style={{ width: `${stats.completion}%` }}
                    />
                  </div>
                  <p className={`text-[10px] ${isToday ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {stats.completedHabits + stats.completedTasks}/{stats.totalHabits + stats.totalTasks}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Summary */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Today's Progress
        </h3>

        {(() => {
          const todayStats = getDayStats(todayDate);
          return (
            <div className="card-elevated p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Repeat className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Habits</p>
                    <p className="text-sm text-muted-foreground">
                      {todayStats.completedHabits} of {todayStats.totalHabits} completed
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-primary">
                  {todayStats.totalHabits > 0 
                    ? Math.round((todayStats.completedHabits / todayStats.totalHabits) * 100)
                    : 0}%
                </span>
              </div>
              <Progress 
                value={todayStats.totalHabits > 0 
                  ? (todayStats.completedHabits / todayStats.totalHabits) * 100 
                  : 0
                } 
              />

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-accent-foreground" />
                  <div>
                    <p className="font-medium">Tasks</p>
                    <p className="text-sm text-muted-foreground">
                      {todayStats.completedTasks} of {todayStats.totalTasks} completed
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-accent-foreground">
                  {todayStats.totalTasks > 0 
                    ? Math.round((todayStats.completedTasks / todayStats.totalTasks) * 100)
                    : 0}%
                </span>
              </div>
              <Progress 
                value={todayStats.totalTasks > 0 
                  ? (todayStats.completedTasks / todayStats.totalTasks) * 100 
                  : 0
                } 
                className="bg-accent/20"
              />
            </div>
          );
        })()}

        {/* Active Goals Progress */}
        {activeGoals.length > 0 && (
          <>
            <h3 className="font-semibold flex items-center gap-2 mt-6">
              <Target className="w-4 h-4 text-primary" />
              Active Goals
            </h3>
            <div className="space-y-3">
              {activeGoals.slice(0, 3).map(goal => {
                let progress = goal.currentProgress;
                if (goal.trackingType === 'checklist' && goal.milestones) {
                  const completed = goal.milestones.filter(m => m.completed).length;
                  progress = goal.milestones.length > 0 ? Math.round((completed / goal.milestones.length) * 100) : 0;
                } else if (goal.trackingType === 'numeric' && goal.targetValue) {
                  progress = Math.min(100, Math.round((goal.currentProgress / goal.targetValue) * 100));
                }

                return (
                  <div key={goal.id} className="card-elevated p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm truncate flex-1 mr-2">{goal.title}</p>
                      <span className="text-sm font-bold text-primary">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
