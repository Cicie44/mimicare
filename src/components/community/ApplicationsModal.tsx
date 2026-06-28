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
  pending:  "bg-parchment-200 text-gray-600",
  accepted: "bg-green-50 text-green-700",
  declined: "bg-gray-100 text-gray-400",
};

const STATUS_LABEL: Record<string, string> = {
  pending:  "Pending review",
  accepted: "Accepted",
  declined: "Declined",
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
      <div className="bg-parchment-50 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl border border-parchment-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-parchment-200 shrink-0">
          <div>
            <h3 className="font-semibold text-gray-800">Offers</h3>
            {postTitle && (
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[240px]">{postTitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-parchment-200 flex items-center justify-center text-gray-400 hover:bg-parchment-300 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {applications.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">No offers yet.</p>
          )}
          {applications.map((app) => (
            <div key={app.id} className="bg-parchment-100 rounded-xl p-3 border border-parchment-300">
              {/* Applicant header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-parchment-200 flex items-center justify-center text-sm font-bold text-sage-600 shrink-0">
                  {(app.applicantDisplayName ?? "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => onViewProfile?.(app.applicantUserId)}
                    className="text-sm font-semibold text-gray-700 hover:text-sage-600 transition-colors truncate block"
                  >
                    {app.applicantDisplayName ?? "User"}
                  </button>
                  <p className="text-[10px] text-gray-400">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_STYLE[app.status]}`}>
                  {STATUS_LABEL[app.status] ?? app.status}
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
                      className="text-xs px-3 py-1 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-[#B85C5C] transition-colors font-medium"
                    >
                      Decline
                    </button>
                  </>
                )}
                {app.status === "accepted" && onOpenChat && (
                  <button
                    onClick={() => onOpenChat(app.applicantUserId)}
                    className="text-xs px-3 py-1 rounded-lg bg-sage-100 text-sage-700 hover:bg-sage-200 transition-colors font-medium"
                  >
                    Open Chat
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
