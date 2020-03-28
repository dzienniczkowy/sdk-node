export interface TimetableLesson {
  number?: number;
  start?: string;
  end?: string;
  date?: Date;
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
