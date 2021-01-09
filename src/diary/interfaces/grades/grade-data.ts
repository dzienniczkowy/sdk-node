export interface GradeDataPartial {
  DataOceny: string;
  KodKolumny: string;
  NazwaKolumny: string;
  KolorOceny: number;
  Nauczyciel: string;
  Waga: number;
  Wpis: string;
}

export interface GradeDataSubject {
  OcenaRoczna: string;
  OcenaRocznaPunkty: string | null;
  OcenyCzastkowe: GradeDataPartial[]; // TODO: Add type
  Pozycja: number;
  ProponowanaOcenaRoczna: string;
  ProponowanaOcenaRocznaPunkty: string | null;
  Przedmiot: string;
  Srednia: number;
  SumaPunktow: string | null;
  WidocznyPrzedmiot: boolean;
}

export interface GradeData {
  IsDlaDoroslych: boolean;
  IsOstatniSemest: boolean;
  IsPunkty: boolean;
  IsSrednia: boolean;
  TypOcen: number;
  Oceny: GradeDataSubject[];
  OcenyOpisowe: any[]; // TODO: Add type
}
