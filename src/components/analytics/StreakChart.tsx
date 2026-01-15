import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Flame } from 'lucide-react';

export function StreakChart() {
  const { habitStats, overallStats } = useAnalytics();

  const chartData = useMemo(() => {
    return habitStats
      .filter(h => h.currentStreak > 0 || h.bestStreak > 0)
      .slice(0, 8)
      .map(h => ({
        name: h.habitName.length > 10 ? h.habitName.slice(0, 10) + '...' : h.habitName,
        current: h.currentStreak,
        best: h.bestStreak,
      }));
  }, [habitStats]);

  if (chartData.length === 0) {
    return (
      <div className="glass-card p-4 text-center">
        <Flame className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">No streak data yet</p>
        <p className="text-xs text-muted-foreground mt-1">Complete habits to build streaks</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-warning" />
          <h4 className="font-medium text-sm">Streak Overview</h4>
        </div>
        <div className="text-xs text-muted-foreground">
          Best: <span className="font-bold text-warning">{overallStats.bestStreak}</span> days
        </div>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => [
                `${value} days`,
                name === 'current' ? 'Current' : 'Best'
              ]}
            />
            <Bar dataKey="current" radius={[0, 4, 4, 0]} maxBarSize={20}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill="hsl(var(--warning))" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-warning" />
          <span>Current Streak</span>
        </div>
      </div>
    </div>
  );
}
