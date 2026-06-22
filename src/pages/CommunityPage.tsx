import { useState, useEffect, useCallback } from "react";
import type { CommunityPost, PostApplication, UserProfile, PostCategory } from "../types";
import type { CreatePostInput } from "../services/communityService";
import * as communityService from "../services/communityService";
import * as notificationService from "../services/notificationService";
import * as userProfileService from "../services/userProfileService";
import PostCard from "../components/community/PostCard";
import PostComposer from "../components/community/PostComposer";
import UserProfileCard from "../components/community/UserProfileCard";
import SitterProfileForm from "../components/services/SitterProfileForm";

type Tab = "for_you" | "pet_daily" | "tips" | "sitter_help" | "my_posts" | "my_profile";

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "for_you", label: "For You", emoji: "✨" },
  { id: "pet_daily", label: "Pet Daily", emoji: "🐾" },
  { id: "tips", label: "Tips", emoji: "💡" },
  { id: "sitter_help", label: "Sitter Help", emoji: "🏡" },
  { id: "my_posts", label: "My Posts", emoji: "📝" },
  { id: "my_profile", label: "My Profile", emoji: "👤" },
];

type Props = {
  currentUserId: string;
  userProfile: UserProfile | null;
  postApplications: PostApplication[];
  myPostApplications: PostApplication[];
  blockedUserIds: string[];
  onSaveProfile: (p: Omit<UserProfile, "completedVisitsCount" | "averageRating" | "reviewCount" | "postCount">) => Promise<void>;
  onApply: (postId: string, message: string) => Promise<void>;
  onAcceptApplicant: (postId: string, appId: string, applicantUserId: string) => Promise<void>;
  onDeclineApplicant: (appId: string) => Promise<void>;
  onComplete: (postId: string) => Promise<void>;
  onPostCreated: (post: CommunityPost) => void;
  onPostDeleted: (postId: string) => void;
  onStartConversation: (otherUserId: string) => Promise<void>;
  onBlockUser: (userId: string) => Promise<void>;
  showToast: (type: "success" | "error", message: string) => void;
};

export default function CommunityPage({
  currentUserId,
  userProfile,
  postApplications,
  myPostApplications,
  blockedUserIds,
  onSaveProfile,
  onApply,
  onAcceptApplicant,
  onDeclineApplicant,
  onComplete,
  onPostCreated,
  onPostDeleted,
  onStartConversation,
  onBlockUser,
  showToast,
}: Props) {
  const [tab, setTab] = useState<Tab>("for_you");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [myPosts, setMyPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);

  const blockedSet = new Set(blockedUserIds);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const [feed, mine] = await Promise.all([
        communityService.fetchPosts(currentUserId),
        communityService.fetchMyPosts(currentUserId),
      ]);
      setPosts(feed);
      setMyPosts(mine);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load community posts.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, showToast]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  useEffect(() => {
    if (tab === "sitter_help" || tab === "for_you") loadFeed();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter out blocked users from feed
  function getFilteredPosts(): CommunityPost[] {
    const visible = posts.filter((p) => !blockedSet.has(p.userId));
    if (tab === "for_you") return visible;
    const catMap: Partial<Record<Tab, PostCategory>> = {
      pet_daily: "pet_daily",
      tips: "tips",
      sitter_help: "sitter_help",
    };
    const cat = catMap[tab];
    return cat ? visible.filter((p) => p.category === cat) : [];
  }

  async function handleLike(postId: string, liked: boolean) {
    const post = posts.find((p) => p.id === postId) ?? myPosts.find((p) => p.id === postId);
    const update = (list: CommunityPost[]) =>
      list.map((p) =>
        p.id === postId
          ? { ...p, likedByMe: !liked, likesCount: p.likesCount + (liked ? -1 : 1) }
          : p
      );
    setPosts((prev) => update(prev));
    setMyPosts((prev) => update(prev));
    try {
      if (liked) {
        await communityService.unlikePost(postId, currentUserId);
      } else {
        await communityService.likePost(postId, currentUserId);
        if (post && post.userId !== currentUserId) {
          notificationService.createNotification(
            post.userId, "post_like", "❤️ Someone liked your post",
            { postId }
          ).catch(console.error);
        }
      }
    } catch (err) {
      console.error(err);
      const revert = (list: CommunityPost[]) =>
        list.map((p) =>
          p.id === postId
            ? { ...p, likedByMe: liked, likesCount: p.likesCount + (liked ? 1 : -1) }
            : p
        );
      setPosts((prev) => revert(prev));
      setMyPosts((prev) => revert(prev));
    }
  }

  async function handleCreatePost(input: CreatePostInput, imageFile?: File) {
    let storagePath: string | undefined;
    if (imageFile) storagePath = await communityService.uploadPostImage(imageFile, currentUserId);
    const created = await communityService.createPost({ ...input, storagePath }, currentUserId);
    setPosts((prev) => [created, ...prev]);
    setMyPosts((prev) => [created, ...prev]);
    onPostCreated(created);
    setShowComposer(false);
    showToast("success", "Post published! 🐾");
  }

  async function handleDeletePost(postId: string) {
    try {
      await communityService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setMyPosts((prev) => prev.filter((p) => p.id !== postId));
      onPostDeleted(postId);
      showToast("success", "Post deleted.");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to delete post.");
    }
  }

  async function handleComplete(postId: string) {
    await onComplete(postId);
    const update = (list: CommunityPost[]) =>
      list.map((p) => (p.id === postId ? { ...p, status: "completed" as const } : p));
    setPosts((prev) => update(prev));
    setMyPosts((prev) => update(prev));
  }

  async function handleViewProfile(userId: string) {
    try {
      const p = await userProfileService.fetchPublicProfile(userId);
      setViewingProfile(p);
    } catch {
      showToast("error", "Could not load profile.");
    }
  }

  async function handleSendMessageFromProfile(userId: string) {
    setViewingProfile(null);
    try {
      await onStartConversation(userId);
    } catch (err) {
      console.error(err);
      showToast("error", "Could not start conversation.");
    }
  }

  async function handleBlockFromProfile(userId: string) {
    setViewingProfile(null);
    try {
      await onBlockUser(userId);
      // Remove their posts from the local feed immediately
      setPosts((prev) => prev.filter((p) => p.userId !== userId));
      showToast("success", "User blocked.");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to block user.");
    }
  }

  // Lookup maps
  const appsByPost = new Map<string, PostApplication[]>();
  postApplications.forEach((a) => {
    const list = appsByPost.get(a.postId) ?? [];
    list.push(a);
    appsByPost.set(a.postId, list);
  });
  const myAppByPost = new Map(myPostApplications.map((a) => [a.postId, a]));

  const feedPosts = tab === "my_posts" ? myPosts : getFilteredPosts();
  const isProfileTab = tab === "my_profile";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile overlay */}
      {viewingProfile && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm max-h-[80vh] overflow-y-auto p-4">
            <button
              onClick={() => setViewingProfile(null)}
              className="text-gray-400 hover:text-gray-600 mb-3 text-sm"
            >
              ← Back
            </button>
            <UserProfileCard
              profile={viewingProfile}
              isOwn={viewingProfile.userId === currentUserId}
              onSendMessage={viewingProfile.userId !== currentUserId ? handleSendMessageFromProfile : undefined}
              onBlock={viewingProfile.userId !== currentUserId ? handleBlockFromProfile : undefined}
            />
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-5 -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setShowComposer(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
              tab === t.id
                ? "bg-rose-100 text-rose-600"
                : "text-gray-500 hover:bg-orange-50 hover:text-rose-400"
            }`}
          >
            <span>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* My Profile tab */}
      {isProfileTab && (
        <div>
          {editingProfile || !userProfile ? (
            <SitterProfileForm
              initialData={userProfile}
              onSubmit={async (p) => {
                await onSaveProfile(p as Omit<UserProfile, "completedVisitsCount" | "averageRating" | "reviewCount" | "postCount">);
                setEditingProfile(false);
              }}
              onCancel={userProfile ? () => setEditingProfile(false) : undefined}
            />
          ) : (
            <UserProfileCard
              profile={userProfile}
              isOwn
              onEdit={() => setEditingProfile(true)}
            />
          )}
        </div>
      )}

      {/* Feed tabs */}
      {!isProfileTab && (
        <>
          {!showComposer && (
            <button
              onClick={() => setShowComposer(true)}
              className="w-full mb-5 py-3 border-2 border-dashed border-rose-200 rounded-2xl text-sm text-gray-400 hover:border-rose-400 hover:text-rose-500 transition-colors font-medium"
            >
              ✍️ Share something with the community...
            </button>
          )}

          {showComposer && (
            <PostComposer
              onSubmit={handleCreatePost}
              onCancel={() => setShowComposer(false)}
            />
          )}

          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🐱</p>
              <p className="text-sm">Loading community...</p>
            </div>
          ) : feedPosts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🌸</p>
              <p className="text-sm font-medium">
                {tab === "my_posts" ? "You haven't posted yet." : "No posts here yet — be the first!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                  currentUserProfile={userProfile}
                  applications={appsByPost.get(post.id)}
                  myApplication={myAppByPost.get(post.id)}
                  onLike={handleLike}
                  onDelete={post.userId === currentUserId ? handleDeletePost : undefined}
                  onApply={onApply}
                  onAcceptApplicant={onAcceptApplicant}
                  onDeclineApplicant={onDeclineApplicant}
                  onComplete={handleComplete}
                  onViewProfile={handleViewProfile}
                  onSendMessage={post.userId !== currentUserId ? onStartConversation : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
