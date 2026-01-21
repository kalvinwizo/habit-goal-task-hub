import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { 
  Check, 
  Star, 
  Sparkles, 
  Rocket, 
  Heart, 
  Shield, 
  Download, 
  Upload, 
  Bell, 
  Target, 
  Repeat, 
  BarChart3,
  Crown,
  Lock,
  Zap,
  Grid3X3,
  Share2,
  Smartphone
} from 'lucide-react';
import { FREE_LIMITS, PREMIUM_FEATURES } from '@/hooks/usePremium';
import { useApp } from '@/context/AppContext';
import { usePremium } from '@/hooks/usePremium';

export default function PremiumPage() {
  const { habits, goals } = useApp();
  const { isPremium, habitCount, goalCount } = usePremium({ habits, goals });

  const freeFeatures = [
    { icon: Repeat, title: `${FREE_LIMITS.habits} Active Habits`, description: 'Track up to 3 habits for free' },
    { icon: Target, title: `${FREE_LIMITS.goals} Active Goals`, description: 'Create up to 2 goals for free' },
    { icon: BarChart3, title: 'Basic Analytics', description: 'View completion rates and streaks' },
    { icon: Bell, title: 'Push Notifications', description: 'Get reminders for your habits' },
    { icon: Upload, title: 'Cloud Sync', description: 'Automatic backup to the cloud' },
    { icon: Shield, title: 'Privacy-First', description: 'Your data is encrypted and secured' },
  ];

  const premiumFeatures = [
    { icon: Repeat, title: 'Unlimited Habits', description: 'Track as many habits as you want' },
    { icon: Target, title: 'Unlimited Goals', description: 'Create unlimited SMART goals' },
    { icon: BarChart3, title: 'Advanced Analytics', description: 'Detailed charts, trends, and insights' },
    { icon: Grid3X3, title: 'Calendar Heatmaps', description: 'Visualize your progress over time' },
    { icon: Share2, title: 'Goal Sharing', description: 'Share progress as image or public link' },
    { icon: Smartphone, title: 'Home Widgets', description: 'Quick access from your home screen' },
  ];

  const roadmap = [
    { status: 'done', title: 'Habit tracking with streaks' },
    { status: 'done', title: 'SMART goal system' },
    { status: 'done', title: 'Task management' },
    { status: 'done', title: 'Analytics dashboard' },
    { status: 'done', title: 'Custom categories' },
    { status: 'done', title: 'Data backup & restore' },
    { status: 'done', title: 'Multiple reminders' },
    { status: 'done', title: 'Calendar heatmap visualization' },
    { status: 'done', title: 'Cloud sync' },
    { status: 'done', title: 'Modular architecture' },
    { status: 'done', title: 'Onboarding tour' },
    { status: 'done', title: 'Enhanced settings' },
    { status: 'done', title: 'Account management' },
    { status: 'planned', title: 'Widget support (Android/iOS)' },
    { status: 'planned', title: 'Habit templates' },
    { status: 'planned', title: 'Goal sharing' },
    { status: 'planned', title: 'Social accountability' },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Features & Plans" 
        subtitle="Everything you need to build better habits"
      />

      {/* Current Usage */}
      <div className="glass-card p-4 mb-6 slide-up">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Your Usage
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-muted/30 text-center">
            <p className="text-2xl font-bold">{habitCount}/{FREE_LIMITS.habits}</p>
            <p className="text-xs text-muted-foreground">Active Habits</p>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 text-center">
            <p className="text-2xl font-bold">{goalCount}/{FREE_LIMITS.goals}</p>
            <p className="text-xs text-muted-foreground">Active Goals</p>
          </div>
        </div>
      </div>

      {/* Free Tier */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary" />
          Free Tier
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {freeFeatures.map((feature, index) => (
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

      {/* Premium Features */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-500" />
          Premium Features
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 ml-auto">
            Coming Soon
          </span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {premiumFeatures.map((feature, index) => (
            <div 
              key={feature.title} 
              className="glass-card p-4 scale-in relative overflow-hidden"
              style={{ animationDelay: `${(index + freeFeatures.length) * 0.05}s` }}
            >
              <div className="absolute top-2 right-2">
                <Lock className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-amber-500" />
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
          The free tier gives you everything you need to build lasting habits.
        </p>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <span>No Ads</span>
          <span>•</span>
          <span>No Tracking</span>
          <span>•</span>
          <span>Privacy First</span>
        </div>
      </div>
    </PageContainer>
  );
}
