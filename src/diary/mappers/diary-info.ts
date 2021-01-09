import { DiaryDataItem } from '../interfaces/diary/diary-data';
import { DiaryInfo } from '../interfaces/diary/diary-info';

export function mapDiaryInfo(dataItem: DiaryDataItem): DiaryInfo {
  return {
    diaryId: dataItem.IdDziennik,
    studentId: dataItem.IdUczen,
    schoolYear: dataItem.DziennikRokSzkolny,
  };
}
