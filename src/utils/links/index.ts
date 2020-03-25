/**
 * Login URL.
 * @param host Host address.
 * @return Login endpoint URL.
 */
export const loginUrl = (host): string => `https://cufs.${host}/Default/Account/LogOn?ReturnUrl=%2FDefault%2FFS%2FLS%3Fwa%3Dwsignin1.0%26wtrealm%3Dhttps%253a%252f%252fuonetplus.${host}%252fDefault%252fLoginEndpoint.aspx%26wctx%3Dhttps%253a%252f%252fuonetplus.${host}%252fDefault%252fLoginEndpoint.aspx`;
