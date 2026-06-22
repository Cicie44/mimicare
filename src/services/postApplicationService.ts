import { supabase } from "../lib/supabase";
import type { PostApplication, ApplicationStatus } from "../types";

type AppRow = {
  id: string;
  post_id: string;
  applicant_user_id: string;
  message: string | null;
  status: string;
  created_at: string;
};

function rowToApp(row: AppRow, nameMap?: Map<string, string>): PostApplication {
  return {
    id: row.id,
    postId: row.post_id,
    applicantUserId: row.applicant_user_id,
    applicantDisplayName: nameMap?.get(row.applicant_user_id),
    message: row.message ?? undefined,
    status: row.status as ApplicationStatus,
    createdAt: row.created_at,
  };
}

async function attachNames(apps: AppRow[]): Promise<PostApplication[]> {
  const ids = [...new Set(apps.map((a) => a.applicant_user_id))];
  const { data } = await supabase
    .from("user_profiles")
    .select("user_id, display_name")
    .in("user_id", ids);
  const nameMap = new Map(
    (data ?? []).map((p: { user_id: string; display_name: string }) => [p.user_id, p.display_name])
  );
  return apps.map((r) => rowToApp(r, nameMap));
}

// Applications on my sitter_help posts (owner view)
export async function fetchApplicationsForMyPosts(userId: string): Promise<PostApplication[]> {
  const { data: posts } = await supabase
    .from("community_posts")
    .select("id")
    .eq("user_id", userId)
    .eq("category", "sitter_help");
  const ids = (posts ?? []).map((p: { id: string }) => p.id);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("post_applications")
    .select("*")
    .in("post_id", ids)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return attachNames(data as AppRow[]);
}

// Applications I submitted as a helper
export async function fetchMyPostApplications(userId: string): Promise<PostApplication[]> {
  const { data, error } = await supabase
    .from("post_applications")
    .select("*")
    .eq("applicant_user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as AppRow[]).map((r) => rowToApp(r));
}

export async function applyToPost(
  postId: string,
  message: string,
  userId: string
): Promise<PostApplication> {
  const { data, error } = await supabase
    .from("post_applications")
    .insert({ post_id: postId, applicant_user_id: userId, message, status: "pending" })
    .select("*")
    .single();
  if (error) throw error;
  return rowToApp(data as AppRow);
}

export async function acceptPostApplication(
  postId: string,
  applicationId: string,
  _applicantUserId: string  // used by caller for notification
): Promise<void> {
  // Sequential to avoid partial-update if one step fails
  const { error: e1 } = await supabase
    .from("post_applications")
    .update({ status: "accepted" })
    .eq("id", applicationId);
  if (e1) throw e1;

  const { error: e2 } = await supabase
    .from("post_applications")
    .update({ status: "declined" })
    .eq("post_id", postId)
    .eq("status", "pending")
    .neq("id", applicationId);
  if (e2) throw e2;

  const { error: e3 } = await supabase
    .from("community_posts")
    .update({ status: "accepted" })
    .eq("id", postId);
  if (e3) throw e3;
}

export async function declinePostApplication(applicationId: string): Promise<void> {
  const { error } = await supabase
    .from("post_applications")
    .update({ status: "declined" })
    .eq("id", applicationId);
  if (error) throw error;
}

export async function completePost(postId: string): Promise<void> {
  const { error } = await supabase
    .from("community_posts")
    .update({ status: "completed" })
    .eq("id", postId);
  if (error) throw error;
}
