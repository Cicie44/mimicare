import { useState } from "react";
import type { Reminder } from "../../types";

type Props = {
  onSubmit: (reminder: Reminder) => Promise<void>;
  onCancel: () => void;
  initialData?: Reminder;
  petId: string;
};

const CATEGORIES = ["Health", "Grooming", "Nutrition", "Hygiene", "Play"];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ReminderForm({ onSubmit, onCancel, initialData, petId }: Props) {
  const isEdit = !!initialData;
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "Health");
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? todayISO());
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [titleError, setTitleError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    setTitleError(false);
    setIsSubmitting(true);
    try {
      await onSubmit({
        id: initialData?.id ?? `r-${Date.now()}`,
        petId,
        title: title.trim(),
        category,
        dueDate,
        status: initialData?.status ?? (dueDate < todayISO() ? "overdue" : "pending"),
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
        {isEdit ? "✏️ Edit Reminder" : "➕ New Reminder"}
      </h3>

      <div className="space-y-4 mb-4">
        <FormField label="Title">
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (e.target.value.trim()) setTitleError(false); }}
            placeholder="e.g. Monthly flea & tick treatment"
            className={`input ${titleError ? "border-red-300 focus:ring-red-200 focus:border-red-300" : ""}`}
          />
          {titleError && (
            <p className="text-xs text-red-400 mt-1">Please enter a title 🐾</p>
          )}
        </FormField>

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Due Date 📅">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="input"
            />
          </FormField>
        </div>

        <FormField label="Notes 📝">
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
          {isSubmitting ? "Saving..." : isEdit ? "Save Changes 🔔" : "Add Reminder 🔔"}
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
