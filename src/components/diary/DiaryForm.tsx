import { useState } from "react";
import type { DiaryEntry } from "../../types";

type Props = {
  onSubmit: (entry: DiaryEntry) => Promise<void>;
  onCancel: () => void;
  initialData?: DiaryEntry;
};

const MOODS: DiaryEntry["mood"][] = ["happy", "sleepy", "playful", "grumpy", "sick", "calm"];

const MOOD_EMOJI: Record<DiaryEntry["mood"], string> = {
  happy: "😄",
  sleepy: "😴",
  playful: "🎉",
  grumpy: "😾",
  sick: "🤒",
  calm: "😌",
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DiaryForm({ onSubmit, onCancel, initialData }: Props) {
  const isEdit = !!initialData;
  const [date, setDate] = useState(initialData?.date ?? todayISO());
  const [mood, setMood] = useState<DiaryEntry["mood"]>(initialData?.mood ?? "happy");
  const [food, setFood] = useState(initialData?.food ?? "");
  const [activity, setActivity] = useState(initialData?.activity ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        id: initialData?.id ?? `d-${Date.now()}`,
        petId: "mimi-01",
        date,
        mood,
        food: food.trim() || undefined,
        activity: activity.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } catch {
      // error toast shown by App.tsx; form stays open
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card border-rose-100 mb-6">
      <h3 className="font-semibold text-gray-700 mb-4">
        {isEdit ? "✏️ Edit Diary Entry" : "✏️ New Diary Entry"}
      </h3>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <FormField label="Date">
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            required
            className="input"
          />
        </FormField>

        <FormField label="Mood">
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value as DiaryEntry["mood"])}
            className="input"
          >
            {MOODS.map((m) => (
              <option key={m} value={m}>
                {MOOD_EMOJI[m]} {m.charAt(0).toUpperCase() + m.slice(1)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Food 🍽">
          <input
            type="text"
            value={food}
            onChange={(e) => setFood(e.target.value)}
            placeholder="What did Mimi eat today?"
            className="input"
          />
        </FormField>

        <FormField label="Activity 🎯">
          <input
            type="text"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="What did she do?"
            className="input"
          />
        </FormField>
      </div>

      <FormField label="Notes 📝">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything else to remember..."
          rows={2}
          className="input resize-none"
        />
      </FormField>

      <div className="flex gap-2 mt-4 justify-end">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-60">
          {isSubmitting ? "Saving..." : isEdit ? "Save Changes 🐾" : "Save Entry 🐾"}
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
