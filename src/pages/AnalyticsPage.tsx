import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Flame, Target, TrendingUp, CheckCircle, XCircle, SkipForward, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HabitCompletionChart } from '@/components/analytics/HabitCompletionChart';
import { StreakChart } from '@/components/analytics/StreakChart';
import { GoalProgressChart } from '@/components/analytics/GoalProgressChart';
import { WeeklyOverviewChart } from '@/components/analytics/WeeklyOverviewChart';
import { TaskCompletionChart } from '@/components/analytics/TaskCompletionChart';
import { Progress } from '@/components/ui/progress';

export default function AnalyticsPage() {
  const { overallStats, habitStats } = useAnalytics();
  const [activeTab, setActiveTab] = useState('overview');

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
          <p className="stat-number text-warning">{overallStats.bestStreak}</p>
          <p className="text-xs text-muted-foreground">days</p>
        </div>

        <div className="card-elevated p-4 slide-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Completion Rate</span>
          </div>
          <p className="stat-number text-primary">{overallStats.completionRate7}%</p>
          <p className="text-xs text-muted-foreground">last 7 days</p>
        </div>

        <div className="card-elevated p-4 slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="w-4 h-4" />
            <span className="text-xs font-medium">Goals Progress</span>
          </div>
          <p className="stat-number text-primary">{overallStats.avgGoalProgress}%</p>
          <p className="text-xs text-muted-foreground">{overallStats.activeGoals} active</p>
        </div>

        <div className="card-elevated p-4 slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Consistency</span>
          </div>
          <p className="stat-number text-success">{overallStats.consistencyScore}%</p>
          <p className="text-xs text-muted-foreground">score</p>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full grid grid-cols-3 h-10">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="habits" className="text-xs">Habits</TabsTrigger>
          <TabsTrigger value="goals" className="text-xs">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 slide-up">
          {/* 7-Day Summary */}
          <div className="card-elevated p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Last 7 Days
            </h3>
            <div className="flex justify-between">
              <div className="text-center flex-1">
                <div className="w-10 h-10 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto mb-1">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-lg font-bold">{overallStats.done7}</p>
                <p className="text-xs text-muted-foreground">Done</p>
              </div>
              <div className="text-center flex-1">
                <div className="w-10 h-10 rounded-full bg-skipped/20 text-skipped flex items-center justify-center mx-auto mb-1">
                  <SkipForward className="w-5 h-5" />
                </div>
                <p className="text-lg font-bold">{overallStats.skipped7}</p>
                <p className="text-xs text-muted-foreground">Skipped</p>
              </div>
              <div className="text-center flex-1">
                <div className="w-10 h-10 rounded-full bg-missed/20 text-missed flex items-center justify-center mx-auto mb-1">
                  <XCircle className="w-5 h-5" />
                </div>
                <p className="text-lg font-bold">{overallStats.missed7}</p>
                <p className="text-xs text-muted-foreground">Missed</p>
              </div>
            </div>
          </div>

          {/* Weekly Chart */}
          <WeeklyOverviewChart />
          
          {/* Task Completion */}
          <TaskCompletionChart />
        </TabsContent>

        <TabsContent value="habits" className="space-y-4 slide-up">
          {/* Habit Completion Trend */}
          <HabitCompletionChart days={7} />
          
          {/* Streak Overview */}
          <StreakChart />

          {/* Individual Habit Stats */}
          {habitStats.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Habit Breakdown
              </h3>
              {habitStats.map((stat) => (
                <div key={stat.habitId} className="card-elevated p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm truncate max-w-[180px]">{stat.habitName}</h4>
                    <span className="streak-badge text-xs">
                      <Flame className="w-3 h-3" />
                      {stat.currentStreak}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">7-day completion</span>
                        <span className="font-medium">{stat.completion7Days}%</span>
                      </div>
                      <Progress value={stat.completion7Days} className="h-1.5" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Consistency score</span>
                        <span className="font-medium">{stat.consistencyScore}%</span>
                      </div>
                      <Progress value={stat.consistencyScore} className="h-1.5" />
                    </div>

                    {/* Mini week view */}
                    <div className="flex gap-1 mt-2">
                      {stat.dailyData.map((day, i) => (
                        <div 
                          key={i}
                          className={`flex-1 h-5 rounded text-center text-[9px] leading-5 ${
                            day.state === 'done' 
                              ? 'bg-success/20 text-success' 
                              : day.state === 'skipped'
                                ? 'bg-skipped/20 text-skipped'
                                : day.state === 'missed'
                                  ? 'bg-missed/20 text-missed'
                                  : 'bg-muted/50 text-muted-foreground'
                          }`}
                        >
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="goals" className="space-y-4 slide-up">
          {/* Goal Progress Chart */}
          <GoalProgressChart />

          {/* 30-day Trend */}
          <HabitCompletionChart days={30} />
        </TabsContent>
      </Tabs>

      {habitStats.length === 0 && overallStats.activeGoals === 0 && (
        <div className="text-center py-12 text-muted-foreground slide-up">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No data yet</p>
          <p className="text-sm mt-1">Start tracking habits and goals to see analytics</p>
        </div>
      )}
    </PageContainer>
  );
}
