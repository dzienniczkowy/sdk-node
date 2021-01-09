export type NoteType = 'unknown' | 'positive' | 'neutral' | 'negative';

export interface Note {
  dateTime: string;
  teacher: string;
  category: {
    name: string;
    type: NoteType;
  };
  content: string;
  points: number | null;
  showPoints: boolean;
}
