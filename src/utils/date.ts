import {
  addWeeks, format, isAfter, isBefore, parse,
} from 'date-fns';
import startOfWeek from 'date-fns/startOfWeek';

export function parseDateString(dateString: string): Date {
  return parse(dateString, 'yyyy-MM-dd', new Date());
}

export function formatDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function dayIsAfter(dateString: string, dateToCompareString: string): boolean {
  return isAfter(parseDateString(dateString), parseDateString(dateToCompareString));
}

export function inDateRange(date: string, from: string, to: string): boolean {
  const dateDay = parseDateString(date);
  const dateFromDay = parseDateString(from);
  const dateToDay = parseDateString(to);
  return !isBefore(dateDay, dateFromDay) && !isAfter(dateDay, dateToDay);
}

export function getWeekDate(dateString: string): string {
  return formatDateString(startOfWeek(parseDateString(dateString), { weekStartsOn: 1 }));
}

export function dateStringAddWeeks(dateString: string, weeks: number): string {
  return formatDateString(addWeeks(parseDateString(dateString), weeks));
}

export function requestWeeks(from: string, to: string, weeksPerRequest: number): string[] {
  const endWeek = getWeekDate(to);
  const weeks: string[] = [];
  let currentWeek = getWeekDate(from);
  do {
    weeks.push(currentWeek);
    currentWeek = dateStringAddWeeks(currentWeek, weeksPerRequest);
  } while (!dayIsAfter(currentWeek, endWeek));
  return weeks;
}
