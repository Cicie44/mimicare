import { supabase } from "../lib/supabase";
import type { Conversation, ConversationStatus, Message } from "../types";

// ── DB row types ──────────────────────────────────────────────────────────────

type ConvRow = {
  id: string;
  participant_a: string;
  participant_b: string;
  status: string;
  initiated_by: string | null;
  last_message_at: string;
  created_at: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

// Canonical ordering: smaller UUID string goes to participant_a
function ordered(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

function rowToMessage(row: MessageRow): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content,
    readAt: row.read_at ?? undefined,
    createdAt: row.created_at,
  };
}

function rowToConversation(row: ConvRow, currentUserId: string, nameMap: Map<string, string>): Conversation {
  const otherUserId = row.participant_a === currentUserId ? row.participant_b : row.participant_a;
  return {
    id: row.id,
    participantA: row.participant_a,
    participantB: row.participant_b,
    status: row.status as ConversationStatus,
    initiatedBy: row.initiated_by ?? undefined,
    lastMessageAt: row.last_message_at,
    createdAt: row.created_at,
    otherUserId,
    otherUserName: nameMap.get(otherUserId),
    unreadCount: 0,  // enriched separately
  };
}

// ── Conversations ─────────────────────────────────────────────────────────────

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
    .order("last_message_at", { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as ConvRow[];
  if (rows.length === 0) return [];

  // Fetch display names for all other participants
  const otherIds = rows.map((r) => r.participant_a === userId ? r.participant_b : r.participant_a);
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("user_id, display_name")
    .in("user_id", [...new Set(otherIds)]);
  const nameMap = new Map(
    (profiles ?? []).map((p: { user_id: string; display_name: string }) => [p.user_id, p.display_name])
  );

  // Fetch last message per conversation
  const convIds = rows.map((r) => r.id);
  const { data: lastMsgs } = await supabase
    .from("messages")
    .select("conversation_id, content, created_at")
    .in("conversation_id", convIds)
    .order("created_at", { ascending: false });

  const lastMsgMap = new Map<string, string>();
  (lastMsgs ?? []).forEach((m: { conversation_id: string; content: string }) => {
    if (!lastMsgMap.has(m.conversation_id)) lastMsgMap.set(m.conversation_id, m.content);
  });

  // Count unread messages per conversation (not sent by me, not yet read)
  const { data: unreadData } = await supabase
    .from("messages")
    .select("conversation_id")
    .in("conversation_id", convIds)
    .neq("sender_id", userId)
    .is("read_at", null);

  const unreadMap = new Map<string, number>();
  (unreadData ?? []).forEach((m: { conversation_id: string }) => {
    unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) ?? 0) + 1);
  });

  return rows.map((r) => ({
    ...rowToConversation(r, userId, nameMap),
    lastMessagePreview: lastMsgMap.get(r.id),
    unreadCount: unreadMap.get(r.id) ?? 0,
  }));
}

// Find existing conversation between two users (or null)
export async function findConversation(userId1: string, userId2: string): Promise<Conversation | null> {
  const [a, b] = ordered(userId1, userId2);
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("participant_a", a)
    .eq("participant_b", b)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const nameMap = new Map<string, string>();
  return rowToConversation(data as ConvRow, userId1, nameMap);
}

// Get or create a conversation. Returns {conversation, isNew}
export async function findOrCreateConversation(
  currentUserId: string,
  otherUserId: string,
  status: ConversationStatus = "request"
): Promise<Conversation> {
  const [a, b] = ordered(currentUserId, otherUserId);

  // Try to find existing
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("participant_a", a)
    .eq("participant_b", b)
    .maybeSingle();

  if (existing) {
    return rowToConversation(existing as ConvRow, currentUserId, new Map());
  }

  // Create new
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      participant_a: a,
      participant_b: b,
      status,
      initiated_by: currentUserId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return rowToConversation(data as ConvRow, currentUserId, new Map());
}

// Activate a conversation (request → active), used when application accepted
export async function activateConversation(userId1: string, userId2: string): Promise<Conversation> {
  const [a, b] = ordered(userId1, userId2);

  // Upsert: activate if exists, create as active if not
  const { data, error } = await supabase
    .from("conversations")
    .upsert(
      { participant_a: a, participant_b: b, status: "active", initiated_by: userId1 },
      { onConflict: "participant_a,participant_b" }
    )
    .select("*")
    .single();
  if (error) throw error;
  return rowToConversation(data as ConvRow, userId1, new Map());
}

export async function updateConversationStatus(
  conversationId: string,
  status: ConversationStatus
): Promise<void> {
  const { error } = await supabase
    .from("conversations")
    .update({ status })
    .eq("id", conversationId);
  if (error) throw error;
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function fetchMessages(conversationId: string, limit = 60): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data as MessageRow[]).map(rowToMessage);
}

export async function sendMessage(
  conversationId: string,
  content: string,
  senderId: string
): Promise<Message> {
  // Insert message + update conversation last_message_at in parallel
  const [{ data, error }] = await Promise.all([
    supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: senderId, content })
      .select("*")
      .single(),
    supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId),
  ]);
  if (error) throw error;
  return rowToMessage(data as MessageRow);
}

// Mark all unread messages in a conversation as read (for the recipient)
export async function markMessagesRead(conversationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .is("read_at", null);
  if (error) throw error;
}

// Total unread message count across all conversations
export async function fetchUnreadMessageCount(userId: string): Promise<number> {
  // Get user's conversation IDs first
  const { data: convs } = await supabase
    .from("conversations")
    .select("id")
    .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
    .neq("status", "blocked");

  if (!convs || convs.length === 0) return 0;
  const ids = convs.map((c: { id: string }) => c.id);

  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("conversation_id", ids)
    .neq("sender_id", userId)
    .is("read_at", null);
  if (error) throw error;
  return count ?? 0;
}

// ── Block / Unblock ───────────────────────────────────────────────────────────

export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  // Insert block record
  const { error: e1 } = await supabase
    .from("blocked_users")
    .insert({ blocker_id: blockerId, blocked_id: blockedId });
  if (e1 && e1.code !== "23505") throw e1; // ignore duplicate

  // Mark any existing conversation as blocked
  const [a, b] = ordered(blockerId, blockedId);
  await supabase
    .from("conversations")
    .update({ status: "blocked" })
    .eq("participant_a", a)
    .eq("participant_b", b);
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  await supabase
    .from("blocked_users")
    .delete()
    .eq("blocker_id", blockerId)
    .eq("blocked_id", blockedId);

  // Restore conversation to active if it exists
  const [a, b] = ordered(blockerId, blockedId);
  await supabase
    .from("conversations")
    .update({ status: "active" })
    .eq("participant_a", a)
    .eq("participant_b", b)
    .eq("status", "blocked");
}

export async function fetchBlockedUserIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("blocked_users")
    .select("blocked_id")
    .eq("blocker_id", userId);
  if (error) throw error;
  return (data ?? []).map((r: { blocked_id: string }) => r.blocked_id);
}
