import type { Reminder } from "../../types";

type Props = { reminder: Reminder };

const categoryEmoji: Record<string, string> = {
  Health: "🏥",
  Grooming: "✂️",
  Nutrition: "🍖",
  Hygiene: "🧹",
  Play: "🎾",
};

const statusStyle: Record<Reminder["status"], string> = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  done: "bg-green-50 text-green-600 border-green-200",
  overdue: "bg-red-50 text-red-500 border-red-200",
};

const statusLabel: Record<Reminder["status"], string> = {
  pending: "Pending",
  done: "Done ✓",
  overdue: "Overdue ⚠️",
};

export default function ReminderCard({ reminder }: Props) {
  return (
    <div className={`card border ${statusStyle[reminder.status]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <span className="text-xl mt-0.5">
            {categoryEmoji[reminder.category] ?? "📌"}
          </span>
          <div>
            <h3 className="font-semibold text-gray-800 leading-snug">{reminder.title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{reminder.category}</p>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${statusStyle[reminder.status]}`}
        >
          {statusLabel[reminder.status]}
        </span>
      </div>

      <div className="mt-3 text-sm text-gray-500 flex items-center gap-1">
        <span>📅</span>
        <span>Due: <span className="font-medium text-gray-700">{reminder.dueDate}</span></span>
      </div>

      {reminder.notes && (
        <p className="mt-2 text-xs text-gray-400 border-t border-current border-opacity-10 pt-2">
          {reminder.notes}
        </p>
      )}
    </div>
  );
}
