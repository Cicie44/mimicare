import type { VaccineRecord } from "../types";
import VaccineCard from "../components/health/VaccineCard";

type Props = { vaccines: VaccineRecord[] };

export default function VaccinesPage({ vaccines }: Props) {
  const sorted = [...vaccines].sort((a, b) => {
    if (!a.nextDueDate) return 1;
    if (!b.nextDueDate) return -1;
    return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          💉 Vaccine Tracker
        </h1>
        <p className="text-gray-400 text-sm mt-1">Keeping Mimi protected and healthy</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((v) => (
          <VaccineCard key={v.id} vaccine={v} />
        ))}
      </div>

      <div className="card mt-8 bg-amber-50 border-amber-100">
        <h3 className="font-semibold text-amber-700 mb-2">📋 Legend</h3>
        <div className="space-y-1 text-sm text-amber-600">
          <p>📅 <strong>Soon</strong> — due within 60 days</p>
          <p>⚠️ <strong>Overdue</strong> — past the due date</p>
        </div>
      </div>
    </div>
  );
}
