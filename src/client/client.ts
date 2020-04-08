import cheerio from 'cheerio';
import UnknownSymbolError from '../errors/unknown-symbol';
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
  public symbol: string | undefined;

  // public userList: object;

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

    // TODO: Remove type assertion
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
    const links: string[] = $('.panel.linkownia.pracownik.klient a[href*="uonetplus-uczen"]').map(
      (index, value) => $(value).attr('href'),
    ).get();
  }
}
