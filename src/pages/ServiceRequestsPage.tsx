import { useState } from "react";
import type {
  Application,
  Review,
  ServiceRequest,
  ServiceRequestStatus,
  SitterProfile,
  VisitChecklist,
  VisitReport,
} from "../types";
import ServiceRequestCard from "../components/services/ServiceRequestCard";
import ServiceRequestForm from "../components/services/ServiceRequestForm";
import SitterProfileCard from "../components/services/SitterProfileCard";
import SitterProfileForm from "../components/services/SitterProfileForm";
import * as reviewService from "../services/reviewService";
import * as sitterProfileService from "../services/sitterProfileService";

type Tab = "my" | "public" | "jobs" | "profile";

type Props = {
  myRequests: ServiceRequest[];
  publicRequests: ServiceRequest[];
  myJobs: ServiceRequest[];
  petId: string;
  applications: Application[];
  myApplications: Application[];
  reviewsGiven: Review[];
  sitterProfile: SitterProfile | null;
  onAdd: (req: ServiceRequest) => Promise<void>;
  onUpdate: (req: ServiceRequest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  onApply: (requestId: string, message: string) => Promise<void>;
  onAcceptApplicant: (requestId: string, applicationId: string, applicantUserId: string) => Promise<void>;
  onDeclineApplicant: (applicationId: string, applicantUserId: string) => Promise<void>;
  onChecklistToggle: (id: string, checklist: VisitChecklist) => Promise<void>;
  onSaveReport: (id: string, report: VisitReport) => Promise<void>;
  onUpdateStatus: (id: string, status: ServiceRequestStatus) => Promise<void>;
  onReview: (requestId: string, sitterUserId: string, rating: number, comment?: string) => Promise<void>;
  onSaveProfile: (profile: Omit<SitterProfile, "completedVisitsCount" | "averageRating" | "reviewCount">) => Promise<void>;
};

export default function ServiceRequestsPage({
  myRequests, publicRequests, myJobs, petId,
  applications, myApplications, reviewsGiven,
  sitterProfile,
  onAdd, onUpdate, onDelete, onCancel,
  onApply, onAcceptApplicant, onDeclineApplicant,
  onChecklistToggle, onSaveReport, onUpdateStatus,
  onReview, onSaveProfile,
}: Props) {
  const [tab, setTab] = useState<Tab>("my");
  const [showForm, setShowForm] = useState(false);
  const [editingReq, setEditingReq] = useState<ServiceRequest | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);

  // Profile overlay for viewing another sitter
  const [viewingProfile, setViewingProfile] = useState<SitterProfile | null>(null);
  const [viewingReviews, setViewingReviews] = useState<Review[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  async function handleViewProfile(userId: string) {
    setProfileLoading(true);
    try {
      const [profile, reviews] = await Promise.all([
        sitterProfileService.fetchProfile(userId),
        reviewService.fetchReviewsForSitter(userId),
      ]);
      if (profile) {
        setViewingProfile(profile);
        setViewingReviews(reviews);
      }
    } catch {
      // silently fail — profile may not exist
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleAdd(req: ServiceRequest) {
    await onAdd(req);
    setShowForm(false);
  }

  async function handleUpdate(req: ServiceRequest) {
    await onUpdate(req);
    setEditingReq(null);
  }

  const tabs: { value: Tab; label: string; emoji: string; count?: number }[] = [
    { value: "my", label: "My Requests", emoji: "📋", count: myRequests.length },
    { value: "public", label: "Community", emoji: "🌐", count: publicRequests.length },
    { value: "jobs", label: "My Jobs", emoji: "🐾", count: myJobs.length },
    { value: "profile", label: "My Profile", emoji: "👤" },
  ];

  // Group applications by requestId for easy lookup
  const appsByRequest = applications.reduce<Record<string, Application[]>>((acc, app) => {
    (acc[app.requestId] ??= []).push(app);
    return acc;
  }, {});

  const myAppByRequest = myApplications.reduce<Record<string, Application>>((acc, app) => {
    acc[app.requestId] = app;
    return acc;
  }, {});

  const reviewByRequest = reviewsGiven.reduce<Record<string, Review>>((acc, r) => {
    acc[r.requestId] = r;
    return acc;
  }, {});

  return (
    <div>
      {/* Profile overlay */}
      {(viewingProfile || profileLoading) && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-start justify-center pt-16 px-4 overflow-y-auto">
          <div className="w-full max-w-md mb-8">
            {profileLoading ? (
              <div className="card text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">🐾</p>
                <p className="text-sm">Loading profile...</p>
              </div>
            ) : viewingProfile ? (
              <SitterProfileCard
                profile={viewingProfile}
                reviews={viewingReviews}
                onClose={() => { setViewingProfile(null); setViewingReviews([]); }}
              />
            ) : null}
          </div>
        </div>
      )}

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            🏡 Pet Sitting & Feeding
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Post a request, or help a neighbour's pet
          </p>
        </div>
        {tab === "my" && !showForm && !editingReq && (
          <button onClick={() => setShowForm(true)} className="btn-primary shrink-0">
            ＋ Post Request
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(({ value, label, emoji, count }) => (
          <button
            key={value}
            onClick={() => { setTab(value); setShowForm(false); setEditingReq(null); setShowProfileForm(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
              tab === value
                ? "bg-rose-100 text-rose-600"
                : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <span>{emoji}</span>
            <span>{label}</span>
            {count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                tab === value ? "bg-rose-200 text-rose-700" : "bg-gray-100 text-gray-400"
              }`}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── My Requests ── */}
      {tab === "my" && (
        <>
          {showForm && (
            <ServiceRequestForm petId={petId} onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
          )}
          {editingReq && (
            <ServiceRequestForm
              petId={petId}
              initialData={editingReq}
              onSubmit={handleUpdate}
              onCancel={() => setEditingReq(null)}
            />
          )}
          {myRequests.length === 0 && !showForm ? (
            <EmptyState icon="📋" text="No requests yet" sub='Click "Post Request" to ask the community for help' />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {myRequests.map((req) => (
                <ServiceRequestCard
                  key={req.id}
                  req={req}
                  role="owner"
                  applications={appsByRequest[req.id]}
                  existingReview={reviewByRequest[req.id]}
                  onEdit={() => { setEditingReq(req); setShowForm(false); }}
                  onDelete={() => onDelete(req.id)}
                  onCancel={onCancel}
                  onAcceptApplicant={onAcceptApplicant}
                  onDeclineApplicant={onDeclineApplicant}
                  onReview={onReview}
                  onViewProfile={handleViewProfile}
                  onChecklistToggle={onChecklistToggle}
                  onSaveReport={onSaveReport}
                  onUpdateStatus={onUpdateStatus}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Community ── */}
      {tab === "public" && (
        <>
          <div className="card bg-amber-50 border-amber-100 mb-5 flex items-start gap-3">
            <span className="text-xl">🔒</span>
            <p className="text-sm text-amber-700">
              Only the <strong>area</strong> and <strong>public description</strong> are visible here.
              Private details are shared only after the owner accepts your application.
            </p>
          </div>
          {publicRequests.length === 0 ? (
            <EmptyState icon="🌐" text="No open requests right now" sub="Check back later — new requests from neighbours will appear here" />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {publicRequests.map((req) => (
                <ServiceRequestCard
                  key={req.id}
                  req={req}
                  role="public"
                  myApplication={myAppByRequest[req.id]}
                  onApply={onApply}
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── My Jobs ── */}
      {tab === "jobs" && (
        <>
          {myJobs.length === 0 ? (
            <EmptyState icon="🐾" text="No accepted jobs yet" sub='Apply to open requests in "Community" to get started' />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {myJobs.map((req) => (
                <ServiceRequestCard
                  key={req.id}
                  req={req}
                  role="sitter"
                  onChecklistToggle={onChecklistToggle}
                  onSaveReport={onSaveReport}
                  onUpdateStatus={onUpdateStatus}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── My Profile ── */}
      {tab === "profile" && (
        <>
          {showProfileForm || !sitterProfile ? (
            <SitterProfileForm
              initialData={sitterProfile}
              onSubmit={async (profile) => {
                await onSaveProfile({ ...profile, postCount: 0 });
                setShowProfileForm(false);
              }}
              onCancel={sitterProfile ? () => setShowProfileForm(false) : undefined}
            />
          ) : (
            <div className="space-y-4">
              <SitterProfileCard profile={sitterProfile} />
              <div className="flex justify-end">
                <button
                  onClick={() => setShowProfileForm(true)}
                  className="btn-secondary text-sm"
                >
                  ✏️ Edit Profile
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({ icon, text, sub }: { icon: string; text: string; sub: string }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <p className="text-5xl mb-3">{icon}</p>
      <p className="font-medium text-gray-500">{text}</p>
      <p className="text-sm mt-1">{sub}</p>
    </div>
  );
}
