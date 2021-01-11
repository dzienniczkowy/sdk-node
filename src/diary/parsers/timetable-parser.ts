import * as cheerio from 'cheerio';
import { humanDateToDateString, notNil } from '../../utils';
import { TimetableData } from '../interfaces/timetable/timetable-data';
import { TimetableLesson, TimetableLessonInfo } from '../interfaces/timetable/timetable-lesson';

function getSubjectAndGroupFromSpan(span: Cheerio): { subject: string; group?: string } {
  return {
    subject: span.text().substr(
      0,
      span.text().includes(' [') ? span.text().indexOf(' [') : span.text().length,
    ),
    group: span.text().includes(' [') ? span.text().substring(span.text().indexOf('[') + 1, span.text().indexOf(']')) : undefined,
  };
}

function getFormattedLessonInfo(info: string): string {
  return info.substring(1, info.length - 1);
}

function getLesson(spans: Cheerio, offset = 0): TimetableLessonInfo {
  const { subject, group } = getSubjectAndGroupFromSpan(spans.eq(0));
  return {
    subject,
    group,
    teacher: spans.eq(1 + offset).text(),
    room: spans.eq(2 + offset).text(),
    info: 3 + offset < spans.length
      ? getFormattedLessonInfo(spans.eq(3 + offset).text())
      : undefined,
    canceled: spans.hasClass('x-treelabel-inv'),
    hasChanges: spans.hasClass('x-treelabel-zas'),
  };
}

function getLessonWithReplacement(spans: Cheerio, offset = 0): TimetableLessonInfo {
  const { subject, group } = getSubjectAndGroupFromSpan(spans.eq(3 + offset));
  const { subject: subjectOld } = getSubjectAndGroupFromSpan(spans.eq(0));
  return {
    subject,
    subjectOld,
    group,
    teacher: spans.eq(4 + offset * 2).text(),
    teacherOld: spans.eq(1 + offset).text(),
    room: spans.eq(5 + offset * 2).text(),
    roomOld: spans.eq(2 + offset).text(),
    info: `${getFormattedLessonInfo(spans.last().text())}, poprzednio: ${subjectOld}`,
    hasChanges: true,
    canceled: false,
  };
}

function getLessonInfo(div: string): TimetableLessonInfo | null {
  const $ = cheerio.load(div);
  const spans = $('span');
  if (spans.length === 3) return getLesson(spans);
  if (spans.length === 4 && spans.last().hasClass('x-treelabel-rlz')) return getLesson(spans);
  if (spans.length === 4) return getLesson(spans, 1);
  if (spans.length === 5 && spans.last().hasClass('x-treelabel-rlz')) return getLesson(spans, 1);
  if (spans.length === 7) return getLessonWithReplacement(spans);
  if (spans.length === 9) return getLessonWithReplacement(spans, 1);
  return null;
}

function stripLessonInfo(info: string): string {
  const newInfo = info.startsWith(', ') ? info.substring(2, info.length) : info;
  return newInfo
    .replace('okienko dla uczniów', '')
    .replace('zmiana organizacji zajęć', '')
    .replace(' ,', '');
}

function capitalizeString(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function parseCell(cell: string): TimetableLessonInfo | null {
  const $ = cheerio.load(cell);
  const divs = $('div:not([class])');
  if (divs.length === 1) return getLessonInfo(divs.eq(0).html()!);
  if (divs.length === 2 && divs.eq(1).find('span').first().hasClass('x-treelabel-inv')) {
    if (divs.eq(1).find('span').first().hasClass('x-treelabel-ppl')) {
      const newLesson = getLessonInfo(divs.eq(0).html()!);
      if (newLesson === null) return null;
      const oldLesson = getLessonInfo(divs.eq(1).html()!);
      return {
        ...newLesson,
        hasChanges: true,
        subjectOld: oldLesson?.subject,
        teacherOld: oldLesson?.teacher,
        roomOld: oldLesson?.room,
        info: newLesson.info
          ? capitalizeString(stripLessonInfo(
            `${getFormattedLessonInfo(newLesson.info)}, ${oldLesson?.info}`,
          ).replace(newLesson.subject, ''))
          : undefined,
      };
    } return getLessonInfo(divs.eq(1).html()!);
  }
  if (divs.length === 2 && divs.eq(1).find('span').first().hasClass('x-treelabel-zas')) {
    const newLesson = getLessonInfo(divs.eq(1).html()!);
    if (newLesson === null) return null;
    const oldLesson = getLessonInfo(divs.eq(0).html()!);
    return {
      ...newLesson,
      hasChanges: true,
      canceled: false,
      subjectOld: oldLesson?.subject,
      teacherOld: oldLesson?.teacher,
      roomOld: oldLesson?.room,
    };
  }
  if (divs.length === 2 && divs.eq(0).find('span').first().hasClass('x-treelabel-inv')
    && divs.eq(0).find('span').first().hasClass('x-treelabel-ppl')
    && divs.eq(1).find('span').first().attr('class') === '') {
    const newLesson = getLessonInfo(divs.eq(1).html()!);
    const oldLesson = getLessonInfo(divs.eq(0).html()!);
    if (newLesson === null || oldLesson === null) return null;
    return {
      ...newLesson,
      hasChanges: true,
      canceled: false,
      subjectOld: oldLesson.subject,
      teacherOld: oldLesson.teacher,
      roomOld: oldLesson.room,
      info: `Poprzednio: ${oldLesson.subject} (${oldLesson.info})`,
    };
  }
  if (divs.length === 2) getLessonInfo(divs.eq(0).html()!);
  else if (divs.length === 3) {
    if (divs.eq(0).find('span').first().hasClass('x-treelabel-zas')
      && divs.eq(1).find('span').first().hasClass('x-treelabel-inv')
      && divs.eq(2).find('span').first().hasClass('x-treelabel-inv')) {
      const newLesson = getLessonInfo(divs.eq(0).html()!);
      if (newLesson === null) return null;
      const oldLesson = getLessonInfo(divs.eq(1).html()!);
      return {
        ...newLesson,
        hasChanges: true,
        canceled: false,
        subjectOld: oldLesson?.subject,
        teacherOld: oldLesson?.teacher,
        roomOld: oldLesson?.room,
      };
    }
    if (divs.eq(0).find('span').first().hasClass('x-treelabel-inv')
      && divs.eq(1).find('span').first().hasClass('x-treelabel-inv')
      && divs.eq(2).find('span').first().hasClass('x-treelabel-zas')) {
      const newLesson = getLessonInfo(divs.eq(2).html()!);
      if (newLesson === null) return null;
      const oldLesson = getLessonInfo(divs.eq(0).html()!);
      return {
        ...newLesson,
        hasChanges: true,
        canceled: false,
        subjectOld: oldLesson?.subject,
        teacherOld: oldLesson?.teacher,
        roomOld: oldLesson?.room,
      };
    }
    return getLessonInfo(divs.eq(0).html()!);
  } return null;
}

export function parseTimetable(htmlResponse: TimetableData): TimetableLesson[] {
  const weekDays = htmlResponse.Headers.slice(1);
  return weekDays.flatMap(
    (weekDay, weekDayIndex) => htmlResponse.Rows
      .map((row) => {
        const [number, start, end] = row[0].split('<br />');
        const cell = row[weekDayIndex + 1];
        if (cell === '') return null;
        const lesson = parseCell(cell);
        if (!lesson) return null;
        return {
          ...lesson,
          date: humanDateToDateString(weekDay.Text.split('<br />')[1]),
          number: parseInt(number, 10),
          start,
          end,
        };
      })
      .filter(notNil),
  );
}
