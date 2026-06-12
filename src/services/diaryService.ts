import { supabase } from "../lib/supabase";
import type { DiaryEntry } from "../types";

// Shape returned by the database (snake_case)
type DiaryRow = {
  id: string;
  pet_id: string;
  date: string;
  mood: string;
  food: string | null;
  activity: string | null;
  notes: string | null;
  created_at: string;
};

function rowToEntry(row: DiaryRow): DiaryEntry {
  return {
    id: row.id,
    petId: row.pet_id,
    date: row.date,
    mood: row.mood as DiaryEntry["mood"],
    food: row.food ?? undefined,
    activity: row.activity ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export async function fetchDiaryEntries(): Promise<DiaryEntry[]> {
  const { data, error } = await supabase
    .from("diary_entries")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data as DiaryRow[]).map(rowToEntry);
}

export async function createDiaryEntry(
  entry: Omit<DiaryEntry, "id">
): Promise<DiaryEntry> {
  const { data, error } = await supabase
    .from("diary_entries")
    .insert({
      pet_id: entry.petId,
      date: entry.date,
      mood: entry.mood,
      food: entry.food ?? null,
      activity: entry.activity ?? null,
      notes: entry.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToEntry(data as DiaryRow);
}

export async function updateDiaryEntry(entry: DiaryEntry): Promise<void> {
  const { error } = await supabase
    .from("diary_entries")
    .update({
      date: entry.date,
      mood: entry.mood,
      food: entry.food ?? null,
      activity: entry.activity ?? null,
      notes: entry.notes ?? null,
    })
    .eq("id", entry.id);
  if (error) throw error;
}

export async function deleteDiaryEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from("diary_entries")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
