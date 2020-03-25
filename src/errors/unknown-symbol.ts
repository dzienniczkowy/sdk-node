export default class UnknownSymbolError extends Error {
  constructor(message = 'Symbol not found. Please enter your symbol during sign in.') {
    super(message);
    this.name = 'UnknownSymbolError';
  }
}
