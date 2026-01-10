import { useState, useRef } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/context/AppContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Upload, Moon, Sun, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SettingsPage() {
  const { settings, setSettings, exportData, importData } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        toast.success('Data imported successfully!');
      } else {
        toast.error('Failed to import data. Invalid format.');
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    exportData();
    toast.success('Data exported successfully!');
  };

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Settings" 
        subtitle="Customize your experience"
      />

      <div className="space-y-6">
        {/* Appearance */}
        <section className="card-elevated p-4 slide-up">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            {settings.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            Appearance
          </h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="theme">Dark Mode</Label>
            <Switch
              id="theme"
              checked={settings.theme === 'dark'}
              onCheckedChange={(checked) => {
                updateSetting('theme', checked ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', checked);
              }}
            />
          </div>
        </section>

        {/* Time Settings */}
        <section className="card-elevated p-4 slide-up" style={{ animationDelay: '0.05s' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Time Settings
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="startOfDay">Start of Day</Label>
              <Input
                id="startOfDay"
                type="time"
                value={settings.startOfDay}
                onChange={(e) => updateSetting('startOfDay', e.target.value)}
                className="w-28"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="weekStart">Week Starts On</Label>
              <Select 
                value={settings.weekStartDay.toString()} 
                onValueChange={(v) => updateSetting('weekStartDay', parseInt(v))}
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

            <div className="flex items-center justify-between">
              <Label htmlFor="defaultReminder">Default Reminder</Label>
              <Input
                id="defaultReminder"
                type="time"
                value={settings.defaultReminderTime}
                onChange={(e) => updateSetting('defaultReminderTime', e.target.value)}
                className="w-28"
              />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="card-elevated p-4 slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Display Options
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Streak Reminders</Label>
                <p className="text-xs text-muted-foreground">Notify when streak is at risk</p>
              </div>
              <Switch
                checked={settings.streakReminders}
                onCheckedChange={(checked) => updateSetting('streakReminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Daily Summary</Label>
                <p className="text-xs text-muted-foreground">Show daily progress summary</p>
              </div>
              <Switch
                checked={settings.dailySummary}
                onCheckedChange={(checked) => updateSetting('dailySummary', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Streaks</Label>
                <p className="text-xs text-muted-foreground">Display streak counters on habits</p>
              </div>
              <Switch
                checked={settings.showStreaks}
                onCheckedChange={(checked) => updateSetting('showStreaks', checked)}
              />
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="card-elevated p-4 slide-up" style={{ animationDelay: '0.15s' }}>
          <h3 className="font-semibold mb-4">Data Management</h3>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={handleExport}
            >
              <Download className="w-4 h-4" />
              Export Data Backup
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              Import Data from Backup
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />

            <p className="text-xs text-muted-foreground mt-2">
              All data is stored locally on your device. Export regularly to create backups.
            </p>
          </div>
        </section>

        {/* App Info */}
        <section className="text-center py-4 text-muted-foreground text-sm">
          <p className="font-medium">Habit & Goal Tracker</p>
          <p className="text-xs mt-1">100% Free • Local-First • No Subscriptions</p>
        </section>
      </div>
    </PageContainer>
  );
}
