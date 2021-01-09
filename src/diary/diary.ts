import qs from 'querystring';
import axios, { AxiosInstance } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import format from 'date-fns/format';
import startOfWeek from 'date-fns/startOfWeek';
import { CookieJar } from 'tough-cookie';
import { handleResponse } from '../utils';
import { Response } from './interfaces/response';
import { TimetableData } from './interfaces/timetable/timetable-data';
import { TimetableLesson } from './interfaces/timetable/timetable-lesson';
import { UserObject } from './interfaces/user-object';
import { parseTimetable } from './parsers/timetable-parser';

export class Diary {
  private userObject: UserObject;

  private readonly cookieJar: CookieJar;

  private api: AxiosInstance;

  /**
   * Api diary for SDK constructor.
   * @param userObject Selected diary from diary list.
   * @param cookieJar Client's cookie jar.
   */
  public constructor(userObject: UserObject, cookieJar: CookieJar) {
    this.cookieJar = cookieJar;
    this.userObject = userObject;
    this.cookieJar.setCookie(`idBiezacyDziennik=${this.userObject.IdDziennik}; path=/; domain=uonetplus-uczen.${this.userObject.host}`, `https://uonetplus-uczen.${this.userObject.host}`, () => {});
    this.cookieJar.setCookie(`idBiezacyUczen=${this.userObject.IdUczen}; path=/; domain=uonetplus-uczen.${this.userObject.host}`, `https://uonetplus-uczen.${this.userObject.host}`, () => {});
    this.api = axios.create({
      baseURL: userObject.baseUrl,
      headers: { jar: this.cookieJar },
    });
    axiosCookieJarSupport(this.api);
  }

  /**
   * Represents timetable.
   * @param date Selected diary from diary list.
   * @resolve Timetable object.
   */
  public async getTimetable(date: Date): Promise<TimetableLesson[]> {
    const response = await this.api.post<Response<TimetableData>>(
      'http://uonetplus-uczen.fakelog.cf/powiatwulkanowy/123456/PlanZajec.mvc/Get',
      qs.stringify({ date: Diary.getWeekDateString(date) }),
    );
    const data = handleResponse(response);
    return parseTimetable(data);
  }

  private static getWeekDateString(date: Date): string {
    return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd'T'HH:mm:ss");
  }
}
