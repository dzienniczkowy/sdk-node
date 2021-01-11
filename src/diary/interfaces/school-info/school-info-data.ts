export interface SchoolData {
  Id: number;
  Nazwa: string;
  Adres: string;
  Kontakt: string;
  Dyrektor: string;
  Pedagog: string;
}

export interface TeacherData {
  Id: number;
  Nauczyciel: string;
  Nazwa: string;
}

export interface SchoolInfoData {
  Szkola: SchoolData;
  Nauczyciele: TeacherData[];
  Klasa: string;
}
