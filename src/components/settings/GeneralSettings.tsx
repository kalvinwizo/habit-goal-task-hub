import { Moon, Sun, Palette } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings } from '@/types';

interface GeneralSettingsProps {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

/**
 * General settings section - Theme and appearance
 */
export function GeneralSettings({ settings, onUpdate }: GeneralSettingsProps) {
  return (
    <section className="glass-card p-4 slide-up" style={{ animationDelay: '0.05s' }}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Palette className="w-4 h-4 text-primary" />
        General
      </h3>
      
      <div className="space-y-4">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <div>
              <Label htmlFor="theme">Dark Mode</Label>
              <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
            </div>
          </div>
          <Switch
            id="theme"
            checked={settings.theme === 'dark'}
            onCheckedChange={(checked) => {
              onUpdate('theme', checked ? 'dark' : 'light');
              document.documentElement.classList.toggle('dark', checked);
            }}
          />
        </div>

        {/* Show Streaks */}
        <div className="flex items-center justify-between">
          <div>
            <Label>Show Streaks</Label>
            <p className="text-xs text-muted-foreground">Display streak counters on habits</p>
          </div>
          <Switch
            checked={settings.showStreaks}
            onCheckedChange={(checked) => onUpdate('showStreaks', checked)}
          />
        </div>
      </div>
    </section>
  );
}
