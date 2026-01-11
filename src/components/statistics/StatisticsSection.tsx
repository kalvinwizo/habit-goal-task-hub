import { useMemo } from 'react';
import { Flame, TrendingUp, Target, CheckCircle2, XCircle, SkipForward } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { format, subDays, parseISO } from 'date-fns';

// Circular progress component
function CircularProgress({ 
  value, 
  size = 80, 
  strokeWidth = 6,
  label,
  sublabel 
}: { 
  value: number; 
  size?: number; 
  strokeWidth?: number;
  label: string;
  sublabel?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          className="progress-ring-bg"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="progress-ring-fill"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold">{label}</span>
        {sublabel && <span className="text-[10px] text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  );
}

// Mini bar chart for weekly view
function WeeklyMiniChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((value, i) => (
        <div 
          key={i} 
          className="mini-bar flex-1"
          style={{ height: '100%' }}
        >
          <div 
            className="mini-bar-fill mt-auto"
            style={{ 
              height: `${(value / max) * 100}%`,
              minHeight: value > 0 ? '4px' : '2px'
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function StatisticsSection() {
  const { habits, habitLogs, goals, tasks, getTodayString } = useApp();
  const today = getTodayString();

  // Calculate statistics
  const stats = useMemo(() => {
    // Last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => 
      format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
    );

    // Weekly completion data
    const weeklyCompletions = last7Days.map(date => {
      const completed = habitLogs.filter(
        l => l.date === date && l.state === 'done'
      ).length;
      return completed;
    });

    // 7-day stats
    const last7DaysLogs = habitLogs.filter(l => last7Days.includes(l.date));
    const doneCount7 = last7DaysLogs.filter(l => l.state === 'done').length;
    const skippedCount7 = last7DaysLogs.filter(l => l.state === 'skipped').length;
    const missedCount7 = last7DaysLogs.filter(l => l.state === 'missed').length;
    const totalLogs7 = doneCount7 + skippedCount7 + missedCount7;

    // Completion rate
    const completionRate7 = totalLogs7 > 0 
      ? Math.round((doneCount7 / totalLogs7) * 100) 
      : 0;

    // 30-day completion rate
    const last30Days = Array.from({ length: 30 }, (_, i) => 
      format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')
    );
    const last30DaysLogs = habitLogs.filter(l => last30Days.includes(l.date));
    const doneCount30 = last30DaysLogs.filter(l => l.state === 'done').length;
    const totalLogs30 = last30DaysLogs.length;
    const completionRate30 = totalLogs30 > 0 
      ? Math.round((doneCount30 / totalLogs30) * 100) 
      : 0;

    // Current streaks
    const totalCurrentStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
    const bestStreak = Math.max(...habits.map(h => h.bestStreak), 0);
    const activeStreaks = habits.filter(h => h.currentStreak > 0).length;

    // Goals progress
    const activeGoals = goals.filter(g => !g.completed);
    const completedGoals = goals.filter(g => g.completed);
    const avgGoalProgress = activeGoals.length > 0
      ? Math.round(activeGoals.reduce((sum, g) => sum + g.currentProgress, 0) / activeGoals.length)
      : 0;

    // Today's tasks
    const tasksCompletedToday = tasks.filter(t => 
      t.completed || t.completedDates.includes(today)
    ).length;

    // Consistency score (based on done vs total excluding skipped)
    const consistencyScore = (doneCount7 + missedCount7) > 0
      ? Math.round((doneCount7 / (doneCount7 + missedCount7)) * 100)
      : 100;

    return {
      weeklyCompletions,
      completionRate7,
      completionRate30,
      doneCount7,
      skippedCount7,
      missedCount7,
      totalCurrentStreak,
      bestStreak,
      activeStreaks,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      avgGoalProgress,
      tasksCompletedToday,
      consistencyScore,
    };
  }, [habits, habitLogs, goals, tasks, today]);

  return (
    <div className="space-y-4">
      {/* Main Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Streak Card */}
        <div className="stat-card scale-in flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1.5 mb-2">
            <Flame className="w-5 h-5 text-warning" />
          </div>
          <p className="text-2xl font-bold">{stats.bestStreak}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Best Streak</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-xs text-success font-medium">{stats.activeStreaks}</span>
            <span className="text-[10px] text-muted-foreground">active</span>
          </div>
        </div>

        {/* Completion Rate Card */}
        <div className="stat-card scale-in flex flex-col items-center justify-center" style={{ animationDelay: '0.05s' }}>
          <CircularProgress 
            value={stats.completionRate7} 
            size={70} 
            strokeWidth={5}
            label={`${stats.completionRate7}%`}
            sublabel="7 days"
          />
        </div>

        {/* Goals Card */}
        <div className="stat-card scale-in flex flex-col items-center justify-center text-center" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{stats.avgGoalProgress}%</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Goals Progress</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-xs text-primary font-medium">{stats.activeGoals}</span>
            <span className="text-[10px] text-muted-foreground">active</span>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="glass-card p-4 scale-in" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h4 className="font-medium text-sm">This Week</h4>
          </div>
          <span className="text-xs text-muted-foreground">
            {stats.doneCount7} completed
          </span>
        </div>
        <WeeklyMiniChart data={stats.weeklyCompletions} />
        <div className="flex justify-between mt-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <span key={i} className="text-[10px] text-muted-foreground flex-1 text-center">{day}</span>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 text-center scale-in" style={{ animationDelay: '0.2s' }}>
          <CheckCircle2 className="w-5 h-5 text-success mx-auto mb-1" />
          <p className="text-lg font-bold text-success">{stats.doneCount7}</p>
          <p className="text-[10px] text-muted-foreground">Done</p>
        </div>
        <div className="glass-card p-3 text-center scale-in" style={{ animationDelay: '0.25s' }}>
          <SkipForward className="w-5 h-5 text-skipped mx-auto mb-1" />
          <p className="text-lg font-bold text-skipped">{stats.skippedCount7}</p>
          <p className="text-[10px] text-muted-foreground">Skipped</p>
        </div>
        <div className="glass-card p-3 text-center scale-in" style={{ animationDelay: '0.3s' }}>
          <XCircle className="w-5 h-5 text-missed mx-auto mb-1" />
          <p className="text-lg font-bold text-missed">{stats.missedCount7}</p>
          <p className="text-[10px] text-muted-foreground">Missed</p>
        </div>
      </div>

      {/* Consistency Score */}
      <div className="glass-card p-4 scale-in" style={{ animationDelay: '0.35s' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Consistency Score</span>
          <span className="text-sm font-bold text-primary">{stats.consistencyScore}%</span>
        </div>
        <div className="progress-bar progress-bar-success">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${stats.consistencyScore}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Based on completed vs missed habits (skipped don't count)
        </p>
      </div>
    </div>
  );
}
