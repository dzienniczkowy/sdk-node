import * as wulkanowy from '../src';

describe('Client', () => {
  describe('Login method', () => {
    let client;

    beforeEach(() => {
      client = new wulkanowy.Client('fakelog.cf');
    });

    afterEach(() => {
      // TODO: Logout
    });

    it('Login to fakelog account', () => expect(
      client.login('jan@fakelog.cf', 'jan123'),
    ).resolves.toEqual('powiatwulkanowy'));

    it('Throws error if login credentials are invalid', () => expect(
      client.login('jan@fakelog.cf', 'invalid-password'),
    ).rejects.toHaveProperty('name', 'InvalidCredentialsError'));
  });
});
