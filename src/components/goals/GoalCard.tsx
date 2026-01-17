/**
 * GoalCard - Presentation component for displaying a single goal
 * 
 * This component is primarily presentation-focused and delegates
 * business logic to domain hooks and the data layer.
 */

import { useState, useRef } from 'react';
import { Target, Calendar, MoreVertical, Edit, Trash2, Check, Clock, Eye } from 'lucide-react';
import { Goal } from '@/types';
import { useApp } from '@/context/AppContext';
import { useGoals } from '@/hooks/domain/useGoals';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GoalDetailDialog } from './GoalDetailDialog';

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const { deleteGoal, updateGoal, habits, tasks, goals } = useApp();
  
  // Use domain hooks for business logic
  const { calculateProgress, getTimeStatus, getLinkedHabits, getLinkedTasks, isBehindSchedule } = useGoals({ goals, habits, tasks });
  
  // Local UI state
  const [showDetail, setShowDetail] = useState(false);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  
  // Get computed values from domain hooks
  const { percentage: progress } = calculateProgress(goal);
  const { daysRemaining, isOverdue, timeProgress } = getTimeStatus(goal);
  const linkedHabits = getLinkedHabits(goal);
  const linkedTasks = getLinkedTasks(goal);
  const behindSchedule = isBehindSchedule(goal);

  // Long-press handlers
  const handleTouchStart = () => {
    setIsLongPress(false);
    longPressTimeoutRef.current = setTimeout(() => {
      setIsLongPress(true);
      setShowDetail(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
  };

  const handleTouchMove = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
  };

  return (
    <>
      <div 
        className={`card-elevated p-4 fade-in ${goal.completed ? 'opacity-70' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
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
                  <DropdownMenuItem onClick={() => setShowDetail(true)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
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
            <div className="mt-3 space-y-2">
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

              {/* Time remaining bar */}
              {!goal.completed && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Time elapsed
                    </span>
                    <span>{Math.round(timeProgress)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        behindSchedule 
                          ? 'bg-warning' 
                          : 'bg-success/60'
                      }`}
                      style={{ width: `${timeProgress}%` }}
                    />
                  </div>
                  {behindSchedule && (
                    <p className="text-[10px] text-warning">
                      Behind schedule - {Math.round(timeProgress - progress)}% more time used than progress made
                    </p>
                  )}
                </div>
              )}
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

      {/* Goal Detail Dialog */}
      <GoalDetailDialog 
        goal={goal}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </>
  );
}