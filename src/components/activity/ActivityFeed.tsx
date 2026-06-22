import type { AppNotification, NotificationType } from "../../types";

const TYPE_CONFIG: Record<NotificationType, { emoji: string; color: string }> = {
  new_application:       { emoji: "🙋", color: "bg-orange-50 text-orange-500" },
  application_accepted:  { emoji: "✅", color: "bg-green-50 text-green-600" },
  application_declined:  { emoji: "❌", color: "bg-red-50 text-red-400" },
  visit_completed:       { emoji: "🎉", color: "bg-purple-50 text-purple-500" },
  new_review:            { emoji: "⭐", color: "bg-yellow-50 text-yellow-600" },
  post_comment:          { emoji: "💬", color: "bg-blue-50 text-blue-500" },
  post_like:             { emoji: "❤️", color: "bg-rose-50 text-rose-500" },
  comment_reply:         { emoji: "↩️", color: "bg-indigo-50 text-indigo-500" },
  new_message:           { emoji: "✉️", color: "bg-teal-50 text-teal-500" },
  help_application:      { emoji: "🐾", color: "bg-amber-50 text-amber-600" },
};

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`;
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

type Props = {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigateToCommunity?: () => void;
  onNavigateToMessages?: () => void;
};

export default function ActivityFeed({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigateToCommunity,
  onNavigateToMessages,
}: Props) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleClick(n: AppNotification) {
    if (!n.read) onMarkRead(n.id);
    if ((n.type === "new_message" || n.type === "comment_reply") && onNavigateToMessages) {
      onNavigateToMessages();
    } else if (onNavigateToCommunity) {
      // All other notification types link back to community
      onNavigateToCommunity();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">🔔 Activity</h2>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-rose-400 hover:text-rose-600 transition-colors font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🌸</p>
          <p className="text-sm font-medium">No activity yet</p>
          <p className="text-xs mt-1">Post in the community to get started!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type] ?? { emoji: "📌", color: "bg-gray-50 text-gray-500" };
            return (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full flex items-start gap-3 p-3 rounded-2xl border transition-all text-left ${
                  n.read
                    ? "bg-white border-orange-50 hover:bg-orange-50/50"
                    : "bg-rose-50/40 border-rose-100 hover:bg-rose-50"
                }`}
              >
                <span className={`text-lg shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${cfg.color}`}>
                  {cfg.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${n.read ? "text-gray-600" : "text-gray-800 font-medium"}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
