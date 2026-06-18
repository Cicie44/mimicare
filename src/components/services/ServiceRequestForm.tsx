import { useState } from "react";
import type { ServiceRequest, VisitChecklist } from "../../types";

type Props = {
  petId: string;
  onSubmit: (req: ServiceRequest) => Promise<void>;
  onCancel: () => void;
  initialData?: ServiceRequest;
};

const SERVICE_TYPES = [
  "Feeding Visit",
  "Full Day Sitting",
  "Overnight Stay",
  "Drop-in Check",
  "Medication Administration",
];

const EMPTY_CHECKLIST: VisitChecklist = {
  feedPet: false,
  refillWater: false,
  cleanLitter: false,
  playComfortPet: false,
  sendUpdate: false,
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ServiceRequestForm({ petId, onSubmit, onCancel, initialData }: Props) {
  const isEdit = !!initialData;

  const [serviceType, setServiceType] = useState(initialData?.serviceType ?? SERVICE_TYPES[0]);
  const [visitDate, setVisitDate] = useState(initialData?.visitDate ?? todayISO());
  const [visitTime, setVisitTime] = useState(initialData?.visitTime ?? "12:00");
  const [durationMinutes, setDurationMinutes] = useState(initialData?.durationMinutes ?? 60);
  const [area, setArea] = useState(initialData?.area ?? "");
  const [publicDescription, setPublicDescription] = useState(initialData?.publicDescription ?? "");
  const [careInstructions, setCareInstructions] = useState(initialData?.careInstructions ?? "");
  const [homeAccessNotes, setHomeAccessNotes] = useState(initialData?.homeAccessNotes ?? "");
  const [emergencyContactName, setEmergencyContactName] = useState(initialData?.emergencyContactName ?? "");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(initialData?.emergencyContactPhone ?? "");
  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let valid = true;
    if (!emergencyContactName.trim()) { setNameError(true); valid = false; }
    if (!emergencyContactPhone.trim()) { setPhoneError(true); valid = false; }
    if (!valid) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        id: initialData?.id ?? "",
        ownerUserId: initialData?.ownerUserId ?? "",
        sitterUserId: initialData?.sitterUserId,
        petId,
        serviceType,
        visitDate,
        visitTime,
        durationMinutes,
        area: area.trim() || undefined,
        publicDescription: publicDescription.trim() || undefined,
        careInstructions: careInstructions.trim() || undefined,
        homeAccessNotes: homeAccessNotes.trim() || undefined,
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactPhone: emergencyContactPhone.trim(),
        status: initialData?.status ?? "open",
        checklist: initialData?.checklist ?? { ...EMPTY_CHECKLIST },
        visitReport: initialData?.visitReport,
        createdAt: initialData?.createdAt,
      });
    } catch {
      // error toast shown by App.tsx
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card border-rose-100 mb-6">
      <h3 className="font-semibold text-gray-700 mb-1">
        {isEdit ? "✏️ Edit Request" : "➕ Post a Service Request"}
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        Your request will be visible to the community. Sensitive details are only shared after a sitter accepts.
      </p>

      <div className="space-y-4 mb-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Service Type">
            <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="input">
              {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>

          <FormField label="Duration (minutes) ⏱️">
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              min={15}
              max={1440}
              step={15}
              className="input"
            />
          </FormField>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Visit Date 📅">
            <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} required className="input" />
          </FormField>
          <FormField label="Visit Time 🕐">
            <input type="time" value={visitTime} onChange={(e) => setVisitTime(e.target.value)} required className="input" />
          </FormField>
        </div>

        <FormField label="Area / Neighbourhood 📍">
          <input
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. Taipei - Da'an District"
            className="input"
          />
        </FormField>

        <FormField label="Public Description (visible to all) 📢">
          <textarea
            value={publicDescription}
            onChange={(e) => setPublicDescription(e.target.value)}
            placeholder="Briefly describe what you need — no private details here"
            rows={2}
            className="input resize-none"
          />
        </FormField>

        <div className="border-t border-dashed border-orange-200 pt-4">
          <p className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-3">
            🔒 Private — only shared with accepted sitter
          </p>

          <div className="space-y-4">
            <FormField label="Care Instructions 📝">
              <textarea
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                placeholder="e.g. Feed 1/4 cup dry food at noon, give 1 treat after play..."
                rows={2}
                className="input resize-none"
              />
            </FormField>

            <FormField label="Home Access Notes 🔑">
              <textarea
                value={homeAccessNotes}
                onChange={(e) => setHomeAccessNotes(e.target.value)}
                placeholder="e.g. Key is under the mat, alarm code is 1234..."
                rows={2}
                className="input resize-none"
              />
            </FormField>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Emergency Contact Name 🚨">
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => { setEmergencyContactName(e.target.value); if (e.target.value.trim()) setNameError(false); }}
                  placeholder="e.g. Dr. Chen"
                  className={`input ${nameError ? "border-red-300" : ""}`}
                />
                {nameError && <p className="text-xs text-red-400 mt-1">Required</p>}
              </FormField>

              <FormField label="Emergency Contact Phone 📞">
                <input
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => { setEmergencyContactPhone(e.target.value); if (e.target.value.trim()) setPhoneError(false); }}
                  placeholder="e.g. +886 912 345 678"
                  className={`input ${phoneError ? "border-red-300" : ""}`}
                />
                {phoneError && <p className="text-xs text-red-400 mt-1">Required</p>}
              </FormField>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-60">
          {isSubmitting ? "Saving..." : isEdit ? "Save Changes 🐾" : "Post Request 🐾"}
        </button>
      </div>
    </form>
  );
}
