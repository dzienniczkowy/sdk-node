import type { CookieJar } from 'tough-cookie';

export type BaseClientConfig = {
  jar: CookieJar;
  withCredentials: boolean;
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded';
  };
};

export type DefaultAjaxPostPayload = {
  wa: 'wsignin1.0';
  wresult: string;
  wctx: string;
};

export interface Credentials {
  username: string;
  password: string;
}

export type GetCredentialsFunction = () => Credentials | Promise<Credentials>;
