import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { GoalCard } from '@/components/goals/GoalCard';
import { CreateGoalDialog } from '@/components/goals/CreateGoalDialog';
import { UpgradePrompt } from '@/components/premium/UpgradePrompt';
import { useApp } from '@/context/AppContext';
import { usePremium } from '@/hooks/usePremium';
import { Goal } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Check } from 'lucide-react';

export default function GoalsPage() {
  const { goals, habits } = useApp();
  const { canAddGoal, goalCount, goalsRemaining } = usePremium({ habits, goals });
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(true);

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  return (
    <PageContainer>
      <PageHeader 
        title="Goals" 
        subtitle={`Track your SMART goals • ${goalsRemaining === Infinity ? '∞' : goalsRemaining} remaining`}
        action={<CreateGoalDialog disabled={!canAddGoal} />}
      />

      {/* Upgrade Prompt */}
      {showUpgrade && !canAddGoal && (
        <UpgradePrompt 
          type="goal" 
          current={goalCount} 
          onDismiss={() => setShowUpgrade(false)} 
        />
      )}

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Active ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Completed ({completedGoals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3">
          {activeGoals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No active goals</p>
              <p className="text-sm mt-1">Create a SMART goal to get started</p>
            </div>
          ) : (
            activeGoals.map(goal => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onEdit={setEditingGoal}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          {completedGoals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Check className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No completed goals yet</p>
              <p className="text-sm mt-1">Complete goals to see them here</p>
            </div>
          ) : (
            completedGoals.map(goal => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onEdit={setEditingGoal}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {editingGoal && (
        <CreateGoalDialog 
          editGoal={editingGoal} 
          onClose={() => setEditingGoal(null)} 
        />
      )}
    </PageContainer>
  );
}
