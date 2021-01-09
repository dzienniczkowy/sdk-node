import { TimetableHeaders } from './timetable-headers';

export interface TimetableData {
  Data: string;
  Headers: TimetableHeaders[];
  Rows: string[][];
  Additionals: string[];
}
