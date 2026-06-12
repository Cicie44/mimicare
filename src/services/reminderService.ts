import { supabase } from "../lib/supabase";
import type { Reminder } from "../types";

// Shape returned by the database (snake_case)
type ReminderRow = {
  id: string;
  pet_id: string;
  title: string;
  category: string;
  due_date: string;
  status: string;
  notes: string | null;
  created_at: string;
};

function rowToReminder(row: ReminderRow): Reminder {
  return {
    id: row.id,
    petId: row.pet_id,
    title: row.title,
    category: row.category,
    dueDate: row.due_date,
    status: row.status as Reminder["status"],
    notes: row.notes ?? undefined,
  };
}

export async function fetchReminders(): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .order("due_date", { ascending: true });
  if (error) throw error;
  return (data as ReminderRow[]).map(rowToReminder);
}

export async function createReminder(
  reminder: Omit<Reminder, "id">
): Promise<Reminder> {
  const { data, error } = await supabase
    .from("reminders")
    .insert({
      pet_id: reminder.petId,
      title: reminder.title,
      category: reminder.category,
      due_date: reminder.dueDate,
      status: reminder.status,
      notes: reminder.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToReminder(data as ReminderRow);
}

export async function updateReminder(reminder: Reminder): Promise<void> {
  const { error } = await supabase
    .from("reminders")
    .update({
      title: reminder.title,
      category: reminder.category,
      due_date: reminder.dueDate,
      status: reminder.status,
      notes: reminder.notes ?? null,
    })
    .eq("id", reminder.id);
  if (error) throw error;
}

export async function deleteReminder(id: string): Promise<void> {
  const { error } = await supabase.from("reminders").delete().eq("id", id);
  if (error) throw error;
}

export async function markReminderDone(id: string): Promise<void> {
  const { error } = await supabase
    .from("reminders")
    .update({ status: "done" })
    .eq("id", id);
  if (error) throw error;
}
