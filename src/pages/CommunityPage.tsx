import { useState, useEffect, useCallback } from "react";
import type { CommunityPost, PostApplication, UserProfile, PostCategory } from "../types";
import type { CreatePostInput } from "../services/communityService";
import * as communityService from "../services/communityService";
import * as notificationService from "../services/notificationService";
import * as userProfileService from "../services/userProfileService";
import PostCard from "../components/community/PostCard";
import PostComposer from "../components/community/PostComposer";
import UserProfileCard from "../components/community/UserProfileCard";
import ApplicationsModal from "../components/community/ApplicationsModal";
import SitterProfileForm from "../components/services/SitterProfileForm";
import { mockCommunityPosts, DEMO_POST_IDS, DEMO_PROFILES, DEMO_REVIEWS } from "../data/mockCommunityPosts";

type Tab = "for_you" | "pet_daily" | "tips" | "sitter_help" | "my_posts" | "my_profile";

const TABS: { id: Tab; label: string }[] = [
  { id: "for_you", label: "For You" },
  { id: "pet_daily", label: "Pet Daily" },
  { id: "tips", label: "Tips" },
  { id: "sitter_help", label: "Community Care" },
  { id: "my_posts", label: "My Posts" },
  { id: "my_profile", label: "My Profile" },
];

type Props = {
  currentUserId: string;
  userProfile: UserProfile | null;
  postApplications: PostApplication[];
  myPostApplications: PostApplication[];
  blockedUserIds: string[];
  onSaveProfile: (p: Omit<UserProfile, "completedVisitsCount" | "averageRating" | "reviewCount" | "postCount">) => Promise<void>;
  onApply: (postId: string, message: string, postOwnerId: string) => Promise<void>;
  onAcceptApplicant: (postId: string, appId: string, applicantUserId: string) => Promise<void>;
  onDeclineApplicant: (appId: string, applicantUserId: string) => Promise<void>;
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
  const [applicationsModalPostId, setApplicationsModalPostId] = useState<string | null>(null);

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
            post.userId, "post_like", "❤️ Someone liked your post", { postId }
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
    showToast("success", "Post published.");
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
    // Show demo profile directly without hitting the backend
    if (DEMO_PROFILES[userId]) {
      setViewingProfile(DEMO_PROFILES[userId]);
      return;
    }
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
      setPosts((prev) => prev.filter((p) => p.userId !== userId));
      showToast("success", "User blocked.");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to block user.");
    }
  }

  // Lookup maps for applications
  const appsByPost = new Map<string, PostApplication[]>();
  postApplications.forEach((a) => {
    const list = appsByPost.get(a.postId) ?? [];
    list.push(a);
    appsByPost.set(a.postId, list);
  });
  const myAppByPost = new Map(myPostApplications.map((a) => [a.postId, a]));

  // Modal post lookup
  const modalPost = applicationsModalPostId
    ? (posts.find((p) => p.id === applicationsModalPostId) ?? myPosts.find((p) => p.id === applicationsModalPostId))
    : null;
  const modalApps = applicationsModalPostId ? (appsByPost.get(applicationsModalPostId) ?? []) : [];

  const feedPosts = tab === "my_posts" ? myPosts : getFilteredPosts();
  const isProfileTab = tab === "my_profile";

  // Demo content: shown when real feed is empty (community tabs only)
  const demoPosts = (() => {
    if (tab === "for_you") return mockCommunityPosts;
    const catMap: Partial<Record<Tab, PostCategory>> = {
      pet_daily: "pet_daily",
      tips: "tips",
      sitter_help: "sitter_help",
    };
    const cat = catMap[tab];
    return cat ? mockCommunityPosts.filter((p) => p.category === cat) : [];
  })();
  const showDemo = !loading && tab !== "my_posts" && !isProfileTab && feedPosts.length === 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Applications Modal — rendered first so profile overlay sits on top */}
      {applicationsModalPostId && (
        <ApplicationsModal
          postTitle={modalPost?.title}
          applications={modalApps}
          postStatus={modalPost?.status ?? "open"}
          onAccept={(appId, applicantUserId) => {
            onAcceptApplicant(applicationsModalPostId, appId, applicantUserId);
            setApplicationsModalPostId(null);
          }}
          onDecline={(appId, applicantUserId) => {
            onDeclineApplicant(appId, applicantUserId);
          }}
          onViewProfile={handleViewProfile}
          onOpenChat={(userId) => {
            setApplicationsModalPostId(null);
            onStartConversation(userId);
          }}
          onClose={() => setApplicationsModalPostId(null)}
        />
      )}

      {/* Profile overlay — rendered after ApplicationsModal so it sits on top */}
      {viewingProfile && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-parchment-50 rounded-2xl w-full max-w-sm max-h-[80vh] overflow-y-auto p-4 border border-parchment-300 shadow-xl">
            <button
              onClick={() => setViewingProfile(null)}
              className="text-gray-400 hover:text-gray-600 mb-3 text-sm"
            >
              ← Back
            </button>
            <UserProfileCard
              profile={viewingProfile}
              recentReviews={DEMO_REVIEWS[viewingProfile.userId]}
              isOwn={viewingProfile.userId === currentUserId}
              onSendMessage={viewingProfile.userId !== currentUserId ? handleSendMessageFromProfile : undefined}
              onBlock={viewingProfile.userId !== currentUserId ? handleBlockFromProfile : undefined}
            />
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-5 -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setShowComposer(false); }}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
              tab === t.id
                ? "bg-sage-100 text-sage-700"
                : "text-gray-500 bg-parchment-50 border border-parchment-300 hover:bg-parchment-100 hover:text-sage-600"
            }`}
          >
            {t.label}
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
          {/* Ways to help — Community Care tab only */}
          {tab === "sitter_help" && !showComposer && (
            <WaysToHelp />
          )}

          {!showComposer && (
            <button
              onClick={() => setShowComposer(true)}
              className="w-full mb-5 py-3 border border-dashed border-parchment-300 rounded-2xl text-sm text-gray-400 hover:border-sage-400 hover:text-sage-600 transition-colors font-medium"
            >
              Share something with the community...
            </button>
          )}

          {showComposer && (
            <PostComposer onSubmit={handleCreatePost} onCancel={() => setShowComposer(false)} />
          )}

          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">Loading community...</p>
            </div>
          ) : tab === "my_posts" && feedPosts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🐾</p>
              <p className="text-sm font-medium">You haven't posted yet.</p>
            </div>
          ) : (
            <>
              {showDemo && (
                <div className="mb-4 bg-parchment-100 border border-parchment-300 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-xs text-gray-400">
                    Sample posts — be the first to share something with the community.
                  </p>
                </div>
              )}
              <div className="space-y-4">
                {(showDemo ? demoPosts : feedPosts).map((post) => {
                  const isDemo = DEMO_POST_IDS.has(post.id);
                  return (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={currentUserId}
                      currentUserProfile={userProfile}
                      applications={isDemo ? undefined : appsByPost.get(post.id)}
                      myApplication={isDemo ? undefined : myAppByPost.get(post.id)}
                      onLike={isDemo ? () => {} : handleLike}
                      onDelete={!isDemo && post.userId === currentUserId ? handleDeletePost : undefined}
                      onApply={!isDemo && post.userId !== currentUserId ? onApply : undefined}
                      onComplete={!isDemo ? handleComplete : undefined}
                      onViewProfile={!isDemo || DEMO_PROFILES[post.userId] ? handleViewProfile : undefined}
                      onSendMessage={!isDemo && post.userId !== currentUserId ? onStartConversation : undefined}
                      onViewApplications={
                        !isDemo && post.userId === currentUserId && post.category === "sitter_help"
                          ? () => setApplicationsModalPostId(post.id)
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

const WAYS_TO_HELP = [
  {
    title: "Feeding visits",
    desc: "Drop in to refill food, water, and litter.",
  },
  {
    title: "Lost pet lookout",
    desc: "Help neighbors keep an eye out locally.",
  },
  {
    title: "Supplies sharing",
    desc: "Offer spare food, litter, carriers, or blankets.",
  },
  {
    title: "Short-term care",
    desc: "Support pets during travel, illness, or busy weeks.",
  },
];

function WaysToHelp() {
  return (
    <div className="mb-5 bg-parchment-50 border border-parchment-300 rounded-2xl p-4">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
        Ways to help
      </p>
      <p className="text-xs text-gray-400 mb-3">
        Small ways neighbors can support pets and people nearby.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {WAYS_TO_HELP.map((item) => (
          <div
            key={item.title}
            className="bg-parchment-100 border border-parchment-200 rounded-xl px-3 py-2.5"
          >
            <p className="text-xs font-semibold text-gray-700 mb-0.5">{item.title}</p>
            <p className="text-[11px] text-gray-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
