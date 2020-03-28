import qs from 'querystring';
import startOfWeek from 'date-fns/startOfWeek';
import format from 'date-fns/format'
import { UserObject } from './interfaces/UserObject';
import { TimetableParser } from './parsers/timetableParser';

const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;

let api;

export class Diary {
  private userObject: UserObject;

  private readonly cookieJar;

  public constructor(userObject: UserObject, cookieJar) {
    this.cookieJar = cookieJar;
    this.userObject = userObject;
    this.cookieJar.setCookie(`idBiezacyDziennik=${this.userObject.IdDziennik}; path=/; domain=uonetplus-uczen.${this.userObject.host}`, `https://uonetplus-uczen.${this.userObject.host}`, () => {});
    this.cookieJar.setCookie(`idBiezacyUczen=${this.userObject.IdUczen}; path=/; domain=uonetplus-uczen.${this.userObject.host}`, `https://uonetplus-uczen.${this.userObject.host}`, () => {});
    api = axios.create({
      baseURL: userObject.url,
      headers: { jar: this.cookieJar },
    });
    axiosCookieJarSupport(api);
  }

  public getTimetable(date: Date): Promise<object> {
    console.log(this.getWeekDateString(date));
    return new Promise((resolve) => {
      api.post('http://uonetplus-uczen.fakelog.cf/powiatwulkanowy/123456/PlanZajec.mvc/Get', qs.stringify({ date: this.getWeekDateString(date) })).then((response) => {
        if (response.data.success === true) {
          const parser = new TimetableParser();
          resolve(parser.parseTimetable(response.data.data));
        }
      });
    });
  }

  private getWeekDateString(date: Date): string {
    return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd'T'HH:mm:ss");
  }
}
