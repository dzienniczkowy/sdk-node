import { CookieJar } from 'tough-cookie';
import { stringify } from 'querystring';
import cheerio from 'cheerio';
import axios from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import { loginUrl, parseLoginResponds, parseSymbolsXml } from '../utils';

export class Client {
  public symbol: string;

  public userList: object;

  public constructor(host: string) {
    this.host = host;
    axiosCookieJarSupport(axios);
    this.cookieJar = new CookieJar();
  }

  public async login(username: string, password: string): Promise<string> {
    const config = {
      jar: this.cookieJar,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    const response = await axios.post<string>(
      loginUrl(this.host),
      stringify({
        LoginName: username,
        Password: password,
      }),
      config,
    );

    const xml = parseLoginResponds(response.data);

    const symbols = parseSymbolsXml(xml);

    await Promise.all(symbols.map(async (symbol) => {
      const { data } = await axios.post(
        `https://uonetplus.${this.host}/${symbol}/LoginEndpoint.aspx`,
        stringify({
          wa: 'wsignin1.0',
          wresult: xml,
          wctx: `https://uonetplus.${this.host}/${symbol}/LoginEndpoint.aspx`,
        }),
        config,
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

  /**
   * Cookie jar client object.
   */
  private readonly cookieJar: CookieJar;

  private async initClient(mainResponse: string, symbol: string): Promise<boolean> {
    this.symbol = symbol;
    const $ = cheerio.load(mainResponse);
    const links: string[] = $('.panel.linkownia.pracownik.klient a[href*="uonetplus-uczen"]').map(
      (index, value) => $(value).attr('href'),
    ).get();
    return true;
  }
}
