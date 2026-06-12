import { useState } from "react";
import type { Pet } from "../types";
import PetProfileCard from "../components/pet/PetProfileCard";
import PetForm from "../components/pet/PetForm";

type Props = {
  pet: Pet;
  onUpdate: (pet: Pet) => Promise<void>;
};

export default function PetProfilePage({ pet, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);

  async function handleUpdate(updated: Pet) {
    await onUpdate(updated);
    setShowForm(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            🐱 Pet Profile
          </h1>
          <p className="text-gray-400 text-sm mt-1">Everything about Mimi</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary shrink-0">
            ✏️ Edit Profile
          </button>
        )}
      </div>

      <div className="max-w-xl mx-auto">
        {showForm ? (
          <PetForm pet={pet} onSubmit={handleUpdate} onCancel={() => setShowForm(false)} />
        ) : (
          <>
            <PetProfileCard pet={pet} />
            {pet.birthday && (
              <div className="card mt-4">
                <h3 className="font-semibold text-gray-700 mb-3">🎂 Birthday Info</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Birthday: <span className="font-medium">{pet.birthday}</span></p>
                  <p>Age: <span className="font-medium">{pet.ageLabel}</span></p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
