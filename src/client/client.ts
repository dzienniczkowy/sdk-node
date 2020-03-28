import cheerio from 'cheerio';
import {
  checkUserSignUrl, loginUrl, parseLoginResponds, parseSymbolsXml,
} from '../utils';
import { BaseClient } from './base';
import { DefaultAjaxPostPayload, LoginPostParams } from './types';

/**
 * API client for SDK.
 */
export class Client extends BaseClient {
  /**
   * User region login sign.
   */
  public symbol: string;

  public urlList: string[];

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
    const response = await this.post<LoginPostParams, string>(
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
      const { data } = await this.post<DefaultAjaxPostPayload, string>(
        currentUrl,
        {
          wa: 'wsignin1.0',
          wresult: xml,
          wctx: currentUrl,
        },
      );

      if (data.includes('appLink')) {
        this.initClient(data, symbol);
      }
    }));

    return this.symbol;
  }

  /**
   * Client host.
   */
  private readonly host: string = '';

  private async initClient(mainResponse: string, symbol: string): Promise<boolean> {
    this.symbol = symbol;
    const $ = cheerio.load(mainResponse);
    this.urlList = $('.panel.linkownia.pracownik.klient a[href*="uonetplus-uczen"]').map(
      (index, value) => $(value).attr('href'),
    ).get();
    return true;
  }

  public async getDiaryList(): Promise<any[]> {
    const results = [];
    this.urlList.forEach((url) => {
      results.push(this.post(
        `${url}UczenDziennik.mvc/Get`,
        {},
      ));
    });
    const responses = await Promise.all(results);
    responses.forEach((response) => {
      if (response.data.success === true) {
        for (let i = 0; i < response.data.data.length; i += 1) {
          response.data.data[i].url = response.config.url
            .substring(0, response.config.url.length - 22);
          response.data.data[i].host = this.host;
        }
      }
    });
    return [].concat(...responses.map((x) => x.data.data));
  }
}
