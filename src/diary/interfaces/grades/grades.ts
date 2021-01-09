import { GradeSubject } from './grade-subject';

export interface Grades {
  subjects: GradeSubject[];
  isAverage: boolean;
  isPoints: boolean;
}
