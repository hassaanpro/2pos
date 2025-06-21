import { format, addDays, startOfDay, endOfDay } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

// Pakistan timezone
const PAKISTAN_TIMEZONE = 'Asia/Karachi';

/**
 * Format currency in Pakistani Rupees
 */
export const formatCurrency = (amount: number): string => {
  return `₨${amount.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Get the current date in Pakistan timezone
 */
export const getCurrentPakistanDate = (): Date => {
  return utcToZonedTime(new Date(), PAKISTAN_TIMEZONE);
};

/**
 * Format a date for display in Pakistan format
 */
export const formatPakistanDateTimeForDisplay = (date: Date): string => {
  const pakistanDate = utcToZonedTime(date, PAKISTAN_TIMEZONE);
  return format(pakistanDate, 'dd-MM-yyyy HH:mm:ss');
};

/**
 * Format a date for database storage (ISO format)
 */
export const formatDateForDatabase = (date: Date): string => {
  return date.toISOString();
};

/**
 * Get the start and end of day in Pakistan timezone
 */
export const getPakistanDayRange = (date: Date): { startOfDay: Date; endOfDay: Date } => {
  const pakistanDate = utcToZonedTime(date, PAKISTAN_TIMEZONE);
  const pakistanStartOfDay = startOfDay(pakistanDate);
  const pakistanEndOfDay = endOfDay(pakistanDate);
  
  // Convert back to UTC for database queries
  const utcStartOfDay = zonedTimeToUtc(pakistanStartOfDay, PAKISTAN_TIMEZONE);
  const utcEndOfDay = zonedTimeToUtc(pakistanEndOfDay, PAKISTAN_TIMEZONE);
  
  return {
    startOfDay: utcStartOfDay,
    endOfDay: utcEndOfDay
  };
};

/**
 * Get the date range for a specific period in Pakistan timezone
 */
export const getPakistanDateRange = (
  period: 'today' | 'yesterday' | 'week' | 'month' | 'custom',
  customStartDate?: Date,
  customEndDate?: Date
): { startDate: Date; endDate: Date } => {
  const today = getCurrentPakistanDate();
  
  switch (period) {
    case 'today':
      return getPakistanDayRange(today);
    case 'yesterday':
      const yesterday = addDays(today, -1);
      return getPakistanDayRange(yesterday);
    case 'week':
      const weekStart = addDays(today, -6); // Last 7 days including today
      return {
        startDate: startOfDay(weekStart),
        endDate: endOfDay(today)
      };
    case 'month':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        startDate: startOfDay(monthStart),
        endDate: endOfDay(today)
      };
    case 'custom':
      if (!customStartDate || !customEndDate) {
        throw new Error('Custom date range requires both start and end dates');
      }
      return {
        startDate: startOfDay(customStartDate),
        endDate: endOfDay(customEndDate)
      };
    default:
      return getPakistanDayRange(today);
  }
};