import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import { useAnalytics } from '@/hooks/useAnalytics';
import { CheckSquare } from 'lucide-react';

export function TaskCompletionChart() {
  const { taskCompletionTrend, overallStats } = useAnalytics();

  const chartData = useMemo(() => {
    return taskCompletionTrend.map(d => ({
      ...d,
      day: format(parseISO(d.date), 'EEE'),
    }));
  }, [taskCompletionTrend]);

  const totalCompleted = useMemo(() => {
    return taskCompletionTrend.reduce((sum, d) => sum + d.completed, 0);
  }, [taskCompletionTrend]);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-primary" />
          <h4 className="font-medium text-sm">Tasks This Week</h4>
        </div>
        <div className="text-xs">
          <span className="text-muted-foreground">Total: </span>
          <span className="font-bold text-primary">{totalCompleted}</span>
        </div>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
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
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`${value} tasks`, 'Completed']}
            />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
