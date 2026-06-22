import type { PostApplication } from "../../types";

type Props = {
  postTitle?: string;
  applications: PostApplication[];
  postStatus: "open" | "accepted" | "completed";
  onAccept: (appId: string, applicantUserId: string) => void;
  onDecline: (appId: string, applicantUserId: string) => void;
  onViewProfile?: (userId: string) => void;
  onOpenChat?: (userId: string) => void;
  onClose: () => void;
};

const STATUS_STYLE: Record<string, string> = {
  pending:  "bg-orange-50 text-orange-500",
  accepted: "bg-green-50 text-green-600",
  declined: "bg-gray-100 text-gray-400",
};

export default function ApplicationsModal({
  postTitle,
  applications,
  postStatus,
  onAccept,
  onDecline,
  onViewProfile,
  onOpenChat,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-orange-50 shrink-0">
          <div>
            <h3 className="font-bold text-gray-800">Applications</h3>
            {postTitle && (
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[240px]">{postTitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {applications.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">No applications yet.</p>
          )}
          {applications.map((app) => (
            <div key={app.id} className="bg-orange-50/40 rounded-2xl p-3 border border-orange-100">
              {/* Applicant header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-sm font-bold text-rose-400 shrink-0">
                  {(app.applicantDisplayName ?? "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => onViewProfile?.(app.applicantUserId)}
                    className="text-sm font-semibold text-gray-700 hover:text-rose-400 transition-colors truncate block"
                  >
                    {app.applicantDisplayName ?? "User"}
                  </button>
                  <p className="text-[10px] text-gray-400">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_STYLE[app.status]}`}>
                  {app.status}
                </span>
              </div>

              {/* Message */}
              {app.message && (
                <p className="text-xs text-gray-600 leading-relaxed mb-2.5 pl-10">
                  {app.message}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pl-10">
                {app.status === "pending" && postStatus === "open" && (
                  <>
                    <button
                      onClick={() => onAccept(app.id, app.applicantUserId)}
                      className="text-xs px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors font-medium"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => onDecline(app.id, app.applicantUserId)}
                      className="text-xs px-3 py-1 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-400 transition-colors font-medium"
                    >
                      Decline
                    </button>
                  </>
                )}
                {app.status === "accepted" && onOpenChat && (
                  <button
                    onClick={() => onOpenChat(app.applicantUserId)}
                    className="text-xs px-3 py-1 rounded-lg bg-rose-100 text-rose-500 hover:bg-rose-200 transition-colors font-medium"
                  >
                    ✉️ Chat
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
