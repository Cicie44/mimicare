import { supabase } from "../lib/supabase";
import type { Review } from "../types";

type ReviewRow = {
  id: string;
  request_id: string;
  sitter_user_id: string;
  owner_user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

function rowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    requestId: row.request_id,
    sitterUserId: row.sitter_user_id,
    ownerUserId: row.owner_user_id,
    rating: row.rating,
    comment: row.comment ?? undefined,
    createdAt: row.created_at,
  };
}

// Reviews I left as owner
export async function fetchReviewsGiven(userId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ReviewRow[]).map(rowToReview);
}

// Reviews for a specific sitter (public profile view)
export async function fetchReviewsForSitter(sitterUserId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("sitter_user_id", sitterUserId)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw error;
  return (data as ReviewRow[]).map(rowToReview);
}

export async function submitReview(
  requestId: string,
  sitterUserId: string,
  userId: string,
  rating: number,
  comment?: string
): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      request_id: requestId,
      sitter_user_id: sitterUserId,
      owner_user_id: userId,
      rating,
      comment: comment ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToReview(data as ReviewRow);
}
