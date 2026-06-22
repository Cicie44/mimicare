import { useState } from "react";
import type { CommunityPost, PostApplication, UserProfile } from "../../types";
import CommentSection from "./CommentSection";

const CATEGORY_LABEL: Record<string, string> = {
  pet_daily: "🐾 Pet Daily",
  tips: "💡 Tips",
  sitter_help: "🏡 Sitter Help",
};

const COMPENSATION_LABEL: Record<string, string> = {
  volunteer: "Volunteer 💛",
  open: "Open to discuss",
  fixed: "Fixed amount",
};

type Props = {
  post: CommunityPost;
  currentUserId: string;
  currentUserProfile?: UserProfile | null;
  applications?: PostApplication[];      // owner: count badge; helper: own status
  myApplication?: PostApplication;       // helper: private status
  onLike: (postId: string, liked: boolean) => void;
  onDelete?: (postId: string) => void;
  onApply?: (postId: string, message: string, postOwnerId: string) => Promise<void>;
  onComplete?: (postId: string) => Promise<void>;
  onViewProfile?: (userId: string) => void;
  onSendMessage?: (userId: string) => void;
  onViewApplications?: () => void;   // opens modal in parent
};

export default function PostCard({
  post,
  currentUserId,
  currentUserProfile,
  applications = [],
  myApplication,
  onLike,
  onDelete,
  onApply,
  onComplete,
  onViewProfile,
  onSendMessage,
  onViewApplications,
}: Props) {
  const [showComments, setShowComments] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [applyMsg, setApplyMsg] = useState("");
  const [applying, setApplying] = useState(false);

  const isOwner = post.userId === currentUserId;
  const isSitterHelp = post.category === "sitter_help";
  const h = post.helpDetails;

  async function handleApply() {
    if (!onApply) return;
    setApplying(true);
    try {
      await onApply(post.id, applyMsg, post.userId);
      setShowApply(false);
      setApplyMsg("");
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="card border-orange-100">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-sm font-bold text-rose-400 shrink-0">
            {(post.authorName ?? "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewProfile?.(post.userId)}
                className="text-sm font-semibold text-gray-700 hover:text-rose-400 transition-colors truncate"
              >
                {post.authorName ?? "User"}
              </button>
              {!isOwner && onSendMessage && (
                <button
                  onClick={() => onSendMessage(post.userId)}
                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-400 hover:bg-rose-100 transition-colors shrink-0"
                  title="Send message"
                >
                  ✉️
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 font-medium">
            {CATEGORY_LABEL[post.category]}
          </span>
          {isSitterHelp && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                post.status === "open"
                  ? "bg-green-50 text-green-600"
                  : post.status === "accepted"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {post.status}
            </span>
          )}
          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(post.id)}
              className="text-xs text-gray-300 hover:text-red-400 transition-colors"
              title="Delete post"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      {post.title && (
        <h3 className="font-semibold text-gray-800 mb-1.5">{post.title}</h3>
      )}

      {/* Sitter Help meta */}
      {isSitterHelp && h && (
        <div className="flex flex-wrap gap-2 mb-3">
          {h.requestDate && (
            <span className="text-xs bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full">
              📅 {h.requestDate}
            </span>
          )}
          {h.area && (
            <span className="text-xs bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">
              📍 {h.area}
            </span>
          )}
          {h.petType && (
            <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
              {h.petType === "cat" ? "🐱" : h.petType === "dog" ? "🐶" : "🐾"} {h.petType}
            </span>
          )}
          {h.duration && (
            <span className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">
              ⏱ {h.duration}
            </span>
          )}
          <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
            💰 {COMPENSATION_LABEL[h.compensation]}
            {h.compensation === "fixed" && h.compensationNote ? ` — ${h.compensationNote}` : ""}
          </span>
        </div>
      )}

      {/* Content */}
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">
        {post.content}
      </p>

      {/* Image */}
      {post.signedUrl && (
        <div className="mb-3 rounded-2xl overflow-hidden">
          <img src={post.signedUrl} alt="post" className="w-full max-h-72 object-cover" />
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((t) => (
            <span key={t} className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-orange-50">
        <button
          onClick={() => onLike(post.id, post.likedByMe)}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            post.likedByMe ? "text-rose-500" : "text-gray-400 hover:text-rose-400"
          }`}
        >
          <span>{post.likedByMe ? "❤️" : "🤍"}</span>
          <span>{post.likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-rose-400 transition-colors"
        >
          <span>💬</span>
          <span>{post.commentsCount}</span>
        </button>

        {/* Owner controls — sitter help */}
        {isSitterHelp && isOwner && (
          <div className="ml-auto flex items-center gap-2">
            {onViewApplications && (
              <button
                onClick={onViewApplications}
                className="text-xs px-2.5 py-1 rounded-xl bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors font-medium"
              >
                📋 {applications.length > 0 ? `${applications.length} Application${applications.length > 1 ? "s" : ""}` : "Applications"} · View
              </button>
            )}
            {post.status === "accepted" && onComplete && (
              <button
                onClick={() => onComplete(post.id)}
                className="text-xs px-3 py-1 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition-colors font-medium"
              >
                Mark Complete ✅
              </button>
            )}
          </div>
        )}

        {/* Helper controls — private apply / status */}
        {isSitterHelp && !isOwner && (
          <div className="ml-auto flex items-center gap-2">
            {myApplication ? (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  myApplication.status === "accepted"
                    ? "bg-green-50 text-green-600"
                    : myApplication.status === "declined"
                    ? "bg-red-50 text-red-400"
                    : "bg-orange-50 text-orange-500"
                }`}
              >
                {myApplication.status === "accepted"
                  ? "✅ Accepted"
                  : myApplication.status === "declined"
                  ? "Not selected"
                  : "⏳ Applied"}
              </span>
            ) : post.status === "open" ? (
              <button
                onClick={() => setShowApply((v) => !v)}
                className="btn-primary text-xs py-1 px-3"
              >
                Apply to Help 🐾
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Apply form — private, not visible to post owner */}
      {showApply && (
        <div className="mt-3 pt-3 border-t border-orange-50">
          <p className="text-xs text-gray-400 mb-2">
            🔒 Your application is private — only the post owner can see it.
          </p>
          <textarea
            value={applyMsg}
            onChange={(e) => setApplyMsg(e.target.value)}
            placeholder="Briefly introduce yourself and why you'd like to help..."
            rows={3}
            maxLength={400}
            className="input resize-none text-sm w-full mb-2"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowApply(false)}
              className="btn-secondary text-xs py-1 px-3"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={applying || !applyMsg.trim()}
              className="btn-primary text-xs py-1 px-3 disabled:opacity-60"
            >
              {applying ? "Sending..." : "Send Application"}
            </button>
          </div>
        </div>
      )}

      {/* Comments — public discussion only */}
      {showComments && (
        <CommentSection
          postId={post.id}
          postAuthorId={post.userId}
          currentUserId={currentUserId}
          currentUserDisplayName={currentUserProfile?.displayName}
        />
      )}
    </div>
  );
}
