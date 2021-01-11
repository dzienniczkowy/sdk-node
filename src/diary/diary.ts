import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import {
  dateStringToRemoteISO,
  dayIsAfter,
  getWeekDate,
  handleResponse,
  inDateRange,
  requestWeeks,
} from '../utils';
import { DiaryInfo } from './interfaces/diary/diary-info';
import { ExamDay } from './interfaces/exams/exam';
import { ExamsData } from './interfaces/exams/exams-data';
import { GradeData } from './interfaces/grades/grade-data';
import { Grades } from './interfaces/grades/grades';
import { NotesAndAchievements } from './interfaces/notes-and-achievements/notes-and-achievements';
import { NotesAndAchievementsData } from './interfaces/notes-and-achievements/notes-and-achievements-data';
import { Response } from './interfaces/response';
import { SchoolInfo } from './interfaces/school-info/school-info';
import { SchoolInfoData } from './interfaces/school-info/school-info-data';
import { Timetable } from './interfaces/timetable/timetable';
import { TimetableData } from './interfaces/timetable/timetable-data';
import { mapExamDays } from './mappers/exam-mapper';
import { mapGrades } from './mappers/grade-details';
import { mapNotesAndAchievements } from './mappers/notes-and-achievements';
import { mapSchoolInfo } from './mappers/school-info';
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
   * @param date Date string (2021-02-28).
   * @returns Promise<Timetable>
   */
  public async getTimetable(date: string): Promise<Timetable> {
    const data = await this.postAndHandle<TimetableData>(
      'PlanZajec.mvc/Get',
      { data: dateStringToRemoteISO(getWeekDate(date)) },
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

  /**
   * Lists exams for all days between dateFrom and dateTo
   * @param dateFrom Start date string (2020-01-28).
   * @param dateTo End date string (2020-02-13).
   * @param removeExcess Don't return days before dateFrom or after dateTo
   */
  public async getExams(
    dateFrom: string,
    dateTo: string,
    removeExcess: boolean,
  ): Promise<ExamDay[]> {
    if (dayIsAfter(dateFrom, dateTo)) throw new Error('dateFrom is after than dateTo');
    const weeks = requestWeeks(dateFrom, dateTo, 4);
    const dataList = await Promise.all(weeks.map(async (week) => {
      const data = await this.postAndHandle<ExamsData>(
        'Sprawdziany.mvc/Get',
        {
          data: dateStringToRemoteISO(week),
          rokSzkolny: this.info.schoolYear,
        },
      );
      return mapExamDays(data);
    }));
    const allDays = dataList.flat(1);

    if (!removeExcess) return allDays;
    return allDays.filter((day) => inDateRange(
      day.date,
      dateFrom,
      dateTo,
    ));
  }

  public async getSchoolInfo(): Promise<SchoolInfo> {
    const data = await this.postAndHandle<SchoolInfoData>(
      'SzkolaINauczyciele.mvc/Get',
    );
    return mapSchoolInfo(data);
  }
}
