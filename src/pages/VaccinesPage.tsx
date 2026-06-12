import { useState } from "react";
import type { VaccineRecord } from "../types";
import VaccineCard from "../components/health/VaccineCard";
import VaccineForm from "../components/health/VaccineForm";

type Props = {
  vaccines: VaccineRecord[];
  petId: string;
  onAdd: (vaccine: VaccineRecord) => Promise<void>;
  onUpdate: (vaccine: VaccineRecord) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function VaccinesPage({ vaccines, petId, onAdd, onUpdate, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState<VaccineRecord | null>(null);

  const sorted = [...vaccines].sort((a, b) => {
    if (!a.nextDueDate) return 1;
    if (!b.nextDueDate) return -1;
    return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
  });

  async function handleAdd(vaccine: VaccineRecord) {
    await onAdd(vaccine);
    setShowForm(false);
  }

  async function handleUpdate(vaccine: VaccineRecord) {
    await onUpdate(vaccine);
    setEditingVaccine(null);
  }

  function startEdit(vaccine: VaccineRecord) {
    setEditingVaccine(vaccine);
    setShowForm(false);
  }

  function startAdd() {
    setShowForm(true);
    setEditingVaccine(null);
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            💉 Vaccine Tracker
          </h1>
          <p className="text-gray-400 text-sm mt-1">Keeping Mimi protected and healthy</p>
        </div>
        {!showForm && !editingVaccine && (
          <button onClick={startAdd} className="btn-primary shrink-0">
            ＋ Add Record
          </button>
        )}
      </div>

      {showForm && (
        <VaccineForm petId={petId} onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      )}
      {editingVaccine && (
        <VaccineForm
          petId={petId}
          initialData={editingVaccine}
          onSubmit={handleUpdate}
          onCancel={() => setEditingVaccine(null)}
        />
      )}

      {vaccines.length === 0 && !showForm ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">💉</p>
          <p className="font-medium text-gray-500">No vaccine records yet</p>
          <p className="text-sm mt-1">Click "Add Record" to start tracking Mimi's vaccines!</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((v) => (
              <VaccineCard
                key={v.id}
                vaccine={v}
                onEdit={() => startEdit(v)}
                onDelete={() => onDelete(v.id)}
              />
            ))}
          </div>

          <div className="card mt-8 bg-amber-50 border-amber-100">
            <h3 className="font-semibold text-amber-700 mb-2">📋 Legend</h3>
            <div className="space-y-1 text-sm text-amber-600">
              <p>📅 <strong>Soon</strong> — due within 60 days</p>
              <p>⚠️ <strong>Overdue</strong> — past the due date</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
