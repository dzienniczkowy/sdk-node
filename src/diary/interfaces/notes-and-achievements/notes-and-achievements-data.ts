export interface NoteData {
  DataWpisu: string;
  Nauczyciel: string;
  Kategoria: string;
  KategoriaTyp: number;
  TrescUwagi: string;
  Punkty: string;
  PokazPunkty: boolean;
}

// export interface AchievementData {
//
// }

export interface NotesAndAchievementsData {
  Uwagi: NoteData[];
  // Osiagniecia: AchievementData[];
}
