import type { CookieJar } from 'tough-cookie';

export interface SerializedClient {
  cookieJar: CookieJar.Serialized;
  symbol: {
    value: string,
    urlList: string[];
  } | undefined;
  host: string;
}
