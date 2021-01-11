import { nullIfEmpty } from '../../utils';
import { School } from '../interfaces/school-info/school';
import { SchoolInfo } from '../interfaces/school-info/school-info';
import {
  SchoolData,
  SchoolInfoData, TeacherData,
} from '../interfaces/school-info/school-info-data';
import { Teacher } from '../interfaces/school-info/teacher';

const teacherRegex = /^(.+) \[(.+)]$/;

function parseTeacher(data: TeacherData): Teacher[] {
  return data.Nauczyciel
    .split(', ')
    .map((teacher) => {
      const match = teacherRegex.exec(teacher);
      if (match === null) throw new Error(`Couldn't parse "${teacher}" teacher`);
      return {
        name: match[1],
        short: match[2],
        subject: nullIfEmpty(data.Nazwa),
      };
    });
}

function mapSchool(data: SchoolData): School {
  return {
    address: data.Adres,
    contact: data.Kontakt,
    headmaster: data.Dyrektor,
    name: data.Nazwa,
    pedagogue: data.Pedagog,
  };
}

export function mapSchoolInfo(data: SchoolInfoData): SchoolInfo {
  return {
    classHeader: data.Klasa,
    school: mapSchool(data.Szkola),
    teachers: data.Nauczyciele.flatMap(parseTeacher),
  };
}
