import { useState } from "react";
import type { VaccineRecord } from "../../types";
import { formatDate } from "../../utils/formatDate";

type Props = {
  vaccine: VaccineRecord;
  onEdit?: () => void;
  onDelete?: () => void;
};

function isUpcoming(dateStr?: string): boolean {
  if (!dateStr) return false;
  const due = new Date(dateStr);
  const now = new Date();
  const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 60;
}

function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function vaccineBadge(upcoming: boolean, overdue: boolean, hasDueDate: boolean) {
  if (!hasDueDate) return null;
  if (overdue) return { label: "Overdue", cls: "bg-red-50 text-[#B85C5C]" };
  if (upcoming) return { label: "Due soon", cls: "bg-parchment-200 text-terracotta-500" };
  return { label: "Up to date", cls: "bg-sage-50 text-sage-700" };
}

export default function VaccineCard({ vaccine, onEdit, onDelete }: Props) {
  const upcoming = isUpcoming(vaccine.nextDueDate);
  const overdue = isOverdue(vaccine.nextDueDate);
  const badge = vaccineBadge(upcoming, overdue, !!vaccine.nextDueDate);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{vaccine.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Dose #{vaccine.doseNumber}</p>
        </div>
        {badge && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${badge.cls}`}>
            {badge.label}
          </span>
        )}
      </div>

      <div className="space-y-1.5 text-sm">
        <Row label="Date given" value={formatDate(vaccine.dateGiven)} />
        {vaccine.nextDueDate && (
          <Row label="Next due" value={formatDate(vaccine.nextDueDate)} />
        )}
        {vaccine.clinicName && <Row label="Clinic" value={vaccine.clinicName} />}
        {vaccine.notes && (
          <p className="text-gray-400 text-xs pt-1 border-t border-parchment-200">{vaccine.notes}</p>
        )}
      </div>

      {(onEdit || onDelete) && (
        <div className="mt-3 pt-2 border-t border-parchment-200 flex items-center justify-end gap-3">
          {confirmingDelete ? (
            <>
              <span className="text-xs text-gray-500 font-medium mr-auto">Delete this record?</span>
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
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-700">{value}</span>
    </div>
  );
}
