import { useState } from 'react';
import { Plus, CheckCircle, Hash, Timer, ListChecks, Trash2 } from 'lucide-react';
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
import { Habit, HabitDifficulty, HabitFrequency, HabitEvaluationType, HabitChecklistItem, PRESET_CATEGORIES } from '@/types';
import { MonthDayPicker } from '@/components/ui/month-day-picker';
import { ReminderInput } from '@/components/reminders/ReminderInput';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CreateHabitDialogProps {
  editHabit?: Habit | null;
  onClose?: () => void;
  disabled?: boolean;
}

export function CreateHabitDialog({ editHabit, onClose, disabled }: CreateHabitDialogProps) {
  const { addHabit, updateHabit, customCategories, goals } = useApp();
  const [open, setOpen] = useState(!!editHabit);
  const [name, setName] = useState(editHabit?.name || '');
  const [category, setCategory] = useState(editHabit?.category || 'Health');
  const [difficulty, setDifficulty] = useState<HabitDifficulty>(editHabit?.difficulty || 'medium');
  const [frequency, setFrequency] = useState<HabitFrequency>(editHabit?.frequency || 'daily');
  const [evaluationType, setEvaluationType] = useState<HabitEvaluationType>(editHabit?.evaluationType || 'yes_no');
  const [specificDays, setSpecificDays] = useState<number[]>(editHabit?.specificDays || []);
  const [monthlyDates, setMonthlyDates] = useState<number[]>(editHabit?.monthlyDates || []);
  const [notes, setNotes] = useState(editHabit?.notes || '');
  const [linkedGoalId, setLinkedGoalId] = useState(editHabit?.linkedGoalId || '');
  const [reminderTimes, setReminderTimes] = useState<string[]>(editHabit?.reminderTimes || []);
  const [targetNumericValue, setTargetNumericValue] = useState(editHabit?.targetNumericValue || 0);
  const [targetTimerValue, setTargetTimerValue] = useState(editHabit?.targetTimerValue ? Math.floor(editHabit.targetTimerValue / 60) : 30);
  const [checklistItems, setChecklistItems] = useState<HabitChecklistItem[]>(editHabit?.checklistItems || []);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const allCategories = [...PRESET_CATEGORIES.map(c => c.name), ...customCategories.map(c => c.name)];
  const activeGoals = goals.filter(g => !g.completed);

  const resetForm = () => {
    setName('');
    setCategory('Health');
    setDifficulty('medium');
    setFrequency('daily');
    setEvaluationType('yes_no');
    setSpecificDays([]);
    setMonthlyDates([]);
    setNotes('');
    setLinkedGoalId('');
    setReminderTimes([]);
    setTargetNumericValue(0);
    setTargetTimerValue(30);
    setChecklistItems([]);
    setNewChecklistItem('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const habitData = {
      name: name.trim(),
      category,
      difficulty,
      frequency,
      evaluationType,
      specificDays: frequency === 'specific' ? specificDays : undefined,
      monthlyDates: frequency === 'monthly' ? monthlyDates : undefined,
      notes: notes.trim() || undefined,
      linkedGoalId: linkedGoalId || undefined,
      reminderTimes: reminderTimes.length > 0 ? reminderTimes : undefined,
      targetNumericValue: evaluationType === 'numeric' ? targetNumericValue : undefined,
      targetTimerValue: evaluationType === 'timer' ? targetTimerValue * 60 : undefined,
      checklistItems: evaluationType === 'checklist' ? checklistItems : undefined,
    };

    if (editHabit) {
      updateHabit(editHabit.id, habitData);
    } else {
      addHabit(habitData);
    }

    resetForm();
    setOpen(false);
    onClose?.();
  };

  const toggleDay = (dayIndex: number) => {
    setSpecificDays(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklistItems(prev => [...prev, {
        id: Date.now().toString(),
        title: newChecklistItem.trim(),
        completed: false
      }]);
      setNewChecklistItem('');
    }
  };

  const removeChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id));
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
      onClose?.();
    }
  };

  const evaluationOptions = [
    { value: 'yes_no', icon: CheckCircle, label: 'Yes or No', description: 'Record whether you succeed with the activity or not' },
    { value: 'numeric', icon: Hash, label: 'Numeric Value', description: 'Establish a value as a daily goal or limit' },
    { value: 'timer', icon: Timer, label: 'Timer', description: 'Establish a time value as a daily goal or limit' },
    { value: 'checklist', icon: ListChecks, label: 'Checklist', description: 'Evaluate based on a set of sub-items' },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!editHabit && (
        <DialogTrigger asChild>
          <Button size="icon" className="rounded-full shadow-elevated" disabled={disabled}>
            <Plus className="w-5 h-5" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editHabit ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning meditation"
              required
            />
          </div>

          {/* Evaluation Type Selection */}
          <div className="space-y-3">
            <Label>How do you want to evaluate your progress?</Label>
            <div className="grid grid-cols-2 gap-2">
              {evaluationOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEvaluationType(opt.value as HabitEvaluationType)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    evaluationType === opt.value
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                      : 'glass-card hover:bg-muted/60'
                  }`}
                >
                  <opt.icon className="w-5 h-5 mb-1.5" />
                  <p className="font-medium text-sm">{opt.label}</p>
                  <p className={`text-[10px] mt-0.5 ${evaluationType === opt.value ? 'opacity-80' : 'text-muted-foreground'}`}>
                    {opt.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Numeric Target */}
          {evaluationType === 'numeric' && (
            <div className="space-y-2">
              <Label>Daily Target Value</Label>
              <Input
                type="number"
                min={1}
                value={targetNumericValue}
                onChange={(e) => setTargetNumericValue(parseInt(e.target.value) || 0)}
                placeholder="e.g., 10000 steps"
              />
            </div>
          )}

          {/* Timer Target */}
          {evaluationType === 'timer' && (
            <div className="space-y-2">
              <Label>Daily Time Goal (minutes)</Label>
              <Input
                type="number"
                min={1}
                value={targetTimerValue}
                onChange={(e) => setTargetTimerValue(parseInt(e.target.value) || 0)}
                placeholder="e.g., 30 minutes"
              />
            </div>
          )}

          {/* Checklist Items */}
          {evaluationType === 'checklist' && (
            <div className="space-y-2">
              <Label>Checklist Items</Label>
              <div className="flex gap-2">
                <Input
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  placeholder="Add checklist item..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                />
                <Button type="button" size="icon" variant="outline" onClick={addChecklistItem}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {checklistItems.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {checklistItems.map(item => (
                    <div key={item.id} className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg px-3 py-2">
                      <ListChecks className="w-4 h-4 text-muted-foreground" />
                      <span className="flex-1">{item.title}</span>
                      <button type="button" onClick={() => removeChecklistItem(item.id)} className="text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as HabitDifficulty)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as HabitFrequency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="specific">Specific Days of Week</SelectItem>
                <SelectItem value="monthly">Specific Days of Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === 'specific' && (
            <div className="space-y-2">
              <Label>Select Days of Week</Label>
              <div className="flex gap-1.5">
                {weekDays.map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`w-9 h-9 rounded-lg text-xs font-medium transition-colors ${
                      specificDays.includes(index)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {frequency === 'monthly' && (
            <div className="space-y-2">
              <Label>Select Days of Month</Label>
              <MonthDayPicker selectedDays={monthlyDates} onChange={setMonthlyDates} />
            </div>
          )}

          {/* Reminders */}
          <ReminderInput reminders={reminderTimes} onChange={setReminderTimes} />

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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this habit..."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editHabit ? 'Save Changes' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}