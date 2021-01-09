import { URL } from 'url';

export function joinPathNames(basePathName: string, ...items: string[]): string {
  if (!basePathName.startsWith('/')) throw new Error('Base path name doesn\'t start with a slash');
  let currentPathName = basePathName;
  items.forEach((item) => {
    if (item.startsWith('/')) currentPathName = item;
    else {
      if (!currentPathName.endsWith('/')) currentPathName += '/';
      currentPathName += item;
    }
  });
  return currentPathName;
}

export function joinUrl(baseUrl: string | URL, ...items: string[]): URL {
  const urlObject = new URL(baseUrl.toString());
  urlObject.pathname = joinPathNames(urlObject.pathname, ...items);
  return urlObject;
}
