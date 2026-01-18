import { Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings } from '@/types';

interface TimeSettingsProps {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Time-related settings - Start of day, week start, default reminder
 */
export function TimeSettings({ settings, onUpdate }: TimeSettingsProps) {
  return (
    <section className="glass-card p-4 slide-up" style={{ animationDelay: '0.1s' }}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" />
        Time & Calendar
      </h3>
      
      <div className="space-y-4">
        {/* Start of Day */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="startOfDay">Start of Day</Label>
            <p className="text-xs text-muted-foreground">When your day resets</p>
          </div>
          <Input
            id="startOfDay"
            type="time"
            value={settings.startOfDay}
            onChange={(e) => onUpdate('startOfDay', e.target.value)}
            className="w-28"
          />
        </div>

        {/* Week Start */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="weekStart">Week Starts On</Label>
            <p className="text-xs text-muted-foreground">First day of the week</p>
          </div>
          <Select 
            value={settings.weekStartDay.toString()} 
            onValueChange={(v) => onUpdate('weekStartDay', parseInt(v))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {weekDays.map((day, index) => (
                <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Default Reminder */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="defaultReminder">Default Reminder</Label>
            <p className="text-xs text-muted-foreground">Default time for habit reminders</p>
          </div>
          <Input
            id="defaultReminder"
            type="time"
            value={settings.defaultReminderTime}
            onChange={(e) => onUpdate('defaultReminderTime', e.target.value)}
            className="w-28"
          />
        </div>
      </div>
    </section>
  );
}
