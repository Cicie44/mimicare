import type { PostApplication, PostStatus } from "../../types";

type Props = {
  applications: PostApplication[];
  postStatus: PostStatus;
  onAccept?: (appId: string, applicantUserId: string) => void;
  onDecline?: (appId: string) => void;
  onViewProfile?: (userId: string) => void;
  onOpenChat?: (userId: string) => void;
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-orange-50 text-orange-500",
  accepted: "bg-green-50 text-green-600",
  declined: "bg-gray-100 text-gray-400",
};

export default function ApplicationPanel({
  applications,
  postStatus,
  onAccept,
  onDecline,
  onViewProfile,
  onOpenChat,
}: Props) {
  return (
    <div className="mt-3 pt-3 border-t border-orange-50">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        Applications ({applications.length})
      </p>
      <div className="space-y-2">
        {applications.map((app) => (
          <div
            key={app.id}
            className="flex items-start gap-2 bg-orange-50/50 rounded-xl p-2.5"
          >
            <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-400 shrink-0 mt-0.5">
              {(app.applicantDisplayName ?? "?")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <button
                  onClick={() => onViewProfile?.(app.applicantUserId)}
                  className="text-xs font-semibold text-gray-700 hover:text-rose-400 transition-colors"
                >
                  {app.applicantDisplayName ?? "User"}
                </button>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_STYLE[app.status]}`}>
                  {app.status}
                </span>
              </div>
              {app.message && (
                <p className="text-xs text-gray-600 leading-relaxed">{app.message}</p>
              )}
            </div>
            {app.status === "pending" && postStatus === "open" && (
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => onAccept?.(app.id, app.applicantUserId)}
                  className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors font-medium"
                >
                  Accept
                </button>
                <button
                  onClick={() => onDecline?.(app.id)}
                  className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-400 transition-colors font-medium"
                >
                  Decline
                </button>
              </div>
            )}
            {app.status === "accepted" && onOpenChat && (
              <button
                onClick={() => onOpenChat(app.applicantUserId)}
                className="text-xs px-2 py-1 rounded-lg bg-rose-100 text-rose-500 hover:bg-rose-200 transition-colors font-medium shrink-0"
              >
                ✉️ Chat
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
