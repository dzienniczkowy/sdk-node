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
    });
  });
});

describe('Diary', () => {
  let client: wulkanowy.Client;
  let diaryList: any[];

  beforeEach(async () => {
    client = new wulkanowy.Client('fakelog.cf');
    await client.login('jan@fakelog.cf', 'jan123');
    diaryList = await client.getDiaryList();
  });

  afterEach(() => {
    // TODO: Logout
  });

  it('Get timetable', async () => {
    const diary = new wulkanowy.Diary(diaryList[0], client.cookieJar);
    await diary.getTimetable(new Date(Date.UTC(2020, 2, 23)));
  });
});
