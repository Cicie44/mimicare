import type { Application } from "../../types";

type Props = {
  app: Application;
  onAccept: () => Promise<void>;
  onDecline: () => Promise<void>;
  onViewProfile?: () => void;
  busy?: boolean;
};

const statusStyle: Record<Application["status"], string> = {
  pending: "bg-amber-50 text-amber-600",
  accepted: "bg-green-50 text-green-600",
  declined: "bg-gray-50 text-gray-400",
};

const statusLabel: Record<Application["status"], string> = {
  pending: "Pending",
  accepted: "Accepted ✓",
  declined: "Declined",
};

export default function ApplicationCard({ app, onAccept, onDecline, onViewProfile, busy }: Props) {
  return (
    <div className="border border-orange-100 rounded-2xl px-3 py-2.5 bg-white space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">🙋</span>
          <div className="min-w-0">
            <p className="font-semibold text-gray-700 text-sm truncate">
              {app.applicantDisplayName ?? "Unknown User"}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(app.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusStyle[app.status]}`}>
          {statusLabel[app.status]}
        </span>
      </div>

      <p className="text-sm text-gray-600 bg-orange-50 rounded-xl px-3 py-2 leading-relaxed">
        {app.message}
      </p>

      <div className="flex items-center gap-3 pt-0.5">
        {onViewProfile && (
          <button
            onClick={onViewProfile}
            className="text-xs text-rose-400 hover:text-rose-500 font-medium transition-colors"
          >
            👤 View Profile
          </button>
        )}
        {app.status === "pending" && (
          <>
            <button
              onClick={onAccept}
              disabled={busy}
              className="text-xs font-semibold text-white bg-rose-400 hover:bg-rose-500 px-3 py-1 rounded-xl transition-colors disabled:opacity-60"
            >
              ✓ Accept
            </button>
            <button
              onClick={onDecline}
              disabled={busy}
              className="text-xs text-gray-400 hover:text-red-400 font-medium transition-colors"
            >
              ✕ Decline
            </button>
          </>
        )}
      </div>
    </div>
  );
}
