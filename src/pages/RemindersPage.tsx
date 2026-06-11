import type { Reminder } from "../types";
import ReminderCard from "../components/reminders/ReminderCard";

type Props = { reminders: Reminder[] };

export default function RemindersPage({ reminders }: Props) {
  const overdue = reminders.filter((r) => r.status === "overdue");
  const pending = reminders.filter((r) => r.status === "pending");
  const done = reminders.filter((r) => r.status === "done");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          🔔 Care Reminders
        </h1>
        <p className="text-gray-400 text-sm mt-1">Stay on top of Mimi's care routine</p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <Stat label="Overdue" count={overdue.length} color="text-red-500" />
        <Stat label="Pending" count={pending.length} color="text-amber-500" />
        <Stat label="Done" count={done.length} color="text-green-500" />
      </div>

      {overdue.length > 0 && (
        <Group title="⚠️ Overdue" reminders={overdue} />
      )}
      {pending.length > 0 && (
        <Group title="📅 Pending" reminders={pending} />
      )}
      {done.length > 0 && (
        <Group title="✅ Done" reminders={done} />
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

function Group({ title, reminders }: { title: string; reminders: Reminder[] }) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {reminders.map((r) => (
          <ReminderCard key={r.id} reminder={r} />
        ))}
      </div>
    </div>
  );
}
