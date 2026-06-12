import { useState } from "react";
import type { Pet } from "../../types";

type Props = {
  pet: Pet;
  onSubmit: (pet: Pet) => Promise<void>;
  onCancel: () => void;
};

export default function PetForm({ pet, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(pet.name);
  const [breed, setBreed] = useState(pet.breed ?? "");
  const [gender, setGender] = useState(pet.gender);
  const [birthday, setBirthday] = useState(pet.birthday ?? "");
  const [ageLabel, setAgeLabel] = useState(pet.ageLabel);
  const [neutered, setNeutered] = useState(pet.neutered);
  const [indoor, setIndoor] = useState(pet.indoor);
  const [personality, setPersonality] = useState(pet.personality.join(", "));
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...pet,
        name: name.trim(),
        breed: breed.trim() || undefined,
        gender,
        birthday: birthday || undefined,
        ageLabel: ageLabel.trim(),
        neutered,
        indoor,
        personality: personality
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
    } catch {
      // error toast shown by App.tsx; form stays open
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card border-rose-100 mb-6">
      <h3 className="font-semibold text-gray-700 mb-4">✏️ Edit Profile</h3>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <FormField label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input"
          />
        </FormField>

        <FormField label="Breed">
          <input
            type="text"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            placeholder="e.g. Ragdoll"
            className="input"
          />
        </FormField>

        <FormField label="Gender">
          <select value={gender} onChange={(e) => setGender(e.target.value)} className="input">
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
        </FormField>

        <FormField label="Age label">
          <input
            type="text"
            value={ageLabel}
            onChange={(e) => setAgeLabel(e.target.value)}
            placeholder="e.g. 2 years old"
            required
            className="input"
          />
        </FormField>

        <FormField label="Birthday 🎂">
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="input"
          />
        </FormField>
      </div>

      <FormField label="Personality traits (comma-separated)">
        <input
          type="text"
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          placeholder="e.g. Gentle, Sweet, Curious"
          className="input"
        />
      </FormField>

      <div className="flex flex-wrap gap-6 mt-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={neutered}
            onChange={(e) => setNeutered(e.target.checked)}
            className="w-4 h-4 accent-rose-400"
          />
          <span className="text-sm text-gray-700">Spayed / Neutered</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={indoor}
            onChange={(e) => setIndoor(e.target.checked)}
            className="w-4 h-4 accent-rose-400"
          />
          <span className="text-sm text-gray-700">Indoor only</span>
        </label>
      </div>

      <div className="flex gap-2 mt-6 justify-end">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-60">
          {isSubmitting ? "Saving..." : "Save Profile 🐾"}
        </button>
      </div>
    </form>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
