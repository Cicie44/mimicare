import { useState, useEffect, useCallback } from "react";
import type { Conversation } from "../types";
import * as messageService from "../services/messageService";
import ConversationList from "../components/messages/ConversationList";
import ChatWindow from "../components/messages/ChatWindow";

type Props = {
  currentUserId: string;
  initialConversationId?: string;
  onUnreadCountChange: (count: number) => void;
  onBlock: (userId: string) => Promise<void>;
  showToast: (type: "success" | "error", message: string) => void;
};

export default function MessagesPage({
  currentUserId,
  initialConversationId,
  onUnreadCountChange,
  onBlock,
  showToast,
}: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    try {
      const convs = await messageService.fetchConversations(currentUserId);
      setConversations(convs);
      const total = convs.reduce((s, c) => s + c.unreadCount, 0);
      onUnreadCountChange(total);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, onUnreadCountChange, showToast]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (initialConversationId && conversations.length > 0) {
      const found = conversations.find((c) => c.id === initialConversationId);
      if (found) setActive(found);
    }
  }, [initialConversationId, conversations]);

  async function handleSelect(conv: Conversation) {
    setActive(conv);
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
    );
    const newTotal = conversations.reduce(
      (s, c) => s + (c.id === conv.id ? 0 : c.unreadCount), 0
    );
    onUnreadCountChange(newTotal);
  }

  async function handleAcceptRequest(convId: string) {
    try {
      await messageService.updateConversationStatus(convId, "active");
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, status: "active" as const } : c))
      );
      if (active?.id === convId) setActive((a) => a ? { ...a, status: "active" } : a);
      showToast("success", "Message request accepted!");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to accept request.");
    }
  }

  function handleDeclineRequest(convId: string) {
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    setActive(null);
    showToast("success", "Message request declined.");
  }

  async function handleBlock(otherUserId: string) {
    try {
      await onBlock(otherUserId);
      setConversations((prev) => prev.filter((c) => c.otherUserId !== otherUserId));
      setActive(null);
      showToast("success", "User blocked.");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to block user.");
    }
  }

  const showChat = !!active;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Messages</h2>

      <div className="bg-parchment-50 rounded-2xl border border-parchment-300 shadow-sm overflow-hidden flex" style={{ height: "calc(100vh - 200px)", minHeight: 480 }}>
        {/* Sidebar */}
        <div className={`border-r border-parchment-300 flex flex-col ${showChat ? "hidden md:flex md:w-72" : "flex-1 md:w-72"}`}>
          <div className="px-4 pt-3 pb-2 border-b border-parchment-200">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Inbox</p>
          </div>
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <ConversationList
                conversations={conversations}
                activeId={active?.id}
                onSelect={handleSelect}
              />
            </div>
          )}
        </div>

        {/* Chat area */}
        <div className={`flex-1 flex flex-col ${showChat ? "flex" : "hidden md:flex"}`}>
          {active ? (
            <ChatWindow
              key={active.id}
              conversation={active}
              currentUserId={currentUserId}
              onAcceptRequest={handleAcceptRequest}
              onDeclineRequest={handleDeclineRequest}
              onBlock={handleBlock}
              onClose={() => setActive(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <p className="text-sm font-medium">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
