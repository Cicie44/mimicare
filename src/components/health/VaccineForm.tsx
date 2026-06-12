import { useState } from "react";
import type { VaccineRecord } from "../../types";

type Props = {
  onSubmit: (vaccine: VaccineRecord) => Promise<void>;
  onCancel: () => void;
  initialData?: VaccineRecord;
  petId: string;
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function VaccineForm({ onSubmit, onCancel, initialData, petId }: Props) {
  const isEdit = !!initialData;
  const [name, setName] = useState(initialData?.name ?? "");
  const [doseNumber, setDoseNumber] = useState(String(initialData?.doseNumber ?? 1));
  const [dateGiven, setDateGiven] = useState(initialData?.dateGiven ?? todayISO());
  const [nextDueDate, setNextDueDate] = useState(initialData?.nextDueDate ?? "");
  const [clinicName, setClinicName] = useState(initialData?.clinicName ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [nameError, setNameError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    setIsSubmitting(true);
    try {
      await onSubmit({
        id: initialData?.id ?? `v-${Date.now()}`,
        petId,
        name: name.trim(),
        doseNumber: Number(doseNumber) || 1,
        dateGiven,
        nextDueDate: nextDueDate || undefined,
        clinicName: clinicName.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } catch {
      // error toast shown by App.tsx; form stays open
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card border-amber-100 mb-6">
      <h3 className="font-semibold text-gray-700 mb-4">
        {isEdit ? "✏️ Edit Vaccine Record" : "💉 Add Vaccine Record"}
      </h3>

      <div className="space-y-4 mb-4">
        <FormField label="Vaccine name">
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); if (e.target.value.trim()) setNameError(false); }}
            placeholder="e.g. FVRCP (3-in-1)"
            className={`input ${nameError ? "border-red-300 focus:ring-red-200 focus:border-red-300" : ""}`}
          />
          {nameError && <p className="text-xs text-red-400 mt-1">Please enter a vaccine name 💉</p>}
        </FormField>

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Dose #">
            <input
              type="number"
              value={doseNumber}
              onChange={(e) => setDoseNumber(e.target.value)}
              min={1}
              required
              className="input"
            />
          </FormField>

          <FormField label="Date given 📅">
            <input
              type="date"
              value={dateGiven}
              onChange={(e) => setDateGiven(e.target.value)}
              required
              className="input"
            />
          </FormField>

          <FormField label="Next due date (optional)">
            <input
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="input"
            />
          </FormField>

          <FormField label="Clinic (optional)">
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder="e.g. Happy Paws Vet"
              className="input"
            />
          </FormField>
        </div>

        <FormField label="Notes (optional) 📝">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any extra details..."
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
          {isSubmitting ? "Saving..." : isEdit ? "Save Changes 💉" : "Add Record 💉"}
        </button>
      </div>
    </form>
  );
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
