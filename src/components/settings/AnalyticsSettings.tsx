/**
 * AnalyticsSettings - Analytics display preferences
 */

import { BarChart3, Eye, EyeOff } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings } from '@/types';

interface AnalyticsSettingsProps {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  showCharts: boolean;
  onShowChartsChange: (show: boolean) => void;
}

export function AnalyticsSettings({ 
  settings, 
  onUpdate,
  showCharts,
  onShowChartsChange,
}: AnalyticsSettingsProps) {
  return (
    <section className="glass-card p-4 slide-up" style={{ animationDelay: '0.2s' }}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        Analytics
      </h3>
      
      <div className="space-y-4">
        {/* Show Charts */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showCharts ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            <div>
              <Label>Show Charts</Label>
              <p className="text-xs text-muted-foreground">Display analytics charts and graphs</p>
            </div>
          </div>
          <Switch
            checked={showCharts}
            onCheckedChange={onShowChartsChange}
          />
        </div>

        {/* Show Streaks (moved from General) */}
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
