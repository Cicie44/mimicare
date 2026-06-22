import { supabase } from "../lib/supabase";
import type { AppNotification, NotificationType } from "../types";

type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  request_id: string | null;
  post_id: string | null;
  conversation_id: string | null;
  message: string;
  read: boolean;
  created_at: string;
};

function rowToNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as NotificationType,
    requestId: row.request_id ?? undefined,
    postId: row.post_id ?? undefined,
    conversationId: row.conversation_id ?? undefined,
    message: row.message,
    read: row.read,
    createdAt: row.created_at,
  };
}

export async function fetchNotifications(userId: string, limit = 50): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as NotificationRow[]).map(rowToNotification);
}

type CreateOptions = {
  postId?: string;
  conversationId?: string;
  requestId?: string;
};

export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  options?: CreateOptions | string   // string = legacy requestId
): Promise<void> {
  const opts: CreateOptions =
    typeof options === "string" ? { requestId: options } : (options ?? {});

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    message,
    request_id: opts.requestId ?? null,
    post_id: opts.postId ?? null,
    conversation_id: opts.conversationId ?? null,
    read: false,
  });
  if (error) throw error;
}

export async function markAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);
  if (error) throw error;
}

export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw error;
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw error;
  return count ?? 0;
}
