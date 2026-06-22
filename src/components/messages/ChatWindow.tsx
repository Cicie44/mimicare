import { useState, useEffect, useRef } from "react";
import type { Conversation, Message } from "../../types";
import * as messageService from "../../services/messageService";

type Props = {
  conversation: Conversation;
  currentUserId: string;
  onAcceptRequest?: (convId: string) => void;
  onBlock?: (otherUserId: string) => void;
  onClose?: () => void;
};

export default function ChatWindow({ conversation, currentUserId, onAcceptRequest, onBlock, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isRequest = conversation.status === "request";
  const isBlocked = conversation.status === "blocked";
  const iAmInitiator = conversation.initiatedBy === currentUserId;

  useEffect(() => {
    setLoading(true);
    messageService.fetchMessages(conversation.id).then((msgs) => {
      setMessages(msgs);
      setLoading(false);
      // Mark as read
      messageService.markMessagesRead(conversation.id, currentUserId).catch(console.error);
    });
  }, [conversation.id, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending || isBlocked) return;
    setSending(true);
    try {
      const msg = await messageService.sendMessage(conversation.id, text.trim(), currentUserId);
      setMessages((prev) => [...prev, msg]);
      setText("");
    } finally {
      setSending(false);
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-orange-100 shrink-0">
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 md:hidden">
            ←
          </button>
        )}
        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center font-bold text-rose-400 text-sm shrink-0">
          {(conversation.otherUserName ?? "?")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">
            {conversation.otherUserName ?? "User"}
          </p>
          {isRequest && (
            <p className="text-[10px] text-orange-500">Message Request</p>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowActions((v) => !v)}
            className="text-gray-400 hover:text-gray-600 text-lg px-1"
          >
            ···
          </button>
          {showActions && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-orange-100 rounded-xl shadow-lg py-1 min-w-[140px] z-20">
              {onBlock && (
                <button
                  onClick={() => { onBlock(conversation.otherUserId); setShowActions(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-50 transition-colors"
                >
                  🚫 Block User
                </button>
              )}
              <button
                onClick={() => { setShowActions(false); alert("Reporting tools are coming soon."); }}
                className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                ⚑ Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Message Request Banner */}
      {isRequest && !iAmInitiator && (
        <div className="mx-4 mt-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 text-sm text-center">
          <p className="text-gray-600 mb-2">
            <strong>{conversation.otherUserName ?? "Someone"}</strong> wants to message you.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => onAcceptRequest?.(conversation.id)}
              className="btn-primary text-xs py-1.5 px-4"
            >
              Accept
            </button>
            <button
              onClick={() => onBlock?.(conversation.otherUserId)}
              className="btn-secondary text-xs py-1.5 px-4"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Blocked Banner */}
      {isBlocked && (
        <div className="mx-4 mt-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-center text-red-500">
          You have blocked this user. You cannot send or receive messages.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading ? (
          <div className="text-center text-gray-400 text-sm py-8">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            Say hello to {conversation.otherUserName ?? "them"} 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? "bg-rose-400 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-0.5 ${isMine ? "text-rose-100" : "text-gray-400"} text-right`}>
                    {formatTime(msg.createdAt)}
                    {isMine && msg.readAt && " · Read"}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isBlocked && (isRequest ? iAmInitiator : true) && (
        <form onSubmit={handleSend} className="flex gap-2 px-4 py-3 border-t border-orange-100 shrink-0">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            maxLength={1000}
            className="input flex-1 text-sm py-2"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="btn-primary text-sm py-2 px-4 disabled:opacity-60"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}
