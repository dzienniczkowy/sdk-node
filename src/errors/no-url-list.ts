export default class NoUrlListError extends Error {
  constructor(message = 'URL list is missing. Did you forget to log in?') {
    super(message);
    this.name = 'NoUrlListError';
  }
}
