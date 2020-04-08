import cheerio from 'cheerio';
import InvalidCredentialsError from '../../errors/invalid-credentials';
import UnknownSymbolError from '../../errors/unknown-symbol';

/**
 * Parsing login respond to get users recently used region symbols.
 * @param html HTML respond data to parse.
 * @return XML data.
 */
export const parseLoginResponds = (html: string): string => {
  const $ = cheerio.load(html);
  const errorMessage: Cheerio = $('.ErrorMessage');

  if (errorMessage.length) {
    const errorMessageText = errorMessage.text().trim();
    if (errorMessageText.includes('Zła nazwa użytkownika lub hasło')) throw new InvalidCredentialsError();
    throw new Error(errorMessageText);
  }

  const xml = $('[name=hiddenform] [name=wresult]').attr('value');
  if (!xml) throw new Error('Can\'t find element "[name=hiddenform] [name=wresult]"');
  return xml;
};

/**
 * Extract Array with symbols.
 * @param xml
 * @returns Array of symbols.
 */
export const parseSymbolsXml = (xml: string): string[] => {
  const $ = cheerio.load(xml, {
    xmlMode: true,
  });

  const symbols: string[] = $('[AttributeName$="UserInstance"] saml\\:AttributeValue')
    .map((
      iterator,
      element,
    ) => $(element).text()).get();

  if (symbols.length === 0) {
    throw new UnknownSymbolError();
  }

  return symbols;
};
