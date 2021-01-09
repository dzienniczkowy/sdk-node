export interface Color {
  decimal: number;
  hex: string;
  red: number;
  green: number;
  blue: number;
}

export interface PartialGrade {
  entry: string;
  /**
   * ISO 8601 string (YYYY-MM-DD).
   */
  date: string;
  column: {
    name: string | null;
    code: string | null;
  };
  color: Color;
  teacher: string;
  weight: number;
}
