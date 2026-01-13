import { useState, useRef } from 'react';
import { Check, X, SkipForward, Flame, MoreVertical, Archive, Edit, Hash, Timer, ListChecks, Eye } from 'lucide-react';
import { Habit, HabitState } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HabitDetailDialog } from './HabitDetailDialog';

interface HabitCardProps {
  habit: Habit;
  onEdit?: (habit: Habit) => void;
}

export function HabitCard({ habit, onEdit }: HabitCardProps) {
  const { logHabit, getHabitLogForDate, getTodayString, archiveHabit, settings } = useApp();
  const today = getTodayString();
  const todayLog = getHabitLogForDate(habit.id, today);
  const currentState = todayLog?.state || 'pending';
  
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleTap = () => {
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    tapTimeoutRef.current = setTimeout(() => {
      if (newTapCount === 1) {
        // Single tap: Mark as done
        logHabit(habit.id, 'done');
      } else if (newTapCount >= 2) {
        // Double tap: Mark as missed
        logHabit(habit.id, 'missed');
      }
      setTapCount(0);
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const deltaX = e.touches[0].clientX - touchStart.x;
    const deltaY = Math.abs(e.touches[0].clientY - touchStart.y);
    
    // Only allow horizontal swipes
    if (deltaY > 30) {
      setSwipeOffset(0);
      return;
    }
    
    setSwipeOffset(Math.max(-100, Math.min(100, deltaX)));
    if (deltaX > 30) setSwipeDirection('right');
    else if (deltaX < -30) setSwipeDirection('left');
    else setSwipeDirection(null);
  };

  const handleTouchEnd = () => {
    if (swipeOffset > 60) {
      // Swipe right: Skip
      logHabit(habit.id, 'skipped');
    } else if (swipeOffset < -60) {
      // Swipe left: Miss
      logHabit(habit.id, 'missed');
    }
    setSwipeOffset(0);
    setSwipeDirection(null);
    setTouchStart(null);
  };

  const handleStateChange = (state: HabitState) => {
    if (state === 'pending') return;
    logHabit(habit.id, state);
  };

  const difficultyClass = {
    easy: 'difficulty-easy',
    medium: 'difficulty-medium',
    hard: 'difficulty-hard',
  }[habit.difficulty];

  const frequencyLabel = {
    daily: 'Daily',
    weekly: 'Weekly',
    specific: habit.specificDays?.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ') || 'Specific days',
    monthly: habit.monthlyDates?.map(d => d.toString()).join(', ') || 'Monthly',
  }[habit.frequency];

  const getStateColor = () => {
    switch (currentState) {
      case 'done': return 'ring-2 ring-success bg-success/10';
      case 'missed': return 'ring-2 ring-destructive bg-destructive/10';
      case 'skipped': return 'ring-2 ring-muted-foreground bg-muted/50';
      default: return '';
    }
  };

  const getEvaluationIcon = () => {
    switch (habit.evaluationType) {
      case 'numeric': return <Hash className="w-3.5 h-3.5" />;
      case 'timer': return <Timer className="w-3.5 h-3.5" />;
      case 'checklist': return <ListChecks className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  return (
    <>
      <div 
        className={`card-elevated p-4 fade-in relative overflow-hidden transition-all duration-200 ${getStateColor()}`}
        style={{ 
          transform: `translateX(${swipeOffset}px)`,
          opacity: 1 - Math.abs(swipeOffset) / 200
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Swipe indicators */}
        {swipeDirection === 'right' && (
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-skipped/30 to-transparent flex items-center justify-center">
            <SkipForward className="w-6 h-6 text-skipped" />
          </div>
        )}
        {swipeDirection === 'left' && (
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-destructive/30 to-transparent flex items-center justify-center">
            <X className="w-6 h-6 text-destructive" />
          </div>
        )}

        <div className="flex items-start gap-3">
          {/* Tap completion button */}
          <button
            onClick={handleTap}
            className={`habit-state-btn shrink-0 transition-all duration-200 ${
              currentState === 'done' 
                ? 'habit-state-done scale-110' 
                : currentState === 'missed'
                  ? 'bg-destructive text-destructive-foreground scale-110'
                  : currentState === 'skipped'
                    ? 'bg-muted-foreground text-background'
                    : 'habit-state-pending'
            }`}
            title="Tap: done, Double-tap: missed"
          >
            {currentState === 'done' ? (
              <Check className="w-5 h-5" />
            ) : currentState === 'missed' ? (
              <X className="w-5 h-5" />
            ) : currentState === 'skipped' ? (
              <SkipForward className="w-5 h-5" />
            ) : (
              <Check className="w-5 h-5" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-base leading-tight">{habit.name}</h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs text-muted-foreground">{habit.category}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{frequencyLabel}</span>
                  {getEvaluationIcon() && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="flex items-center gap-1 text-xs text-primary">
                        {getEvaluationIcon()}
                        {habit.evaluationType === 'numeric' && habit.targetNumericValue && `/${habit.targetNumericValue}`}
                        {habit.evaluationType === 'timer' && habit.targetTimerValue && `/${Math.floor(habit.targetTimerValue / 60)}min`}
                        {habit.evaluationType === 'checklist' && habit.checklistItems && `${habit.checklistItems.length} items`}
                      </span>
                    </>
                  )}
                  <span className={`difficulty-badge ${difficultyClass}`}>{habit.difficulty}</span>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowDetail(true)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStateChange('done')}>
                    <Check className="w-4 h-4 mr-2 text-success" />
                    Mark Done
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStateChange('skipped')}>
                    <SkipForward className="w-4 h-4 mr-2" />
                    Skip (keeps streak)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStateChange('missed')}>
                    <X className="w-4 h-4 mr-2 text-destructive" />
                    Mark Missed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(habit)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => archiveHabit(habit.id)}>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Streak display */}
            {settings.showStreaks && (
              <div className="flex items-center gap-3 mt-3">
                {habit.currentStreak > 0 && (
                  <div className="streak-badge">
                    <Flame className="w-4 h-4" />
                    <span>{habit.currentStreak} day{habit.currentStreak !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {habit.bestStreak > 0 && habit.bestStreak > habit.currentStreak && (
                  <span className="text-xs text-muted-foreground">
                    Best: {habit.bestStreak} days
                  </span>
                )}
              </div>
            )}

            {habit.notes && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{habit.notes}</p>
            )}
          </div>
        </div>
      </div>

      {/* Habit Detail Dialog */}
      <HabitDetailDialog 
        habit={habit}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </>
  );
}