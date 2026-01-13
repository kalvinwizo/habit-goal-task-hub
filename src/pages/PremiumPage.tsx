import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Check, Star, Sparkles, Rocket, Heart, Shield, Download, Upload, Bell, Target, Repeat, BarChart3 } from 'lucide-react';

export default function PremiumPage() {
  const features = [
    { icon: Repeat, title: 'Unlimited Habits', description: 'Track as many habits as you want with no limits' },
    { icon: Target, title: 'SMART Goals', description: 'Create goals with percentage, numeric, or checklist tracking' },
    { icon: BarChart3, title: 'Detailed Analytics', description: 'View completion rates, streaks, and consistency scores' },
    { icon: Bell, title: 'Custom Reminders', description: 'Set multiple reminders for each habit, task, and goal' },
    { icon: Download, title: 'Data Export', description: 'Export your data as JSON backup anytime' },
    { icon: Upload, title: 'Data Import', description: 'Restore from backups or migrate your data' },
    { icon: Shield, title: 'Local-First Privacy', description: 'All data stays on your device - no cloud required' },
    { icon: Sparkles, title: 'Beautiful UI', description: 'Modern Apple-inspired liquid glass design' },
  ];

  const roadmap = [
    { status: 'done', title: 'Habit tracking with streaks' },
    { status: 'done', title: 'SMART goal system' },
    { status: 'done', title: 'Task management' },
    { status: 'done', title: 'Analytics dashboard' },
    { status: 'done', title: 'Custom categories' },
    { status: 'done', title: 'Data backup & restore' },
    { status: 'done', title: 'Multiple reminders' },
    { status: 'planned', title: 'Calendar heatmap visualization' },
    { status: 'planned', title: 'Widget support' },
    { status: 'planned', title: 'Cloud sync (optional)' },
    { status: 'planned', title: 'Habit templates' },
    { status: 'planned', title: 'Goal sharing' },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Features" 
        subtitle="Everything you need to build better habits"
      />

      {/* Free Message */}
      <div className="goal-center-card mb-6 slide-up text-center">
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="w-6 h-6" />
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold mb-2">100% Free Forever</h2>
          <p className="opacity-90 text-sm max-w-md mx-auto">
            This app is completely free with no subscriptions, no ads, and no data collection. 
            All features are available to everyone.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-8">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" />
          All Features Included
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((feature, index) => (
            <div 
              key={feature.title} 
              className="glass-card p-4 scale-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap */}
      <div className="mb-8">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Rocket className="w-4 h-4 text-primary" />
          Roadmap
        </h3>
        <div className="glass-card p-4">
          <div className="space-y-3">
            {roadmap.map((item, index) => (
              <div 
                key={item.title} 
                className="flex items-center gap-3 fade-in"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  item.status === 'done' 
                    ? 'bg-success/20 text-success' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {item.status === 'done' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current" />
                  )}
                </div>
                <span className={`text-sm ${
                  item.status === 'done' ? '' : 'text-muted-foreground'
                }`}>
                  {item.title}
                </span>
                {item.status === 'planned' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground ml-auto">
                    Coming Soon
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Philosophy */}
      <div className="glass-card p-5 text-center slide-up">
        <h3 className="font-semibold mb-2">Our Philosophy</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          We believe habit tracking should be simple, private, and accessible to everyone. 
          That's why this app is free, works offline, and keeps your data on your device.
        </p>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <span>No Ads</span>
          <span>•</span>
          <span>No Tracking</span>
          <span>•</span>
          <span>No Subscriptions</span>
        </div>
      </div>
    </PageContainer>
  );
}
