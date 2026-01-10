import { Check, X, SkipForward, Flame, MoreVertical, Archive, Edit, Trash2 } from 'lucide-react';
import { Habit, HabitState } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HabitCardProps {
  habit: Habit;
  onEdit?: (habit: Habit) => void;
}

export function HabitCard({ habit, onEdit }: HabitCardProps) {
  const { logHabit, getHabitLogForDate, getTodayString, archiveHabit, settings } = useApp();
  const today = getTodayString();
  const todayLog = getHabitLogForDate(habit.id, today);
  const currentState = todayLog?.state || 'pending';

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
  }[habit.frequency];

  return (
    <div className="card-elevated p-4 fade-in">
      <div className="flex items-start gap-3">
        {/* State buttons */}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => handleStateChange('done')}
            className={`habit-state-btn ${currentState === 'done' ? 'habit-state-done' : 'habit-state-pending'}`}
            title="Mark as done"
          >
            <Check className="w-5 h-5" />
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => handleStateChange('skipped')}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                currentState === 'skipped' ? 'bg-skipped text-skipped-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
              title="Skip (won't break streak)"
            >
              <SkipForward className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleStateChange('missed')}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                currentState === 'missed' ? 'bg-missed text-missed-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
              title="Miss (breaks streak)"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-base leading-tight">{habit.name}</h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs text-muted-foreground">{habit.category}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{frequencyLabel}</span>
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
  );
}
