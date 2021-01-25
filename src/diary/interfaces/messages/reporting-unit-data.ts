export interface ReportingUnitDataItem {
  Id: number;
  IdJednostkaSprawozdawcza: number;
  NazwaNadawcy: string;
  Role: number[]
  Skrot: string;
  WychowawcaWOddzialach: any[]
}

export type ReportingUnitData = ReportingUnitDataItem[];
