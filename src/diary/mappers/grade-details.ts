import { nullIfEmpty, parseNotNullOrEmpty, toISODate } from '../../utils';
import { GradeData, GradeDataPartial, GradeDataSubject } from '../interfaces/grades/grade-data';
import { GradeSubject } from '../interfaces/grades/grade-subject';
import { Grades } from '../interfaces/grades/grades';
import { Color, PartialGrade } from '../interfaces/grades/partial-grade';

function parseColor(decimal: number): Color {
  const hex = decimal.toString(16).padStart(6, '0');
  const red = parseInt(hex.substring(0, 2), 16);
  const green = parseInt(hex.substring(2, 4), 16);
  const blue = parseInt(hex.substring(4, 6), 16);
  return {
    decimal,
    hex: `#${hex}`,
    red,
    green,
    blue,
  };
}

function mapPartialGrade(grade: GradeDataPartial): PartialGrade {
  return {
    entry: grade.Wpis,
    date: toISODate(grade.DataOceny),
    column: {
      code: nullIfEmpty(grade.KodKolumny),
      name: nullIfEmpty(grade.NazwaKolumny),
    },
    color: parseColor(grade.KolorOceny),
    teacher: grade.Nauczyciel,
    weight: grade.Waga,
  };
}

function mapSubject(subject: GradeDataSubject): GradeSubject {
  return {
    name: subject.Przedmiot,
    visible: subject.WidocznyPrzedmiot,
    proposedGrade: nullIfEmpty(subject.ProponowanaOcenaRoczna),
    finalGrade: nullIfEmpty(subject.OcenaRoczna),
    proposedPoints: parseNotNullOrEmpty(subject.ProponowanaOcenaRocznaPunkty),
    finalPoints: parseNotNullOrEmpty(subject.OcenaRocznaPunkty),
    pointsSum: nullIfEmpty(subject.SumaPunktow),
    average: subject.Srednia === 0 ? null : subject.Srednia,
    partialGrades: subject.OcenyCzastkowe.map(mapPartialGrade),
  };
}

export function mapGrades(data: GradeData): Grades {
  return {
    isAverage: data.IsSrednia,
    isPoints: data.IsPunkty,
    subjects: data.Oceny.map(mapSubject),
  };
}
