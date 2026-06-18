import { useState } from "react";
import type { VisitReport } from "../../types";

const PET_MOODS = ["happy", "calm", "playful", "sleepy", "grumpy", "anxious"];

type Props = {
  onSubmit: (report: VisitReport) => Promise<void>;
  onCancel: () => void;
  initialData?: VisitReport;
};

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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
          checked ? "bg-rose-400 border-rose-400 text-white" : "border-gray-300"
        }`}
      >
        {checked && <span className="text-xs font-bold">✓</span>}
      </button>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

export default function VisitReportForm({ onSubmit, onCancel, initialData }: Props) {
  const [arrivalTime, setArrivalTime] = useState(initialData?.arrivalTime ?? "");
  const [departureTime, setDepartureTime] = useState(initialData?.departureTime ?? "");
  const [foodGiven, setFoodGiven] = useState(initialData?.foodGiven ?? false);
  const [waterRefilled, setWaterRefilled] = useState(initialData?.waterRefilled ?? false);
  const [litterCleaned, setLitterCleaned] = useState(initialData?.litterCleaned ?? false);
  const [petMood, setPetMood] = useState(initialData?.petMood ?? "calm");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        arrivalTime,
        departureTime,
        foodGiven,
        waterRefilled,
        litterCleaned,
        petMood,
        notes: notes.trim() || undefined,
      });
    } catch {
      // error toast shown by parent
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card border-green-100 mb-4 bg-green-50/40">
      <h4 className="font-semibold text-gray-700 mb-4">📋 Visit Report</h4>

      <div className="space-y-4 mb-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Arrival Time">
            <input
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              required
              className="input"
            />
          </FormField>

          <FormField label="Departure Time">
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              required
              className="input"
            />
          </FormField>
        </div>

        <FormField label="Tasks Completed">
          <div className="space-y-2 mt-1">
            <Toggle label="Food given" checked={foodGiven} onChange={setFoodGiven} />
            <Toggle label="Water refilled" checked={waterRefilled} onChange={setWaterRefilled} />
            <Toggle label="Litter cleaned" checked={litterCleaned} onChange={setLitterCleaned} />
          </div>
        </FormField>

        <FormField label="Pet Mood 🐱">
          <div className="flex flex-wrap gap-2">
            {PET_MOODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPetMood(m)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize ${
                  petMood === m
                    ? "bg-rose-100 border-rose-300 text-rose-600"
                    : "bg-white border-gray-200 text-gray-500 hover:border-rose-200"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Notes 📝">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional observations or notes..."
            rows={2}
            className="input resize-none"
          />
        </FormField>
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-60">
          {isSubmitting ? "Saving..." : "Save Report ✓"}
        </button>
      </div>
    </form>
  );
}
