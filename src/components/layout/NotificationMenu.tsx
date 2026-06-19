import { useState, useRef, useEffect } from "react";
import type { AppNotification } from "../../types";

type Props = {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
};

const typeEmoji: Record<string, string> = {
  new_application: "🙋",
  application_accepted: "✅",
  application_declined: "❌",
  visit_completed: "🎉",
  new_review: "⭐",
};

export default function NotificationMenu({ notifications, onMarkRead, onMarkAllRead }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-8 h-8 rounded-xl text-gray-500 hover:bg-orange-50 hover:text-rose-400 transition-all"
        aria-label="Notifications"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-orange-100 rounded-2xl shadow-lg w-80 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-orange-50">
            <span className="font-semibold text-gray-700 text-sm">Notifications</span>
            {unread > 0 && (
              <button
                onClick={() => { onMarkAllRead(); }}
                className="text-xs text-rose-400 hover:text-rose-500 font-medium transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-orange-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                <p className="text-2xl mb-2">🔕</p>
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <button
                  key={n.id}
                  onClick={() => { if (!n.read) onMarkRead(n.id); }}
                  className={`w-full flex items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-orange-50 ${
                    n.read ? "opacity-60" : "bg-rose-50/30"
                  }`}
                >
                  <span className="text-base mt-0.5 shrink-0">{typeEmoji[n.type] ?? "📢"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700 leading-snug">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
