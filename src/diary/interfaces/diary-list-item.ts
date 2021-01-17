import type { Diary } from '../diary';
import { SerializedDiary } from './serialized-diary';

export interface DiaryListItem {
  serialized: SerializedDiary;
  createDiary: () => Diary;
}
