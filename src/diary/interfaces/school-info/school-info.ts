import { School } from './school';
import { Teacher } from './teacher';

export interface SchoolInfo {
  school: School;
  teachers: Teacher[];
  classHeader: string;
}
