import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import {
  addWeeks, isAfter, isBefore, startOfDay,
} from 'date-fns';
import format from 'date-fns/format';
import startOfWeek from 'date-fns/startOfWeek';
import { CookieJar } from 'tough-cookie';
import { handleResponse } from '../utils';
import { DiaryInfo } from './interfaces/diary/diary-info';
import { ExamDay } from './interfaces/exams/exam';
import { ExamsData } from './interfaces/exams/exams-data';
import { GradeData } from './interfaces/grades/grade-data';
import { Grades } from './interfaces/grades/grades';
import { NotesAndAchievements } from './interfaces/notes-and-achievements/notes-and-achievements';
import { NotesAndAchievementsData } from './interfaces/notes-and-achievements/notes-and-achievements-data';
import { Response } from './interfaces/response';
import { Timetable } from './interfaces/timetable/timetable';
import { TimetableData } from './interfaces/timetable/timetable-data';
import { mapExamDays } from './mappers/exam-mapper';
import { mapGrades } from './mappers/grade-details';
import { mapNotesAndAchievements } from './mappers/notes-and-achievements';
import { parseTimetable } from './parsers/timetable-parser';

export class Diary {
  public readonly baseUrl: string;

  public readonly host: string;

  public readonly info: DiaryInfo;

  private readonly cookieJar: CookieJar;

  private api: AxiosInstance;

  /**
   * Api diary for SDK constructor.
   * Not supposed to be called directly
   * @param baseUrl Request base url.
   * @param host Default host used by user.
   * @param info DiaryInfo object.
   * @param cookieJar Client's cookie jar.
   */
  private constructor(
    baseUrl: string,
    host: string,
    info: DiaryInfo,
    cookieJar: CookieJar,
  ) {
    this.baseUrl = baseUrl;
    this.info = info;
    this.host = host;
    this.cookieJar = cookieJar;
    this.api = axios.create({
      baseURL: baseUrl,
      withCredentials: true,
      jar: this.cookieJar,
    });
    axiosCookieJarSupport(this.api);
  }

  /**
   * Creates a Diary class instance.
   * @param baseUrl Request base url.
   * @param host Default host used by user.
   * @param info DiaryInfo object.
   * @param cookieJar Client's cookie jar.
   * @returns Promise<Diary>
   */
  public static async create(
    baseUrl: string,
    host: string,
    info: DiaryInfo,
    cookieJar: CookieJar,
  ): Promise<Diary> {
    const diary = new Diary(baseUrl, host, info, cookieJar);
    await diary.setCookies();
    return diary;
  }

  private async setCookies(): Promise<void> {
    await this.cookieJar.setCookie(`idBiezacyDziennik=${this.info.diaryId}; path=/; domain=uonetplus-uczen.${this.host}`, `https://uonetplus-uczen.${this.host}`);
    await this.cookieJar.setCookie(`idBiezacyUczen=${this.info.studentId}; path=/; domain=uonetplus-uczen.${this.host}`, `https://uonetplus-uczen.${this.host}`);
    await this.cookieJar.setCookie(`biezacyRokSzkolny=${this.info.schoolYear}; path=/; domain=uonetplus-uczen.${this.host}`, `https://uonetplus-uczen.${this.host}`);
    await this.cookieJar.setCookie(`idBiezacyDziennikPrzedszkole=0; path=/; domain=uonetplus-uczen.${this.host}`, `https://uonetplus-uczen.${this.host}`);
  }

  private async postAndHandle<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.api.post<Response<T>>(url, data, config);
    return handleResponse(response);
  }

  /**
   * Returns information about student's timetable.
   * @param date Selected diary from diary list.
   * @returns Promise<Timetable>
   */
  public async getTimetable(date: Date): Promise<Timetable> {
    const data = await this.postAndHandle<TimetableData>(
      'PlanZajec.mvc/Get',
      { data: Diary.formatLocalISO(Diary.getWeekDate(date)) },
    );
    return {
      lessons: parseTimetable(data),
    };
  }

  /**
   * Returns information about student's grades.
   * @param semesterId Semester id.
   * @returns Promise<Grades>
   */
  public async getGradeDetails(semesterId: number): Promise<Grades> {
    const data = await this.postAndHandle<GradeData>(
      'Oceny.mvc/Get',
      { okres: semesterId },
    );
    return mapGrades(data);
  }

  /**
   * Returns list of student's achievements as strings and list of note objects.
   * @returns Promise<NotesAndAchievements>
   */
  public async getNotesAndAchievements(): Promise<NotesAndAchievements> {
    const data = await this.postAndHandle<NotesAndAchievementsData>(
      'UwagiIOsiagniecia.mvc/Get',
    );
    return mapNotesAndAchievements(data);
  }

  private static examRequestWeeks(from: Date, to: Date): Date[] {
    const endWeek = Diary.getWeekDate(to);
    const weeks: Date[] = [];
    let currentWeek = Diary.getWeekDate(from);
    do {
      weeks.push(currentWeek);
      currentWeek = addWeeks(currentWeek, 4);
    } while (!isAfter(currentWeek, endWeek));
    return weeks;
  }

  // TODO: Handle timezones
  /**
   * Lists exams for all days between dateFrom and dateTo
   * @param dateFrom start date.
   * @param dateTo end date.
   * @param removeExcess don't return days before dateFrom or after dateTo
   */
  public async getExams(dateFrom: Date, dateTo: Date, removeExcess: boolean): Promise<ExamDay[]> {
    if (Diary.dayIsAfter(dateFrom, dateTo)) throw new Error('dateFrom is after than dateTo');
    const weeks = Diary.examRequestWeeks(dateFrom, dateTo);
    const dataList = await Promise.all(weeks.map(async (week) => {
      const data = await this.postAndHandle<ExamsData>(
        'Sprawdziany.mvc/Get',
        {
          data: Diary.formatLocalISO(week),
          rokSzkolny: this.info.schoolYear,
        },
      );
      return mapExamDays(data);
    }));
    const allDays = dataList.flat(1);

    if (!removeExcess) return allDays;
    return allDays.filter((day) => Diary.inDateRange(
      new Date(day.date), // Probably doesn't handle timezones well
      dateFrom,
      dateTo,
    ));
  }

  private static dayIsAfter(date: Date, dateToCompare: Date): boolean {
    return isAfter(startOfDay(date), startOfDay(dateToCompare));
  }

  private static inDateRange(date: Date, from: Date, to: Date): boolean {
    const dateDay = startOfDay(date);
    const dateFromDay = startOfDay(from);
    const dateToDay = startOfDay(to);
    return !isBefore(dateDay, dateFromDay) && !isAfter(dateDay, dateToDay);
  }

  private static getWeekDate(date: Date): Date {
    return startOfWeek(date, { weekStartsOn: 1 });
  }

  private static formatLocalISO(date: Date): string {
    return format(date, "yyyy-MM-dd'T'HH:mm:ss");
  }
}
