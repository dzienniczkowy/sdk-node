export type ExamTypeName = 'Sprawdzian' | 'Kartkówka' | 'Praca klasowa';

export interface Exam {
  subject: string;
  class: string;
  group: string | null;
  entryDateTime: string;
  date: string;
  teacher: string;
  description: string;
  type: {
    name: ExamTypeName;
    code: number;
  };
}

export interface ExamDay {
  date: string;
  visible: boolean;
  exams: Exam[];
}
