import type { AxiosInstance } from 'axios';
import axios from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import type { Client } from '../client/client';
import {
  dateStringToRemoteISO,
  dayIsAfter,
  getWeekDate,
  handleResponse,
  inDateRange,
  requestWeeks,
} from '../utils';
import type { DiaryInfo } from './interfaces/diary/diary-info';
import type { ExamDay } from './interfaces/exams/exam';
import type { ExamsData } from './interfaces/exams/exams-data';
import type { GradeData } from './interfaces/grades/grade-data';
import type { Grades } from './interfaces/grades/grades';
import type { NotesAndAchievements } from './interfaces/notes-and-achievements/notes-and-achievements';
import type { NotesAndAchievementsData } from './interfaces/notes-and-achievements/notes-and-achievements-data';
import type { Response } from './interfaces/response';
import type { SchoolInfo } from './interfaces/school-info/school-info';
import type { SchoolInfoData } from './interfaces/school-info/school-info-data';
import type { SerializedDiary } from './interfaces/serialized-diary';
import type { Timetable } from './interfaces/timetable/timetable';
import type { TimetableData } from './interfaces/timetable/timetable-data';
import { mapExamDays } from './mappers/exam-mapper';
import { mapGrades } from './mappers/grade-details';
import { mapNotesAndAchievements } from './mappers/notes-and-achievements';
import { mapSchoolInfo } from './mappers/school-info';
import { parseTimetable } from './parsers/timetable-parser';

export class Diary {
  private readonly baseUrl: string;

  private readonly host: string;

  public readonly info: DiaryInfo;

  private readonly diaryCookieJar = new CookieJar();

  private api: AxiosInstance;

  /**
   * Api diary for SDK constructor.
   * @param client SDK Client
   * @param serializedDiary Serialized diary.
   */
  public constructor(
    private readonly client: Client,
    serializedDiary: SerializedDiary,
  ) {
    this.baseUrl = serializedDiary.baseUrl;
    this.info = serializedDiary.info;
    this.host = serializedDiary.host;
    this.setDiaryCookies();
    this.api = axios.create({
      baseURL: this.baseUrl,
      withCredentials: true,
      jar: this.client.cookieJar,
    });
    axiosCookieJarSupport(this.api);
  }

  public serialize(): SerializedDiary {
    return {
      info: { ...this.info },
      baseUrl: this.baseUrl,
      host: this.host,
    };
  }

  private setDiaryCookies(): void {
    this.diaryCookieJar.setCookieSync(`idBiezacyDziennik=${this.info.diaryId}; path=/; domain=uonetplus-uczen.${this.host}`, `https://uonetplus-uczen.${this.host}`);
    this.diaryCookieJar.setCookieSync(`idBiezacyUczen=${this.info.studentId}; path=/; domain=uonetplus-uczen.${this.host}`, `https://uonetplus-uczen.${this.host}`);
    this.diaryCookieJar.setCookieSync(`biezacyRokSzkolny=${this.info.schoolYear}; path=/; domain=uonetplus-uczen.${this.host}`, `https://uonetplus-uczen.${this.host}`);
    this.diaryCookieJar.setCookieSync(`idBiezacyDziennikPrzedszkole=0; path=/; domain=uonetplus-uczen.${this.host}`, `https://uonetplus-uczen.${this.host}`);
  }

  private getDiaryCookieString(): string {
    return this.diaryCookieJar.getCookieStringSync(`https://uonetplus-uczen.${this.host}`);
  }

  private async postAndHandle<T>(
    url: string,
    data?: unknown,
  ): Promise<T> {
    const response = await this.client.requestWithAutoLogin(
      () => this.api.post<Response<T>>(
        url,
        data,
        {
          headers: {
            Cookie: this.getDiaryCookieString(),
          },
        },
      ),
    );
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
