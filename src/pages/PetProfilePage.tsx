import type { Pet } from "../types";
import PetProfileCard from "../components/pet/PetProfileCard";

type Props = { pet: Pet };

export default function PetProfilePage({ pet }: Props) {
  return (
    <div>
      <PageHeader title="Pet Profile" emoji="🐱" subtitle="Everything about Mimi" />
      <div className="max-w-xl mx-auto">
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
      </div>
    </div>
  );
}

function PageHeader({ title, emoji, subtitle }: { title: string; emoji: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span>{emoji}</span> {title}
      </h1>
      <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
    </div>
  );
}
