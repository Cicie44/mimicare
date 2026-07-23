import type { AppNotification, NotificationType } from "../../types";

const TYPE_CONFIG: Record<NotificationType, { label: string; color: string }> = {
  new_application:       { label: "OF", color: "bg-parchment-200 text-gray-600" },
  application_accepted:  { label: "OK", color: "bg-sage-50 text-sage-700" },
  application_declined:  { label: "NO", color: "bg-gray-100 text-gray-500" },
  visit_completed:       { label: "RV", color: "bg-sage-50 text-sage-700" },
  new_review:            { label: "RV", color: "bg-parchment-200 text-terracotta-500" },
  post_comment:          { label: "CM", color: "bg-parchment-100 text-gray-600" },
  post_like:             { label: "LK", color: "bg-parchment-200 text-terracotta-500" },
  comment_reply:         { label: "RP", color: "bg-parchment-100 text-gray-600" },
  new_message:           { label: "MS", color: "bg-sage-50 text-sage-600" },
  help_application:      { label: "OF", color: "bg-parchment-200 text-sage-600" },
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
      onNavigateToCommunity();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-800">Activity</h2>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-sage-600 hover:text-sage-700 transition-colors font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🐾</p>
          <p className="text-sm font-medium">No activity yet</p>
          <p className="text-xs mt-1">Post in the community to get started.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type] ?? { label: "•", color: "bg-parchment-200 text-gray-500" };
            return (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                  n.read
                    ? "bg-parchment-50 border-parchment-200 hover:bg-parchment-100"
                    : "bg-white border-parchment-300 hover:bg-parchment-50"
                }`}
              >
                <span className={`text-[10px] tracking-tight shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold ${cfg.color}`}>
                  {cfg.label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${n.read ? "text-gray-500" : "text-gray-800 font-medium"}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500 shrink-0 mt-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
