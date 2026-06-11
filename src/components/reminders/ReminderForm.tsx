import { useState } from "react";
import type { Reminder } from "../../types";

type Props = {
  onSubmit: (reminder: Reminder) => void;
  onCancel: () => void;
};

const CATEGORIES = ["Health", "Grooming", "Nutrition", "Hygiene", "Play"];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ReminderForm({ onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Health");
  const [dueDate, setDueDate] = useState(todayISO());
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      id: `r-${Date.now()}`,
      petId: "mimi-01",
      title: title.trim(),
      category,
      dueDate,
      status: "pending",
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card border-amber-100 mb-6">
      <h3 className="font-semibold text-gray-700 mb-4">➕ New Reminder</h3>

      <div className="space-y-4 mb-4">
        <FormField label="Title">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Monthly flea & tick treatment"
            required
            className="input"
          />
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
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Add Reminder 🔔
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
