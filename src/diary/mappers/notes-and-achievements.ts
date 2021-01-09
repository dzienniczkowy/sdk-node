import { basicToExtendedISO, parseNotNullOrEmpty } from '../../utils';
import { Note, NoteType } from '../interfaces/notes-and-achievements/note';
import { NotesAndAchievements } from '../interfaces/notes-and-achievements/notes-and-achievements';
import {
  NoteData,
  NotesAndAchievementsData,
} from '../interfaces/notes-and-achievements/notes-and-achievements-data';

export function mapNote(data: NoteData): Note {
  let type: NoteType = 'unknown';
  if (data.KategoriaTyp === 1) type = 'positive';
  else if (data.KategoriaTyp === 2) type = 'neutral';
  else if (data.KategoriaTyp === 3) type = 'negative';
  return {
    category: {
      name: data.Kategoria,
      type,
    },
    content: data.TrescUwagi,
    dateTime: basicToExtendedISO(data.DataWpisu),
    points: parseNotNullOrEmpty(data.Punkty),
    showPoints: data.PokazPunkty,
    teacher: data.Nauczyciel,
  };
}

export function mapNotesAndAchievements(data: NotesAndAchievementsData): NotesAndAchievements {
  return {
    achievements: data.Osiagniecia,
    notes: data.Uwagi.map(mapNote),
  };
}
