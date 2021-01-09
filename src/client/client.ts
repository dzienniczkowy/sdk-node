import cheerio from 'cheerio';
import { DiaryListData } from '../diary/interfaces/diary-data';
import { Response } from '../diary/interfaces/response';
import { UserObject } from '../diary/interfaces/user-object';
import NoUrlListError from '../errors/no-url-list';
import UnknownSymbolError from '../errors/unknown-symbol';
import {
  checkUserSignUrl,
  handleResponse,
  joinUrl,
  loginUrl,
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
   * API client for SDK constructor.
   * @param host Default host used by user.
   */
  public constructor(host: string) {
    super();
    this.host = host;
  }

  /**
   * Login user to UONET.
   *
   * Covers region symbol finding.
   * @param username User login.
   * @param password User password.
   * @resolve Region symbol for user.
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

  /**
   * Client host.
   */
  private readonly host: string = '';

  private initClient(mainResponse: string, symbol: string): void {
    this.symbol = symbol;
    const $ = cheerio.load(mainResponse);
    this.urlList = $('.panel.linkownia.pracownik.klient a[href*="uonetplus-uczen"]')
      .toArray()
      .map((element) => $(element).attr('href'))
      .filter(notNil);
  }

  public async getDiaryList(): Promise<UserObject[]> {
    if (this.urlList === undefined) throw new NoUrlListError();
    const results = await Promise.all(this.urlList.map(async (baseUrl) => {
      const url = joinUrl(baseUrl, 'UczenDziennik.mvc/Get').toString();
      return {
        baseUrl,
        data: handleResponse(await this.post<Response<DiaryListData>>(url)),
      };
    }));
    return results.flatMap(({ data, baseUrl }) => data.map((diary) => ({
      diaryId: diary.IdDziennik,
      studentId: diary.IdUczen,
      schoolYear: diary.DziennikRokSzkolny,
      baseUrl,
      host: this.host,
    })));
  }
}
