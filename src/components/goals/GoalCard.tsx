import { Target, Calendar, MoreVertical, Edit, Trash2, Check } from 'lucide-react';
import { Goal } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, differenceInDays } from 'date-fns';

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const { deleteGoal, updateGoal, habits, tasks } = useApp();
  
  const daysRemaining = differenceInDays(new Date(goal.targetDate), new Date());
  const isOverdue = daysRemaining < 0;
  
  // Calculate progress based on tracking type
  let progress = goal.currentProgress;
  if (goal.trackingType === 'checklist' && goal.milestones) {
    const completed = goal.milestones.filter(m => m.completed).length;
    progress = goal.milestones.length > 0 ? Math.round((completed / goal.milestones.length) * 100) : 0;
  } else if (goal.trackingType === 'numeric' && goal.targetValue) {
    progress = Math.min(100, Math.round((goal.currentProgress / goal.targetValue) * 100));
  }

  const linkedHabits = habits.filter(h => goal.linkedHabitIds.includes(h.id));
  const linkedTasks = tasks.filter(t => goal.linkedTaskIds.includes(t.id));

  return (
    <div className={`card-elevated p-4 fade-in ${goal.completed ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          goal.completed ? 'bg-success/20 text-success' : 'bg-primary/10 text-primary'
        }`}>
          {goal.completed ? <Check className="w-5 h-5" /> : <Target className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className={`font-semibold text-base leading-tight ${goal.completed ? 'line-through' : ''}`}>
                {goal.title}
              </h3>
              {goal.why && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{goal.why}</p>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(goal)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {!goal.completed && (
                  <DropdownMenuItem onClick={() => updateGoal(goal.id, { completed: true })}>
                    <Check className="w-4 h-4 mr-2" />
                    Mark Complete
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => deleteGoal(goal.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium">{progress}% complete</span>
              {goal.trackingType === 'numeric' && goal.targetValue && (
                <span className="text-muted-foreground">
                  {goal.currentProgress} / {goal.targetValue}
                </span>
              )}
            </div>
            <div className="progress-bar">
              <div 
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {isOverdue 
                  ? `${Math.abs(daysRemaining)} days overdue`
                  : daysRemaining === 0 
                    ? 'Due today'
                    : `${daysRemaining} days left`
                }
              </span>
            </div>
            {(linkedHabits.length > 0 || linkedTasks.length > 0) && (
              <span className="text-xs text-muted-foreground">
                {linkedHabits.length > 0 && `${linkedHabits.length} habit${linkedHabits.length !== 1 ? 's' : ''}`}
                {linkedHabits.length > 0 && linkedTasks.length > 0 && ', '}
                {linkedTasks.length > 0 && `${linkedTasks.length} task${linkedTasks.length !== 1 ? 's' : ''}`}
              </span>
            )}
          </div>

          {/* Milestones preview */}
          {goal.trackingType === 'checklist' && goal.milestones && goal.milestones.length > 0 && (
            <div className="mt-3 space-y-1">
              {goal.milestones.slice(0, 3).map(milestone => (
                <div key={milestone.id} className="flex items-center gap-2 text-xs">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    milestone.completed ? 'bg-success border-success text-success-foreground' : 'border-muted-foreground/30'
                  }`}>
                    {milestone.completed && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <span className={milestone.completed ? 'line-through text-muted-foreground' : ''}>
                    {milestone.title}
                  </span>
                </div>
              ))}
              {goal.milestones.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{goal.milestones.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
