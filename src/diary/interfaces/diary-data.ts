// Partial
export interface DiaryDataSemester {
  NumerOkresu: number;
  Poziom: number;
  DataOd: string;
  DataDo: string;
  IdOddzial: number;
  IdJednostkaSprawozdawcza: number;
  IsLastOkres: boolean;
  Id: number;
}

export interface DiaryDataItem {
  Id: number;
  IdUczen: number;
  UczenImie: string;
  UczenImie2: string;
  UczenNazwisko: string;
  IsDziennik: boolean;
  IdDziennik: number;
  IdPrzedszkoleDziennik: number;
  Poziom: number;
  Symbol: string;
  Nazwa?: string;
  DziennikRokSzkolny: number;
  Okresy: DiaryDataSemester[];
  UczenPelnaNazwa: string;
}

export type DiaryListData = DiaryDataItem[];
