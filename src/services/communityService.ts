import { supabase } from "../lib/supabase";
import type {
  CommunityPost,
  PostCategory,
  PostComment,
  SitterHelpDetails,
  CompensationType,
  PostStatus,
} from "../types";

// ── Types ─────────────────────────────────────────────────────────────────────

type PostRow = {
  id: string;
  user_id: string;
  category: string;
  title: string | null;
  content: string;
  storage_path: string | null;
  tags: string[];
  status: string;
  created_at: string;
  sitter_help_details?: HelpRow | HelpRow[] | null;
};

type HelpRow = {
  post_id: string;
  request_date: string | null;
  area: string | null;
  pet_type: string | null;
  duration: string | null;
  compensation: string;
  compensation_note: string | null;
};

type CommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveHelp(raw: HelpRow | HelpRow[] | null | undefined): HelpRow | null {
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

async function attachSignedUrls(posts: CommunityPost[]): Promise<CommunityPost[]> {
  const withPath = posts.filter((p) => p.storagePath);
  if (withPath.length === 0) return posts;
  const urls = await Promise.all(
    withPath.map((p) =>
      supabase.storage
        .from("community-posts")
        .createSignedUrl(p.storagePath!, 3600)
        .then(({ data }) => ({ id: p.id, url: data?.signedUrl }))
    )
  );
  const urlMap = new Map(urls.map((u) => [u.id, u.url]));
  return posts.map((p) => (urlMap.has(p.id) ? { ...p, signedUrl: urlMap.get(p.id) } : p));
}

function rowToPost(row: PostRow, likedIds: Set<string>, nameMap?: Map<string, string>): CommunityPost {
  const help = resolveHelp(row.sitter_help_details);
  return {
    id: row.id,
    userId: row.user_id,
    authorName: nameMap?.get(row.user_id),
    category: row.category as PostCategory,
    title: row.title ?? undefined,
    content: row.content,
    storagePath: row.storage_path ?? undefined,
    tags: row.tags,
    status: row.status as PostStatus,
    createdAt: row.created_at,
    likesCount: 0,
    commentsCount: 0,
    likedByMe: likedIds.has(row.id),
    helpDetails: help
      ? {
          postId: help.post_id,
          requestDate: help.request_date ?? undefined,
          area: help.area ?? undefined,
          petType: help.pet_type ?? undefined,
          duration: help.duration ?? undefined,
          compensation: help.compensation as CompensationType,
          compensationNote: help.compensation_note ?? undefined,
        }
      : undefined,
  };
}

function rowToComment(row: CommentRow, nameMap?: Map<string, string>): PostComment {
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    authorName: nameMap?.get(row.user_id),
    content: row.content,
    createdAt: row.created_at,
  };
}

async function fetchNameMap(userIds: string[]): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map();
  const { data } = await supabase
    .from("user_profiles")
    .select("user_id, display_name")
    .in("user_id", userIds);
  return new Map(
    (data ?? []).map((p: { user_id: string; display_name: string }) => [p.user_id, p.display_name])
  );
}

const POST_SELECT = "*, sitter_help_details(*)";

// ── Posts ─────────────────────────────────────────────────────────────────────

export async function fetchPosts(
  currentUserId: string,
  category?: PostCategory,
  limit = 30
): Promise<CommunityPost[]> {
  let q = supabase
    .from("community_posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (category) q = q.eq("category", category);

  const [{ data, error }, likesRes] = await Promise.all([
    q,
    supabase.from("post_likes").select("post_id").eq("user_id", currentUserId),
  ]);
  if (error) throw error;

  const likedIds = new Set((likesRes.data ?? []).map((l: { post_id: string }) => l.post_id));
  const rows = data as PostRow[];

  // Fetch author names separately (no direct FK between community_posts and user_profiles)
  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const nameMap = await fetchNameMap(userIds);

  let posts = rows.map((r) => rowToPost(r, likedIds, nameMap));

  // Attach like/comment counts
  const ids = posts.map((p) => p.id);
  if (ids.length > 0) {
    const [lCounts, cCounts] = await Promise.all([
      supabase.from("post_likes").select("post_id").in("post_id", ids),
      supabase.from("post_comments").select("post_id").in("post_id", ids),
    ]);
    const lMap = new Map<string, number>();
    const cMap = new Map<string, number>();
    (lCounts.data ?? []).forEach((r: { post_id: string }) => lMap.set(r.post_id, (lMap.get(r.post_id) ?? 0) + 1));
    (cCounts.data ?? []).forEach((r: { post_id: string }) => cMap.set(r.post_id, (cMap.get(r.post_id) ?? 0) + 1));
    posts = posts.map((p) => ({
      ...p,
      likesCount: lMap.get(p.id) ?? 0,
      commentsCount: cMap.get(p.id) ?? 0,
    }));
  }

  return attachSignedUrls(posts);
}

export async function fetchMyPosts(userId: string): Promise<CommunityPost[]> {
  const [{ data, error }, likesRes] = await Promise.all([
    supabase
      .from("community_posts")
      .select(POST_SELECT)
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase.from("post_likes").select("post_id").eq("user_id", userId),
  ]);
  if (error) throw error;
  const rows = data as PostRow[];
  const likedIds = new Set((likesRes.data ?? []).map((l: { post_id: string }) => l.post_id));
  const nameMap = await fetchNameMap([...new Set(rows.map((r) => r.user_id))]);
  const posts = rows.map((r) => rowToPost(r, likedIds, nameMap));
  return attachSignedUrls(posts);
}

export type CreatePostInput = {
  category: PostCategory;
  title?: string;
  content: string;
  tags: string[];
  storagePath?: string;
  helpDetails?: Omit<SitterHelpDetails, "postId">;
};

export async function createPost(
  input: CreatePostInput,
  userId: string
): Promise<CommunityPost> {
  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: userId,
      category: input.category,
      title: input.title ?? null,
      content: input.content,
      storage_path: input.storagePath ?? null,
      tags: input.tags,
      status: "open",
    })
    .select("id")
    .single();
  if (error) throw error;
  const postId = (data as { id: string }).id;

  if (input.category === "sitter_help" && input.helpDetails) {
    const h = input.helpDetails;
    await supabase.from("sitter_help_details").insert({
      post_id: postId,
      request_date: h.requestDate ?? null,
      area: h.area ?? null,
      pet_type: h.petType ?? null,
      duration: h.duration ?? null,
      compensation: h.compensation,
      compensation_note: h.compensationNote ?? null,
    });
  }

  // Re-fetch with joins
  const { data: full, error: e2 } = await supabase
    .from("community_posts")
    .select(POST_SELECT)
    .eq("id", postId)
    .single();
  if (e2) throw e2;
  const row = full as PostRow;
  const nameMap = await fetchNameMap([row.user_id]);
  const post = rowToPost(row, new Set(), nameMap);
  const [withUrls] = await attachSignedUrls([post]);
  return withUrls;
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from("community_posts").delete().eq("id", postId);
  if (error) throw error;
}

export async function updatePostStatus(postId: string, status: PostStatus): Promise<void> {
  const { error } = await supabase
    .from("community_posts")
    .update({ status })
    .eq("id", postId);
  if (error) throw error;
}

// ── Image upload ──────────────────────────────────────────────────────────────

export async function uploadPostImage(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("community-posts")
    .upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

export async function createSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("community-posts")
    .createSignedUrl(storagePath, 3600);
  if (error) throw error;
  return data.signedUrl;
}

// ── Likes ─────────────────────────────────────────────────────────────────────

export async function likePost(postId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("post_likes")
    .insert({ post_id: postId, user_id: userId });
  if (error && error.code !== "23505") throw error; // ignore duplicate
}

export async function unlikePost(postId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("post_likes")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId);
  if (error) throw error;
}

// ── Comments ──────────────────────────────────────────────────────────────────

export async function fetchComments(postId: string): Promise<PostComment[]> {
  const { data, error } = await supabase
    .from("post_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rows = data as CommentRow[];
  const nameMap = await fetchNameMap([...new Set(rows.map((r) => r.user_id))]);
  return rows.map((r) => rowToComment(r, nameMap));
}

export async function addComment(
  postId: string,
  content: string,
  userId: string
): Promise<PostComment> {
  const { data, error } = await supabase
    .from("post_comments")
    .insert({ post_id: postId, user_id: userId, content })
    .select("*")
    .single();
  if (error) throw error;
  const nameMap = await fetchNameMap([userId]);
  return rowToComment(data as CommentRow, nameMap);
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase.from("post_comments").delete().eq("id", commentId);
  if (error) throw error;
}
