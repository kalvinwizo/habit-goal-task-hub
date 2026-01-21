import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { Goal, GoalTrackingType, GoalMilestone, PRESET_CATEGORIES } from '@/types';
import { Switch } from '@/components/ui/switch';
import { ReminderInput } from '@/components/reminders/ReminderInput';

interface CreateGoalDialogProps {
  editGoal?: Goal | null;
  onClose?: () => void;
  disabled?: boolean;
}

export function CreateGoalDialog({ editGoal, onClose, disabled }: CreateGoalDialogProps) {
  const { addGoal, updateGoal, customCategories } = useApp();
  const [open, setOpen] = useState(!!editGoal);
  const [title, setTitle] = useState(editGoal?.title || '');
  const [why, setWhy] = useState(editGoal?.why || '');
  const [targetDate, setTargetDate] = useState(editGoal?.targetDate || '');
  const [trackingType, setTrackingType] = useState<GoalTrackingType>(editGoal?.trackingType || 'percentage');
  const [targetValue, setTargetValue] = useState(editGoal?.targetValue?.toString() || '');
  const [milestones, setMilestones] = useState<GoalMilestone[]>(editGoal?.milestones || []);
  const [newMilestone, setNewMilestone] = useState('');
  const [category, setCategory] = useState(editGoal?.category || '');
  const [autoTrack, setAutoTrack] = useState(editGoal?.autoTrack ?? true);
  const [reminderTimes, setReminderTimes] = useState<string[]>(editGoal?.reminderTimes || []);

  const allCategories = [...PRESET_CATEGORIES.map(c => c.name), ...customCategories.map(c => c.name)];

  const resetForm = () => {
    setTitle('');
    setWhy('');
    setTargetDate('');
    setTrackingType('percentage');
    setTargetValue('');
    setMilestones([]);
    setNewMilestone('');
    setCategory('');
    setAutoTrack(true);
    setReminderTimes([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDate) return;

    const goalData = {
      title: title.trim(),
      why: why.trim() || undefined,
      targetDate,
      trackingType,
      targetValue: trackingType === 'numeric' ? parseInt(targetValue) || undefined : undefined,
      milestones: trackingType === 'checklist' ? milestones : undefined,
      category: category || undefined,
      autoTrack,
      reminderTimes: reminderTimes.length > 0 ? reminderTimes : undefined,
    };

    if (editGoal) {
      updateGoal(editGoal.id, goalData);
    } else {
      addGoal(goalData);
    }

    resetForm();
    setOpen(false);
    onClose?.();
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    setMilestones([
      ...milestones,
      { id: Date.now().toString(), title: newMilestone.trim(), completed: false }
    ]);
    setNewMilestone('');
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
      onClose?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!editGoal && (
        <DialogTrigger asChild>
          <Button size="icon" className="rounded-full shadow-elevated" disabled={disabled}>
            <Plus className="w-5 h-5" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Run a marathon"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="why">Why this goal? (optional)</Label>
            <Textarea
              id="why"
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder="Your motivation..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date</Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tracking Type</Label>
            <Select value={trackingType} onValueChange={(v) => setTrackingType(v as GoalTrackingType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (0-100%)</SelectItem>
                <SelectItem value="numeric">Numeric Target</SelectItem>
                <SelectItem value="checklist">Checklist / Milestones</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category (optional)</Label>
            <Select value={category || "none"} onValueChange={(v) => setCategory(v === "none" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {allCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Auto Track Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Auto-track Progress</Label>
              <p className="text-xs text-muted-foreground">
                Update progress from linked habits & tasks
              </p>
            </div>
            <Switch checked={autoTrack} onCheckedChange={setAutoTrack} />
          </div>

          {trackingType === 'numeric' && (
            <div className="space-y-2">
              <Label htmlFor="targetValue">Target Value</Label>
              <Input
                id="targetValue"
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="e.g., 20"
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                You can manually input progress values
              </p>
            </div>
          )}

          {trackingType === 'checklist' && (
            <div className="space-y-2">
              <Label>Milestones</Label>
              <div className="flex gap-2">
                <Input
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  placeholder="Add a milestone..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                />
                <Button type="button" size="icon" variant="outline" onClick={addMilestone}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {milestones.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {milestones.map(milestone => (
                    <div key={milestone.id} className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg px-3 py-2">
                      <span className="flex-1">{milestone.title}</span>
                      <button
                        type="button"
                        onClick={() => removeMilestone(milestone.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reminders */}
          <ReminderInput
            reminders={reminderTimes}
            onChange={setReminderTimes}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editGoal ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
