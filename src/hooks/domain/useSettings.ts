/**
 * useSettings - Domain hook for settings-related business logic
 * 
 * Responsibilities:
 * - Provide computed settings values
 * - Handle theme detection and application
 * - Generate time-based defaults
 * - Validate settings values
 * 
 * This hook is UI-agnostic and contains NO JSX, DOM, or side effects.
 * All data mutations are delegated to the data layer.
 */

import { useMemo, useCallback } from 'react';
import { Settings } from '@/types';

interface UseSettingsParams {
  settings: Settings;
}

interface TimeOfDay {
  hour: number;
  minute: number;
  formatted: string;
}

interface UseSettingsResult {
  /** Current settings */
  settings: Settings;
  /** Parsed start of day time */
  startOfDay: TimeOfDay;
  /** Parsed default reminder time */
  defaultReminderTime: TimeOfDay;
  /** Day names starting from user's preferred week start */
  weekDays: string[];
  /** Check if notifications are fully enabled */
  areNotificationsEnabled: boolean;
  /** Get theme class for body */
  getThemeClass: () => 'light' | 'dark';
  /** Validate a time string (HH:mm format) */
  validateTimeString: (time: string) => boolean;
  /** Convert 24h time to 12h format */
  formatTime12h: (time: string) => string;
  /** Get week start day name */
  weekStartDayName: string;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function useSettings({ settings }: UseSettingsParams): UseSettingsResult {
  /**
   * Parse a time string into components
   */
  const parseTime = useCallback((timeStr: string): TimeOfDay => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const hour = isNaN(hours) ? 6 : hours;
    const minute = isNaN(minutes) ? 0 : minutes;
    
    // Format as 12-hour time
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    const formatted = `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
    
    return { hour, minute, formatted };
  }, []);

  /**
   * Parsed start of day
   */
  const startOfDay = useMemo(() => {
    return parseTime(settings.startOfDay);
  }, [settings.startOfDay, parseTime]);

  /**
   * Parsed default reminder time
   */
  const defaultReminderTime = useMemo(() => {
    return parseTime(settings.defaultReminderTime);
  }, [settings.defaultReminderTime, parseTime]);

  /**
   * Week days ordered by user preference
   */
  const weekDays = useMemo(() => {
    const start = settings.weekStartDay;
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(SHORT_DAY_NAMES[(start + i) % 7]);
    }
    return days;
  }, [settings.weekStartDay]);

  /**
   * Week start day name
   */
  const weekStartDayName = useMemo(() => {
    return DAY_NAMES[settings.weekStartDay];
  }, [settings.weekStartDay]);

  /**
   * Check if all notification settings are enabled
   */
  const areNotificationsEnabled = useMemo(() => {
    return settings.notificationsEnabled && 
           (settings.streakReminders || settings.dailySummary);
  }, [settings]);

  /**
   * Get current theme class
   */
  const getThemeClass = useCallback((): 'light' | 'dark' => {
    return settings.theme;
  }, [settings.theme]);

  /**
   * Validate time string format (HH:mm)
   */
  const validateTimeString = useCallback((time: string): boolean => {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  }, []);

  /**
   * Convert 24h time to 12h format
   */
  const formatTime12h = useCallback((time: string): string => {
    return parseTime(time).formatted;
  }, [parseTime]);

  return {
    settings,
    startOfDay,
    defaultReminderTime,
    weekDays,
    areNotificationsEnabled,
    getThemeClass,
    validateTimeString,
    formatTime12h,
    weekStartDayName,
  };
}
