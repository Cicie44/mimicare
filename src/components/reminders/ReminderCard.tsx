import { useState } from "react";
import type { Reminder } from "../../types";
import { formatDate } from "../../utils/formatDate";

type Props = {
  reminder: Reminder;
  onMarkDone?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

const statusStyle: Record<Reminder["status"], string> = {
  pending: "bg-parchment-200 text-gray-600 border-parchment-300",
  done: "bg-green-50 text-green-700 border-green-100",
  overdue: "bg-red-50 text-[#B85C5C] border-red-100",
};

const statusLabel: Record<Reminder["status"], string> = {
  pending: "Pending",
  done: "Done",
  overdue: "Overdue",
};

export default function ReminderCard({ reminder, onMarkDone, onEdit, onDelete }: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 leading-snug">{reminder.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{reminder.category}</p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap shrink-0 ${statusStyle[reminder.status]}`}
        >
          {statusLabel[reminder.status]}
        </span>
      </div>

      <div className="mt-3 text-sm text-gray-400">
        Due: <span className="font-medium text-gray-700">{formatDate(reminder.dueDate)}</span>
      </div>

      {reminder.notes && (
        <p className="mt-2 text-xs text-gray-400 border-t border-parchment-200 pt-2">
          {reminder.notes}
        </p>
      )}

      {(onMarkDone || onEdit || onDelete) && (
        <div className="mt-3 pt-2 border-t border-parchment-200 flex items-center justify-between">
          {confirmingDelete ? (
            <>
              <span className="text-xs text-gray-500 font-medium">Delete this record?</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setConfirmingDelete(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onDelete}
                  className="text-xs text-[#B85C5C] hover:text-red-700 font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                {reminder.status !== "done" && onMarkDone && (
                  <button
                    onClick={onMarkDone}
                    className="text-xs text-sage-600 hover:text-sage-700 font-semibold flex items-center gap-1 transition-colors"
                  >
                    ✓ Mark as done
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="text-xs text-gray-400 hover:text-sage-600 font-medium transition-colors"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    className="text-xs text-gray-400 hover:text-[#B85C5C] font-medium transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
