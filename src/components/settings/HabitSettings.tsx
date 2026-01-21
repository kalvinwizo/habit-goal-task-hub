/**
 * HabitSettings - Habit-specific settings
 */

import { Repeat, Bell, Flame } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings } from '@/types';

interface HabitSettingsProps {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export function HabitSettings({ settings, onUpdate }: HabitSettingsProps) {
  return (
    <section className="glass-card p-4 slide-up" style={{ animationDelay: '0.1s' }}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Repeat className="w-4 h-4 text-primary" />
        Habits
      </h3>
      
      <div className="space-y-4">
        {/* Streak Behavior */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-warning" />
            <div>
              <Label>Strict Streak Mode</Label>
              <p className="text-xs text-muted-foreground">
                Skipped days don't break streaks (only missed days)
              </p>
            </div>
          </div>
          <Switch
            checked={settings.streakReminders}
            onCheckedChange={(checked) => onUpdate('streakReminders', checked)}
          />
        </div>

        {/* Default Reminder */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5" />
            <div>
              <Label>Default Reminder Time</Label>
              <p className="text-xs text-muted-foreground">
                Pre-fill reminder time for new habits
              </p>
            </div>
          </div>
          <input
            type="time"
            value={settings.defaultReminderTime}
            onChange={(e) => onUpdate('defaultReminderTime', e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-muted/50 border-0 text-sm"
          />
        </div>
      </div>
    </section>
  );
}
