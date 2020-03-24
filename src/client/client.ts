import tough, { CookieJar } from 'tough-cookie';
import { stringify } from 'querystring';
import cheerio from 'cheerio';
import axios from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';

export class Client {
  public symbol: string;

  public userList: object;

  public constructor(host: string) {
    this.host = host;
    axiosCookieJarSupport(axios);
    this.cookieJar = new tough.CookieJar();
  }

  public login(username: string, password: string): Promise<string> {
    return new Promise(async (resolve) => {
      const config = {
        jar: this.cookieJar,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      const response = await axios.post<string>(
        this.loginUrl(this.host),
        stringify({
          LoginName: username,
          Password: password,
        }),
        config,
      );

      const xml = this.parseLoginResponds(response.data);

      const symbols = this.parseSymbolsXml(xml);

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
          resolve(symbol);
        }
      }));
    });
  }

  /**
   * Login URL.
   * @param host Host address.
   * @return Login endpoint URL.
   */
  private loginUrl(host): string {
    return `https://cufs.${host}/Default/Account/LogOn?ReturnUrl=%2FDefault%2FFS%2FLS%3Fwa%3Dwsignin1.0%26wtrealm%3Dhttps%253a%252f%252fuonetplus.${host}%252fDefault%252fLoginEndpoint.aspx%26wctx%3Dhttps%253a%252f%252fuonetplus.${host}%252fDefault%252fLoginEndpoint.aspx`;
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
    const links = [];
    $('.panel.linkownia.pracownik.klient a[href*="uonetplus-uczen"]').each((index, value) => {
      const link = $(value).attr('href');
      links.push(link);
    });
    return true;
  }

  /**
   * Parsing login respond to find `wresult` in hidden form in respond from UONET API.
   * @param html HTML respond data to parse.
   * @return XML data.
   */
  private parseLoginResponds(html: string): string {
    const $ = cheerio.load(html);
    const errorMessage: Cheerio = $('.ErrorMessage');

    if (errorMessage.length) {
      throw new Error(errorMessage.text().trim());
    }

    return $('[name=hiddenform]').find('[name=wresult]').attr('value');
  }

  /**
   * Extract Array with symbols.
   * @param xml
   * @returns Array of symbols.
   */
  private parseSymbolsXml(xml): string[] {
    const $ = cheerio.load(xml, {
      xmlMode: true,
    });

    const symbols: string[] = $('[AttributeName$="UserInstance"] saml\\:AttributeValue')
      .map((
        iterator,
        element,
      ) => $(element).text()).get();

    if (symbols.length === 0) {
      throw new Error('Nie znaleziono symbolu. Zaloguj się, podając dodatkowo symbol.');
    }

    return symbols;
  }
}
