export interface ExamsDataExam {
  DataModyfikacji: string;
  DisplayValue: string;
  Opis: string;
  PracownikModyfikujacyDisplay: string;
  Rodzaj: number;
}

export interface ExamsDataDay {
  Data: string;
  Pokazuj: boolean;
  Sprawdziany: ExamsDataExam[];
}

export interface ExamsDataItem {
  SprawdzianyGroupedByDayList: ExamsDataDay[];
}

export type ExamsData = ExamsDataItem[];
