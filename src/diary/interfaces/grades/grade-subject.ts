import type { PartialGrade } from './partial-grade';

export interface GradeSubject {
  name: string;
  visible: boolean;
  proposedGrade: string | null;
  finalGrade: string | null;
  partialGrades: PartialGrade[];
  average: number | null;
  proposedPoints: number | null;
  finalPoints: number | null;
  pointsSum: string | null;
}
