import { useState } from 'react';
import { Target, Calendar, Check, Clock, TrendingUp, Minus, Plus, Link } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useApp } from '@/context/AppContext';
import { Goal } from '@/types';
import { format, differenceInDays, differenceInMilliseconds } from 'date-fns';

interface GoalDetailDialogProps {
  goal: Goal;
  open: boolean;
  onClose: () => void;
}

export function GoalDetailDialog({ goal, open, onClose }: GoalDetailDialogProps) {
  const { updateGoal, habits, tasks } = useApp();
  const [editProgress, setEditProgress] = useState(false);
  const [progressValue, setProgressValue] = useState(goal.currentProgress);
  const [numericInput, setNumericInput] = useState(goal.currentProgress.toString());

  const daysRemaining = differenceInDays(new Date(goal.targetDate), new Date());
  const isOverdue = daysRemaining < 0;
  
  const totalDuration = differenceInMilliseconds(new Date(goal.targetDate), new Date(goal.createdAt));
  const elapsed = differenceInMilliseconds(new Date(), new Date(goal.createdAt));
  const timeProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  // Calculate display progress
  let displayProgress = goal.currentProgress;
  if (goal.trackingType === 'checklist' && goal.milestones) {
    const completed = goal.milestones.filter(m => m.completed).length;
    displayProgress = goal.milestones.length > 0 ? Math.round((completed / goal.milestones.length) * 100) : 0;
  } else if (goal.trackingType === 'numeric' && goal.targetValue) {
    displayProgress = Math.min(100, Math.round((goal.currentProgress / goal.targetValue) * 100));
  }

  const linkedHabits = habits.filter(h => goal.linkedHabitIds.includes(h.id));
  const linkedTasks = tasks.filter(t => goal.linkedTaskIds.includes(t.id));

  const handleSaveProgress = () => {
    if (goal.trackingType === 'numeric') {
      const value = parseInt(numericInput) || 0;
      updateGoal(goal.id, { currentProgress: value });
    } else {
      updateGoal(goal.id, { currentProgress: progressValue });
    }
    setEditProgress(false);
  };

  const handleMilestoneToggle = (milestoneId: string) => {
    if (!goal.milestones) return;
    const updatedMilestones = goal.milestones.map(m =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    updateGoal(goal.id, { milestones: updatedMilestones });
  };

  const adjustNumericValue = (delta: number) => {
    const newValue = Math.max(0, (parseInt(numericInput) || 0) + delta);
    setNumericInput(newValue.toString());
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {goal.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Progress Overview */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-2xl font-bold text-primary">{displayProgress}%</span>
            </div>
            <div className="progress-bar h-3">
              <div 
                className="progress-bar-fill h-full"
                style={{ width: `${displayProgress}%` }}
              />
            </div>

            {/* Time remaining bar */}
            {!goal.completed && (
              <div className="space-y-1 pt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Time elapsed
                  </span>
                  <span>{Math.round(timeProgress)}%</span>
                </div>
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      timeProgress > displayProgress ? 'bg-warning' : 'bg-success/60'
                    }`}
                    style={{ width: `${timeProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Manual Progress Update */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Update Progress</h4>
              {!editProgress ? (
                <Button size="sm" variant="outline" onClick={() => setEditProgress(true)}>
                  Edit
                </Button>
              ) : (
                <Button size="sm" onClick={handleSaveProgress}>
                  Save
                </Button>
              )}
            </div>

            {editProgress && (
              <>
                {goal.trackingType === 'percentage' && (
                  <div className="space-y-2">
                    <Slider
                      value={[progressValue]}
                      onValueChange={(v) => setProgressValue(v[0])}
                      max={100}
                      step={1}
                    />
                    <div className="text-center text-lg font-bold">{progressValue}%</div>
                  </div>
                )}

                {goal.trackingType === 'numeric' && (
                  <div className="flex items-center gap-3 justify-center">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => adjustNumericValue(-1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={numericInput}
                      onChange={(e) => setNumericInput(e.target.value)}
                      className="w-24 text-center text-lg font-bold"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => adjustNumericValue(1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    {goal.targetValue && (
                      <span className="text-muted-foreground">/ {goal.targetValue}</span>
                    )}
                  </div>
                )}
              </>
            )}

            {goal.trackingType === 'checklist' && goal.milestones && (
              <div className="space-y-2">
                {goal.milestones.map(milestone => (
                  <button
                    key={milestone.id}
                    onClick={() => handleMilestoneToggle(milestone.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      milestone.completed 
                        ? 'bg-success border-success text-success-foreground' 
                        : 'border-muted-foreground/30'
                    }`}>
                      {milestone.completed && <Check className="w-3 h-3" />}
                    </div>
                    <span className={milestone.completed ? 'line-through text-muted-foreground' : ''}>
                      {milestone.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-card text-center p-3">
              <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">
                {isOverdue ? `${Math.abs(daysRemaining)}d overdue` : `${daysRemaining}d left`}
              </p>
              <p className="text-[10px] text-muted-foreground">Deadline</p>
            </div>
            <div className="stat-card text-center p-3">
              <TrendingUp className="w-5 h-5 text-success mx-auto mb-1" />
              <p className="text-lg font-bold">{displayProgress}%</p>
              <p className="text-[10px] text-muted-foreground">Complete</p>
            </div>
          </div>

          {/* Linked Items */}
          {(linkedHabits.length > 0 || linkedTasks.length > 0) && (
            <div className="glass-card p-4 space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Link className="w-4 h-4" />
                Linked Items
              </h4>
              
              {linkedHabits.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Habits</p>
                  {linkedHabits.map(habit => (
                    <div key={habit.id} className="text-sm py-1">
                      {habit.name}
                    </div>
                  ))}
                </div>
              )}
              
              {linkedTasks.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Tasks</p>
                  {linkedTasks.map(task => (
                    <div key={task.id} className="text-sm py-1 flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${task.completed ? 'bg-success' : 'bg-muted'}`} />
                      {task.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Goal Details */}
          <div className="glass-card p-4 space-y-3">
            <h4 className="font-medium text-sm">Details</h4>
            {goal.why && (
              <div>
                <p className="text-[10px] text-muted-foreground">Why</p>
                <p className="text-sm">{goal.why}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] text-muted-foreground">Tracking Type</p>
                <p className="font-medium capitalize">{goal.trackingType}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Target Date</p>
                <p className="font-medium">{format(new Date(goal.targetDate), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Auto-track</p>
                <p className="font-medium">{goal.autoTrack ? 'Yes' : 'No (Manual)'}</p>
              </div>
              {goal.category && (
                <div>
                  <p className="text-[10px] text-muted-foreground">Category</p>
                  <p className="font-medium">{goal.category}</p>
                </div>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground pt-2 border-t">
              Created: {format(new Date(goal.createdAt), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
