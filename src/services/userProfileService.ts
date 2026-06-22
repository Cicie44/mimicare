import { supabase } from "../lib/supabase";
import type { UserProfile } from "../types";

type ProfileRow = {
  user_id: string;
  display_name: string;
  bio: string | null;
  area: string | null;
  has_cat_experience: boolean;
  has_dog_experience: boolean;
  available_days: string[];
  preferred_service_types: string[];
};

type Stats = {
  completedVisitsCount: number;
  averageRating?: number;
  reviewCount: number;
  postCount: number;
};

async function fetchStats(userId: string): Promise<Stats> {
  const [visitsRes, reviewsRes, postsRes] = await Promise.all([
    supabase
      .from("community_posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("category", "sitter_help")
      .eq("status", "completed"),
    supabase.from("post_reviews").select("rating").eq("sitter_user_id", userId),
    supabase
      .from("community_posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);
  const count = visitsRes.count ?? 0;
  const ratings = (reviewsRes.data ?? []) as { rating: number }[];
  const avg =
    ratings.length > 0
      ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
      : undefined;
  return {
    completedVisitsCount: count,
    averageRating: avg,
    reviewCount: ratings.length,
    postCount: postsRes.count ?? 0,
  };
}

function rowToProfile(row: ProfileRow, stats: Stats): UserProfile {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    bio: row.bio ?? undefined,
    area: row.area ?? undefined,
    hasCatExperience: row.has_cat_experience,
    hasDogExperience: row.has_dog_experience,
    availableDays: row.available_days,
    preferredServiceTypes: row.preferred_service_types,
    completedVisitsCount: stats.completedVisitsCount,
    averageRating: stats.averageRating,
    reviewCount: stats.reviewCount,
    postCount: stats.postCount,
  };
}

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const stats = await fetchStats(userId);
  return rowToProfile(data as ProfileRow, stats);
}

export async function fetchPublicProfile(userId: string): Promise<UserProfile | null> {
  return fetchProfile(userId);
}

export async function upsertProfile(
  profile: Omit<UserProfile, "completedVisitsCount" | "averageRating" | "reviewCount" | "postCount">,
  userId: string
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(
      {
        user_id: userId,
        display_name: profile.displayName,
        bio: profile.bio ?? null,
        area: profile.area ?? null,
        has_cat_experience: profile.hasCatExperience,
        has_dog_experience: profile.hasDogExperience,
        available_days: profile.availableDays,
        preferred_service_types: profile.preferredServiceTypes,
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();
  if (error) throw error;
  const stats = await fetchStats(userId);
  return rowToProfile(data as ProfileRow, stats);
}
