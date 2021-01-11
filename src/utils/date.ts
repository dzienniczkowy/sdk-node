import {
  formatISO, isAfter, isBefore, parse, startOfDay,
} from 'date-fns';
import { format, zonedTimeToUtc } from 'date-fns-tz';
import startOfWeek from 'date-fns/startOfWeek';

/**
 * @param date Date from API (D.M.YY)
 * @returns ISO 8601 date string (YYYY-MM-DD)
 */
export function toISODate(date: string): string {
  return format(parse(date, 'dd.MM.yyyy', new Date()), 'yyyy-MM-dd');
}

/**
 * @param dateTime Date time from API (YYYY-MM-DD HH:mm:ss)
 * @returns ISO 8601 date time string (YYYY-MM-DD'T'HH:mm:ss)
 */
export function toExtendedISO(dateTime: string): string {
  return formatISO(zonedTimeToUtc(dateTime, 'Europe/Warsaw'));
}

/**
 * @param dateTime Date time from API (YYYY-MM-DD HH:mm:ss)
 * @returns ISO 8601 date string (YYYY-MM-DD)
 */
export function localDateTimeToISODate(dateTime: string): string {
  return format(new Date(dateTime), 'yyyy-MM-dd');
}

export function dayIsAfter(date: Date, dateToCompare: Date): boolean {
  return isAfter(startOfDay(date), startOfDay(dateToCompare));
}

export function inDateRange(date: Date, from: Date, to: Date): boolean {
  const dateDay = startOfDay(date);
  const dateFromDay = startOfDay(from);
  const dateToDay = startOfDay(to);
  return !isBefore(dateDay, dateFromDay) && !isAfter(dateDay, dateToDay);
}

export function getWeekDate(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function formatLocalISO(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss", {
    timeZone: 'Europe/Warsaw',
  });
}
