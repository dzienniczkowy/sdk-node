import { AxiosResponse } from 'axios';

// TODO: Add fields for error details
export default class RequestFailedError extends Error {
  private response: AxiosResponse;

  constructor(response: AxiosResponse) {
    super('Request failed');
    this.name = 'RequestFailedError';
    this.response = response;
  }
}
