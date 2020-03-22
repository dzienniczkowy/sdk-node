import tough from 'tough-cookie';
import qs from 'querystring';
import cheerio from 'cheerio';

const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;

export class Client {
  public symbol: string;
  public userList: object;

  public async login(username: string, password: string, host: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      axiosCookieJarSupport(axios);
      const cookieJar = new tough.CookieJar();
      axios.post(
        `https://cufs.${host}/Default/Account/LogOn?ReturnUrl=%2FDefault%2FFS%2FLS%3Fwa%3Dwsignin1.0%26wtrealm%3Dhttps%253a%252f%252fuonetplus.${host}%252fDefault%252fLoginEndpoint.aspx%26wctx%3Dhttps%253a%252f%252fuonetplus.${host}%252fDefault%252fLoginEndpoint.aspx`,
        qs.stringify({
          LoginName: username,
          Password: password,
        }),
        {
          jar: cookieJar,
          withCredentials: true,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ).then((response) => {
        const $ = cheerio.load(response.data);
        if ($('.ErrorMessage').length) {
          reject(new Error($('.ErrorMessage').text().trim()));
          return;
        }
        const xml = $('[name=hiddenform]').find('[name=wresult]').attr('value');
        const x = cheerio.load(xml, {
          xmlMode: true,
        });
        let symbols: string[];
        x('[AttributeName$="UserInstance"]').map(function a() {
          symbols = [];
          this.children.forEach((r) => {
            symbols.push(r.children[0].data);
          });
          return symbols;
        });
        if (symbols.length === 0) {
          reject(new Error('Nie znaleziono symbolu. Zaloguj się, podając dodatkowo symbol.'));
          return;
        }
        for (let i = 0; i < symbols.length; i++) {
          const symbol = symbols[i];
          axios.post(
            `https://uonetplus.${host}/${symbol}/LoginEndpoint.aspx`,
            qs.stringify({
              wa: 'wsignin1.0',
              wresult: xml,
              wctx: `https://uonetplus.${host}/${symbol}/LoginEndpoint.aspx`,
            }),
            {
              jar: cookieJar,
              withCredentials: true,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            },

          ).then((responselog) => {
            if (responselog.data.includes('appLink')) {
              this.initClient(responselog.data, symbol);
              resolve(symbol);
            }
          });
        }
      });
    });
  }

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
}
