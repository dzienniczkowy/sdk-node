export interface TimetableLessonInfo {
  subject: string;
  subjectOld?: string;
  group?: string;
  room: string;
  roomOld?: string;
  teacher: string;
  teacherOld?: string;
  info?: string;
  studentPlan?: boolean;
  hasChanges: boolean;
  canceled: boolean;
}

export interface TimetableLesson extends TimetableLessonInfo {
  number: number;
  start: string;
  end: string;
  date: string;
  startDateTime: string;
  endDateTime: string;
}
