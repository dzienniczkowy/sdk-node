/**
 * Generator for links to UONET+ default endpoint.
 * @param host User login host.
 * @param symbol User region tag.
 * @param url Relative URL for this generator.
 * @returns Absolute URL.
 */
const uonetPlusBaseUrl = (host: string, symbol: string, url: string): string => `https://uonetplus.${host}/${symbol}/${url}`;

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
export const checkUserSignUrl = (host: string, symbol: string): string => uonetPlusBaseUrl(host, symbol, 'LoginEndpoint.aspx');
