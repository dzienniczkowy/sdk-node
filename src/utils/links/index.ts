/**
 * Generator for links to UONET+ default endpoint.
 * @param host User login host.
 * @param symbol User region tag.
 * @returns Absolute URL.
 */
import { joinUrl } from '../url';

const uonetPlusBaseUrl = (host: string, symbol: string): string => `https://uonetplus.${host}/${symbol}`;

const uonetPlusUserUrl = (host: string, symbol: string): string => `https://uonetplus-uzytkownik.${host}/${symbol}`;

/**
 * Login URL.
 * @param host Host address.
 * @returns Login absolute endpoint URL.
 */
export const loginUrl = (host: string): string => `https://cufs.${host}/Default/Account/LogOn?ReturnUrl=%2FDefault%2FFS%2FLS%3Fwa%3Dwsignin1.0%26wtrealm%3Dhttps%253a%252f%252fuonetplus.${host}%252fDefault%252fLoginEndpoint.aspx%26wctx%3Dhttps%253a%252f%252fuonetplus.${host}%252fDefault%252fLoginEndpoint.aspx`;

/**
 * Symbol checking URL.
 * @param host User login host.
 * @param symbol Region tag.
 * @returns Check sign absolute endpoint URL.
 */
export const checkUserSignUrl = (host: string, symbol: string): string => joinUrl(uonetPlusBaseUrl(host, symbol), 'LoginEndpoint.aspx').toString();

/**
 * Start URL.
 * @param host User login host.
 * @param symbol Region tag.
 * @returns Start page absolute endpoint URL.
 */
export const startIndexUrl = (host: string, symbol: string): string => joinUrl(uonetPlusBaseUrl(host, symbol), 'Start.mvc/Index').toString();

/**
 * Lucky number tile URL.
 * @param host User login host.
 * @param symbol Region tag.
 * @returns Lucky number tile absolute endpoint URL.
 */
export const luckyNumbersUrl = (host: string, symbol: string): string => joinUrl(uonetPlusBaseUrl(host, symbol), 'Start.mvc/GetKidsLuckyNumbers').toString();

export const reportingUnitsUrl = (host: string, symbol: string): string => joinUrl(uonetPlusUserUrl(host, symbol), 'NowaWiadomosc.mvc/GetJednostkiUzytkownika').toString();
