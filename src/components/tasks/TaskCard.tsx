import { useState, useRef } from 'react';
import { Check, MoreVertical, Edit, Trash2, Calendar, Repeat, Clock, X } from 'lucide-react';
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

  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const deltaX = e.touches[0].clientX - touchStart.x;
    const deltaY = Math.abs(e.touches[0].clientY - touchStart.y);
    
    if (deltaY > 30) {
      setSwipeOffset(0);
      return;
    }
    
    setSwipeOffset(Math.max(-100, Math.min(100, deltaX)));
    if (deltaX > 30) setSwipeDirection('right');
    else if (deltaX < -30) setSwipeDirection('left');
    else setSwipeDirection(null);
  };

  const handleTouchEnd = () => {
    if (swipeOffset > 60) {
      // Swipe right: Complete
      completeTask(task.id, currentDate);
    } else if (swipeOffset < -60) {
      // Swipe left: Delete
      deleteTask(task.id);
    }
    setSwipeOffset(0);
    setSwipeDirection(null);
    setTouchStart(null);
  };

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
    <div 
      className={`card-elevated p-4 fade-in relative overflow-hidden transition-all duration-200 ${
        isCompleted ? 'opacity-60 ring-2 ring-success/30' : ''
      }`}
      style={{ 
        transform: `translateX(${swipeOffset}px)`,
        opacity: 1 - Math.abs(swipeOffset) / 200
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe indicators */}
      {swipeDirection === 'right' && (
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-success/30 to-transparent flex items-center justify-center">
          <Check className="w-6 h-6 text-success" />
        </div>
      )}
      {swipeDirection === 'left' && (
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-destructive/30 to-transparent flex items-center justify-center">
          <Trash2 className="w-6 h-6 text-destructive" />
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => completeTask(task.id, currentDate)}
          className={`habit-state-btn shrink-0 transition-all duration-200 ${
            isCompleted ? 'habit-state-done scale-110' : 'habit-state-pending'
          }`}
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
            {task.category && (
              <span className="text-xs text-muted-foreground">• {task.category}</span>
            )}
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