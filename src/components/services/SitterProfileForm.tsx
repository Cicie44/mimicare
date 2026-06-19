import { useState } from "react";
import type { SitterProfile } from "../../types";

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ALL_SERVICE_TYPES = [
  "Feeding Visit",
  "Full Day Sitting",
  "Overnight Stay",
  "Drop-in Check",
  "Medication Administration",
];

type ProfileInput = Omit<SitterProfile, "completedVisitsCount" | "averageRating" | "reviewCount">;

type Props = {
  initialData?: SitterProfile | null;
  onSubmit: (profile: ProfileInput) => Promise<void>;
  onCancel?: () => void;
};

export default function SitterProfileForm({ initialData, onSubmit, onCancel }: Props) {
  const [displayName, setDisplayName] = useState(initialData?.displayName ?? "");
  const [bio, setBio] = useState(initialData?.bio ?? "");
  const [area, setArea] = useState(initialData?.area ?? "");
  const [hasCatExperience, setHasCatExperience] = useState(initialData?.hasCatExperience ?? true);
  const [hasDogExperience, setHasDogExperience] = useState(initialData?.hasDogExperience ?? false);
  const [availableDays, setAvailableDays] = useState<string[]>(initialData?.availableDays ?? []);
  const [preferredServiceTypes, setPreferredServiceTypes] = useState<string[]>(
    initialData?.preferredServiceTypes ?? []
  );
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState(false);

  function toggleDay(day: string) {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function toggleService(svc: string) {
    setPreferredServiceTypes((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) { setNameError(true); return; }
    setSubmitting(true);
    try {
      await onSubmit({
        userId: initialData?.userId ?? "",
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        area: area.trim() || undefined,
        hasCatExperience,
        hasDogExperience,
        availableDays,
        preferredServiceTypes,
      });
    } catch {
      // error toast shown by parent
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card border-rose-100">
      <h3 className="font-semibold text-gray-700 mb-4">
        {initialData ? "✏️ Edit My Sitter Profile" : "🐾 Create My Sitter Profile"}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Display Name *
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => { setDisplayName(e.target.value); if (e.target.value.trim()) setNameError(false); }}
            placeholder="How you appear to pet owners"
            className={`input ${nameError ? "border-red-300" : ""}`}
          />
          {nameError && <p className="text-xs text-red-400 mt-1">Required</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell owners about yourself and your pet care experience..."
            rows={3}
            maxLength={400}
            className="input resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Area / Neighbourhood 📍
          </label>
          <input
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. Taipei - Da'an District"
            className="input"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Experience</p>
          <div className="flex gap-3">
            {[
              { label: "🐱 Cats", key: "cat" as const },
              { label: "🐶 Dogs", key: "dog" as const },
            ].map(({ label, key }) => {
              const checked = key === "cat" ? hasCatExperience : hasDogExperience;
              const toggle = key === "cat" ? setHasCatExperience : setHasDogExperience;
              return (
                <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                  <button
                    type="button"
                    onClick={() => toggle(!checked)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      checked ? "bg-rose-400 border-rose-400 text-white" : "border-gray-300"
                    }`}
                  >
                    {checked && <span className="text-xs font-bold">✓</span>}
                  </button>
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Available Days</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  availableDays.includes(day)
                    ? "bg-rose-100 border-rose-300 text-rose-600"
                    : "bg-white border-gray-200 text-gray-500 hover:border-rose-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Preferred Service Types
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_SERVICE_TYPES.map((svc) => (
              <button
                key={svc}
                type="button"
                onClick={() => toggleService(svc)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  preferredServiceTypes.includes(svc)
                    ? "bg-orange-100 border-orange-300 text-orange-600"
                    : "bg-white border-gray-200 text-gray-500 hover:border-orange-200"
                }`}
              >
                {svc}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end mt-5">
        <button type="button" onClick={onCancel} disabled={submitting} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
          {submitting ? "Saving..." : "Save Profile 🐾"}
        </button>
      </div>
    </form>
  );
}
