import { useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/context/AppContext';
import { format, differenceInDays, subDays } from 'date-fns';
import { Target, Flame, TrendingUp, CheckSquare, ListChecks, Calendar, Settings } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { StatisticsSection } from '@/components/statistics/StatisticsSection';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { goals, habits, tasks, habitLogs, getTodayString } = useApp();

  const today = getTodayString();
  const todayDate = new Date();

  // Quick stats
  const stats = useMemo(() => {
    const activeGoals = goals.filter(g => !g.completed);
    const completedGoals = goals.filter(g => g.completed);
    
    // Today's habits
    const todayHabits = habits.filter(h => {
      if (h.archived) return false;
      const dayOfWeek = new Date().getDay();
      const dayOfMonth = new Date().getDate();
      if (h.frequency === 'daily') return true;
      if (h.frequency === 'specific' && h.specificDays?.includes(dayOfWeek)) return true;
      if (h.frequency === 'monthly' && h.monthlyDates?.includes(dayOfMonth)) return true;
      return false;
    });
    const completedHabitsToday = habitLogs.filter(l => l.date === today && l.state === 'done').length;

    // Today's tasks
    const todayTasks = tasks.filter(t => {
      if (t.type === 'daily') return true;
      if (t.type === 'one-time' && !t.completed) return true;
      if (t.type === 'monthly') {
        const dayOfMonth = new Date().getDate();
        return t.monthlyDates?.includes(dayOfMonth);
      }
      return false;
    });
    const completedTasksToday = todayTasks.filter(t => 
      t.type === 'one-time' ? t.completed : t.completedDates.includes(today)
    ).length;

    // Streaks
    const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
    const bestStreak = Math.max(...habits.map(h => h.bestStreak), 0);

    return {
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      todayHabits: todayHabits.length,
      completedHabitsToday,
      todayTasks: todayTasks.length,
      completedTasksToday,
      totalStreak,
      bestStreak,
    };
  }, [goals, habits, tasks, habitLogs, today]);

  // Get primary goal
  const primaryGoal = useMemo(() => {
    const activeGoals = goals.filter(g => !g.completed);
    if (activeGoals.length === 0) return null;
    return activeGoals.sort((a, b) => {
      const daysA = differenceInDays(new Date(a.targetDate), new Date());
      const daysB = differenceInDays(new Date(b.targetDate), new Date());
      if (daysA !== daysB) return daysA - daysB;
      return b.currentProgress - a.currentProgress;
    })[0];
  }, [goals]);

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

  return (
    <PageContainer>
      {/* Settings Quick Access */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{format(todayDate, 'EEEE, MMMM d')}</p>
        </div>
        <Link 
          to="/settings" 
          className="p-2.5 rounded-xl glass-card hover:bg-muted/60 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>

      {/* Today's Overview Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link to="/habits" className="stat-card flex items-center gap-3 scale-in">
          <div className="w-11 h-11 rounded-xl bg-success/15 flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.completedHabitsToday}/{stats.todayHabits}</p>
            <p className="text-xs text-muted-foreground">Habits Today</p>
          </div>
        </Link>

        <Link to="/tasks" className="stat-card flex items-center gap-3 scale-in" style={{ animationDelay: '0.05s' }}>
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.completedTasksToday}/{stats.todayTasks}</p>
            <p className="text-xs text-muted-foreground">Tasks Today</p>
          </div>
        </Link>

        <Link to="/goals" className="stat-card flex items-center gap-3 scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center">
            <Target className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.activeGoals}</p>
            <p className="text-xs text-muted-foreground">Active Goals</p>
          </div>
        </Link>

        <div className="stat-card flex items-center gap-3 scale-in" style={{ animationDelay: '0.15s' }}>
          <div className="w-11 h-11 rounded-xl bg-warning/15 flex items-center justify-center">
            <Flame className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalStreak}</p>
            <p className="text-xs text-muted-foreground">Total Streak</p>
          </div>
        </div>
      </div>

      {/* Primary Goal Card */}
      {primaryGoal && (
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

            {/* Circular progress */}
            <div className="flex items-center justify-center my-6">
              <div className="radial-stat" style={{ width: 120, height: 120 }}>
                <svg width="120" height="120" className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="white"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - progress / 100)}
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </svg>
                <div className="radial-stat-inner" style={{ 
                  inset: 14, 
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)'
                }}>
                  <span className="text-2xl font-bold">{progress}%</span>
                </div>
              </div>
            </div>

            {/* Goal meta */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>
                  {daysRemaining === 0 
                    ? 'Due today' 
                    : daysRemaining > 0 
                      ? `${daysRemaining} days left`
                      : `${Math.abs(daysRemaining)} days overdue`
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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