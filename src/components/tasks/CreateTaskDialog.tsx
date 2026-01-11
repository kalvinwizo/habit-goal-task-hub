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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { Task, TaskType, PRESET_CATEGORIES } from '@/types';
import { MonthDayPicker } from '@/components/ui/month-day-picker';
import { ReminderInput } from '@/components/reminders/ReminderInput';

interface CreateTaskDialogProps {
  editTask?: Task | null;
  onClose?: () => void;
}

export function CreateTaskDialog({ editTask, onClose }: CreateTaskDialogProps) {
  const { addTask, updateTask, goals, customCategories } = useApp();
  const [open, setOpen] = useState(!!editTask);
  const [title, setTitle] = useState(editTask?.title || '');
  const [type, setType] = useState<TaskType>(editTask?.type || 'daily');
  const [dates, setDates] = useState<string[]>(editTask?.dates || []);
  const [monthlyDates, setMonthlyDates] = useState<number[]>(editTask?.monthlyDates || []);
  const [linkedGoalId, setLinkedGoalId] = useState(editTask?.linkedGoalId || '');
  const [category, setCategory] = useState(editTask?.category || '');
  const [numericValue, setNumericValue] = useState(editTask?.numericValue?.toString() || '');
  const [targetNumericValue, setTargetNumericValue] = useState(editTask?.targetNumericValue?.toString() || '');
  const [reminderTimes, setReminderTimes] = useState<string[]>(editTask?.reminderTimes || []);
  const [newDate, setNewDate] = useState('');

  const allCategories = [...PRESET_CATEGORIES.map(c => c.name), ...customCategories.map(c => c.name)];

  const resetForm = () => {
    setTitle('');
    setType('daily');
    setDates([]);
    setMonthlyDates([]);
    setLinkedGoalId('');
    setCategory('');
    setNumericValue('');
    setTargetNumericValue('');
    setReminderTimes([]);
    setNewDate('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      type,
      dates: type === 'monthly' ? dates : undefined,
      monthlyDates: type === 'monthly' ? monthlyDates : undefined,
      linkedGoalId: linkedGoalId || undefined,
      category: category || undefined,
      numericValue: numericValue ? parseInt(numericValue) : undefined,
      targetNumericValue: targetNumericValue ? parseInt(targetNumericValue) : undefined,
      reminderTimes: reminderTimes.length > 0 ? reminderTimes : undefined,
    };

    if (editTask) {
      updateTask(editTask.id, taskData);
    } else {
      addTask(taskData);
    }

    resetForm();
    setOpen(false);
    onClose?.();
  };

  const addDate = () => {
    if (!newDate || dates.includes(newDate)) return;
    setDates([...dates, newDate].sort());
    setNewDate('');
  };

  const removeDate = (date: string) => {
    setDates(dates.filter(d => d !== date));
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
      onClose?.();
    }
  };

  const activeGoals = goals.filter(g => !g.completed);
  const linkedGoal = activeGoals.find(g => g.id === linkedGoalId);
  const showNumericInput = linkedGoal?.trackingType === 'numeric';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!editTask && (
        <DialogTrigger asChild>
          <Button size="icon" className="rounded-full shadow-elevated">
            <Plus className="w-5 h-5" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Review weekly goals"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Task Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as TaskType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily (resets every day)</SelectItem>
                <SelectItem value="one-time">One-time</SelectItem>
                <SelectItem value="monthly">Monthly (specific dates)</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

          {type === 'monthly' && (
            <>
              {/* Recurring monthly dates */}
              <div className="space-y-2">
                <Label>Recurring Days of Month</Label>
                <MonthDayPicker
                  selectedDays={monthlyDates}
                  onChange={setMonthlyDates}
                />
              </div>

              {/* Specific dates */}
              <div className="space-y-2">
                <Label>Or Select Specific Dates</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <Button type="button" size="icon" variant="outline" onClick={addDate}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {dates.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {dates.map(date => (
                      <span key={date} className="flex items-center gap-1 text-xs bg-muted rounded-lg px-2 py-1">
                        {new Date(date).toLocaleDateString()}
                        <button type="button" onClick={() => removeDate(date)} className="hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeGoals.length > 0 && (
            <div className="space-y-2">
              <Label>Link to Goal (optional)</Label>
              <Select value={linkedGoalId || "none"} onValueChange={(v) => setLinkedGoalId(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a goal..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No goal</SelectItem>
                  {activeGoals.map(goal => (
                    <SelectItem key={goal.id} value={goal.id}>{goal.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Numeric value for linked goal */}
          {showNumericInput && (
            <div className="space-y-2">
              <Label>Numeric Value Contribution</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    value={numericValue}
                    onChange={(e) => setNumericValue(e.target.value)}
                    placeholder="Current value"
                    min="0"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Current</p>
                </div>
                <div>
                  <Input
                    type="number"
                    value={targetNumericValue}
                    onChange={(e) => setTargetNumericValue(e.target.value)}
                    placeholder="Target value"
                    min="1"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Target</p>
                </div>
              </div>
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
              {editTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
