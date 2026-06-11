import type { VaccineRecord } from "../../types";

type Props = { vaccine: VaccineRecord };

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
  if (overdue) return { label: "⚠️ Overdue", cls: "bg-red-100 text-red-500" };
  if (upcoming) return { label: "📅 Due soon", cls: "bg-amber-100 text-amber-600" };
  return { label: "✅ Up to date", cls: "bg-green-100 text-green-600" };
}

export default function VaccineCard({ vaccine }: Props) {
  const upcoming = isUpcoming(vaccine.nextDueDate);
  const overdue = isOverdue(vaccine.nextDueDate);
  const badge = vaccineBadge(upcoming, overdue, !!vaccine.nextDueDate);

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{vaccine.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Dose #{vaccine.doseNumber}</p>
        </div>
        {badge && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${badge.cls}`}>
            {badge.label}
          </span>
        )}
      </div>

      <div className="space-y-1.5 text-sm">
        <Row label="Date given" value={vaccine.dateGiven} />
        {vaccine.nextDueDate && (
          <Row label="Next due" value={vaccine.nextDueDate} />
        )}
        {vaccine.clinicName && <Row label="Clinic" value={vaccine.clinicName} />}
        {vaccine.notes && (
          <p className="text-gray-400 text-xs pt-1 border-t border-gray-50">{vaccine.notes}</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-700">{value}</span>
    </div>
  );
}
