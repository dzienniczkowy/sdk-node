export default class NoUrlListError extends Error {
  constructor(message = 'URL list is missing. Did you forget call initClient?') {
    super(message);
    this.name = 'NoUrlListError';
  }
}
