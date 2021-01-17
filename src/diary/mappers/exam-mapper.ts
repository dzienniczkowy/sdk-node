import { remoteISOToDateString, remoteISOToExtendedISO } from '../../utils';
import type { Exam, ExamDay, ExamTypeName } from '../interfaces/exams/exam';
import type { ExamsData, ExamsDataDay, ExamsDataExam } from '../interfaces/exams/exams-data';

const displayValueRegex = /^(.+) ([^\s|]+)(?:\|([^\s|]+))?$/;

function parseDisplayValue(displayValue: string): {
  subject: string;
  class: string;
  group: string | null;
} {
  const match = displayValueRegex.exec(displayValue);
  if (match === null) throw new Error(`Couldn't parse "${displayValue}" DisplayValue`);
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
    entryDateTime: remoteISOToExtendedISO(dataExam.DataModyfikacji),
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
  const date = remoteISOToDateString(dataDay.Data);
  return {
    date,
    exams: dataDay.Sprawdziany.map((exam) => mapExam(exam, date)),
    show: dataDay.Pokazuj,
  };
}

export function mapExamDays(data: ExamsData): ExamDay[] {
  return data
    .flatMap((week) => week.SprawdzianyGroupedByDayList)
    .map(mapExamDay);
}
