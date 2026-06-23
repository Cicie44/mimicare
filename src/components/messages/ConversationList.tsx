import type { Conversation } from "../../types";

type Props = {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (conv: Conversation) => void;
};

function timeLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ConversationList({ conversations, activeId, onSelect }: Props) {
  const requests = conversations.filter((c) => c.status === "request");
  const active = conversations.filter((c) => c.status === "active");

  function ConvItem({ conv }: { conv: Conversation }) {
    const isActive = conv.id === activeId;
    const initial = (conv.otherUserName ?? "?")[0].toUpperCase();
    return (
      <button
        onClick={() => onSelect(conv)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
          isActive
            ? "bg-sage-50 border border-sage-200"
            : "hover:bg-parchment-100 border border-transparent"
        }`}
      >
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-parchment-200 flex items-center justify-center font-bold text-sage-600 text-sm">
            {initial}
          </div>
          {conv.unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-terracotta-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-semibold truncate ${conv.unreadCount > 0 ? "text-gray-800" : "text-gray-600"}`}>
              {conv.otherUserName ?? "User"}
            </span>
            <span className="text-[10px] text-gray-400 shrink-0 ml-1">
              {timeLabel(conv.lastMessageAt)}
            </span>
          </div>
          {conv.lastMessagePreview && (
            <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? "text-gray-700 font-medium" : "text-gray-400"}`}>
              {conv.lastMessagePreview}
            </p>
          )}
        </div>
      </button>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <p className="text-sm font-medium">No messages yet</p>
        <p className="text-xs mt-1 text-center px-4">Start a chat from someone's profile or post</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 p-2">
      {requests.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-2 mb-1">
            Requests ({requests.length})
          </p>
          {requests.map((c) => <ConvItem key={c.id} conv={c} />)}
        </div>
      )}
      {active.length > 0 && (
        <div>
          {requests.length > 0 && (
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-2 mb-1 mt-3">
              Messages
            </p>
          )}
          {active.map((c) => <ConvItem key={c.id} conv={c} />)}
        </div>
      )}
    </div>
  );
}
