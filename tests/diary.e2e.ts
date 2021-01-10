import * as wulkanowy from '../src';
import { Diary } from '../src';
import { UserObject } from '../src/diary/interfaces/user-object';

jest.setTimeout(30000);

describe('Diary', () => {
  let client: wulkanowy.Client;
  let diaryList: UserObject[];
  let diary: Diary;

  beforeAll(async () => {
    client = new wulkanowy.Client('fakelog.cf');
    await client.login('jan@fakelog.cf', 'jan123');
    diaryList = await client.getDiaryList();
    diary = await diaryList[0].createDiary();
  });

  afterAll(() => {
    // TODO: Logout
  });

  it('Get timetable', async () => {
    await diary.getTimetable(new Date(Date.UTC(2020, 2, 23)));
  });

  it('Get grade details', async () => {
    await diary.getGradeDetails(diary.info.semesters[0].id);
  });

  it('Get notes and achievements', async () => {
    await diary.getNotesAndAchievements();
  });
});
