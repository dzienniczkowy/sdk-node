import axios, { AxiosInstance } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import format from 'date-fns/format';
import startOfWeek from 'date-fns/startOfWeek';
import { CookieJar } from 'tough-cookie';
import { handleResponse } from '../utils';
import { DiaryInfo } from './interfaces/diary/diary-info';
import { GradeData } from './interfaces/grades/grade-data';
import { Grades } from './interfaces/grades/grades';
import { Response } from './interfaces/response';
import { Timetable } from './interfaces/timetable/timetable';
import { TimetableData } from './interfaces/timetable/timetable-data';
import { mapGrades } from './mappers/grade-details';
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

  /**
   * Represents timetable.
   * @param date Selected diary from diary list.
   * @resolve Timetable object.
   */
  public async getTimetable(date: Date): Promise<Timetable> {
    const response = await this.api.post<Response<TimetableData>>(
      'PlanZajec.mvc/Get',
      { data: Diary.getWeekDateString(date) },
    );
    const data = handleResponse(response);
    return {
      lessons: parseTimetable(data),
    };
  }

  /**
   * Returns information about student's grades
   * @param semester Semester id
   */
  public async getGradeDetails(semester: number): Promise<Grades> {
    const response = await this.api.post<Response<GradeData>>(
      'Oceny.mvc/Get',
      { okres: semester },
    );
    const data = handleResponse(response);
    return mapGrades(data);
  }

  private static getWeekDateString(date: Date): string {
    return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd'T'HH:mm:ss");
  }
}
