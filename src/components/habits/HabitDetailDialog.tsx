import { useMemo, useState } from 'react';
import { Flame, TrendingUp, Calendar, Check, X, SkipForward, Target } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/context/AppContext';
import { Habit } from '@/types';
import { format, subDays, parseISO } from 'date-fns';
import { HabitHeatmap } from '@/components/heatmap/HabitHeatmap';

interface HabitDetailDialogProps {
  habit: Habit;
  open: boolean;
  onClose: () => void;
}

export function HabitDetailDialog({ habit, open, onClose }: HabitDetailDialogProps) {
  const { habitLogs, getTodayString } = useApp();
  const today = getTodayString();

  const stats = useMemo(() => {
    const habitLogsForHabit = habitLogs.filter(l => l.habitId === habit.id);
    
    // Last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => 
      format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')
    );
    
    // Last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => 
      format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
    );

    const logs30 = habitLogsForHabit.filter(l => last30Days.includes(l.date));
    const logs7 = habitLogsForHabit.filter(l => last7Days.includes(l.date));

    const done30 = logs30.filter(l => l.state === 'done').length;
    const missed30 = logs30.filter(l => l.state === 'missed').length;
    const skipped30 = logs30.filter(l => l.state === 'skipped').length;

    const done7 = logs7.filter(l => l.state === 'done').length;
    const missed7 = logs7.filter(l => l.state === 'missed').length;
    const skipped7 = logs7.filter(l => l.state === 'skipped').length;

    // Weekly calendar view
    const weeklyView = last7Days.map(date => {
      const log = habitLogsForHabit.find(l => l.date === date);
      return {
        date,
        dayName: format(parseISO(date), 'EEE'),
        dayNum: format(parseISO(date), 'd'),
        state: log?.state || 'pending',
      };
    });

    // Monthly heatmap (last 30 days)
    const monthlyHeatmap = last30Days.map(date => {
      const log = habitLogsForHabit.find(l => l.date === date);
      return {
        date,
        state: log?.state || 'pending',
      };
    });

    return {
      done30,
      missed30,
      skipped30,
      done7,
      missed7,
      skipped7,
      completion7: logs7.length > 0 ? Math.round((done7 / 7) * 100) : 0,
      completion30: logs30.length > 0 ? Math.round((done30 / 30) * 100) : 0,
      consistency: (done30 + missed30) > 0 ? Math.round((done30 / (done30 + missed30)) * 100) : 100,
      weeklyView,
      monthlyHeatmap,
      totalLogs: habitLogsForHabit.length,
    };
  }, [habit.id, habitLogs]);

  const getStateColor = (state: string) => {
    switch (state) {
      case 'done': return 'bg-success';
      case 'missed': return 'bg-destructive';
      case 'skipped': return 'bg-muted-foreground/50';
      default: return 'bg-muted/30';
    }
  };

  const getEvaluationLabel = () => {
    switch (habit.evaluationType) {
      case 'numeric': return `Numeric (Target: ${habit.targetNumericValue})`;
      case 'timer': return `Timer (Target: ${Math.floor((habit.targetTimerValue || 0) / 60)} min)`;
      case 'checklist': return `Checklist (${habit.checklistItems?.length || 0} items)`;
      default: return 'Yes/No';
    }
  };

  const frequencyLabel = {
    daily: 'Daily',
    weekly: 'Weekly',
    specific: habit.specificDays?.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ') || 'Specific days',
    monthly: `Days: ${habit.monthlyDates?.join(', ') || 'Monthly'}`,
  }[habit.frequency];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {habit.name}
            {habit.currentStreak > 0 && (
              <span className="streak-badge text-xs">
                <Flame className="w-3 h-3" />
                {habit.currentStreak}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="stat-card text-center p-3">
              <Flame className="w-5 h-5 text-warning mx-auto mb-1" />
              <p className="text-xl font-bold">{habit.currentStreak}</p>
              <p className="text-[10px] text-muted-foreground">Current</p>
            </div>
            <div className="stat-card text-center p-3">
              <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold">{habit.bestStreak}</p>
              <p className="text-[10px] text-muted-foreground">Best</p>
            </div>
            <div className="stat-card text-center p-3">
              <Target className="w-5 h-5 text-success mx-auto mb-1" />
              <p className="text-xl font-bold">{stats.consistency}%</p>
              <p className="text-[10px] text-muted-foreground">Consistency</p>
            </div>
          </div>

          {/* Weekly View */}
          <div className="glass-card p-4">
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              This Week
            </h4>
            <div className="flex justify-between gap-1">
              {stats.weeklyView.map(day => (
                <div key={day.date} className="text-center">
                  <p className="text-[10px] text-muted-foreground mb-1">{day.dayName}</p>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    day.state === 'done' ? 'bg-success text-success-foreground' :
                    day.state === 'missed' ? 'bg-destructive text-destructive-foreground' :
                    day.state === 'skipped' ? 'bg-muted-foreground/50 text-background' :
                    'bg-muted/50'
                  }`}>
                    {day.state === 'done' ? <Check className="w-4 h-4" /> :
                     day.state === 'missed' ? <X className="w-4 h-4" /> :
                     day.state === 'skipped' ? <SkipForward className="w-3.5 h-3.5" /> :
                     <span className="text-xs text-muted-foreground">{day.dayNum}</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap Visualization */}
          <div className="glass-card p-4">
            <Tabs defaultValue="month" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-3">
                <TabsTrigger value="month" className="text-xs">Monthly</TabsTrigger>
                <TabsTrigger value="year" className="text-xs">Yearly</TabsTrigger>
              </TabsList>
              <TabsContent value="month">
                <HabitHeatmap habit={habit} view="month" />
              </TabsContent>
              <TabsContent value="year">
                <HabitHeatmap habit={habit} view="year" />
              </TabsContent>
            </Tabs>
          </div>

          {/* Completion Rates */}
          <div className="space-y-3">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">7-Day Completion</span>
                <span className="text-sm font-bold text-primary">{stats.completion7}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${stats.completion7}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                <span>{stats.done7} done</span>
                <span>{stats.skipped7} skipped</span>
                <span>{stats.missed7} missed</span>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">30-Day Completion</span>
                <span className="text-sm font-bold text-primary">{stats.completion30}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${stats.completion30}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                <span>{stats.done30} done</span>
                <span>{stats.skipped30} skipped</span>
                <span>{stats.missed30} missed</span>
              </div>
            </div>
          </div>

          {/* Habit Details */}
          <div className="glass-card p-4 space-y-3">
            <h4 className="font-medium text-sm">Details</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] text-muted-foreground">Category</p>
                <p className="font-medium">{habit.category}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Difficulty</p>
                <p className="font-medium capitalize">{habit.difficulty}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Frequency</p>
                <p className="font-medium">{frequencyLabel}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Evaluation</p>
                <p className="font-medium text-xs">{getEvaluationLabel()}</p>
              </div>
            </div>
            {habit.notes && (
              <div>
                <p className="text-[10px] text-muted-foreground">Notes</p>
                <p className="text-sm">{habit.notes}</p>
              </div>
            )}
            <div className="text-[10px] text-muted-foreground pt-2 border-t">
              Created: {format(parseISO(habit.createdAt), 'MMM d, yyyy')} • {stats.totalLogs} total logs
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
