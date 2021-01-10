import { basicToDateISO, basicToExtendedISO } from '../../utils';
import { Exam, ExamDay, ExamTypeName } from '../interfaces/exams/exam';
import { ExamsData, ExamsDataDay, ExamsDataExam } from '../interfaces/exams/exams-data';

const displayValueRegex = /^(.+) ([^\s|]+)(?:\|([^\s|]+))?$/m;

function parseDisplayValue(displayValue: string): {
  subject: string;
  class: string;
  group: string | null;
} {
  const matches = displayValueRegex.exec(displayValue);
  if (matches === null) throw new Error(`Couldn't parse "${displayValue}" DisplayValue`);
  const match = matches[0];
  return {
    subject: match[1],
    class: match[2],
    group: match[3] ?? null,
  };
}

function examTypeName(dataType: number): ExamTypeName {
  if (dataType === 1) return 'Sprawdzian';
  if (dataType === 2) return 'Kartkówka';
  return 'Praca klasowa';
}

function mapExam(dataExam: ExamsDataExam, date: string): Exam {
  return {
    ...parseDisplayValue(dataExam.DisplayValue),
    entryDateTime: basicToExtendedISO(dataExam.DataModyfikacji),
    date,
    description: dataExam.Opis,
    teacher: dataExam.PracownikModyfikujacyDisplay,
    type: {
      name: examTypeName(dataExam.Rodzaj),
      code: dataExam.Rodzaj,
    },
  };
}

function mapExamDay(dataDay: ExamsDataDay): ExamDay {
  const date = basicToDateISO(dataDay.Data);
  return {
    date,
    exams: dataDay.Sprawdziany.map((exam) => mapExam(exam, date)),
    visible: dataDay.Pokazuj,
  };
}

export function mapExamDays(data: ExamsData): ExamDay[] {
  return data
    .flatMap((week) => week.SprawdzianyGroupedByDayList)
    .map(mapExamDay);
}
