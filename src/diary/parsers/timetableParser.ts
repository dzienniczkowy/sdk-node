import * as cheerio from 'cheerio';
import { formatISO } from 'date-fns';
import { notNil } from '../../utils';
import { TimetableLesson } from '../interfaces/timetable/timetable-lesson';
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
          const lesson = TimetableParser.parseCell(
            TimetableParser.createEmptyTimetableLesson(),
            cell,
          );
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

  private static parseCell(lesson: TimetableLesson, cell: string): TimetableLesson | null {
    const $ = cheerio.load(cell);
    const divs = $('div:not([class])');
    if (divs.length === 1) return TimetableParser.getLessonInfo(lesson, divs.eq(0).html()!);
    if (divs.length === 2 && divs.eq(1).find('span').first().hasClass('x-treelabel-inv')) {
      if (divs.eq(1).find('span').first().hasClass('x-treelabel-ppl')) {
        const old = TimetableParser.getLessonInfo(lesson, divs.eq(1).html()!);
        const nLesson = TimetableParser.getLessonInfo(lesson, divs.eq(0).html()!);
        return {
          ...nLesson,
          changes: true,
          subjectOld: old.subject,
          teacherOld: old.teacher,
          roomOld: old.room,
          info: TimetableParser.capitalizeString(TimetableParser.stripLessonInfo(`${TimetableParser.getFormattedLessonInfo(nLesson.info)}, ${old.info}`).replace(nLesson.subject, '')),
        };
      } return TimetableParser.getLessonInfo(lesson, divs.eq(1).html()!);
    }
    if (divs.length === 2 && divs.eq(1).find('span').first().hasClass('x-treelabel-zas')) {
      const nLesson = TimetableParser.getLessonInfo(lesson, divs.eq(1).html()!);
      const oldLesson = TimetableParser.getLessonInfo(lesson, divs.eq(0).html()!);
      return {
        ...nLesson,
        changes: true,
        canceled: false,
        subjectOld: oldLesson.subject,
        teacherOld: oldLesson.teacher,
        roomOld: oldLesson.room,
      };
    }
    if (divs.length === 2 && divs.eq(0).find('span').first().hasClass('x-treelabel-inv')
      && divs.eq(0).find('span').first().hasClass('x-treelabel-ppl')
      && divs.eq(1).find('span').first().attr('class') === '') {
      const nLesson = TimetableParser.getLessonInfo(lesson, divs.eq(1).html()!);
      const oldLesson = TimetableParser.getLessonInfo(lesson, divs.eq(0).html()!);
      return {
        ...nLesson,
        changes: true,
        canceled: false,
        subjectOld: oldLesson.subject,
        teacherOld: oldLesson.teacher,
        roomOld: oldLesson.room,
        info: `Poprzednio: ${oldLesson.subject} (${oldLesson.info})`,
      };
    }
    if (divs.length === 2) TimetableParser.getLessonInfo(lesson, divs.eq(0).html()!);
    else if (divs.length === 3) {
      if (divs.eq(0).find('span').first().hasClass('x-treelabel-zas')
        && divs.eq(1).find('span').first().hasClass('x-treelabel-inv')
        && divs.eq(2).find('span').first().hasClass('x-treelabel-inv')) {
        const nLesson = TimetableParser.getLessonInfo(lesson, divs.eq(0).html()!);
        const oldLesson = TimetableParser.getLessonInfo(lesson, divs.eq(1).html()!);
        return {
          ...nLesson,
          changes: true,
          canceled: false,
          subjectOld: oldLesson.subject,
          teacherOld: oldLesson.teacher,
          roomOld: oldLesson.room,
        };
      }
      if (divs.eq(0).find('span').first().hasClass('x-treelabel-inv')
        && divs.eq(1).find('span').first().hasClass('x-treelabel-inv')
        && divs.eq(2).find('span').first().hasClass('x-treelabel-zas')) {
        const nLesson = TimetableParser.getLessonInfo(lesson, divs.eq(2).html()!);
        const oldLesson = TimetableParser.getLessonInfo(lesson, divs.eq(0).html()!);
        return {
          ...nLesson,
          changes: true,
          canceled: false,
          subjectOld: oldLesson.subject,
          teacherOld: oldLesson.teacher,
          roomOld: oldLesson.room,
        };
      }
      return TimetableParser.getLessonInfo(lesson, divs.eq(0).html()!);
    } return null;
  }

  private static getLessonInfo(lesson: TimetableLesson, div: string): TimetableLesson {
    const $ = cheerio.load(div);
    const spans = $('span');
    if (spans.length === 3) return TimetableParser.getLesson(lesson, spans);
    if (spans.length === 4 && spans.last().hasClass('x-treelabel-rlz')) return TimetableParser.getLesson(lesson, spans);
    if (spans.length === 4) return TimetableParser.getLesson(lesson, spans, 1);
    if (spans.length === 5 && spans.last().hasClass('x-treelabel-rlz')) return TimetableParser.getLesson(lesson, spans, 1);
    if (spans.length === 7) return TimetableParser.getLessonWithReplacement(lesson, spans);
    if (spans.length === 9) return TimetableParser.getLessonWithReplacement(lesson, spans, 1);
    return lesson;
  }

  private static getLesson(lesson: TimetableLesson, spans: Cheerio, offset = 0): TimetableLesson {
    return {
      ...lesson,
      subject: TimetableParser.getLessonAndGroupInfoFromSpan(spans.eq(0))[0],
      // group: this.getLessonAndGroupInfoFromSpan(spans.eq(0))[1],
      teacher: spans.eq(1 + offset).text(),
      room: spans.eq(2 + offset).text(),
      info: spans.eq(3 + offset) ? TimetableParser.getFormattedLessonInfo(spans.eq(3 + offset).text()) : '',
      canceled: spans.hasClass('x-treelabel-inv'),
      changes: spans.hasClass('x-treelabel-zas'),
    };
  }

  private static getLessonWithReplacement(lesson: TimetableLesson, spans: Cheerio, offset = 0):
  TimetableLesson {
    return {
      ...lesson,
      subject: TimetableParser.getLessonAndGroupInfoFromSpan(spans.eq(3 + offset))[0],
      subjectOld: TimetableParser.getLessonAndGroupInfoFromSpan(spans.eq(0))[0],
      group: TimetableParser.getLessonAndGroupInfoFromSpan(spans.eq(3 + offset))[1],
      teacher: spans.eq(4 + offset * 2).text(),
      teacherOld: spans.eq(1 + offset).text(),
      room: spans.eq(5 + offset * 2).text(),
      roomOld: spans.eq(2 + offset).text(),
      info: `${TimetableParser.getFormattedLessonInfo(spans.last().text())}, poprzednio: ${TimetableParser.getLessonAndGroupInfoFromSpan(spans.eq(0))[0]}`,
      changes: true,
    };
  }

  private static getLessonAndGroupInfoFromSpan(span: Cheerio): string[] {
    return Array.of(
      span.text().substr(0, span.text().includes(' [') ? span.text().indexOf(' [') : span.text().length),
      span.text().includes(' [') ? span.text().substring(span.text().indexOf('[') + 1, span.text().indexOf(']')) : '',
    );
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

  private static createEmptyTimetableLesson(): TimetableLesson {
    return {
      number: 0,
      start: '',
      end: '',
      date: undefined,
      subject: '',
      subjectOld: '',
      group: '',
      room: '',
      roomOld: '',
      teacher: '',
      teacherOld: '',
      info: '',
      studentPlan: true,
      changes: false,
      canceled: false,
    };
  }
}
