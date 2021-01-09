import { Diary } from '../diary';
import { DiaryInfo } from './diary/diary-info';

export interface UserObject {
  info: DiaryInfo;
  baseUrl: string;
  host: string;
  createDiary: () => Promise<Diary>;
}
