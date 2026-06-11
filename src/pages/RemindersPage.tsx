import { useState } from "react";
import type { Reminder } from "../types";
import ReminderCard from "../components/reminders/ReminderCard";
import ReminderForm from "../components/reminders/ReminderForm";

type Filter = "all" | Reminder["status"];

type Props = {
  reminders: Reminder[];
  onAdd: (reminder: Reminder) => void;
  onUpdate: (reminder: Reminder) => void;
  onMarkDone: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function RemindersPage({ reminders, onAdd, onUpdate, onMarkDone, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  function handleAdd(reminder: Reminder) {
    onAdd(reminder);
    setShowForm(false);
  }

  function handleUpdate(reminder: Reminder) {
    onUpdate(reminder);
    setEditingReminder(null);
  }

  function startEdit(reminder: Reminder) {
    setEditingReminder(reminder);
    setShowForm(false);
  }

  function startAdd() {
    setShowForm(true);
    setEditingReminder(null);
  }

  const overdue = reminders.filter((r) => r.status === "overdue");
  const pending = reminders.filter((r) => r.status === "pending");
  const done = reminders.filter((r) => r.status === "done");
  const filtered = filter === "all" ? reminders : reminders.filter((r) => r.status === filter);

  const filterTabs: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "All", count: reminders.length },
    { value: "pending", label: "Pending", count: pending.length },
    { value: "overdue", label: "Overdue", count: overdue.length },
    { value: "done", label: "Done", count: done.length },
  ];

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            🔔 Care Reminders
          </h1>
          <p className="text-gray-400 text-sm mt-1">Stay on top of Mimi's care routine</p>
        </div>
        {!showForm && !editingReminder && (
          <button onClick={startAdd} className="btn-primary shrink-0">
            ＋ Add Reminder
          </button>
        )}
      </div>

      {showForm && (
        <ReminderForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      )}
      {editingReminder && (
        <ReminderForm
          initialData={editingReminder}
          onSubmit={handleUpdate}
          onCancel={() => setEditingReminder(null)}
        />
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filterTabs.map(({ value, label, count }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
              filter === value
                ? "bg-rose-100 text-rose-600"
                : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            {label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                filter === value
                  ? "bg-rose-200 text-rose-700"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {reminders.length === 0 && !showForm ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">🔔</p>
          <p className="font-medium text-gray-500">No reminders yet</p>
          <p className="text-sm mt-1">Click "Add Reminder" to start tracking Mimi's care!</p>
        </div>
      ) : filter === "all" ? (
        <>
          {overdue.length > 0 && (
            <Group title="⚠️ Overdue" reminders={overdue} onMarkDone={onMarkDone} onEdit={startEdit} onDelete={onDelete} />
          )}
          {pending.length > 0 && (
            <Group title="📅 Pending" reminders={pending} onMarkDone={onMarkDone} onEdit={startEdit} onDelete={onDelete} />
          )}
          {done.length > 0 && (
            <Group title="✅ Done" reminders={done} onMarkDone={onMarkDone} onEdit={startEdit} onDelete={onDelete} />
          )}
        </>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">✨</p>
          <p className="text-sm">No {filter} reminders right now</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((r) => (
            <ReminderCard
              key={r.id}
              reminder={r}
              onMarkDone={r.status !== "done" ? () => onMarkDone(r.id) : undefined}
              onEdit={() => startEdit(r)}
              onDelete={() => onDelete(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Group({
  title,
  reminders,
  onMarkDone,
  onEdit,
  onDelete,
}: {
  title: string;
  reminders: Reminder[];
  onMarkDone: (id: string) => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
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
            onEdit={() => onEdit(r)}
            onDelete={() => onDelete(r.id)}
          />
        ))}
      </div>
    </div>
  );
}
