import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import { useAnalytics } from '@/hooks/useAnalytics';

interface Props {
  days?: 7 | 30;
}

export function HabitCompletionChart({ days = 7 }: Props) {
  const { dailyStats } = useAnalytics();

  const chartData = useMemo(() => {
    const data = days === 7 ? dailyStats.slice(-7) : dailyStats;
    return data.map(d => ({
      ...d,
      dateLabel: format(parseISO(d.date), days === 7 ? 'EEE' : 'MMM d'),
      completionRate: d.total > 0 ? Math.round((d.done / d.total) * 100) : 0,
    }));
  }, [dailyStats, days]);

  return (
    <div className="glass-card p-4">
      <h4 className="font-medium text-sm mb-4">Habit Completion Trend</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="dateLabel" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number, name: string) => [
                value,
                name === 'done' ? 'Completed' : name === 'missed' ? 'Missed' : 'Skipped'
              ]}
            />
            <Area
              type="monotone"
              dataKey="done"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              fill="url(#colorDone)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-success" />
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
}
