import qs from 'querystring';
import axios, { AxiosInstance } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import format from 'date-fns/format';
import startOfWeek from 'date-fns/startOfWeek';
import { CookieJar } from 'tough-cookie';
import { UserObject } from './interfaces/user-object';
import { TimetableParser } from './parsers/timetableParser';

export class Diary {
  private userObject: UserObject;

  private readonly cookieJar: CookieJar;

  private api: AxiosInstance;

  public constructor(userObject: UserObject, cookieJar: CookieJar) {
    this.cookieJar = cookieJar;
    this.userObject = userObject;
    this.cookieJar.setCookie(`idBiezacyDziennik=${this.userObject.IdDziennik}; path=/; domain=uonetplus-uczen.${this.userObject.host}`, `https://uonetplus-uczen.${this.userObject.host}`, () => {});
    this.cookieJar.setCookie(`idBiezacyUczen=${this.userObject.IdUczen}; path=/; domain=uonetplus-uczen.${this.userObject.host}`, `https://uonetplus-uczen.${this.userObject.host}`, () => {});
    this.api = axios.create({
      baseURL: userObject.url,
      headers: { jar: this.cookieJar },
    });
    axiosCookieJarSupport(this.api);
  }

  public getTimetable(date: Date): Promise<object> {
    return new Promise((resolve) => {
      this.api.post('http://uonetplus-uczen.fakelog.cf/powiatwulkanowy/123456/PlanZajec.mvc/Get', qs.stringify({ date: Diary.getWeekDateString(date) })).then((response) => {
        if (response.data.success) {
          resolve(TimetableParser.parseTimetable(response.data.data));
        }
      });
    });
  }

  private static getWeekDateString(date: Date): string {
    return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd'T'HH:mm:ss");
  }
}
