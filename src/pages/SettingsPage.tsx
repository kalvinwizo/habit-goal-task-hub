import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/context/AppContext';
import { Star, ChevronRight, Tag } from 'lucide-react';
import { CategoryManager } from '@/components/categories/CategoryManager';
import { useWebPush } from '@/hooks/useWebPush';
import { Link } from 'react-router-dom';
import { 
  GeneralSettings, 
  TimeSettings, 
  NotificationSettings, 
  DataSettings 
} from '@/components/settings';

/**
 * Settings Page
 * Organized into sections: General, Time, Notifications, Categories, Data
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

        {/* General Settings */}
        <GeneralSettings settings={settings} onUpdate={updateSetting} />

        {/* Time Settings */}
        <TimeSettings settings={settings} onUpdate={updateSetting} />

        {/* Notification Settings */}
        <NotificationSettings 
          settings={settings} 
          onUpdate={updateSetting}
          isSupported={isSupported}
          permission={permission}
          requestPermission={requestPermission}
          scheduleDailySummary={scheduleDailySummary}
        />

        {/* Categories */}
        <section className="glass-card p-4 slide-up" style={{ animationDelay: '0.2s' }}>
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

        {/* App Info */}
        <section className="text-center py-6 text-muted-foreground text-sm slide-up" style={{ animationDelay: '0.3s' }}>
          <p className="font-medium">Habitix - Habit & Goal Tracker</p>
          <p className="text-xs mt-1">100% Free • Cloud Synced • No Subscriptions</p>
        </section>
      </div>
    </PageContainer>
  );
}
