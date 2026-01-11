import { Check, MoreVertical, Edit, Trash2, Calendar, Repeat, Clock } from 'lucide-react';
import { Task } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  date?: string;
  onEdit?: (task: Task) => void;
}

export function TaskCard({ task, date, onEdit }: TaskCardProps) {
  const { completeTask, deleteTask, getTodayString } = useApp();
  const currentDate = date || getTodayString();
  
  const isCompleted = task.type === 'one-time' 
    ? task.completed 
    : task.completedDates.includes(currentDate);

  const typeIcon = {
    daily: <Repeat className="w-3.5 h-3.5" />,
    'one-time': <Clock className="w-3.5 h-3.5" />,
    monthly: <Calendar className="w-3.5 h-3.5" />,
  }[task.type];

  const typeLabel = {
    daily: 'Daily',
    'one-time': 'One-time',
    monthly: 'Monthly',
  }[task.type];

  return (
    <div className={`card-elevated p-4 fade-in ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => completeTask(task.id, currentDate)}
          className={`habit-state-btn shrink-0 ${isCompleted ? 'habit-state-done' : 'habit-state-pending'}`}
        >
          <Check className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-base leading-tight ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {typeIcon}
              {typeLabel}
            </span>
            {task.linkedGoalId && (
              <span className="text-xs text-primary">• Linked to goal</span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(task)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
