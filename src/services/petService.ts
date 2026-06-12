import { supabase } from "../lib/supabase";
import type { Pet } from "../types";

type PetRow = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  gender: string;
  birthday: string | null;
  age_label: string;
  neutered: boolean;
  indoor: boolean;
  personality: string[];
  avatar_url: string | null;
};

function rowToPet(row: PetRow): Pet {
  return {
    id: row.id,
    name: row.name,
    species: row.species,
    breed: row.breed ?? undefined,
    gender: row.gender,
    birthday: row.birthday ?? undefined,
    ageLabel: row.age_label,
    neutered: row.neutered,
    indoor: row.indoor,
    personality: row.personality ?? [],
    avatarUrl: row.avatar_url ?? undefined,
  };
}

export async function fetchPet(): Promise<Pet | null> {
  const { data, error } = await supabase
    .from("pets")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToPet(data as PetRow);
}

export async function upsertPet(pet: Pet): Promise<Pet> {
  const { data, error } = await supabase
    .from("pets")
    .upsert({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed ?? null,
      gender: pet.gender,
      birthday: pet.birthday ?? null,
      age_label: pet.ageLabel,
      neutered: pet.neutered,
      indoor: pet.indoor,
      personality: pet.personality,
      avatar_url: pet.avatarUrl ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToPet(data as PetRow);
}
