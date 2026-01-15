import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { useAnalytics } from '@/hooks/useAnalytics';
import { TrendingUp } from 'lucide-react';

export function WeeklyOverviewChart() {
  const { dailyStats } = useAnalytics();

  const chartData = useMemo(() => {
    return dailyStats.slice(-7).map(d => ({
      ...d,
      day: format(parseISO(d.date), 'EEE'),
      fullDate: format(parseISO(d.date), 'MMM d'),
    }));
  }, [dailyStats]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-1">{data.fullDate}</p>
          <div className="space-y-1 text-xs">
            <p className="text-success">✓ Done: {data.done}</p>
            <p className="text-skipped">→ Skipped: {data.skipped}</p>
            <p className="text-missed">✗ Missed: {data.missed}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h4 className="font-medium text-sm">Weekly Overview</h4>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="done" stackId="a" fill="hsl(var(--success))" radius={[0, 0, 0, 0]} />
            <Bar dataKey="skipped" stackId="a" fill="hsl(var(--skipped))" radius={[0, 0, 0, 0]} />
            <Bar dataKey="missed" stackId="a" fill="hsl(var(--missed))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-3 mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span>Done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-skipped" />
          <span>Skipped</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-missed" />
          <span>Missed</span>
        </div>
      </div>
    </div>
  );
}
