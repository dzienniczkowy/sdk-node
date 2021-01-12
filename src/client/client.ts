import cheerio from 'cheerio';
import { CookieJar } from 'tough-cookie';
import { Diary } from '../diary/diary';
import { DiaryListItem } from '../diary/interfaces/diary-list-item';
import { DiaryListData } from '../diary/interfaces/diary/diary-data';
import { HomepageData } from '../diary/interfaces/homepage/homepage-data';
import { LuckyNumber } from '../diary/interfaces/homepage/lucky-number';
import { Response } from '../diary/interfaces/response';
import { SerializedClient } from '../diary/interfaces/serialized-client';
import { mapDiaryInfo } from '../diary/mappers/diary-info';
import { mapLuckyNumbers } from '../diary/mappers/lucky-numbers';
import NoUrlListError from '../errors/no-url-list';
import UnknownSymbolError from '../errors/unknown-symbol';
import {
  checkUserSignUrl,
  handleResponse,
  joinUrl,
  loginUrl,
  luckyNumbersUrl,
  notNil,
  parseLoginResponds,
  parseSymbolsXml,
} from '../utils';
import { BaseClient } from './base';
import { DefaultAjaxPostPayload } from './types';

/**
 * API client for SDK.
 */
export class Client extends BaseClient {
  /**
   * User region login sign.
   */
  public symbol: string | undefined;

  public urlList: string[] | undefined;

  /**
   * Client host.
   */
  private readonly host: string = '';

  /**
   * API client for SDK constructor.
   * @param host Default host used by user.
   * @param cookieJar Use custom CookieJar instead of generating a new one.
   */
  public constructor(host: string, cookieJar?: CookieJar) {
    super(cookieJar ?? new CookieJar());
    this.host = host;
  }

  /**
   * Login user to UONET.
   *
   * Covers region symbol finding.
   * @param username User login.
   * @param password User password.
   * @returns Promise<string> Region symbol for user.
   */
  public async login(username: string, password: string): Promise<string> {
    const response = await this.post<string>(
      loginUrl(this.host),
      {
        LoginName: username,
        Password: password,
      },
    );

    const xml = parseLoginResponds(response.data);

    const symbols = parseSymbolsXml(xml);

    await Promise.all(symbols.map(async (symbol) => {
      const currentUrl = checkUserSignUrl(this.host, symbol);
      const payload: DefaultAjaxPostPayload = {
        wa: 'wsignin1.0',
        wresult: xml,
        wctx: currentUrl,
      };
      const { data } = await this.post<string>(
        currentUrl,
        payload,
      );

      if (data.includes('newAppLink')) {
        this.initClient(data, symbol);
      }
    }));

    if (!this.symbol) throw new UnknownSymbolError();
    return this.symbol;
  }

  private initClient(mainResponse: string, symbol: string): void {
    this.symbol = symbol;
    const $ = cheerio.load(mainResponse);
    this.urlList = $('.panel.linkownia.pracownik.klient a[href*="uonetplus-uczen"]')
      .toArray()
      .map((element) => $(element).attr('href'))
      .filter(notNil);
  }

  public serialize(): SerializedClient {
    return {
      cookieJar: this.cookieJar.serializeSync(),
      urlList: this.urlList === undefined ? undefined : [...this.urlList],
      symbol: this.symbol,
      host: this.host,
    };
  }

  public static deserialize(serialized: SerializedClient): Client {
    const client = new Client(serialized.host, CookieJar.deserializeSync(serialized.cookieJar));
    client.symbol = serialized.symbol;
    client.urlList = serialized.urlList;
    return client;
  }

  public async getDiaryList(): Promise<DiaryListItem[]> {
    if (this.urlList === undefined) throw new NoUrlListError();
    const results = await Promise.all(this.urlList.map(async (baseUrl) => {
      const url = joinUrl(baseUrl, 'UczenDziennik.mvc/Get').toString();
      return {
        baseUrl,
        data: handleResponse(await this.post<Response<DiaryListData>>(url)),
      };
    }));
    return results.flatMap(({ data, baseUrl }) => data.map((dataItem) => {
      const info = mapDiaryInfo(dataItem);
      const serialized = {
        info,
        baseUrl,
        host: this.host,
      };
      return ({
        serialized,
        createDiary: (): Diary => new Diary(serialized, this.cookieJar),
      });
    }));
  }

  public async getLuckyNumbers(): Promise<LuckyNumber[]> {
    if (!this.symbol) throw new UnknownSymbolError();
    const response = await this.post<Response<HomepageData>>(
      luckyNumbersUrl(this.host, this.symbol),
    );
    const data = handleResponse(response);
    return mapLuckyNumbers(data);
  }
}
