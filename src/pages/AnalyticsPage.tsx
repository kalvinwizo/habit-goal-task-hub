import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/context/AppContext';
import { Flame, Target, TrendingUp, CheckCircle, XCircle, SkipForward } from 'lucide-react';

export default function AnalyticsPage() {
  const { habits, habitLogs, goals, tasks, getTodayString } = useApp();

  // Calculate habit analytics
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  const habitStats = habits.map(habit => {
    const logs7Days = habitLogs.filter(l => l.habitId === habit.id && last7Days.includes(l.date));
    const logs30Days = habitLogs.filter(l => l.habitId === habit.id && last30Days.includes(l.date));
    
    const done7 = logs7Days.filter(l => l.state === 'done').length;
    const done30 = logs30Days.filter(l => l.state === 'done').length;
    const missed7 = logs7Days.filter(l => l.state === 'missed').length;
    const missed30 = logs30Days.filter(l => l.state === 'missed').length;
    const skipped7 = logs7Days.filter(l => l.state === 'skipped').length;
    const skipped30 = logs30Days.filter(l => l.state === 'skipped').length;

    const completion7 = logs7Days.length > 0 ? Math.round((done7 / Math.min(7, logs7Days.length + (7 - last7Days.length))) * 100) : 0;
    const completion30 = logs30Days.length > 0 ? Math.round((done30 / Math.min(30, logs30Days.length + (30 - last30Days.length))) * 100) : 0;

    return {
      habit,
      completion7Days: Math.min(100, Math.round((done7 / 7) * 100)),
      completion30Days: Math.min(100, Math.round((done30 / 30) * 100)),
      missed: missed30,
      skipped: skipped30,
      consistencyScore: Math.round(((done30 + skipped30) / 30) * 100),
    };
  });

  // Overall stats
  const totalDone7Days = habitLogs.filter(l => last7Days.includes(l.date) && l.state === 'done').length;
  const totalMissed7Days = habitLogs.filter(l => last7Days.includes(l.date) && l.state === 'missed').length;
  const totalSkipped7Days = habitLogs.filter(l => last7Days.includes(l.date) && l.state === 'skipped').length;

  const bestStreak = Math.max(...habits.map(h => h.bestStreak), 0);
  const totalCurrentStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);

  // Goal stats
  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);
  const avgProgress = activeGoals.length > 0 
    ? Math.round(activeGoals.reduce((sum, g) => sum + g.currentProgress, 0) / activeGoals.length)
    : 0;

  // Task stats
  const todayStr = getTodayString();
  const completedTasksToday = tasks.filter(t => 
    t.completed || t.completedDates.includes(todayStr)
  ).length;

  return (
    <PageContainer>
      <PageHeader 
        title="Analytics" 
        subtitle="Your progress at a glance"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card-elevated p-4 slide-up">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-medium">Best Streak</span>
          </div>
          <p className="stat-number text-accent">{bestStreak}</p>
          <p className="text-xs text-muted-foreground">days</p>
        </div>

        <div className="card-elevated p-4 slide-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Active Streaks</span>
          </div>
          <p className="stat-number text-primary">{totalCurrentStreak}</p>
          <p className="text-xs text-muted-foreground">total days</p>
        </div>

        <div className="card-elevated p-4 slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="w-4 h-4" />
            <span className="text-xs font-medium">Goals Progress</span>
          </div>
          <p className="stat-number text-primary">{avgProgress}%</p>
          <p className="text-xs text-muted-foreground">{activeGoals.length} active</p>
        </div>

        <div className="card-elevated p-4 slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Tasks Done</span>
          </div>
          <p className="stat-number text-success">{completedTasksToday}</p>
          <p className="text-xs text-muted-foreground">today</p>
        </div>
      </div>

      {/* 7-Day Summary */}
      <div className="card-elevated p-4 mb-4 slide-up" style={{ animationDelay: '0.2s' }}>
        <h3 className="font-semibold mb-3">Last 7 Days</h3>
        <div className="flex justify-between">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto mb-1">
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-lg font-bold">{totalDone7Days}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-skipped/20 text-skipped flex items-center justify-center mx-auto mb-1">
              <SkipForward className="w-5 h-5" />
            </div>
            <p className="text-lg font-bold">{totalSkipped7Days}</p>
            <p className="text-xs text-muted-foreground">Skipped</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-missed/20 text-missed flex items-center justify-center mx-auto mb-1">
              <XCircle className="w-5 h-5" />
            </div>
            <p className="text-lg font-bold">{totalMissed7Days}</p>
            <p className="text-xs text-muted-foreground">Missed</p>
          </div>
        </div>
      </div>

      {/* Individual Habit Stats */}
      {habitStats.length > 0 && (
        <div className="slide-up" style={{ animationDelay: '0.25s' }}>
          <h3 className="font-semibold mb-3">Habit Breakdown</h3>
          <div className="space-y-3">
            {habitStats.map(({ habit, completion7Days, completion30Days, consistencyScore }) => (
              <div key={habit.id} className="card-elevated p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{habit.name}</h4>
                  <span className="streak-badge text-xs">
                    <Flame className="w-3 h-3" />
                    {habit.currentStreak}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">7-day completion</span>
                      <span className="font-medium">{completion7Days}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${completion7Days}%` }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">30-day consistency</span>
                      <span className="font-medium">{consistencyScore}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${consistencyScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {habits.length === 0 && goals.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No data yet</p>
          <p className="text-sm mt-1">Start tracking habits and goals to see analytics</p>
        </div>
      )}
    </PageContainer>
  );
}
