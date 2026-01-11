import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/context/AppContext';
import { format, differenceInDays } from 'date-fns';
import { Target, Flame, TrendingUp, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { StatisticsSection } from '@/components/statistics/StatisticsSection';

export default function DashboardPage() {
  const { goals, habits, getTodayString } = useApp();

  const today = getTodayString();
  const todayDate = new Date();

  // Get primary goal (most recent active goal or the one with highest progress)
  const primaryGoal = useMemo(() => {
    const activeGoals = goals.filter(g => !g.completed);
    if (activeGoals.length === 0) return null;
    
    // Sort by deadline (closest first) then by progress
    return activeGoals.sort((a, b) => {
      const daysA = differenceInDays(new Date(a.targetDate), new Date());
      const daysB = differenceInDays(new Date(b.targetDate), new Date());
      if (daysA !== daysB) return daysA - daysB;
      return b.currentProgress - a.currentProgress;
    })[0];
  }, [goals]);

  // Calculate goal progress
  const getGoalProgress = (goal: typeof primaryGoal) => {
    if (!goal) return 0;
    if (goal.trackingType === 'checklist' && goal.milestones) {
      const completed = goal.milestones.filter(m => m.completed).length;
      return goal.milestones.length > 0 ? Math.round((completed / goal.milestones.length) * 100) : 0;
    } else if (goal.trackingType === 'numeric' && goal.targetValue) {
      return Math.min(100, Math.round((goal.currentProgress / goal.targetValue) * 100));
    }
    return goal.currentProgress;
  };

  const progress = getGoalProgress(primaryGoal);
  const daysRemaining = primaryGoal 
    ? differenceInDays(new Date(primaryGoal.targetDate), new Date()) 
    : 0;

  // Total streak count
  const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
  const activeGoalsCount = goals.filter(g => !g.completed).length;

  return (
    <PageContainer>
      <PageHeader 
        title="Dashboard" 
        subtitle={format(todayDate, 'EEEE, MMMM d')}
      />

      {/* Primary Goal - Centered Hero Card */}
      {primaryGoal ? (
        <div className="goal-center-card mb-6 slide-up">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">Current Focus</span>
            </div>
            
            <h2 className="text-xl font-bold mb-2">{primaryGoal.title}</h2>
            
            {primaryGoal.why && (
              <p className="text-sm opacity-80 mb-4 line-clamp-2">{primaryGoal.why}</p>
            )}

            {/* Large circular progress */}
            <div className="flex items-center justify-center my-6">
              <div className="radial-stat" style={{ width: 140, height: 140 }}>
                <svg width="140" height="140" className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="70"
                    cy="70"
                    r="60"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="60"
                    fill="none"
                    stroke="white"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - progress / 100)}
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </svg>
                <div className="radial-stat-inner" style={{ 
                  inset: 16, 
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)'
                }}>
                  <span className="text-3xl font-bold">{progress}%</span>
                  <span className="text-xs opacity-80">Complete</span>
                </div>
              </div>
            </div>

            {/* Goal meta */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>
                  {daysRemaining === 0 
                    ? 'Due today' 
                    : daysRemaining > 0 
                      ? `${daysRemaining} days left`
                      : `${Math.abs(daysRemaining)} days overdue`
                  }
                </span>
              </div>
              {primaryGoal.trackingType === 'numeric' && primaryGoal.targetValue && (
                <span className="opacity-80">
                  {primaryGoal.currentProgress} / {primaryGoal.targetValue}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 text-center mb-6 slide-up">
          <Target className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <h3 className="font-semibold mb-1">No Active Goal</h3>
          <p className="text-sm text-muted-foreground">Create a SMART goal to track your progress</p>
        </div>
      )}

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="stat-card flex items-center gap-3 scale-in">
          <div className="w-11 h-11 rounded-xl bg-warning/15 flex items-center justify-center">
            <Flame className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalStreak}</p>
            <p className="text-xs text-muted-foreground">Total Streak</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3 scale-in" style={{ animationDelay: '0.05s' }}>
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activeGoalsCount}</p>
            <p className="text-xs text-muted-foreground">Active Goals</p>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Statistics
        </h3>
        <StatisticsSection />
      </div>
    </PageContainer>
  );
}
