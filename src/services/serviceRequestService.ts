import { supabase } from "../lib/supabase";
import type { ServiceRequest, ServiceRequestStatus, VisitChecklist, VisitReport } from "../types";

type ServiceRequestRow = {
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
  care_instructions: string | null;
  home_access_notes: string | null;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  status: string;
  checklist: VisitChecklist;
  visit_report: VisitReport | null;
  created_at: string;
};

function rowToServiceRequest(row: ServiceRequestRow): ServiceRequest {
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
    careInstructions: row.care_instructions ?? undefined,
    homeAccessNotes: row.home_access_notes ?? undefined,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone,
    status: row.status as ServiceRequestStatus,
    checklist: row.checklist,
    visitReport: row.visit_report ?? undefined,
    createdAt: row.created_at,
  };
}

// Requests I created as owner
export async function fetchMyRequests(userId: string): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from("service_requests")
    .select("*")
    .eq("owner_user_id", userId)
    .order("visit_date", { ascending: true });
  if (error) throw error;
  return (data as ServiceRequestRow[]).map(rowToServiceRequest);
}

// Open requests from other users (marketplace)
export async function fetchPublicRequests(userId: string): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from("service_requests")
    .select("*")
    .eq("status", "open")
    .neq("owner_user_id", userId)
    .order("visit_date", { ascending: true });
  if (error) throw error;
  return (data as ServiceRequestRow[]).map(rowToServiceRequest);
}

// Requests I accepted as sitter
export async function fetchMyJobs(userId: string): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from("service_requests")
    .select("*")
    .eq("sitter_user_id", userId)
    .order("visit_date", { ascending: true });
  if (error) throw error;
  return (data as ServiceRequestRow[]).map(rowToServiceRequest);
}

export async function createServiceRequest(
  req: Omit<ServiceRequest, "id" | "createdAt">,
  userId: string
): Promise<ServiceRequest> {
  const { data, error } = await supabase
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
      care_instructions: req.careInstructions ?? null,
      home_access_notes: req.homeAccessNotes ?? null,
      emergency_contact_name: req.emergencyContactName,
      emergency_contact_phone: req.emergencyContactPhone,
      status: "open",
      checklist: req.checklist,
      visit_report: null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToServiceRequest(data as ServiceRequestRow);
}

export async function updateServiceRequest(req: ServiceRequest): Promise<void> {
  const { error } = await supabase
    .from("service_requests")
    .update({
      service_type: req.serviceType,
      visit_date: req.visitDate,
      visit_time: req.visitTime,
      duration_minutes: req.durationMinutes,
      area: req.area ?? null,
      public_description: req.publicDescription ?? null,
      care_instructions: req.careInstructions ?? null,
      home_access_notes: req.homeAccessNotes ?? null,
      emergency_contact_name: req.emergencyContactName,
      emergency_contact_phone: req.emergencyContactPhone,
    })
    .eq("id", req.id);
  if (error) throw error;
}

export async function deleteServiceRequest(id: string): Promise<void> {
  const { error } = await supabase.from("service_requests").delete().eq("id", id);
  if (error) throw error;
}

// Sitter accepts an open request
export async function acceptRequest(id: string, userId: string): Promise<ServiceRequest> {
  const { data, error } = await supabase
    .from("service_requests")
    .update({ sitter_user_id: userId, status: "accepted" })
    .eq("id", id)
    .eq("status", "open")
    .select()
    .single();
  if (error) throw error;
  return rowToServiceRequest(data as ServiceRequestRow);
}

export async function updateChecklist(id: string, checklist: VisitChecklist): Promise<void> {
  const { error } = await supabase
    .from("service_requests")
    .update({ checklist })
    .eq("id", id);
  if (error) throw error;
}

export async function saveVisitReport(id: string, report: VisitReport): Promise<void> {
  const { error } = await supabase
    .from("service_requests")
    .update({ visit_report: report, status: "completed" })
    .eq("id", id);
  if (error) throw error;
}

export async function updateStatus(id: string, status: ServiceRequestStatus): Promise<void> {
  const { error } = await supabase
    .from("service_requests")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}
