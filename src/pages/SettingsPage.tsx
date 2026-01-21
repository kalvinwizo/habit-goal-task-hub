import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/context/AppContext';
import { Star, ChevronRight, Tag, RefreshCw } from 'lucide-react';
import { CategoryManager } from '@/components/categories/CategoryManager';
import { useWebPush } from '@/hooks/useWebPush';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { 
  GeneralSettings, 
  TimeSettings,
  HabitSettings,
  NotificationSettings,
  AnalyticsSettings,
  DataSettings,
  AccountSettings,
} from '@/components/settings';

/**
 * Settings Page
 * Organized into sections: Account, General, Time, Habits, Notifications, Analytics, Categories, Data
 */
export default function SettingsPage() {
  const { 
    settings, 
    setSettings, 
    exportData, 
    importData, 
    clearAllData, 
    customCategories, 
    addCustomCategory, 
    removeCustomCategory 
  } = useApp();
  const { isSupported, permission, requestPermission, scheduleDailySummary } = useWebPush();
  const { reset: resetOnboarding } = useOnboarding();
  const [showCharts, setShowCharts] = useState(true);

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

        {/* Account Settings */}
        <AccountSettings />

        {/* General Settings */}
        <GeneralSettings settings={settings} onUpdate={updateSetting} />

        {/* Time Settings */}
        <TimeSettings settings={settings} onUpdate={updateSetting} />

        {/* Habit Settings */}
        <HabitSettings settings={settings} onUpdate={updateSetting} />

        {/* Notification Settings */}
        <NotificationSettings 
          settings={settings} 
          onUpdate={updateSetting}
          isSupported={isSupported}
          permission={permission}
          requestPermission={requestPermission}
          scheduleDailySummary={scheduleDailySummary}
        />

        {/* Analytics Settings */}
        <AnalyticsSettings 
          settings={settings}
          onUpdate={updateSetting}
          showCharts={showCharts}
          onShowChartsChange={setShowCharts}
        />

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
        <DataSettings 
          exportData={exportData} 
          importData={importData} 
          clearAllData={clearAllData} 
        />

        {/* Restart Onboarding */}
        <section className="glass-card p-4 slide-up" style={{ animationDelay: '0.35s' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary" />
                Onboarding Tour
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Restart the welcome tour to learn about features
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={resetOnboarding}>
              Restart Tour
            </Button>
          </div>
        </section>

        {/* App Info */}
        <section className="text-center py-6 text-muted-foreground text-sm slide-up" style={{ animationDelay: '0.4s' }}>
          <p className="font-medium">Habitix - Habit & Goal Tracker</p>
          <p className="text-xs mt-1">100% Free • Cloud Synced • No Subscriptions</p>
        </section>
      </div>
    </PageContainer>
  );
}
