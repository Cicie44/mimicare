import { supabase } from "../lib/supabase";
import type { VaccineRecord } from "../types";

type VaccineRow = {
  id: string;
  pet_id: string;
  name: string;
  dose_number: number;
  date_given: string;
  next_due_date: string | null;
  clinic_name: string | null;
  notes: string | null;
};

function rowToVaccine(row: VaccineRow): VaccineRecord {
  return {
    id: row.id,
    petId: row.pet_id,
    name: row.name,
    doseNumber: row.dose_number,
    dateGiven: row.date_given,
    nextDueDate: row.next_due_date ?? undefined,
    clinicName: row.clinic_name ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export async function fetchVaccines(): Promise<VaccineRecord[]> {
  const { data, error } = await supabase
    .from("vaccines")
    .select("*")
    .order("date_given", { ascending: false });
  if (error) throw error;
  return (data as VaccineRow[]).map(rowToVaccine);
}

export async function createVaccine(
  vaccine: Omit<VaccineRecord, "id">,
  userId: string
): Promise<VaccineRecord> {
  const { data, error } = await supabase
    .from("vaccines")
    .insert({
      user_id: userId,
      pet_id: vaccine.petId,
      name: vaccine.name,
      dose_number: vaccine.doseNumber,
      date_given: vaccine.dateGiven,
      next_due_date: vaccine.nextDueDate ?? null,
      clinic_name: vaccine.clinicName ?? null,
      notes: vaccine.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToVaccine(data as VaccineRow);
}

export async function updateVaccine(vaccine: VaccineRecord): Promise<void> {
  const { error } = await supabase
    .from("vaccines")
    .update({
      name: vaccine.name,
      dose_number: vaccine.doseNumber,
      date_given: vaccine.dateGiven,
      next_due_date: vaccine.nextDueDate ?? null,
      clinic_name: vaccine.clinicName ?? null,
      notes: vaccine.notes ?? null,
    })
    .eq("id", vaccine.id);
  if (error) throw error;
}

export async function deleteVaccine(id: string): Promise<void> {
  const { error } = await supabase.from("vaccines").delete().eq("id", id);
  if (error) throw error;
}
