import { ParsedUrlQueryInput, stringify } from 'querystring';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { BaseClientConfig } from './types';

/**
 * Basic handlers for UONET+ API client.
 */
export class BaseClient {
  private api: AxiosInstance;

  /**
   * Config for post request.
   */
  protected readonly config: BaseClientConfig;

  /**
   * @param cookieJar Cookie jar client object
   */
  public constructor(
    public readonly cookieJar: CookieJar,
  ) {
    this.config = {
      jar: this.cookieJar,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    this.api = axios.create();
    axiosCookieJarSupport(this.api);
  }

  /**
   * Basic post request handler.
   * @param url URL for request
   * @param payload Object to send to server.
   */
  protected post<R>(
    url: string,
    payload: ParsedUrlQueryInput = {},
  ): Promise<AxiosResponse<R>> {
    return this.api.post<R>(url, stringify(payload), this.config);
  }
}
