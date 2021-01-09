export interface Semester {
  id: number;
  number: number;
  level: number;
  startDate: string;
  endDate: string;
  classId: number;
  unitId: number;
  isLast: boolean;
}

export interface DiaryInfo {
  diaryId: number;
  studentId: number;
  schoolYear: number;
  studentFirstName: string;
  studentSecondName: string | null;
  studentSurname: string;
  studentFullName: string;
  isDiary: boolean;
  level: number;
  symbol: string | null;
  name: string | null;
  semesters: Semester[];
}
