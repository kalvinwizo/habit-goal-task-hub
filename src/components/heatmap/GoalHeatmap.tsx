import { useMemo, useState } from 'react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, addWeeks, differenceInDays } from 'date-fns';
import { Goal } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GoalHeatmapProps {
  goal: Goal;
  view?: 'weekly' | 'monthly';
}

/**
 * Heatmap visualization for goal progress updates
 * Shows when progress was made towards the goal
 */
export function GoalHeatmap({ goal, view = 'weekly' }: GoalHeatmapProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));

  const heatmapData = useMemo(() => {
    const createdDate = new Date(goal.createdAt);
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    
    // Calculate expected progress based on time elapsed
    const totalDays = differenceInDays(targetDate, createdDate);
    const elapsedDays = differenceInDays(today, createdDate);
    const expectedProgress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
    
    if (view === 'weekly') {
      const weekEnd = endOfWeek(currentWeekStart);
      const days = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
      
      return {
        days: days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayProgress = day <= today ? Math.min(goal.currentProgress, (differenceInDays(day, createdDate) / totalDays) * 100) : 0;
          
          return {
            date: dateStr,
            dayName: format(day, 'EEE'),
            dayNum: format(day, 'd'),
            progress: dayProgress,
            isFuture: day > today,
          };
        }),
        weekLabel: `${format(currentWeekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`,
        expectedProgress,
      };
    } else {
      // Monthly view - last 30 days
      const days = Array.from({ length: 30 }, (_, i) => {
        const day = subDays(today, 29 - i);
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayProgress = Math.min(goal.currentProgress, (differenceInDays(day, createdDate) / totalDays) * 100);
        
        return {
          date: dateStr,
          progress: Math.max(0, dayProgress),
        };
      });

      return {
        days,
        expectedProgress,
      };
    }
  }, [goal, view, currentWeekStart]);

  const getProgressColor = (progress: number, isFuture?: boolean): string => {
    if (isFuture) return 'bg-muted/20';
    if (progress >= 100) return 'bg-success';
    if (progress >= 75) return 'bg-success/75';
    if (progress >= 50) return 'bg-primary/60';
    if (progress >= 25) return 'bg-primary/40';
    if (progress > 0) return 'bg-primary/20';
    return 'bg-muted/30';
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev =>
      direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  if (view === 'monthly') {
    const { days } = heatmapData as { days: { date: string; progress: number }[]; expectedProgress: number };
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Last 30 Days Progress</span>
          <span className="text-xs text-muted-foreground">
            {Math.round(goal.currentProgress)}% Complete
          </span>
        </div>
        
        <div className="grid grid-cols-10 gap-1">
          {days.map((day) => (
            <div
              key={day.date}
              className={cn(
                'aspect-square rounded-sm transition-all',
                getProgressColor(day.progress)
              )}
              title={`${day.date}: ${Math.round(day.progress)}%`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-sm bg-muted/30" />
            <div className="w-3 h-3 rounded-sm bg-primary/20" />
            <div className="w-3 h-3 rounded-sm bg-primary/40" />
            <div className="w-3 h-3 rounded-sm bg-primary/60" />
            <div className="w-3 h-3 rounded-sm bg-success" />
          </div>
          <span>More</span>
        </div>
      </div>
    );
  }

  // Weekly view
  const { days, weekLabel, expectedProgress } = heatmapData as {
    days: { date: string; dayName: string; dayNum: string; progress: number; isFuture: boolean }[];
    weekLabel: string;
    expectedProgress: number;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => navigateWeek('prev')}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium">{weekLabel}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => navigateWeek('next')}
          disabled={currentWeekStart >= startOfWeek(new Date())}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex justify-between gap-1">
        {days.map((day) => (
          <div key={day.date} className="flex-1 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">{day.dayName}</p>
            <div
              className={cn(
                'aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all',
                getProgressColor(day.progress, day.isFuture),
                day.progress >= 75 && !day.isFuture && 'text-success-foreground',
                day.isFuture && 'text-muted-foreground/50'
              )}
              title={day.isFuture ? 'Future' : `${Math.round(day.progress)}%`}
            >
              {day.dayNum}
            </div>
          </div>
        ))}
      </div>

      {/* Progress comparison */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
        <span>Expected: {Math.round(expectedProgress)}%</span>
        <span className={cn(
          goal.currentProgress >= expectedProgress ? 'text-success' : 'text-warning'
        )}>
          Actual: {Math.round(goal.currentProgress)}%
        </span>
      </div>
    </div>
  );
}
