import { useState } from "react";
import type { Pet } from "../types";
import PetProfileCard from "../components/pet/PetProfileCard";
import PetForm from "../components/pet/PetForm";

type Props = {
  pet: Pet;
  onUpdate: (pet: Pet) => Promise<void>;
};

export default function PetProfilePage({ pet, onUpdate }: Props) {
  const isNew = !pet.name;
  const [showForm, setShowForm] = useState(isNew);

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
          <p className="text-gray-400 text-sm mt-1">
            {isNew && !showForm ? "Tell us about your pet!" : pet.name ? `Everything about ${pet.name}` : "Create your pet profile"}
          </p>
        </div>
        {!showForm && !isNew && (
          <button onClick={() => setShowForm(true)} className="btn-primary shrink-0">
            ✏️ Edit Profile
          </button>
        )}
      </div>

      <div className="max-w-xl mx-auto">
        {showForm ? (
          <PetForm
            pet={pet}
            onSubmit={handleUpdate}
            onCancel={() => setShowForm(false)}
          />
        ) : isNew ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">🐱</p>
            <p className="font-medium text-gray-500">No pet profile yet</p>
            <p className="text-sm mt-1 mb-6">Add your pet's info to get started!</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              ＋ Create Profile
            </button>
          </div>
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
