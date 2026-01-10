import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { TaskCard } from '@/components/tasks/TaskCard';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { useApp } from '@/context/AppContext';
import { Task } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckSquare, Calendar, Repeat } from 'lucide-react';

export default function TasksPage() {
  const { tasks, getTasksForDate, getTodayString } = useApp();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const today = getTodayString();

  const todaysTasks = getTasksForDate(today);
  const dailyTasks = tasks.filter(t => t.type === 'daily');
  const oneTimeTasks = tasks.filter(t => t.type === 'one-time' && !t.completed);
  const monthlyTasks = tasks.filter(t => t.type === 'monthly');

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <PageContainer>
      <PageHeader 
        title="Tasks" 
        subtitle={`${todayName}, ${todayDate}`}
        action={<CreateTaskDialog />}
      />

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="today" className="text-xs">
            Today ({todaysTasks.length})
          </TabsTrigger>
          <TabsTrigger value="daily" className="text-xs">
            Daily ({dailyTasks.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs">
            All ({tasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-3">
          {todaysTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No tasks for today</p>
              <p className="text-sm mt-1">Add tasks to stay organized</p>
            </div>
          ) : (
            todaysTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task}
                date={today}
                onEdit={setEditingTask}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="daily" className="space-y-3">
          {dailyTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Repeat className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No daily tasks</p>
              <p className="text-sm mt-1">Daily tasks reset every day</p>
            </div>
          ) : (
            dailyTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task}
                date={today}
                onEdit={setEditingTask}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {oneTimeTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">One-time</h3>
              <div className="space-y-2">
                {oneTimeTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    onEdit={setEditingTask}
                  />
                ))}
              </div>
            </div>
          )}

          {monthlyTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Monthly</h3>
              <div className="space-y-2">
                {monthlyTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    onEdit={setEditingTask}
                  />
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No tasks yet</p>
              <p className="text-sm mt-1">Create tasks to get started</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {editingTask && (
        <CreateTaskDialog 
          editTask={editingTask} 
          onClose={() => setEditingTask(null)} 
        />
      )}
    </PageContainer>
  );
}
