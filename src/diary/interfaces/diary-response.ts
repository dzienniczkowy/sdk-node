// Partial
export interface DiaryResponseSemester {
  NumerOkresu: number;
  Poziom: number;
  DataOd: string;
  DataDo: string;
  IdOddzial: number;
  IdJednostkaSprawozdawcza: number;
  IsLastOkres: boolean;
  Id: number;
}

export interface DiaryResponse {
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
  Okresy: DiaryResponseSemester[];
  UczenPelnaNazwa: string;
}

export interface DiaryListResponse {
  data: DiaryResponse[];
  success: boolean;
}
