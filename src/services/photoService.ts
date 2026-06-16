import { supabase } from "../lib/supabase";
import type { PetPhoto } from "../types";

const BUCKET = "pet-photos";
const SIGNED_URL_EXPIRY = 3600; // 1 hour

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type PhotoRow = {
  id: string;
  pet_id: string;
  storage_path: string;
  caption: string;
  tags: string[];
  date: string;
};

function rowToPhoto(row: PhotoRow, signedUrl = ""): PetPhoto {
  return {
    id: row.id,
    petId: row.pet_id,
    storagePath: row.storage_path,
    signedUrl,
    caption: row.caption,
    tags: row.tags ?? [],
    date: row.date,
  };
}

export async function fetchPhotos(): Promise<PetPhoto[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!data || data.length === 0) return [];

  const rows = data as PhotoRow[];
  const paths = rows.map((r) => r.storage_path);

  const { data: signed, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_EXPIRY);
  if (signError) throw signError;

  const urlMap = new Map(
    (signed ?? [])
      .filter((s) => !s.error && s.signedUrl)
      .map((s) => [s.path, s.signedUrl])
  );

  return rows.map((row) => rowToPhoto(row, urlMap.get(row.storage_path) ?? ""));
}

export function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, and WebP files are allowed.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File must be under 5MB.";
  }
  return null;
}

export async function uploadPhoto(file: File, userId: string): Promise<string> {
  const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${userId}/${Date.now()}-${safeFilename}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function createPhotoRecord(
  data: { petId: string; storagePath: string; caption: string; tags: string[]; date: string },
  userId: string
): Promise<PetPhoto> {
  const { data: row, error } = await supabase
    .from("photos")
    .insert({
      user_id: userId,
      pet_id: data.petId,
      storage_path: data.storagePath,
      caption: data.caption,
      tags: data.tags,
      date: data.date,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToPhoto(row as PhotoRow);
}

export async function createSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY);
  if (error) throw error;
  return data.signedUrl;
}

export async function deletePhoto(photoId: string, storagePath: string): Promise<void> {
  const { error: dbError } = await supabase.from("photos").delete().eq("id", photoId);
  if (dbError) throw dbError;
  const { error: storageError } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (storageError) throw storageError;
}
