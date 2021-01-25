import type { ReportingUnit } from '../interfaces/messages/reporting-unit';
import type { ReportingUnitData } from '../interfaces/messages/reporting-unit-data';

export function mapReportingUnits(data: ReportingUnitData): ReportingUnit[] {
  return data.map((item) => ({
    roles: item.Role,
    senderId: item.Id,
    senderName: item.NazwaNadawcy,
    short: item.Skrot,
    unitId: item.IdJednostkaSprawozdawcza,
  }));
}
