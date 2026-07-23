import { useState } from "react";
import type { Reminder } from "../types";
import ReminderCard from "../components/reminders/ReminderCard";
import ReminderForm from "../components/reminders/ReminderForm";

type Filter = "all" | Reminder["status"];

type Props = {
  reminders: Reminder[];
  petId: string;
  onAdd: (reminder: Reminder) => Promise<void>;
  onUpdate: (reminder: Reminder) => Promise<void>;
  onMarkDone: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function RemindersPage({ reminders, petId, onAdd, onUpdate, onMarkDone, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  async function handleAdd(reminder: Reminder) {
    await onAdd(reminder);
    setShowForm(false);
  }

  async function handleUpdate(reminder: Reminder) {
    await onUpdate(reminder);
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
          <h1 className="text-xl font-semibold text-gray-800">Care Reminders</h1>
          <p className="text-gray-400 text-sm mt-0.5">Stay on top of care routines</p>
        </div>
        {!showForm && !editingReminder && (
          <button onClick={startAdd} className="btn-primary shrink-0">
            ＋ Add Reminder
          </button>
        )}
      </div>

      {showForm && (
        <ReminderForm petId={petId} onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      )}
      {editingReminder && (
        <ReminderForm
          petId={petId}
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
                ? "bg-sage-100 text-sage-700"
                : "bg-white border border-parchment-300 text-gray-500 hover:bg-parchment-100"
            }`}
          >
            {label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                filter === value
                  ? "bg-sage-200 text-sage-700"
                  : "bg-parchment-200 text-gray-400"
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
          <p className="text-sm font-medium text-gray-500">No reminders yet</p>
          <p className="text-xs mt-1 mb-4">Add a reminder to track your pet's care routine.</p>
          <button onClick={startAdd} className="btn-primary">
            Add reminder
          </button>
        </div>
      ) : filter === "all" ? (
        <>
          {overdue.length > 0 && (
            <Group title="Overdue" reminders={overdue} onMarkDone={onMarkDone} onEdit={startEdit} onDelete={onDelete} />
          )}
          {pending.length > 0 && (
            <Group title="Pending" reminders={pending} onMarkDone={onMarkDone} onEdit={startEdit} onDelete={onDelete} />
          )}
          {done.length > 0 && (
            <Group title="Done" reminders={done} onMarkDone={onMarkDone} onEdit={startEdit} onDelete={onDelete} />
          )}
        </>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">You're all caught up.</p>
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
      <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">{title}</h2>
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
