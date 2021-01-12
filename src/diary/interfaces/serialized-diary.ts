import { DiaryInfo } from './diary/diary-info';

export interface SerializedDiary {
  info: DiaryInfo;
  baseUrl: string;
  host: string;
}
