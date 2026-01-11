import { useState } from 'react';
import { Plus, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ReminderInputProps {
  reminders: string[];
  onChange: (reminders: string[]) => void;
  label?: string;
}

export function ReminderInput({ reminders, onChange, label = "Reminders" }: ReminderInputProps) {
  const [newTime, setNewTime] = useState('09:00');

  const addReminder = () => {
    if (!reminders.includes(newTime)) {
      onChange([...reminders, newTime].sort());
    }
  };

  const removeReminder = (time: string) => {
    onChange(reminders.filter(r => r !== time));
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Bell className="w-4 h-4" />
        {label} (optional)
      </Label>
      
      <div className="flex gap-2">
        <Input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          className="flex-1"
        />
        <Button 
          type="button" 
          size="icon" 
          variant="outline" 
          onClick={addReminder}
          disabled={reminders.includes(newTime)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {reminders.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {reminders.map(time => (
            <span 
              key={time} 
              className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1"
            >
              <Bell className="w-3 h-3" />
              {formatTime(time)}
              <button 
                type="button" 
                onClick={() => removeReminder(time)} 
                className="hover:text-destructive ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Add multiple reminder times for notifications
      </p>
    </div>
  );
}
