import { useState } from "react";
import type { ServiceRequest, ServiceRequestStatus, VisitChecklist, VisitReport } from "../types";
import ServiceRequestCard from "../components/services/ServiceRequestCard";
import ServiceRequestForm from "../components/services/ServiceRequestForm";

type Tab = "my" | "public" | "jobs";

type Props = {
  myRequests: ServiceRequest[];
  publicRequests: ServiceRequest[];
  myJobs: ServiceRequest[];
  petId: string;
  onAdd: (req: ServiceRequest) => Promise<void>;
  onUpdate: (req: ServiceRequest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  onAccept: (id: string) => Promise<void>;
  onChecklistToggle: (id: string, checklist: VisitChecklist) => Promise<void>;
  onSaveReport: (id: string, report: VisitReport) => Promise<void>;
  onUpdateStatus: (id: string, status: ServiceRequestStatus) => Promise<void>;
};

export default function ServiceRequestsPage({
  myRequests, publicRequests, myJobs,
  petId,
  onAdd, onUpdate, onDelete, onCancel, onAccept,
  onChecklistToggle, onSaveReport, onUpdateStatus,
}: Props) {
  const [tab, setTab] = useState<Tab>("my");
  const [showForm, setShowForm] = useState(false);
  const [editingReq, setEditingReq] = useState<ServiceRequest | null>(null);

  async function handleAdd(req: ServiceRequest) {
    await onAdd(req);
    setShowForm(false);
  }

  async function handleUpdate(req: ServiceRequest) {
    await onUpdate(req);
    setEditingReq(null);
  }

  const tabs: { value: Tab; label: string; emoji: string; count: number }[] = [
    { value: "my", label: "My Requests", emoji: "📋", count: myRequests.length },
    { value: "public", label: "Community", emoji: "🌐", count: publicRequests.length },
    { value: "jobs", label: "My Jobs", emoji: "🐾", count: myJobs.length },
  ];

  return (
    <div>
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
            onClick={() => { setTab(value); setShowForm(false); setEditingReq(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
              tab === value
                ? "bg-rose-100 text-rose-600"
                : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <span>{emoji}</span>
            <span>{label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              tab === value ? "bg-rose-200 text-rose-700" : "bg-gray-100 text-gray-400"
            }`}>{count}</span>
          </button>
        ))}
      </div>

      {/* ── My Requests tab ── */}
      {tab === "my" && (
        <>
          {showForm && (
            <ServiceRequestForm
              petId={petId}
              onSubmit={handleAdd}
              onCancel={() => setShowForm(false)}
            />
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
                  onEdit={() => { setEditingReq(req); setShowForm(false); }}
                  onDelete={() => onDelete(req.id)}
                  onCancel={onCancel}
                  onChecklistToggle={onChecklistToggle}
                  onSaveReport={onSaveReport}
                  onUpdateStatus={onUpdateStatus}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Community tab ── */}
      {tab === "public" && (
        <>
          <div className="card bg-amber-50 border-amber-100 mb-5 flex items-start gap-3">
            <span className="text-xl">🔒</span>
            <p className="text-sm text-amber-700">
              Only the <strong>area</strong> and <strong>public description</strong> are visible here.
              Private details (care instructions, home access, emergency contact) are shared only after you accept a request.
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
                  onAccept={onAccept}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── My Jobs tab ── */}
      {tab === "jobs" && (
        <>
          {myJobs.length === 0 ? (
            <EmptyState icon="🐾" text="No accepted jobs yet" sub='Go to "Community" to find open requests and accept one' />
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
