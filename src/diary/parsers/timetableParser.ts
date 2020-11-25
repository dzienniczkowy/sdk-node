import * as cheerio from 'cheerio';
import { formatISO } from 'date-fns';
import { notNil } from '../../utils';
import { TimetableLesson, TimetableLessonInfo } from '../interfaces/timetable/timetable-lesson';
import { TimetableResponse } from '../interfaces/timetable/timetable-response';

export class TimetableParser {
  public static parseTimetable(htmlResponse: TimetableResponse): TimetableLesson[] {
    const weekDays = htmlResponse.Headers.slice(1);
    return weekDays.flatMap(
      (weekDay, weekDayIndex) => htmlResponse.Rows
        .map((row) => {
          const [number, start, end] = row[0].split('<br />');
          const cell = row[weekDayIndex + 1];
          if (cell === '') return null;
          const lesson = TimetableParser.parseCell(cell);
          if (!lesson) return null;
          const [day, month, year] = weekDay.Text.split('<br />')[1]
            .split('.')
            .map((x) => parseInt(x, 10));
          return {
            ...lesson,
            date: formatISO(Date.UTC(year, month - 1, day), { representation: 'date' }),
            number: parseInt(number, 10),
            start,
            end,
          };
        })
        .filter(notNil),
    );
  }

  private static parseCell(cell: string): TimetableLessonInfo | null {
    const $ = cheerio.load(cell);
    const divs = $('div:not([class])');
    if (divs.length === 1) return TimetableParser.getLessonInfo(divs.eq(0).html()!);
    if (divs.length === 2 && divs.eq(1).find('span').first().hasClass('x-treelabel-inv')) {
      if (divs.eq(1).find('span').first().hasClass('x-treelabel-ppl')) {
        const newLesson = TimetableParser.getLessonInfo(divs.eq(0).html()!);
        if (newLesson === null) return null;
        const oldLesson = TimetableParser.getLessonInfo(divs.eq(1).html()!);
        return {
          ...newLesson,
          hasChanges: true,
          subjectOld: oldLesson?.subject,
          teacherOld: oldLesson?.teacher,
          roomOld: oldLesson?.room,
          info: newLesson.info
            ? TimetableParser.capitalizeString(TimetableParser.stripLessonInfo(
              `${TimetableParser.getFormattedLessonInfo(newLesson.info)}, ${oldLesson?.info}`,
            ).replace(newLesson.subject, ''))
            : undefined,
        };
      } return TimetableParser.getLessonInfo(divs.eq(1).html()!);
    }
    if (divs.length === 2 && divs.eq(1).find('span').first().hasClass('x-treelabel-zas')) {
      const newLesson = TimetableParser.getLessonInfo(divs.eq(1).html()!);
      if (newLesson === null) return null;
      const oldLesson = TimetableParser.getLessonInfo(divs.eq(0).html()!);
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
      const newLesson = TimetableParser.getLessonInfo(divs.eq(1).html()!);
      const oldLesson = TimetableParser.getLessonInfo(divs.eq(0).html()!);
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
    if (divs.length === 2) TimetableParser.getLessonInfo(divs.eq(0).html()!);
    else if (divs.length === 3) {
      if (divs.eq(0).find('span').first().hasClass('x-treelabel-zas')
        && divs.eq(1).find('span').first().hasClass('x-treelabel-inv')
        && divs.eq(2).find('span').first().hasClass('x-treelabel-inv')) {
        const newLesson = TimetableParser.getLessonInfo(divs.eq(0).html()!);
        if (newLesson === null) return null;
        const oldLesson = TimetableParser.getLessonInfo(divs.eq(1).html()!);
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
        const newLesson = TimetableParser.getLessonInfo(divs.eq(2).html()!);
        if (newLesson === null) return null;
        const oldLesson = TimetableParser.getLessonInfo(divs.eq(0).html()!);
        return {
          ...newLesson,
          hasChanges: true,
          canceled: false,
          subjectOld: oldLesson?.subject,
          teacherOld: oldLesson?.teacher,
          roomOld: oldLesson?.room,
        };
      }
      return TimetableParser.getLessonInfo(divs.eq(0).html()!);
    } return null;
  }

  private static getLessonInfo(div: string): TimetableLessonInfo | null {
    const $ = cheerio.load(div);
    const spans = $('span');
    if (spans.length === 3) return TimetableParser.getLesson(spans);
    if (spans.length === 4 && spans.last().hasClass('x-treelabel-rlz')) return TimetableParser.getLesson(spans);
    if (spans.length === 4) return TimetableParser.getLesson(spans, 1);
    if (spans.length === 5 && spans.last().hasClass('x-treelabel-rlz')) return TimetableParser.getLesson(spans, 1);
    if (spans.length === 7) return TimetableParser.getLessonWithReplacement(spans);
    if (spans.length === 9) return TimetableParser.getLessonWithReplacement(spans, 1);
    return null;
  }

  private static getLesson(spans: Cheerio, offset = 0): TimetableLessonInfo {
    const { subject, group } = TimetableParser.getSubjectAndGroupFromSpan(spans.eq(0));
    return {
      subject,
      group,
      teacher: spans.eq(1 + offset).text(),
      room: spans.eq(2 + offset).text(),
      info: 3 + offset < spans.length
        ? TimetableParser.getFormattedLessonInfo(spans.eq(3 + offset).text())
        : undefined,
      canceled: spans.hasClass('x-treelabel-inv'),
      hasChanges: spans.hasClass('x-treelabel-zas'),
    };
  }

  private static getLessonWithReplacement(spans: Cheerio, offset = 0): TimetableLessonInfo {
    const { subject, group } = TimetableParser.getSubjectAndGroupFromSpan(spans.eq(3 + offset));
    const { subject: subjectOld } = TimetableParser.getSubjectAndGroupFromSpan(spans.eq(0));
    return {
      subject,
      subjectOld,
      group,
      teacher: spans.eq(4 + offset * 2).text(),
      teacherOld: spans.eq(1 + offset).text(),
      room: spans.eq(5 + offset * 2).text(),
      roomOld: spans.eq(2 + offset).text(),
      info: `${TimetableParser.getFormattedLessonInfo(spans.last().text())}, poprzednio: ${subjectOld}`,
      hasChanges: true,
      canceled: false,
    };
  }

  private static getSubjectAndGroupFromSpan(span: Cheerio): { subject: string; group?: string } {
    return {
      subject: span.text().substr(
        0,
        span.text().includes(' [') ? span.text().indexOf(' [') : span.text().length,
      ),
      group: span.text().includes(' [') ? span.text().substring(span.text().indexOf('[') + 1, span.text().indexOf(']')) : undefined,
    };
  }

  private static getFormattedLessonInfo(info: string): string {
    return info.substring(1, info.length - 1);
  }

  private static stripLessonInfo(info: string): string {
    const newInfo = info.startsWith(', ') ? info.substring(2, info.length) : info;
    return newInfo
      .replace('okienko dla uczniów', '')
      .replace('zmiana organizacji zajęć', '')
      .replace(' ,', '');
  }

  private static capitalizeString(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
