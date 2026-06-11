import { useState } from "react";
import type { Reminder } from "../types";
import ReminderCard from "../components/reminders/ReminderCard";
import ReminderForm from "../components/reminders/ReminderForm";

type Props = {
  reminders: Reminder[];
  onAdd: (reminder: Reminder) => void;
  onMarkDone: (id: string) => void;
};

export default function RemindersPage({ reminders, onAdd, onMarkDone }: Props) {
  const [showForm, setShowForm] = useState(false);

  function handleAdd(reminder: Reminder) {
    onAdd(reminder);
    setShowForm(false);
  }

  const overdue = reminders.filter((r) => r.status === "overdue");
  const pending = reminders.filter((r) => r.status === "pending");
  const done = reminders.filter((r) => r.status === "done");

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            🔔 Care Reminders
          </h1>
          <p className="text-gray-400 text-sm mt-1">Stay on top of Mimi's care routine</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary shrink-0">
            ＋ Add Reminder
          </button>
        )}
      </div>

      {showForm && (
        <ReminderForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      <div className="flex gap-3 mb-6 flex-wrap">
        <Stat label="Overdue" count={overdue.length} color="text-red-500" />
        <Stat label="Pending" count={pending.length} color="text-amber-500" />
        <Stat label="Done" count={done.length} color="text-green-500" />
      </div>

      {reminders.length === 0 && !showForm ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">🔔</p>
          <p className="font-medium text-gray-500">No reminders yet</p>
          <p className="text-sm mt-1">Click "Add Reminder" to start tracking Mimi's care!</p>
        </div>
      ) : (
        <>
          {overdue.length > 0 && (
            <Group title="⚠️ Overdue" reminders={overdue} onMarkDone={onMarkDone} />
          )}
          {pending.length > 0 && (
            <Group title="📅 Pending" reminders={pending} onMarkDone={onMarkDone} />
          )}
          {done.length > 0 && (
            <Group title="✅ Done" reminders={done} onMarkDone={onMarkDone} />
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="card flex items-center gap-2 py-3 px-4">
      <span className={`text-xl font-bold ${color}`}>{count}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}

function Group({
  title,
  reminders,
  onMarkDone,
}: {
  title: string;
  reminders: Reminder[];
  onMarkDone: (id: string) => void;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {reminders.map((r) => (
          <ReminderCard
            key={r.id}
            reminder={r}
            onMarkDone={r.status !== "done" ? () => onMarkDone(r.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
