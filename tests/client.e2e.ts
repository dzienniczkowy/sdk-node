import * as wulkanowy from '../src';

jest.setTimeout(30000);

describe('Client', () => {
  describe('Login method', () => {
    let client: wulkanowy.Client;

    beforeEach(() => {
      client = new wulkanowy.Client('fakelog.cf');
    });

    afterEach(() => {
      // TODO: Logout
    });

    it('Ger user list before logging in', () => expect(
      client.getDiaryList(),
    ).rejects.toHaveProperty('name', 'NoUrlListError'));

    it('Login to fakelog account', () => expect(
      client.login('jan@fakelog.cf', 'jan123'),
    ).resolves.toEqual('powiatwulkanowy'));

    it('Throws error if login credentials are invalid', () => expect(
      client.login('jan@fakelog.cf', 'invalid-password'),
    ).rejects.toHaveProperty('name', 'InvalidCredentialsError'));

    it('Get user list', async () => {
      await client.login('jan@fakelog.cf', 'jan123');
      const diaryList = await client.getDiaryList();
      expect(diaryList[0].host).toEqual('fakelog.cf');
      await diaryList[0].createDiary();
    });
  });

  describe('Client data', () => {
    let client: wulkanowy.Client;

    beforeAll(async () => {
      client = new wulkanowy.Client('fakelog.cf');
      await client.login('jan@fakelog.cf', 'jan123');
    });

    afterAll(() => {
      // TODO: Logout
    });

    it('Get lucky numbers', async () => {
      await client.getLuckyNumbers();
    });
  });
});
