import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  scheduledFor: Date;
  type: 'habit' | 'task' | 'goal' | 'streak' | 'summary';
}

export function useWebPush() {
  const { settings, habits, tasks, goals, habitLogs, getTodayString } = useApp();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);

  useEffect(() => {
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Notifications are not supported in this browser');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Notifications enabled!');
        return true;
      } else if (result === 'denied') {
        toast.error('Notifications blocked. Please enable in browser settings.');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback((title: string, body: string, options?: NotificationOptions) => {
    if (permission !== 'granted') return;

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: options?.tag || 'habit-tracker',
        requireInteraction: false,
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [permission]);

  // Schedule a notification using setTimeout (for web - simplified approach)
  const scheduleNotification = useCallback((
    id: string,
    title: string, 
    body: string, 
    scheduledFor: Date,
    type: ScheduledNotification['type']
  ) => {
    const now = new Date();
    const delay = scheduledFor.getTime() - now.getTime();
    
    if (delay <= 0) return; // Don't schedule past notifications

    const timeoutId = setTimeout(() => {
      showNotification(title, body, { tag: `${type}-${id}` });
    }, delay);

    setScheduledNotifications(prev => [
      ...prev.filter(n => n.id !== id),
      { id, title, body, scheduledFor, type }
    ]);

    return () => clearTimeout(timeoutId);
  }, [showNotification]);

  // Schedule habit reminders
  const scheduleHabitReminders = useCallback(() => {
    if (!settings.notificationsEnabled || permission !== 'granted') return;

    const today = getTodayString();
    
    habits.forEach(habit => {
      if (habit.archived || !habit.reminderTimes?.length) return;
      
      // Check if already completed today
      const todayLog = habitLogs.find(l => l.habitId === habit.id && l.date === today);
      if (todayLog?.state === 'done') return;

      habit.reminderTimes.forEach((time, index) => {
        const [hours, minutes] = time.split(':').map(Number);
        const reminderDate = new Date();
        reminderDate.setHours(hours, minutes, 0, 0);
        
        if (reminderDate > new Date()) {
          scheduleNotification(
            `habit-${habit.id}-${index}`,
            '⏰ Habit Reminder',
            `Time to complete: ${habit.name}`,
            reminderDate,
            'habit'
          );
        }
      });
    });
  }, [habits, habitLogs, settings.notificationsEnabled, permission, getTodayString, scheduleNotification]);

  // Schedule task reminders
  const scheduleTaskReminders = useCallback(() => {
    if (!settings.notificationsEnabled || permission !== 'granted') return;

    const today = getTodayString();
    
    tasks.forEach(task => {
      if (task.completed || !task.reminderTimes?.length) return;
      
      // Check if already completed today
      if (task.completedDates.includes(today)) return;

      task.reminderTimes.forEach((time, index) => {
        const [hours, minutes] = time.split(':').map(Number);
        const reminderDate = new Date();
        reminderDate.setHours(hours, minutes, 0, 0);
        
        if (reminderDate > new Date()) {
          scheduleNotification(
            `task-${task.id}-${index}`,
            '📝 Task Reminder',
            `Don't forget: ${task.title}`,
            reminderDate,
            'task'
          );
        }
      });
    });
  }, [tasks, settings.notificationsEnabled, permission, getTodayString, scheduleNotification]);

  // Schedule daily summary
  const scheduleDailySummary = useCallback((time: string) => {
    if (!settings.notificationsEnabled || !settings.dailySummary || permission !== 'granted') return;

    const [hours, minutes] = time.split(':').map(Number);
    const summaryDate = new Date();
    summaryDate.setHours(hours, minutes, 0, 0);
    
    if (summaryDate <= new Date()) {
      summaryDate.setDate(summaryDate.getDate() + 1);
    }

    const today = getTodayString();
    const habitsCompleted = habitLogs.filter(l => l.date === today && l.state === 'done').length;
    const totalHabits = habits.filter(h => !h.archived).length;

    scheduleNotification(
      'daily-summary',
      '📊 Daily Summary',
      `You've completed ${habitsCompleted}/${totalHabits} habits today!`,
      summaryDate,
      'summary'
    );
  }, [habits, habitLogs, settings, permission, getTodayString, scheduleNotification]);

  // Check for streaks at risk
  const checkStreakRisk = useCallback(() => {
    if (!settings.notificationsEnabled || !settings.streakReminders || permission !== 'granted') return;

    const today = getTodayString();
    const atRiskHabits = habits.filter(h => {
      if (h.archived || h.currentStreak === 0) return false;
      const todayLog = habitLogs.find(l => l.habitId === h.id && l.date === today);
      return !todayLog || todayLog.state === 'pending';
    });

    if (atRiskHabits.length > 0) {
      // Schedule for evening (8 PM) if not already late
      const eveningCheck = new Date();
      eveningCheck.setHours(20, 0, 0, 0);
      
      if (eveningCheck > new Date()) {
        scheduleNotification(
          'streak-risk',
          '🔥 Streak at Risk!',
          `${atRiskHabits.length} habit${atRiskHabits.length > 1 ? 's' : ''} need${atRiskHabits.length === 1 ? 's' : ''} completion to keep your streak`,
          eveningCheck,
          'streak'
        );
      }
    }
  }, [habits, habitLogs, settings, permission, getTodayString, scheduleNotification]);

  // Initialize reminders when settings change
  useEffect(() => {
    if (settings.notificationsEnabled && permission === 'granted') {
      scheduleHabitReminders();
      scheduleTaskReminders();
      checkStreakRisk();
      if (settings.dailySummary) {
        scheduleDailySummary(settings.defaultReminderTime);
      }
    }
  }, [
    settings.notificationsEnabled,
    settings.dailySummary,
    settings.defaultReminderTime,
    permission,
    scheduleHabitReminders,
    scheduleTaskReminders,
    scheduleDailySummary,
    checkStreakRisk
  ]);

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    scheduleNotification,
    scheduledNotifications,
    scheduleHabitReminders,
    scheduleTaskReminders,
    scheduleDailySummary,
    checkStreakRisk,
  };
}
