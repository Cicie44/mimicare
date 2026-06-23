import type { Pet, VaccineRecord, Reminder, DiaryEntry, PetPhoto } from "../types";
import PetProfileCard from "../components/pet/PetProfileCard";
import ReminderCard from "../components/reminders/ReminderCard";
import DiaryCard from "../components/diary/DiaryCard";
import PhotoCard from "../components/gallery/PhotoCard";
import CareSummaryDashboard from "../components/home/CareSummaryDashboard";

type Page = "home" | "profile" | "vaccines" | "reminders" | "gallery" | "diary";

type Props = {
  pet: Pet;
  vaccines: VaccineRecord[];
  reminders: Reminder[];
  diary: DiaryEntry[];
  photos: PetPhoto[];
  onNavigate: (page: Page) => void;
};

export default function HomePage({ pet, vaccines, reminders, diary, photos, onNavigate }: Props) {
  const pendingReminders = reminders.filter((r) => r.status === "pending" || r.status === "overdue");
  const latestDiary = diary[0];
  const recentPhotos = photos.slice(0, 4);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center py-6 sm:py-10">
        <div className="mb-4">
          {pet.avatarUrl ? (
            <img
              src={pet.avatarUrl}
              alt={pet.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-parchment-300 shadow-sm mx-auto"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-parchment-200 flex items-center justify-center text-4xl shadow-sm mx-auto">
              🐾
            </div>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">
          Welcome to <span className="text-sage-600">MimiCare</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto px-4">
          A calm little corner to track {pet.name || "your pet"}'s health, diary, and sweet moments.
        </p>
      </section>

      {/* Care Summary Dashboard */}
      <section>
        <SectionHeader title="Care Overview" onMore={null} />
        <CareSummaryDashboard
          vaccines={vaccines}
          reminders={reminders}
          diary={diary}
          photos={photos}
          onNavigate={onNavigate}
        />
      </section>

      {/* Pet summary */}
      <section>
        <SectionHeader title="Meet Mimi" onMore={() => onNavigate("profile")} />
        <PetProfileCard pet={pet} />
      </section>

      {/* Active Reminders */}
      {pendingReminders.length > 0 && (
        <section>
          <SectionHeader title="Active Reminders" onMore={() => onNavigate("reminders")} />
          <div className="grid sm:grid-cols-2 gap-3">
            {pendingReminders.slice(0, 4).map((r) => (
              <ReminderCard key={r.id} reminder={r} />
            ))}
          </div>
        </section>
      )}

      {/* Latest diary */}
      {latestDiary && (
        <section>
          <SectionHeader title="Latest Diary Entry" onMore={() => onNavigate("diary")} />
          <div className="max-w-xl">
            <DiaryCard entry={latestDiary} />
          </div>
        </section>
      )}

      {/* Photo preview */}
      {recentPhotos.length > 0 && (
        <section>
          <SectionHeader title="Recent Photos" onMore={() => onNavigate("gallery")} />
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentPhotos.map((p) => (
              <PhotoCard key={p.id} photo={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  onMore,
}: {
  title: string;
  onMore: (() => void) | null;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
        {title}
      </h2>
      {onMore && (
        <button
          onClick={onMore}
          className="text-xs text-sage-600 hover:text-sage-700 font-medium transition-colors"
        >
          See all →
        </button>
      )}
    </div>
  );
}
