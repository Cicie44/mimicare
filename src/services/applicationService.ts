import { supabase } from "../lib/supabase";
import type { Application, ApplicationStatus } from "../types";

type ApplicationRow = {
  id: string;
  request_id: string;
  applicant_user_id: string;
  message: string;
  status: string;
  created_at: string;
  sitter_profiles?: { display_name: string } | null;
};

function rowToApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    requestId: row.request_id,
    applicantUserId: row.applicant_user_id,
    applicantDisplayName:
      row.sitter_profiles && !Array.isArray(row.sitter_profiles)
        ? row.sitter_profiles.display_name
        : Array.isArray(row.sitter_profiles)
        ? (row.sitter_profiles as { display_name: string }[])[0]?.display_name
        : undefined,
    message: row.message,
    status: row.status as ApplicationStatus,
    createdAt: row.created_at,
  };
}

// Applications on requests I own (as owner)
export async function fetchApplicationsForMyRequests(
  userId: string
): Promise<Application[]> {
  const { data: reqs, error: reqErr } = await supabase
    .from("service_requests")
    .select("id")
    .eq("owner_user_id", userId);
  if (reqErr) throw reqErr;
  const ids = (reqs ?? []).map((r: { id: string }) => r.id);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .in("request_id", ids)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const apps = data as ApplicationRow[];

  // Fetch display names separately (no direct FK between applications → sitter_profiles)
  const applicantIds = [...new Set(apps.map((a) => a.applicant_user_id))];
  const { data: profiles } = await supabase
    .from("sitter_profiles")
    .select("user_id, display_name")
    .in("user_id", applicantIds);
  const nameMap = new Map(
    (profiles ?? []).map((p: { user_id: string; display_name: string }) => [p.user_id, p.display_name])
  );

  return apps.map((row) => rowToApplication({ ...row, sitter_profiles: nameMap.has(row.applicant_user_id) ? { display_name: nameMap.get(row.applicant_user_id)! } : null }));
}

// Applications I submitted as a potential sitter
export async function fetchMyApplications(userId: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("applicant_user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ApplicationRow[]).map(rowToApplication);
}

export async function applyToRequest(
  requestId: string,
  message: string,
  userId: string
): Promise<Application> {
  const { data, error } = await supabase
    .from("applications")
    .insert({ request_id: requestId, applicant_user_id: userId, message, status: "pending" })
    .select("*")
    .single();
  if (error) throw error;
  return rowToApplication(data as ApplicationRow);
}

// Owner accepts one applicant — declines all others for the same request
export async function acceptApplication(
  requestId: string,
  applicationId: string,
  applicantUserId: string
): Promise<void> {
  const [{ error: e1 }, { error: e2 }, { error: e3 }] = await Promise.all([
    supabase.from("applications").update({ status: "accepted" }).eq("id", applicationId),
    supabase
      .from("applications")
      .update({ status: "declined" })
      .eq("request_id", requestId)
      .neq("id", applicationId),
    supabase
      .from("service_requests")
      .update({ sitter_user_id: applicantUserId, status: "accepted" })
      .eq("id", requestId),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  if (e3) throw e3;
}

export async function declineApplication(applicationId: string): Promise<void> {
  const { error } = await supabase
    .from("applications")
    .update({ status: "declined" })
    .eq("id", applicationId);
  if (error) throw error;
}
