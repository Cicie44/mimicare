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
  applicantUserId: string
): Promise<void> {
  const [{ error: e1 }, { error: e2 }, { error: e3 }] = await Promise.all([
    supabase.from("post_applications").update({ status: "accepted" }).eq("id", applicationId),
    supabase
      .from("post_applications")
      .update({ status: "declined" })
      .eq("post_id", postId)
      .neq("id", applicationId),
    supabase
      .from("community_posts")
      .update({ status: "accepted" })
      .eq("id", postId),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  if (e3) throw e3;
  // Store accepted sitter in help details (optional metadata — ignore error)
  await supabase
    .from("sitter_help_details")
    .update({ area: supabase.rpc ? undefined : undefined }) // no-op placeholder
    .eq("post_id", postId);
  void applicantUserId; // used by caller for notification
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
