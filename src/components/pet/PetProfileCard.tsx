import type { Pet } from "../../types";

type Props = { pet: Pet };

export default function PetProfileCard({ pet }: Props) {
  return (
    <div className="card flex flex-col sm:flex-row gap-6 items-center sm:items-start">
      <div className="flex-shrink-0">
        {pet.avatarUrl ? (
          <img
            src={pet.avatarUrl}
            alt={pet.name}
            className="w-28 h-28 rounded-full object-cover border-4 border-rose-100 shadow"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-rose-100 flex items-center justify-center text-4xl shadow">
            🐱
          </div>
        )}
      </div>

      <div className="flex-1 text-center sm:text-left">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">{pet.name}</h2>
        <p className="text-rose-400 font-medium mb-3">{pet.species} · {pet.ageLabel}</p>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
          <InfoItem label="Breed" value={pet.breed ?? "Mixed"} />
          <InfoItem label="Gender" value={pet.gender} />
          <InfoItem label="Neutered" value={pet.neutered ? "Yes ✅" : "No"} />
          <InfoItem label="Indoor" value={pet.indoor ? "Yes 🏠" : "Outdoor"} />
          {pet.birthday && <InfoItem label="Birthday" value={pet.birthday} />}
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Personality</p>
          <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
            {pet.personality.map((trait) => (
              <span
                key={trait}
                className="px-2.5 py-0.5 bg-rose-50 text-rose-500 rounded-full text-xs font-medium"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-400 uppercase tracking-wide block">{label}</span>
      <span className="font-medium text-gray-700">{value}</span>
    </div>
  );
}
