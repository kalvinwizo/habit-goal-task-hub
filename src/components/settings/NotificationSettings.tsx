import { Bell, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Settings } from '@/types';
import { toast } from 'sonner';

interface NotificationSettingsProps {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  isSupported: boolean;
  permission: NotificationPermission | null;
  requestPermission: () => Promise<boolean>;
  scheduleDailySummary: (time: string) => void;
}

/**
 * Notification settings - Push notifications, streak reminders, daily summary
 */
export function NotificationSettings({ 
  settings, 
  onUpdate,
  isSupported,
  permission,
  requestPermission,
  scheduleDailySummary,
}: NotificationSettingsProps) {
  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      onUpdate('notificationsEnabled', true);
    }
  };

  const handleDailySummaryChange = async (checked: boolean) => {
    onUpdate('dailySummary', checked);
    if (checked && settings.notificationsEnabled) {
      scheduleDailySummary(settings.defaultReminderTime);
      toast.success('Daily summary reminder scheduled!');
    }
  };

  return (
    <section className="glass-card p-4 slide-up" style={{ animationDelay: '0.15s' }}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Bell className="w-4 h-4 text-primary" />
        Notifications
      </h3>
      
      <div className="space-y-4">
        {/* Web Push Status */}
        {isSupported ? (
          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-xs text-muted-foreground">
                {permission === 'granted' ? 'Enabled - Get reminders in your browser' : 'Get reminders in your browser'}
              </p>
            </div>
            {permission === 'granted' ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <Switch
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => onUpdate('notificationsEnabled', checked)}
                />
              </div>
            ) : permission === 'denied' ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                Blocked in browser
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={handleEnableNotifications}>
                Enable
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <AlertCircle className="w-5 h-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Notifications not supported in this browser
            </p>
          </div>
        )}

        {/* Streak Reminders */}
        <div className="flex items-center justify-between">
          <div>
            <Label>Streak Reminders</Label>
            <p className="text-xs text-muted-foreground">Notify when streak is at risk</p>
          </div>
          <Switch
            checked={settings.streakReminders}
            onCheckedChange={(checked) => onUpdate('streakReminders', checked)}
          />
        </div>

        {/* Daily Summary */}
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
  );
}
