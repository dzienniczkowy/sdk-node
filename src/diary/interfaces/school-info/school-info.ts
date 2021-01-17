import type { School } from './school';
import type { Teacher } from './teacher';

export interface SchoolInfo {
  school: School;
  teachers: Teacher[];
  classHeader: string;
}
