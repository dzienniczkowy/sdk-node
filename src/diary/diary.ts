import axios, { AxiosInstance } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import format from 'date-fns/format';
import startOfWeek from 'date-fns/startOfWeek';
import { CookieJar } from 'tough-cookie';
import { handleResponse } from '../utils';
import { Response } from './interfaces/response';
import { Timetable } from './interfaces/timetable/timetable';
import { TimetableData } from './interfaces/timetable/timetable-data';
import { UserObject } from './interfaces/user-object';
import { parseTimetable } from './parsers/timetable-parser';

export class Diary {
  private userObject: UserObject;

  private readonly cookieJar: CookieJar;

  private api: AxiosInstance;

  /**
   * Api diary for SDK constructor.
   * Not supposed to be called directly
   * @param userObject Selected diary from diary list.
   * @param cookieJar Client's cookie jar.
   */
  private constructor(userObject: UserObject, cookieJar: CookieJar) {
    this.cookieJar = cookieJar;
    this.userObject = userObject;
    this.api = axios.create({
      baseURL: userObject.baseUrl,
      withCredentials: true,
      jar: this.cookieJar,
    });
    axiosCookieJarSupport(this.api);
  }

  /**
   * Creates a Diary class instance.
   * @param userObject Selected diary from diary list.
   * @param cookieJar Client's cookie jar.
   */
  public static async create(userObject: UserObject, cookieJar: CookieJar): Promise<Diary> {
    const diary = new Diary(userObject, cookieJar);
    await diary.setCookies();
    return diary;
  }

  private async setCookies(): Promise<void> {
    await this.cookieJar.setCookie(`idBiezacyDziennik=${this.userObject.diaryId}; path=/; domain=uonetplus-uczen.${this.userObject.host}`, `https://uonetplus-uczen.${this.userObject.host}`);
    await this.cookieJar.setCookie(`idBiezacyUczen=${this.userObject.studentId}; path=/; domain=uonetplus-uczen.${this.userObject.host}`, `https://uonetplus-uczen.${this.userObject.host}`);
    await this.cookieJar.setCookie(`biezacyRokSzkolny=${this.userObject.schoolYear}; path=/; domain=uonetplus-uczen.${this.userObject.host}`, `https://uonetplus-uczen.${this.userObject.host}`);
    await this.cookieJar.setCookie(`idBiezacyDziennikPrzedszkole=0; path=/; domain=uonetplus-uczen.${this.userObject.host}`, `https://uonetplus-uczen.${this.userObject.host}`);
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

  private static getWeekDateString(date: Date): string {
    return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd'T'HH:mm:ss");
  }
}
