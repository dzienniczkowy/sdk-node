import * as cheerio from 'cheerio';
import { TimetableLesson } from '../interfaces/timetable/TimetableLesson';
import { TimetableResponse } from '../interfaces/timetable/TimetableResponse';

export class TimetableParser {
  public parseTimetable(htmlResponse: TimetableResponse): TimetableLesson[] {
    const timetable: TimetableLesson[] = [];
    const weekDays = htmlResponse.Headers;
    weekDays.shift();
    let WDnum = 0;
    weekDays.forEach((weekDay) => {
      WDnum += 1;
      htmlResponse.Rows.forEach((row) => {
        const lessonHr = row[0].split('<br />');
        if (row[WDnum] !== '') {
          const lesson = this.parseCell(this.createEmptyTimetableLesson(), row[WDnum]);
          const dateArray = (weekDay.Text.split('<br />')[1]).split('.').map((x) => parseInt(x, 10));
          timetable.push({
            ...lesson,
            date: new Date(Date.UTC(dateArray[2], dateArray[1] - 1, dateArray[0])),
            number: parseInt(lessonHr[0], 10),
            start: lessonHr[1],
            end: lessonHr[2],
          });
        }
      });
    });
    return timetable;
  }

  private parseCell(lesson: TimetableLesson, cell: string): TimetableLesson {
    const $ = cheerio.load(cell);
    const divs = $('div:not([class])');
    if (divs.length === 1) return this.getLessonInfo(lesson, divs.eq(0).html());
    if (divs.length === 2 && divs.eq(1).find('span').first().hasClass('x-treelabel-inv')) {
      if (divs.eq(1).find('span').first().hasClass('x-treelabel-ppl')) {
        const old = this.getLessonInfo(lesson, divs.eq(1).html());
        const nLesson = this.getLessonInfo(lesson, divs.eq(0).html());
        return {
          ...nLesson,
          changes: true,
          subjectOld: old.subject,
          teacherOld: old.teacher,
          roomOld: old.room,
          info: this.capitalizeString(this.stripLessonInfo(`${this.getFormattedLessonInfo(nLesson.info)}, ${old.info}`).replace(nLesson.subject, '')),
        };
      } return this.getLessonInfo(lesson, divs.eq(1).html());
    }
    if (divs.length === 2 && divs.eq(1).find('span').first().hasClass('x-treelabel-zas')) {
      const nLesson = this.getLessonInfo(lesson, divs.eq(1).html());
      const oldLesson = this.getLessonInfo(lesson, divs.eq(0).html());
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
      const nLesson = this.getLessonInfo(lesson, divs.eq(1).html());
      const oldLesson = this.getLessonInfo(lesson, divs.eq(0).html());
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
    if (divs.length === 2) this.getLessonInfo(lesson, divs.eq(0).html());
    else if (divs.length === 3) {
      if (divs.eq(0).find('span').first().hasClass('x-treelabel-zas')
        && divs.eq(1).find('span').first().hasClass('x-treelabel-inv')
        && divs.eq(2).find('span').first().hasClass('x-treelabel-inv')) {
        const nLesson = this.getLessonInfo(lesson, divs.eq(0).html());
        const oldLesson = this.getLessonInfo(lesson, divs.eq(1).html());
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
        const nLesson = this.getLessonInfo(lesson, divs.eq(2).html());
        const oldLesson = this.getLessonInfo(lesson, divs.eq(0).html());
        return {
          ...nLesson,
          changes: true,
          canceled: false,
          subjectOld: oldLesson.subject,
          teacherOld: oldLesson.teacher,
          roomOld: oldLesson.room,
        };
      }
      return this.getLessonInfo(lesson, divs.eq(0).html());
    } return null;
  }

  private getLessonInfo(lesson: TimetableLesson, div: string): TimetableLesson {
    const $ = cheerio.load(div);
    const spans = $('span');
    if (spans.length === 3) return this.getLesson(lesson, spans);
    if (spans.length === 4 && spans.last().hasClass('x-treelabel-rlz')) return this.getLesson(lesson, spans);
    if (spans.length === 4) return this.getLesson(lesson, spans, 1);
    if (spans.length === 5 && spans.last().hasClass('x-treelabel-rlz')) return this.getLesson(lesson, spans, 1);
    if (spans.length === 7) return this.getLessonWithReplacement(lesson, spans);
    if (spans.length === 9) return this.getLessonWithReplacement(lesson, spans, 1);
    return lesson;
  }

  private getLesson(lesson: TimetableLesson, spans, offset = 0): TimetableLesson {
    return {
      ...lesson,
      subject: this.getLessonAndGroupInfoFromSpan(spans.eq(0))[0],
      // group: this.getLessonAndGroupInfoFromSpan(spans.eq(0))[1],
      teacher: spans.eq(1 + offset).text(),
      room: spans.eq(2 + offset).text(),
      info: spans.eq(3 + offset) ? this.getFormattedLessonInfo(spans.eq(3 + offset).text()) : '',
      canceled: spans.hasClass('x-treelabel-inv'),
      changes: spans.hasClass('x-treelabel-zas'),
    };
  }

  private getLessonWithReplacement(lesson: TimetableLesson, spans, offset = 0):
  TimetableLesson {
    return {
      ...lesson,
      subject: this.getLessonAndGroupInfoFromSpan(spans.eq(3 + offset))[0],
      subjectOld: this.getLessonAndGroupInfoFromSpan(spans.eq(0))[0],
      group: this.getLessonAndGroupInfoFromSpan(spans.eq(3 + offset))[1],
      teacher: spans.eq(4 + offset * 2).text(),
      teacherOld: spans.eq(1 + offset).text(),
      room: spans.eq(5 + offset * 2).text(),
      roomOld: spans.eq(2 + offset).text(),
      info: `${this.getFormattedLessonInfo(spans.last().text())}, poprzednio: ${this.getLessonAndGroupInfoFromSpan(spans.eq(0))[0]}`,
      changes: true,
    };
  }

  private getLessonAndGroupInfoFromSpan(span): string[] {
    return Array.of(
      span.text().substr(0, span.text().includes(' [') ? span.text().indexOf(' [') : span.text().length),
      span.text().includes(' [') ? span.text().substring(span.text().indexOf('[') + 1, span.text().indexOf(']')) : '',
    );
  }

  private getFormattedLessonInfo(info: string): string {
    return info.substring(1, info.length - 1);
  }

  private stripLessonInfo(info: string): string {
    const newInfo = info.startsWith(', ') ? info.substring(2, info.length) : info;
    return newInfo
      .replace('okienko dla uczniów', '')
      .replace('zmiana organizacji zajęć', '')
      .replace(' ,', '');
  }

  private capitalizeString(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  private createEmptyTimetableLesson(): TimetableLesson {
    return {
      number: 0,
      start: '',
      end: '',
      date: null,
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
