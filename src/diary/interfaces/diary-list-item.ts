import type { Diary } from '../diary';
import type { SerializedDiary } from './serialized-diary';

export interface DiaryListItem {
  serialized: SerializedDiary;
  createDiary: () => Diary;
}
