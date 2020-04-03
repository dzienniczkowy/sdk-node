export default class InvalidCredentialsError extends Error {
  constructor(message = 'Invalid login credentials.') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}
