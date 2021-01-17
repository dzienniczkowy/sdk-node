import type { CookieJar } from 'tough-cookie';

export interface SerializedClient {
  cookieJar: CookieJar.Serialized;
  urlList: string[] | undefined;
  symbol: string | undefined;
  host: string;
}
