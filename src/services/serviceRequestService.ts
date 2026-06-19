import { supabase } from "../lib/supabase";
import type { ServiceRequest, ServiceRequestStatus, VisitChecklist, VisitReport } from "../types";

// ── DB row types ──────────────────────────────────────────────────────────────

type PublicRow = {
  id: string;
  owner_user_id: string;
  sitter_user_id: string | null;
  pet_id: string;
  service_type: string;
  visit_date: string;
  visit_time: string;
  duration_minutes: number;
  area: string | null;
  public_description: string | null;
  status: string;
  created_at: string;
};

type PrivateRow = {
  request_id: string;
  care_instructions: string | null;
  home_access_notes: string | null;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  checklist: VisitChecklist;
  visit_report: VisitReport | null;
};

// Supabase may return embedded 1:1 rows as object or single-element array
type FullRow = PublicRow & {
  private_details: PrivateRow | PrivateRow[] | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMPTY_CHECKLIST: VisitChecklist = {
  feedPet: false,
  refillWater: false,
  cleanLitter: false,
  playComfortPet: false,
  sendUpdate: false,
};

const WITH_PRIVATE = "*, private_details:service_request_private_details(*)";

function resolvePrivate(row: FullRow): PrivateRow | null {
  if (!row.private_details) return null;
  return Array.isArray(row.private_details)
    ? (row.private_details[0] ?? null)
    : row.private_details;
}

function rowToServiceRequest(row: FullRow): ServiceRequest {
  const priv = resolvePrivate(row);
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    sitterUserId: row.sitter_user_id ?? undefined,
    petId: row.pet_id,
    serviceType: row.service_type,
    visitDate: row.visit_date,
    visitTime: row.visit_time,
    durationMinutes: row.duration_minutes,
    area: row.area ?? undefined,
    publicDescription: row.public_description ?? undefined,
    careInstructions: priv?.care_instructions ?? undefined,
    homeAccessNotes: priv?.home_access_notes ?? undefined,
    emergencyContactName: priv?.emergency_contact_name ?? "",
    emergencyContactPhone: priv?.emergency_contact_phone ?? "",
    status: row.status as ServiceRequestStatus,
    checklist: priv?.checklist ?? { ...EMPTY_CHECKLIST },
    visitReport: priv?.visit_report ?? undefined,
    createdAt: row.created_at,
  };
}

function publicRowToServiceRequest(row: PublicRow): ServiceRequest {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    sitterUserId: row.sitter_user_id ?? undefined,
    petId: row.pet_id,
    serviceType: row.service_type,
    visitDate: row.visit_date,
    visitTime: row.visit_time,
    durationMinutes: row.duration_minutes,
    area: row.area ?? undefined,
    publicDescription: row.public_description ?? undefined,
    // private fields intentionally omitted — not fetched for public view
    careInstructions: undefined,
    homeAccessNotes: undefined,
    emergencyContactName: "",
    emergencyContactPhone: "",
    status: row.status as ServiceRequestStatus,
    checklist: { ...EMPTY_CHECKLIST },
    visitReport: undefined,
    createdAt: row.created_at,
  };
}

// ── Queries ───────────────────────────────────────────────────────────────────

// Owner: full access to own requests including private details
export async function fetchMyRequests(userId: string): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from("service_requests")
    .select(WITH_PRIVATE)
    .eq("owner_user_id", userId)
    .order("visit_date", { ascending: true });
  if (error) throw error;
  return (data as FullRow[]).map(rowToServiceRequest);
}

// Public marketplace: only public columns — private details never fetched
export async function fetchPublicRequests(userId: string): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from("service_requests")
    .select(
      "id, owner_user_id, sitter_user_id, pet_id, service_type, visit_date, visit_time, duration_minutes, area, public_description, status, created_at"
    )
    .eq("status", "open")
    .neq("owner_user_id", userId)
    .order("visit_date", { ascending: true });
  if (error) throw error;
  return (data as PublicRow[]).map(publicRowToServiceRequest);
}

// Sitter: full access to accepted jobs including private details
export async function fetchMyJobs(userId: string): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from("service_requests")
    .select(WITH_PRIVATE)
    .eq("sitter_user_id", userId)
    .order("visit_date", { ascending: true });
  if (error) throw error;
  return (data as FullRow[]).map(rowToServiceRequest);
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createServiceRequest(
  req: Omit<ServiceRequest, "id" | "createdAt">,
  userId: string
): Promise<ServiceRequest> {
  // 1. Insert public row
  const { data: pubData, error: pubError } = await supabase
    .from("service_requests")
    .insert({
      owner_user_id: userId,
      pet_id: req.petId,
      service_type: req.serviceType,
      visit_date: req.visitDate,
      visit_time: req.visitTime,
      duration_minutes: req.durationMinutes,
      area: req.area ?? null,
      public_description: req.publicDescription ?? null,
      status: "open",
    })
    .select()
    .single();
  if (pubError) throw pubError;
  const pub = pubData as PublicRow;

  // 2. Insert private row (linked by FK)
  const privateRow: Omit<PrivateRow, never> = {
    request_id: pub.id,
    care_instructions: req.careInstructions ?? null,
    home_access_notes: req.homeAccessNotes ?? null,
    emergency_contact_name: req.emergencyContactName,
    emergency_contact_phone: req.emergencyContactPhone,
    checklist: req.checklist,
    visit_report: null,
  };
  const { error: privError } = await supabase
    .from("service_request_private_details")
    .insert(privateRow);
  if (privError) throw privError;

  return rowToServiceRequest({ ...pub, private_details: privateRow });
}

export async function updateServiceRequest(req: ServiceRequest): Promise<void> {
  const [{ error: pubError }, { error: privError }] = await Promise.all([
    supabase
      .from("service_requests")
      .update({
        service_type: req.serviceType,
        visit_date: req.visitDate,
        visit_time: req.visitTime,
        duration_minutes: req.durationMinutes,
        area: req.area ?? null,
        public_description: req.publicDescription ?? null,
      })
      .eq("id", req.id),
    supabase
      .from("service_request_private_details")
      .update({
        care_instructions: req.careInstructions ?? null,
        home_access_notes: req.homeAccessNotes ?? null,
        emergency_contact_name: req.emergencyContactName,
        emergency_contact_phone: req.emergencyContactPhone,
      })
      .eq("request_id", req.id),
  ]);
  if (pubError) throw pubError;
  if (privError) throw privError;
}

export async function deleteServiceRequest(id: string): Promise<void> {
  // ON DELETE CASCADE on service_request_private_details handles the child row
  const { error } = await supabase.from("service_requests").delete().eq("id", id);
  if (error) throw error;
}

// Any authenticated user can accept an open request — RLS enforces the guard
export async function acceptRequest(id: string, userId: string): Promise<ServiceRequest> {
  const { error } = await supabase
    .from("service_requests")
    .update({ sitter_user_id: userId, status: "accepted" })
    .eq("id", id)
    .eq("status", "open");
  if (error) throw error;

  // Now the sitter's RLS policies allow reading private details
  const { data, error: fetchError } = await supabase
    .from("service_requests")
    .select(WITH_PRIVATE)
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;
  return rowToServiceRequest(data as FullRow);
}

export async function updateChecklist(id: string, checklist: VisitChecklist): Promise<void> {
  const { error } = await supabase
    .from("service_request_private_details")
    .update({ checklist })
    .eq("request_id", id);
  if (error) throw error;
}

export async function saveVisitReport(id: string, report: VisitReport): Promise<void> {
  const [{ error: privError }, { error: pubError }] = await Promise.all([
    supabase
      .from("service_request_private_details")
      .update({ visit_report: report })
      .eq("request_id", id),
    supabase
      .from("service_requests")
      .update({ status: "completed" })
      .eq("id", id),
  ]);
  if (privError) throw privError;
  if (pubError) throw pubError;
}

export async function updateStatus(id: string, status: ServiceRequestStatus): Promise<void> {
  const { error } = await supabase
    .from("service_requests")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}
