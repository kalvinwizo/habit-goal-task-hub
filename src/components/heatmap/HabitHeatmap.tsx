import { useMemo, useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, getYear } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { Habit } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HabitHeatmapProps {
  habit: Habit;
  view?: 'month' | 'year';
  onDayClick?: (date: string, state: string) => void;
}

/**
 * GitHub-style heatmap visualization for habit completion
 * Displays daily completion intensity with color coding
 */
export function HabitHeatmap({ habit, view = 'month', onDayClick }: HabitHeatmapProps) {
  const { habitLogs } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const heatmapData = useMemo(() => {
    const habitLogsForHabit = habitLogs.filter(l => l.habitId === habit.id);
    
    if (view === 'month') {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const days = eachDayOfInterval({ start, end });
      
      // Calculate leading empty cells for proper week alignment
      const leadingDays = getDay(start);
      
      return {
        days: days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const log = habitLogsForHabit.find(l => l.date === dateStr);
          return {
            date: dateStr,
            dayNum: format(day, 'd'),
            state: log?.state || 'pending',
          };
        }),
        leadingDays,
        monthLabel: format(currentDate, 'MMMM yyyy'),
      };
    } else {
      // Yearly view - last 365 days
      const days = Array.from({ length: 365 }, (_, i) => {
        const day = subDays(new Date(), 364 - i);
        const dateStr = format(day, 'yyyy-MM-dd');
        const log = habitLogsForHabit.find(l => l.date === dateStr);
        return {
          date: dateStr,
          state: log?.state || 'pending',
          week: Math.floor(i / 7),
          dayOfWeek: getDay(day),
        };
      });

      // Group by weeks for proper display
      const weeks: typeof days[] = [];
      for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
      }

      return {
        weeks,
        year: getYear(new Date()),
      };
    }
  }, [habit.id, habitLogs, view, currentDate]);

  const getStateColor = (state: string): string => {
    switch (state) {
      case 'done':
        return 'bg-success';
      case 'missed':
        return 'bg-destructive';
      case 'skipped':
        return 'bg-muted-foreground/50';
      default:
        return 'bg-muted/30 dark:bg-muted/20';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  if (view === 'year') {
    const { weeks } = heatmapData as { weeks: { date: string; state: string; week: number; dayOfWeek: number }[][] };
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Last 365 Days</span>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-muted/30" /> Pending
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-success" /> Done
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-muted-foreground/50" /> Skip
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-destructive" /> Miss
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-0.5 min-w-max">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-0.5">
                {week.map((day, dayIndex) => (
                  <div
                    key={day.date}
                    className={cn(
                      'w-2.5 h-2.5 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary/50',
                      getStateColor(day.state)
                    )}
                    onClick={() => onDayClick?.(day.date, day.state)}
                    title={`${day.date}: ${day.state}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Monthly view
  const { days, leadingDays, monthLabel } = heatmapData as { 
    days: { date: string; dayNum: string; state: string }[]; 
    leadingDays: number; 
    monthLabel: string;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => navigateMonth('prev')}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium">{monthLabel}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => navigateMonth('next')}
          disabled={format(currentDate, 'yyyy-MM') >= format(new Date(), 'yyyy-MM')}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <span key={i} className="text-[10px] text-muted-foreground font-medium">
            {day}
          </span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leading empty cells */}
        {Array.from({ length: leadingDays }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {/* Actual days */}
        {days.map((day) => (
          <div
            key={day.date}
            className={cn(
              'aspect-square rounded-md flex items-center justify-center text-[10px] font-medium cursor-pointer transition-all hover:ring-2 hover:ring-primary/50',
              getStateColor(day.state),
              day.state === 'done' && 'text-success-foreground',
              day.state === 'missed' && 'text-destructive-foreground',
              day.state === 'skipped' && 'text-background',
              day.state === 'pending' && 'text-muted-foreground'
            )}
            onClick={() => onDayClick?.(day.date, day.state)}
            title={`${day.date}: ${day.state}`}
          >
            {day.dayNum}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground pt-2">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-success" /> Done
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted-foreground/50" /> Skip
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-destructive" /> Miss
        </span>
      </div>
    </div>
  );
}
