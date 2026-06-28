import { useState } from "react";
import type {
  Application,
  Review,
  ServiceRequest,
  ServiceRequestStatus,
  VisitChecklist,
  VisitReport,
} from "../../types";
import VisitReportForm from "./VisitReportForm";
import ApplicationCard from "./ApplicationCard";
import ApplicationForm from "./ApplicationForm";
import SitterReviewForm from "./SitterReviewForm";

type Role = "owner" | "sitter" | "public";

type Props = {
  req: ServiceRequest;
  role: Role;
  // owner-only
  applications?: Application[];
  existingReview?: Review;
  onEdit?: () => void;
  onDelete?: () => void;
  onCancel?: (id: string) => Promise<void>;
  onAcceptApplicant?: (requestId: string, applicationId: string, applicantUserId: string) => Promise<void>;
  onDeclineApplicant?: (applicationId: string, applicantUserId: string) => Promise<void>;
  onReview?: (requestId: string, sitterUserId: string, rating: number, comment?: string) => Promise<void>;
  // public-only
  myApplication?: Application;
  onApply?: (requestId: string, message: string) => Promise<void>;
  onViewProfile?: (userId: string) => void;
  // sitter-only
  onChecklistToggle?: (id: string, checklist: VisitChecklist) => Promise<void>;
  onSaveReport?: (id: string, report: VisitReport) => Promise<void>;
  onUpdateStatus?: (id: string, status: ServiceRequestStatus) => Promise<void>;
};

const statusStyle: Record<ServiceRequestStatus, string> = {
  open: "bg-amber-50 text-amber-600 border-amber-200",
  accepted: "bg-blue-50 text-blue-600 border-blue-200",
  in_progress: "bg-violet-50 text-violet-600 border-violet-200",
  completed: "bg-green-50 text-green-600 border-green-200",
  cancelled: "bg-gray-100 text-gray-400 border-gray-200",
};

const statusLabel: Record<ServiceRequestStatus, string> = {
  open: "Open 📢",
  accepted: "Accepted ✅",
  in_progress: "In Progress 🐾",
  completed: "Completed 🎉",
  cancelled: "Cancelled ✕",
};

const serviceTypeEmoji: Record<string, string> = {
  "Feeding Visit": "🍽️",
  "Full Day Sitting": "🏠",
  "Overnight Stay": "🌙",
  "Drop-in Check": "👋",
  "Medication Administration": "💊",
};

const checklistLabels: { key: keyof VisitChecklist; label: string }[] = [
  { key: "feedPet", label: "Feed pet" },
  { key: "refillWater", label: "Refill water" },
  { key: "cleanLitter", label: "Clean litter" },
  { key: "playComfortPet", label: "Play / comfort pet" },
  { key: "sendUpdate", label: "Send update" },
];

const moodEmoji: Record<string, string> = {
  happy: "😄", calm: "😌", playful: "🎉", sleepy: "😴", grumpy: "😾", anxious: "😰",
};

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export default function ServiceRequestCard({
  req, role,
  applications = [], existingReview,
  onEdit, onDelete, onCancel,
  onAcceptApplicant, onDeclineApplicant, onReview,
  myApplication, onApply, onViewProfile,
  onChecklistToggle, onSaveReport, onUpdateStatus,
}: Props) {
  const [showChecklist, setShowChecklist] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showApplicants, setShowApplicants] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [busy, setBusy] = useState(false);

  async function wrap(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    try { await fn(); } finally { setBusy(false); }
  }

  function handleDelete() {
    if (window.confirm("Delete this request? This cannot be undone.")) onDelete?.();
  }

  const checklistDone = checklistLabels.filter((c) => req.checklist[c.key]).length;
  const showSensitive = role === "owner" || role === "sitter";
  const checklistInteractive = role === "sitter" && req.status !== "completed";
  const pendingApplicants = applications.filter((a) => a.status === "pending");

  return (
    <div className={`card border ${statusStyle[req.status]}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className="text-2xl mt-0.5 shrink-0">
            {serviceTypeEmoji[req.serviceType] ?? "🐾"}
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-800 leading-snug">{req.serviceType}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {req.visitDate} · {req.visitTime} · {formatDuration(req.durationMinutes)}
            </p>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap shrink-0 ${statusStyle[req.status]}`}>
          {statusLabel[req.status]}
        </span>
      </div>

      {/* Area */}
      {req.area && (
        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
          <span>📍</span><span>{req.area}</span>
        </p>
      )}

      {/* Public description */}
      {req.publicDescription && (
        <p className="mt-2 text-sm text-gray-600 bg-orange-50 rounded-lg px-3 py-2">
          {req.publicDescription}
        </p>
      )}

      {/* Sitter assigned (owner view) */}
      {role === "owner" && req.sitterUserId && (
        <div className="mt-2 flex items-center gap-2">
          <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-1.5 font-medium flex-1">
            🙋 Sitter has been assigned
          </p>
          {onViewProfile && (
            <button
              onClick={() => onViewProfile(req.sitterUserId!)}
              className="text-xs text-rose-400 hover:text-rose-500 font-medium transition-colors whitespace-nowrap"
            >
              👤 Profile
            </button>
          )}
        </div>
      )}

      {/* Sensitive details */}
      {showSensitive && (
        <div className="mt-3 space-y-1.5 border-t border-current border-opacity-10 pt-3">
          {req.careInstructions && (
            <p className="text-xs text-gray-600">
              <span className="font-semibold">📝 Care:</span> {req.careInstructions}
            </p>
          )}
          {req.homeAccessNotes && (
            <p className="text-xs text-gray-600">
              <span className="font-semibold">🔑 Access:</span> {req.homeAccessNotes}
            </p>
          )}
          {req.emergencyContactName && (
            <p className="text-xs text-gray-600">
              <span className="font-semibold">🚨 Emergency:</span>{" "}
              {req.emergencyContactName} · {req.emergencyContactPhone}
            </p>
          )}
        </div>
      )}

      {/* Owner: Applicants section */}
      {role === "owner" && req.status === "open" && (
        <div className="mt-3 border-t border-current border-opacity-10 pt-3">
          <button
            onClick={() => setShowApplicants((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-rose-400 transition-colors w-full"
          >
            <span>🙋</span>
            <span>
              Helpers ({pendingApplicants.length} pending
              {applications.length > pendingApplicants.length
                ? `, ${applications.length - pendingApplicants.length} other`
                : ""})
            </span>
            <span className="ml-auto">{showApplicants ? "▲" : "▼"}</span>
          </button>
          {showApplicants && (
            <div className="mt-2 space-y-2">
              {applications.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">No offers yet</p>
              ) : (
                applications.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    busy={busy}
                    onViewProfile={onViewProfile ? () => onViewProfile(app.applicantUserId) : undefined}
                    onAccept={() =>
                      wrap(() => onAcceptApplicant!(req.id, app.id, app.applicantUserId))
                    }
                    onDecline={() =>
                      wrap(() => onDeclineApplicant!(app.id, app.applicantUserId))
                    }
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Checklist */}
      {(req.status === "accepted" || req.status === "in_progress" || req.status === "completed") &&
        (role === "sitter" || role === "owner") && (
          <div className="mt-3 border-t border-current border-opacity-10 pt-3">
            <button
              onClick={() => setShowChecklist((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-rose-400 transition-colors w-full"
            >
              <span>☑️</span>
              <span>Checklist ({checklistDone}/{checklistLabels.length})</span>
              <span className="ml-auto">{showChecklist ? "▲" : "▼"}</span>
            </button>
            {showChecklist && (
              <ul className="mt-2 space-y-1.5">
                {checklistLabels.map(({ key, label }) => (
                  <li key={key} className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!checklistInteractive || busy}
                      onClick={() =>
                        checklistInteractive &&
                        wrap(() =>
                          onChecklistToggle!(req.id, { ...req.checklist, [key]: !req.checklist[key] })
                        )
                      }
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                        req.checklist[key]
                          ? "bg-rose-400 border-rose-400 text-white"
                          : "border-gray-300 hover:border-rose-300"
                      } disabled:opacity-50 disabled:cursor-default`}
                    >
                      {req.checklist[key] && <span className="text-xs font-bold">✓</span>}
                    </button>
                    <span className={`text-sm ${req.checklist[key] ? "line-through text-gray-400" : "text-gray-700"}`}>
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

      {/* Visit report */}
      {req.visitReport && !showReportForm && (
        <div className="mt-3 border-t border-current border-opacity-10 pt-3">
          <button
            onClick={() => setShowReport((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-green-500 transition-colors w-full"
          >
            <span>📋</span><span>Visit Report</span>
            <span className="ml-auto">{showReport ? "▲" : "▼"}</span>
          </button>
          {showReport && (
            <div className="mt-2 text-xs space-y-1 text-gray-600 bg-green-50 rounded-lg px-3 py-2">
              <p>🕐 {req.visitReport.arrivalTime} → {req.visitReport.departureTime}</p>
              <p>
                {req.visitReport.foodGiven ? "✅" : "❌"} Food ·{" "}
                {req.visitReport.waterRefilled ? "✅" : "❌"} Water ·{" "}
                {req.visitReport.litterCleaned ? "✅" : "❌"} Litter
              </p>
              <p>
                {moodEmoji[req.visitReport.petMood] ?? "🐱"} Pet was{" "}
                <span className="font-medium capitalize">{req.visitReport.petMood}</span>
              </p>
              {req.visitReport.notes && <p className="text-gray-500 italic">{req.visitReport.notes}</p>}
            </div>
          )}
        </div>
      )}

      {showReportForm && (
        <div className="mt-3">
          <VisitReportForm
            initialData={req.visitReport}
            onSubmit={async (report) => {
              await onSaveReport!(req.id, report);
              setShowReportForm(false);
            }}
            onCancel={() => setShowReportForm(false)}
          />
        </div>
      )}

      {/* Owner: review after completion */}
      {role === "owner" && req.status === "completed" && req.sitterUserId && (
        <div className="mt-3 border-t border-current border-opacity-10 pt-3">
          {existingReview ? (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{"⭐".repeat(existingReview.rating)}</span>
              <span>You reviewed this visit</span>
            </div>
          ) : showReviewForm ? (
            <SitterReviewForm
              onSubmit={async (rating, comment) => {
                await onReview!(req.id, req.sitterUserId!, rating, comment);
                setShowReviewForm(false);
              }}
              onCancel={() => setShowReviewForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowReviewForm(true)}
              className="text-xs font-semibold text-amber-500 hover:text-amber-600 transition-colors"
            >
              ⭐ Leave a Review
            </button>
          )}
        </div>
      )}

      {/* Public: apply form */}
      {role === "public" && showApplyForm && (
        <ApplicationForm
          onSubmit={async (message) => {
            await onApply!(req.id, message);
            setShowApplyForm(false);
          }}
          onCancel={() => setShowApplyForm(false)}
        />
      )}

      {/* Actions */}
      <div className="mt-3 border-t border-current border-opacity-10 pt-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-3 flex-wrap">
          {/* Public: apply button */}
          {role === "public" && req.status === "open" && !showApplyForm && (
            myApplication ? (
              <span className={`text-xs font-medium px-3 py-1 rounded-xl border ${
                myApplication.status === "accepted"
                  ? "bg-green-50 text-green-600 border-green-200"
                  : myApplication.status === "declined"
                  ? "bg-gray-50 text-gray-400 border-gray-200"
                  : "bg-blue-50 text-blue-500 border-blue-200"
              }`}>
                {myApplication.status === "accepted" ? "✓ Accepted" :
                 myApplication.status === "declined" ? "Not selected" :
                 "🕐 Applied"}
              </span>
            ) : (
              <button
                onClick={() => setShowApplyForm(true)}
                disabled={busy}
                className="text-sm font-semibold text-white bg-rose-400 hover:bg-rose-500 px-3 py-1 rounded-xl transition-colors disabled:opacity-60"
              >
                🐾 Apply
              </button>
            )
          )}

          {/* Sitter: status progression */}
          {role === "sitter" && req.status === "accepted" && (
            <button
              onClick={() => wrap(() => onUpdateStatus!(req.id, "in_progress"))}
              disabled={busy}
              className="text-xs font-semibold text-violet-500 hover:text-violet-600 transition-colors"
            >
              ▶ Start Visit
            </button>
          )}
          {role === "sitter" && req.status === "in_progress" && !req.visitReport && !showReportForm && (
            <button
              onClick={() => setShowReportForm(true)}
              className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
            >
              📋 Complete Visit
            </button>
          )}

          {/* Owner: cancel */}
          {role === "owner" && (req.status === "open" || req.status === "accepted") && (
            <button
              onClick={() => wrap(() => onCancel!(req.id))}
              disabled={busy}
              className="text-xs text-gray-400 hover:text-red-400 font-medium transition-colors"
            >
              ✕ Cancel
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {role === "owner" && req.status === "open" && onEdit && (
            <button onClick={onEdit} className="text-xs text-gray-300 hover:text-rose-400 font-medium transition-colors">
              ✏️ Edit
            </button>
          )}
          {role === "owner" && req.status === "open" && onDelete && (
            <button onClick={handleDelete} className="text-xs text-gray-300 hover:text-red-400 font-medium transition-colors">
              × Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
