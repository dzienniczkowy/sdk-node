import * as wulkanowy from '../src';

const client = new wulkanowy.Client('fakelog.cf');
let diaryList;

describe('Client', () => {
  describe('Login method', () => {
    it('Login to fakelog account', () => expect(client.login('jan@fakelog.cf', 'jan123')).resolves.toEqual('powiatwulkanowy'));
    it('Get user list', async () => {
      diaryList = await client.getDiaryList();
      expect(diaryList[0].host).toEqual('fakelog.cf');
    });
  });
});


describe('Diary', () => {
  it('Get timetable', async () => {
    const diary = new wulkanowy.Diary(diaryList[0], client.cookieJar);
    await diary.getTimetable(new Date(Date.UTC(2020, 2, 23)));
  });
});
