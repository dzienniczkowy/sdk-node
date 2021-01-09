export interface GradeDataPartial {
  DataOceny: string;
  KodKolumny: string | null;
  NazwaKolumny: string | null;
  KolorOceny: number;
  Nauczyciel: string;
  Waga: number;
  Wpis: string;
}

export interface GradeDataSubject {
  OcenaRoczna: string | null;
  OcenaRocznaPunkty: string | null;
  OcenyCzastkowe: GradeDataPartial[]; // TODO: Add type
  Pozycja: number;
  ProponowanaOcenaRoczna: string | null;
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
