import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Target } from 'lucide-react';

export function GoalProgressChart() {
  const { goalStats, overallStats } = useAnalytics();

  const chartData = useMemo(() => {
    return goalStats
      .filter(g => !g.isOverdue || g.progress < 100)
      .slice(0, 5)
      .map(g => ({
        name: g.title,
        value: g.progress,
        remaining: 100 - g.progress,
        daysLeft: g.daysRemaining,
      }));
  }, [goalStats]);

  const pieData = useMemo(() => {
    if (overallStats.activeGoals === 0 && overallStats.completedGoals === 0) {
      return [{ name: 'No Goals', value: 1, color: 'hsl(var(--muted))' }];
    }
    return [
      { name: 'Completed', value: overallStats.completedGoals, color: 'hsl(var(--success))' },
      { name: 'Active', value: overallStats.activeGoals, color: 'hsl(var(--primary))' },
    ].filter(d => d.value > 0);
  }, [overallStats]);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <h4 className="font-medium text-sm">Goals Overview</h4>
        </div>
        <div className="text-xs text-muted-foreground">
          {overallStats.activeGoals} active
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-32 w-32 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-bold">{overallStats.avgGoalProgress}%</p>
              <p className="text-[10px] text-muted-foreground">avg</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {chartData.length > 0 ? (
            chartData.slice(0, 3).map((goal) => (
              <div key={goal.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="truncate max-w-[120px]">{goal.name}</span>
                  <span className="font-medium">{goal.value}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${goal.value}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              No active goals
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span>Active ({overallStats.activeGoals})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-success" />
          <span>Done ({overallStats.completedGoals})</span>
        </div>
      </div>
    </div>
  );
}
