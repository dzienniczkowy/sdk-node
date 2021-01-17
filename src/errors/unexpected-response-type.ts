export default class UnexpectedResponseTypeError extends Error {
  constructor(private expectedType: string, private actualType?: string) {
    super(`Unexpected response type. Expected: ${expectedType}. Actual: ${actualType ?? 'none'}`);
    this.name = 'UnexpectedResponseTypeError';
  }
}
