import { formatISO, parse } from 'date-fns';
import { format, zonedTimeToUtc } from 'date-fns-tz';
import { formatDateString, parseDateString } from './date';

/**
 * @param dateString Date from API (D.M.YY)
 * @returns ISO 8601 date string (YYYY-MM-DD)
 */
export function humanDateToDateString(dateString: string): string {
  return formatDateString(parse(dateString, 'dd.MM.yyyy', new Date()));
}

/**
 * @param dateTimeString Date time from API (YYYY-MM-DD HH:mm:ss)
 * @returns ISO 8601 date time string (YYYY-MM-DD'T'HH:mm:ssX)
 */
export function remoteISOToExtendedISO(dateTimeString: string): string {
  return formatISO(zonedTimeToUtc(dateTimeString, 'Europe/Warsaw'));
}

export function dateStringToRemoteISO(dateString: string): string {
  return format(parseDateString(dateString), 'yyyy-MM-dd\'T\'HH:mm:ss');
}

/**
 * @param dateTimeString Date time from API (YYYY-MM-DD HH:mm:ss)
 * @returns ISO 8601 date string (YYYY-MM-DD)
 */
export function remoteISOToDateString(dateTimeString: string): string {
  return format(parse(dateTimeString, 'yyyy-MM-dd HH:mm:ss', new Date()), 'yyyy-MM-dd');
}
