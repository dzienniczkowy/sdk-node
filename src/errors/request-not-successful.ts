import type { AxiosResponse } from 'axios';

// TODO: Add fields for error details
export default class RequestFailedError extends Error {
  constructor(private response: AxiosResponse) {
    super('Request failed');
    this.name = 'RequestFailedError';
  }
}
