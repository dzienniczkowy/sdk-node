import * as wulkanowy from '../src';

const client = new wulkanowy.Client('fakelog.cf');

describe('Client', () => {
  describe('Login method', () => {
    it('Login to fakelog account', () => expect(client.login('jan@fakelog.cf', 'jan123')).resolves.toEqual('powiatwulkanowy'));
  });
});
