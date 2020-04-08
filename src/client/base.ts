import { stringify, ParsedUrlQueryInput } from 'querystring';
import axios, { AxiosResponse } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { BaseClientConfig } from './types';

/**
 * Basic handlers for UONET+ API client.
 */
export class BaseClient {
  public constructor() {
    axiosCookieJarSupport(axios);
    this.cookieJar = new CookieJar();
    this.config = {
      jar: this.cookieJar,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
  }

  /**
   * Cookie jar client object.
   */
  public readonly cookieJar: CookieJar;

  /**
   * Config for post request.
   */
  protected readonly config: BaseClientConfig;

  /**
   * Basic post request handler.
   * @param url URL for request
   * @param payload Object to send to server.
   */
  protected post<T extends ParsedUrlQueryInput, R>(
    url: string,
    payload: T,
  ): Promise<AxiosResponse<R>> {
    return axios.post<R>(url, stringify(payload), this.config);
  }
}
