import { useState } from 'react';
import { Plus } from 'lucide-react';
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
import { Habit, HabitDifficulty, HabitFrequency } from '@/types';

const categories = ['Health', 'Fitness', 'Learning', 'Productivity', 'Mindfulness', 'Social', 'Finance', 'Other'];
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CreateHabitDialogProps {
  editHabit?: Habit | null;
  onClose?: () => void;
}

export function CreateHabitDialog({ editHabit, onClose }: CreateHabitDialogProps) {
  const { addHabit, updateHabit } = useApp();
  const [open, setOpen] = useState(!!editHabit);
  const [name, setName] = useState(editHabit?.name || '');
  const [category, setCategory] = useState(editHabit?.category || 'Health');
  const [difficulty, setDifficulty] = useState<HabitDifficulty>(editHabit?.difficulty || 'medium');
  const [frequency, setFrequency] = useState<HabitFrequency>(editHabit?.frequency || 'daily');
  const [specificDays, setSpecificDays] = useState<number[]>(editHabit?.specificDays || []);
  const [notes, setNotes] = useState(editHabit?.notes || '');

  const resetForm = () => {
    setName('');
    setCategory('Health');
    setDifficulty('medium');
    setFrequency('daily');
    setSpecificDays([]);
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const habitData = {
      name: name.trim(),
      category,
      difficulty,
      frequency,
      specificDays: frequency === 'specific' ? specificDays : undefined,
      notes: notes.trim() || undefined,
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

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
      onClose?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!editHabit && (
        <DialogTrigger asChild>
          <Button size="icon" className="rounded-full shadow-elevated">
            <Plus className="w-5 h-5" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
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
                <SelectItem value="specific">Specific Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === 'specific' && (
            <div className="space-y-2">
              <Label>Select Days</Label>
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
