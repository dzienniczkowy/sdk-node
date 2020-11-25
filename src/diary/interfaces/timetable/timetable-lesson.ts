export interface TimetableLesson {
  number?: number;
  start?: string;
  end?: string;
  /**
   * Lesson date as ISO 8601 string (YYYY-MM-DD).
   */
  date?: string;
  subject: string;
  subjectOld?: string;
  group: string;
  room: string;
  roomOld?: string;
  teacher: string;
  teacherOld?: string;
  info: string;
  studentPlan?: boolean;
  changes: boolean;
  canceled: boolean;
}
