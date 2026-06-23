import { useState, useEffect } from "react";
import type { PostComment } from "../../types";
import * as communityService from "../../services/communityService";
import * as notificationService from "../../services/notificationService";

type Props = {
  postId: string;
  postAuthorId: string;
  currentUserId: string;
  currentUserDisplayName?: string;
};

export default function CommentSection({ postId, postAuthorId, currentUserId, currentUserDisplayName }: Props) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    communityService.fetchComments(postId).then(setComments).finally(() => setLoading(false));
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const created = await communityService.addComment(postId, text.trim(), currentUserId);
      setComments((prev) => [...prev, { ...created, authorName: created.authorName ?? currentUserDisplayName }]);
      setText("");
      if (currentUserId !== postAuthorId) {
        notificationService.createNotification(
          postAuthorId, "post_comment", "Someone commented on your post",
          { postId }
        ).catch(console.error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    await communityService.deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  if (loading) {
    return <div className="mt-3 text-xs text-gray-400 text-center py-2">Loading...</div>;
  }

  return (
    <div className="mt-4 pt-4 border-t border-parchment-200">
      {comments.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2 mb-2">No comments yet.</p>
      )}
      <div className="space-y-2 mb-3">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-2 items-start">
            <div className="w-6 h-6 rounded-full bg-parchment-200 flex items-center justify-center text-[10px] font-bold text-sage-600 shrink-0 mt-0.5">
              {(c.authorName ?? "?")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 bg-parchment-100 rounded-xl px-2.5 py-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-700">{c.authorName ?? "User"}</span>
                <span className="text-[10px] text-gray-400">
                  {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                {c.userId === currentUserId && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="ml-auto text-[10px] text-gray-300 hover:text-[#B85C5C] transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-700 mt-0.5">{c.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Leave a comment..."
          maxLength={300}
          className="input text-sm flex-1 py-1.5"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="btn-primary text-xs py-1.5 px-3 disabled:opacity-60"
        >
          Post
        </button>
      </form>
    </div>
  );
}
