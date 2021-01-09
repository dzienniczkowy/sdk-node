import { AxiosResponse } from 'axios';
import { Response } from '../diary/interfaces/response';
import RequestFailedError from '../errors/request-not-successful';

export * from './links';
export * from './parsers';
export * from './url';

export function notNil<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * @param response Axios response
 * @throws ResponseNotSuccessfulError
 * @returns Response data
 */
export function handleResponse<T>(response: AxiosResponse<Response<T>>): T {
  if (!response.data.success) throw new RequestFailedError(response);
  return response.data.data;
}

export function nullIfEmpty(value: string | null | undefined): string | null {
  if (value === '' || value === undefined) return null;
  return value;
}

export function parseNotNullOrEmpty(value: string | null | undefined): number | null {
  if (value === null || value === '' || value === undefined) return null;
  return parseFloat(value);
}
