import { TimetableHeaders } from './TimetableHeaders';

export interface TimetableResponse {
  Data: string;
  Headers: TimetableHeaders[];
  Rows: string[][];
  Additionals: string[];
}
