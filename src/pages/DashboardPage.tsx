/**
 * DashboardPage - Main dashboard view
 * 
 * Uses domain hooks for all business logic calculations.
 * This component is presentation-focused.
 */

import { PageContainer } from '@/components/layout/PageContainer';
import { useApp } from '@/context/AppContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useHabits } from '@/hooks/domain/useHabits';
import { useTasks } from '@/hooks/domain/useTasks';
import { useGoals } from '@/hooks/domain/useGoals';
import { format } from 'date-fns';
import { Target, Flame, CheckSquare, ListChecks, Settings, ChevronRight, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HabitCard } from '@/components/habits/HabitCard';
import { TaskCard } from '@/components/tasks/TaskCard';

export default function DashboardPage() {
  const { goals, habits, tasks, getTodayString, archivedHabits } = useApp();
  const { overallStats } = useAnalytics();

  // Use domain hooks for business logic
  const { todayHabits: allTodayHabits } = useHabits({ habits, archivedHabits });
  const { todayTasks: allTodayTasks } = useTasks({ tasks });
  const { primaryGoal, calculateProgress, getTimeStatus } = useGoals({ goals, habits, tasks });

  const today = getTodayString();
  const todayDate = new Date();

  // Limit display to 5 items each
  const todayHabits = allTodayHabits.slice(0, 5);
  const todayTasks = allTodayTasks.slice(0, 5);

  // Get progress and time status from domain hooks
  const progress = primaryGoal ? calculateProgress(primaryGoal).percentage : 0;
  const daysRemaining = primaryGoal ? getTimeStatus(primaryGoal).daysRemaining : 0;

  return (
    <PageContainer>
      {/* Header with Settings */}
      <div className="flex items-center justify-between mb-6">
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

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <Link to="/habits" className="stat-card p-3 flex flex-col items-center scale-in">
          <CheckSquare className="w-5 h-5 text-success mb-1" />
          <p className="text-lg font-bold">{overallStats.done7}</p>
          <p className="text-[10px] text-muted-foreground">Done</p>
        </Link>

        <Link to="/tasks" className="stat-card p-3 flex flex-col items-center scale-in" style={{ animationDelay: '0.05s' }}>
          <ListChecks className="w-5 h-5 text-primary mb-1" />
          <p className="text-lg font-bold">{overallStats.tasksCompletedToday}</p>
          <p className="text-[10px] text-muted-foreground">Tasks</p>
        </Link>

        <Link to="/goals" className="stat-card p-3 flex flex-col items-center scale-in" style={{ animationDelay: '0.1s' }}>
          <Target className="w-5 h-5 text-accent-foreground mb-1" />
          <p className="text-lg font-bold">{overallStats.activeGoals}</p>
          <p className="text-[10px] text-muted-foreground">Goals</p>
        </Link>

        <div className="stat-card p-3 flex flex-col items-center scale-in" style={{ animationDelay: '0.15s' }}>
          <Flame className="w-5 h-5 text-warning mb-1" />
          <p className="text-lg font-bold">{overallStats.bestStreak}</p>
          <p className="text-[10px] text-muted-foreground">Streak</p>
        </div>
      </div>

      {/* Primary Goal Card */}
      {primaryGoal && (
        <Link to="/goals" className="block goal-center-card mb-6 slide-up">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">Current Focus</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </div>
            
            <h2 className="text-xl font-bold mb-2">{primaryGoal.title}</h2>
            
            {primaryGoal.why && (
              <p className="text-sm opacity-80 mb-4 line-clamp-1">{primaryGoal.why}</p>
            )}

            {/* Progress bar style instead of circular */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-bold">{progress}%</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Goal meta */}
            <div className="flex items-center gap-3 mt-4 text-sm opacity-80">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
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
        </Link>
      )}

      {/* Today's Habits */}
      {todayHabits.length > 0 && (
        <div className="mb-6 slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-primary" />
              Today's Habits
            </h3>
            <Link to="/habits" className="text-xs text-primary font-medium flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {todayHabits.map(habit => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      {todayTasks.length > 0 && (
        <div className="mb-6 slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-primary" />
              Today's Tasks
            </h3>
            <Link to="/tasks" className="text-xs text-primary font-medium flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {todayTasks.map(task => (
              <TaskCard key={task.id} task={task} date={today} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Analytics */}
      <div className="glass-card p-4 slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            This Week
          </h3>
          <Link to="/analytics" className="text-xs text-primary font-medium flex items-center gap-1">
            Details <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-lg bg-success/10">
            <p className="text-lg font-bold text-success">{overallStats.completionRate7}%</p>
            <p className="text-[10px] text-muted-foreground">Completion</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-warning/10">
            <p className="text-lg font-bold text-warning">{overallStats.totalCurrentStreak}</p>
            <p className="text-[10px] text-muted-foreground">Active Streaks</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-primary/10">
            <p className="text-lg font-bold text-primary">{overallStats.consistencyScore}%</p>
            <p className="text-[10px] text-muted-foreground">Consistency</p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {todayHabits.length === 0 && todayTasks.length === 0 && !primaryGoal && (
        <div className="text-center py-12 text-muted-foreground slide-up">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Welcome to your tracker!</p>
          <p className="text-sm mt-1">Start by adding habits, tasks, or goals</p>
        </div>
      )}
    </PageContainer>
  );
}
