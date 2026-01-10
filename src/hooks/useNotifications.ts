import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export function useNotifications() {
  const isNative = Capacitor.isNativePlatform();

  const requestPermissions = async () => {
    if (!isNative) {
      console.log('Push notifications require native platform');
      return false;
    }

    try {
      // Request local notification permissions
      const localResult = await LocalNotifications.requestPermissions();
      
      // Request push notification permissions
      const pushResult = await PushNotifications.requestPermissions();
      
      if (pushResult.receive === 'granted') {
        await PushNotifications.register();
      }
      
      return localResult.display === 'granted' && pushResult.receive === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  const scheduleLocalNotification = async (
    title: string,
    body: string,
    scheduleAt: Date,
    id?: number
  ) => {
    if (!isNative) return;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: id || Math.floor(Math.random() * 100000),
            title,
            body,
            schedule: { at: scheduleAt },
            sound: 'default',
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#14b8a6',
          },
        ],
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const scheduleHabitReminder = async (
    habitName: string,
    reminderTime: string,
    habitId: string
  ) => {
    if (!isNative) return;

    const [hours, minutes] = reminderTime.split(':').map(Number);
    const scheduleDate = new Date();
    scheduleDate.setHours(hours, minutes, 0, 0);
    
    if (scheduleDate <= new Date()) {
      scheduleDate.setDate(scheduleDate.getDate() + 1);
    }

    await scheduleLocalNotification(
      '⏰ Habit Reminder',
      `Time to complete: ${habitName}`,
      scheduleDate,
      parseInt(habitId.replace(/\D/g, '').slice(0, 9))
    );
  };

  const scheduleDailySummary = async (time: string) => {
    if (!isNative) return;

    const [hours, minutes] = time.split(':').map(Number);
    const scheduleDate = new Date();
    scheduleDate.setHours(hours, minutes, 0, 0);
    
    if (scheduleDate <= new Date()) {
      scheduleDate.setDate(scheduleDate.getDate() + 1);
    }

    await scheduleLocalNotification(
      '📊 Daily Summary',
      'Check your progress for today!',
      scheduleDate,
      999999
    );
  };

  const cancelAllNotifications = async () => {
    if (!isNative) return;
    
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications,
        });
      }
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  };

  useEffect(() => {
    if (isNative) {
      LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        console.log('Notification action performed:', notification);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
      });
    }

    return () => {
      if (isNative) {
        LocalNotifications.removeAllListeners();
        PushNotifications.removeAllListeners();
      }
    };
  }, [isNative]);

  return {
    isNative,
    requestPermissions,
    scheduleLocalNotification,
    scheduleHabitReminder,
    scheduleDailySummary,
    cancelAllNotifications,
  };
}
