import cheerio from 'cheerio';
import {
  checkUserSignUrl, loginUrl, parseLoginResponds, parseSymbolsXml,
} from '../utils';
import { BaseClient } from './base';
import { DefaultAjaxPostPayload, LoginPostParams } from './types';

export class Client extends BaseClient {
  public symbol: string;

  public userList: object;

  public constructor(host: string) {
    super();
    this.host = host;
  }

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
    const links: string[] = $('.panel.linkownia.pracownik.klient a[href*="uonetplus-uczen"]').map(
      (index, value) => $(value).attr('href'),
    ).get();
    return true;
  }
}
