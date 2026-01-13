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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Download, Upload, Moon, Sun, Clock, Bell, Tag, Palette, Smartphone, FileJson, FileSpreadsheet, Trash2, Star, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { CategoryManager } from '@/components/categories/CategoryManager';
import { useNotifications } from '@/hooks/useNotifications';
import { Link } from 'react-router-dom';

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SettingsPage() {
  const { settings, setSettings, exportData, importData, customCategories, addCustomCategory, removeCustomCategory, clearAllData } = useApp();
  const { isNative, requestPermissions, scheduleDailySummary } = useNotifications();
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

  const handleExportJSON = () => {
    exportData('json');
    toast.success('JSON backup exported!');
  };

  const handleExportCSV = () => {
    exportData('csv');
    toast.success('CSV export completed!');
  };

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermissions();
    if (granted) {
      updateSetting('notificationsEnabled', true);
      toast.success('Notifications enabled!');
    } else {
      toast.error('Notification permission denied or not supported');
    }
  };

  const handleDailySummaryChange = async (checked: boolean) => {
    updateSetting('dailySummary', checked);
    if (checked && settings.notificationsEnabled) {
      await scheduleDailySummary(settings.defaultReminderTime);
      toast.success('Daily summary reminder scheduled!');
    }
  };

  const handleClearData = () => {
    clearAllData();
    toast.success('All data cleared!');
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Settings" 
        subtitle="Customize your experience"
      />

      <div className="space-y-6">
        {/* Premium/Features Link */}
        <Link 
          to="/premium" 
          className="glass-card p-4 flex items-center justify-between slide-up group hover:bg-muted/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Features & Roadmap</h3>
              <p className="text-xs text-muted-foreground">100% Free • View all features</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>

        {/* Appearance */}
        <section className="glass-card p-4 slide-up" style={{ animationDelay: '0.05s' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            Appearance
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <Label htmlFor="theme">Dark Mode</Label>
            </div>
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
        <section className="glass-card p-4 slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
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
        <section className="glass-card p-4 slide-up" style={{ animationDelay: '0.15s' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Notifications
          </h3>
          
          <div className="space-y-4">
          {isNative ? (
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Get reminders on your device</p>
                </div>
                {settings.notificationsEnabled ? (
                  <Switch
                    checked={settings.notificationsEnabled}
                    onCheckedChange={(checked) => updateSetting('notificationsEnabled', checked)}
                  />
                ) : (
                  <Button size="sm" variant="outline" onClick={handleEnableNotifications}>
                    Enable
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Install this app on your device for push notifications
                </p>
              </div>
            )}

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
                onCheckedChange={handleDailySummaryChange}
              />
            </div>
          </div>
        </section>

        {/* Display Options */}
        <section className="glass-card p-4 slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            Display Options
          </h3>
          
          <div className="space-y-4">
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

        {/* Categories */}
        <section className="glass-card p-4 slide-up" style={{ animationDelay: '0.25s' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            Categories
          </h3>
          
          <CategoryManager
            customCategories={customCategories}
            onAddCategory={addCustomCategory}
            onRemoveCategory={removeCustomCategory}
          />
        </section>

        {/* Data Management */}
        <section className="glass-card p-4 slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="font-semibold mb-4">Data Management</h3>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={handleExportJSON}
            >
              <FileJson className="w-4 h-4" />
              Export Full Backup (JSON)
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={handleExportCSV}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Habits (CSV)
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

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your habits, goals, tasks, and logs. 
                    This action cannot be undone. Make sure to export a backup first.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <p className="text-xs text-muted-foreground mt-2">
              All data is stored locally on your device. Export regularly to create backups.
            </p>
          </div>
        </section>

        {/* App Info */}
        <section className="text-center py-6 text-muted-foreground text-sm slide-up" style={{ animationDelay: '0.35s' }}>
          <p className="font-medium">Habit & Goal Tracker</p>
          <p className="text-xs mt-1">100% Free • Local-First • No Subscriptions</p>
        </section>
      </div>
    </PageContainer>
  );
}
