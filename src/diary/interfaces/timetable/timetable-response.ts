import { TimetableHeaders } from './timetable-headers';

export interface TimetableResponse {
  Data: string;
  Headers: TimetableHeaders[];
  Rows: string[][];
  Additionals: string[];
}
