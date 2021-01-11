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
    await diary.getTimetable('2020-03-23');
  });

  it('Get grade details', async () => {
    await diary.getGradeDetails(diary.info.semesters[0].id);
  });

  it('Get notes and achievements', async () => {
    await diary.getNotesAndAchievements();
  });

  it('Get exams', async () => {
    await expect(diary.getExams('2020-03-25', '2020-02-20', false))
      .rejects.toHaveProperty('name');

    await expect(diary.getExams('2020-02-20', '2020-02-20', true))
      .resolves.toHaveProperty('length', 1);
    await expect(diary.getExams('2020-02-20', '2020-02-20', false))
      .resolves.toHaveProperty('length', 28);

    await expect(diary.getExams('2020-02-20', '2020-02-27', true))
      .resolves.toHaveProperty('length', 8);
    await expect(diary.getExams('2020-02-20', '2020-02-27', false))
      .resolves.toHaveProperty('length', 28);

    await expect(diary.getExams('2020-01-01', '2020-01-29', true))
      .resolves.toHaveProperty('length', 29);
    await expect(diary.getExams('2020-01-01', '2020-01-29', false))
      .resolves.toHaveProperty('length', 56);
  });
});
