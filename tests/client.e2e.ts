import * as wulkanowy from '../src';
import { Client } from '../src';

jest.setTimeout(30000);
jest.useFakeTimers();

const testCredentials = {
  username: 'jan@fakelog.cf',
  password: 'jan123',
};

describe('Client', () => {
  describe('Login method', () => {
    let client: wulkanowy.Client;

    beforeEach(() => {
      client = new wulkanowy.Client('fakelog.cf', () => testCredentials);
    });

    afterEach(() => {
      // TODO: Logout
    });

    it('Ger user list before logging in', () => expect(
      client.getDiaryList(),
    ).rejects.toHaveProperty('name', 'NoUrlListError'));

    it('Login to fakelog account', async () => {
      expect(client.getSymbol()).toEqual(undefined);
      await expect(client.login()).resolves.toEqual(['powiatwulkanowy']);
      expect(client.getSymbol()).toEqual(undefined);
      await client.setSymbol('powiatwulkanowy');
      expect(client.getSymbol()).toEqual('powiatwulkanowy');
      await expect(() => client.setSymbol('intenselyfakesymbol')).rejects.toHaveProperty('name', 'UnknownSymbolError');
      expect(client.getSymbol()).toEqual('powiatwulkanowy');
    });

    it('Throws error if login credentials are invalid', async () => {
      client.setCredentialsFunction(() => ({
        username: 'jan@fakelog.cf',
        password: 'invalid-password',
      }));
      await expect(client.login())
        .rejects.toHaveProperty('name', 'InvalidCredentialsError');
    });

    it('Get user list', async () => {
      client.setCredentialsFunction(() => testCredentials);
      const symbols = await client.login();
      expect(symbols[0]).toEqual('powiatwulkanowy');
      await client.setSymbol(symbols[0]);
      const diaryList = await client.getDiaryList();
      expect(diaryList[0].serialized.host).toEqual('fakelog.cf');
      diaryList[0].createDiary();
    });
  });

  describe('Client data', () => {
    let client: wulkanowy.Client;

    beforeAll(async () => {
      client = new wulkanowy.Client('fakelog.cf', () => testCredentials);
      const symbols = await client.login();
      await client.setSymbol(symbols[0]);
    });

    afterAll(() => {
      // TODO: Logout
    });

    it('Get lucky numbers', async () => {
      await client.getLuckyNumbers();
    });

    // Won't ever fail with fakelog.cf
    it('Auto login', async () => {
      client.cookieJar.removeAllCookiesSync();
      await client.getLuckyNumbers();
    });
  });

  describe('Helper functions', () => {
    it('Serialize, deserialize', async () => {
      const client = new wulkanowy.Client('fakelog.cf', () => testCredentials);
      const symbols = await client.login();
      await client.setSymbol(symbols[0]);
      const serialized = client.serialize();
      const deserialized = Client.deserialize(serialized, () => testCredentials);
      const serializedAgain = deserialized.serialize();

      expect(serialized).toEqual(serializedAgain);
    });
  });
});
