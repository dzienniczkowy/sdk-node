export interface HomepageDataContent {
  IkonaNazwa: string | null;
  Num: number | null;
  Zawartosc: HomepageDataContent[];
  Nazwa: string;
  Url: string | null;
  Dane: string | null;
  Symbol: string | null;
  Nieaktywny: boolean;
}

export type HomepageData = HomepageDataContent[];
