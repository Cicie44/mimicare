import type { Pet, VaccineRecord, Reminder, DiaryEntry, PetPhoto } from "../types";
import PetProfileCard from "../components/pet/PetProfileCard";
import ReminderCard from "../components/reminders/ReminderCard";
import CareSummaryDashboard from "../components/home/CareSummaryDashboard";

type Page = "home" | "profile" | "vaccines" | "reminders" | "gallery" | "diary" | "community";

type Props = {
  pet: Pet;
  vaccines: VaccineRecord[];
  reminders: Reminder[];
  diary: DiaryEntry[];
  photos: PetPhoto[];
  onNavigate: (page: Page) => void;
};

const moodEmoji: Record<DiaryEntry["mood"], string> = {
  happy: "😄",
  sleepy: "😴",
  playful: "🎉",
  grumpy: "😾",
  sick: "🤒",
  calm: "😌",
};

const COMMUNITY_FEATURES = [
  {
    icon: "🐾",
    title: "Care requests",
    desc: "Ask for feeding visits, walks, vet transport, or short-term support.",
  },
  {
    icon: "◎",
    title: "Lost pet lookout",
    desc: "Share local alerts and help neighbors keep an eye out.",
  },
  {
    icon: "♡",
    title: "Supplies sharing",
    desc: "Offer spare food, litter, carriers, or blankets to pets who need them.",
  },
];

export default function HomePage({ pet, vaccines, reminders, diary, photos, onNavigate }: Props) {
  const pendingReminders = reminders.filter((r) => r.status === "pending" || r.status === "overdue");
  const latestDiary = diary[0];
  const recentPhotos = photos.slice(0, 3);

  return (
    <div className="space-y-10">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="text-center py-8 sm:py-12">
        <div className="mb-5">
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
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-3 leading-snug">
          Care for your pet,{" "}
          <span className="text-sage-600">and your community.</span>
        </h1>
        <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto px-4 leading-relaxed mb-6">
          MimiCare helps pet owners track daily care, keep memories, and support each other
          through trusted community care requests.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => onNavigate("reminders")}
            className="btn-primary text-sm px-5 py-2"
          >
            View care dashboard
          </button>
          <button
            onClick={() => onNavigate("community")}
            className="btn-secondary text-sm px-5 py-2"
          >
            Explore community care
          </button>
        </div>
      </section>

      {/* ── Care Overview ─────────────────────────────────────────────── */}
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

      {/* ── Community Care ────────────────────────────────────────────── */}
      <section>
        <SectionHeader title="Community Care" onMore={() => onNavigate("community")} />
        <p className="text-sm text-gray-400 mb-4 -mt-1">
          Small acts of help for pets and people nearby.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {COMMUNITY_FEATURES.map((f) => (
            <button
              key={f.title}
              onClick={() => onNavigate("community")}
              className="bg-parchment-50 border border-parchment-300 rounded-2xl p-4 text-left hover:bg-parchment-100 hover:shadow-sm transition-all group"
            >
              <span className="block text-xl mb-2 text-sage-500 group-hover:text-sage-600 transition-colors">
                {f.icon}
              </span>
              <p className="text-sm font-semibold text-gray-700 mb-1">{f.title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Meet Mimi ─────────────────────────────────────────────────── */}
      <section>
        <p className="text-xs text-gray-400 border-l-2 border-parchment-300 pl-3 mb-6 leading-relaxed">
          Mimi inspired the care tools. The community features are for every pet owner who needs a little support.
        </p>
        <SectionHeader title="Meet Mimi" onMore={() => onNavigate("profile")} />
        <p className="text-sm text-gray-400 mb-4 -mt-1 italic">
          {pet.name} is a curious indoor{" "}
          {(pet.breed ?? pet.species).toLowerCase()} who loves cardboard boxes,
          sunny windows, and quiet routines.
        </p>
        <PetProfileCard pet={pet} />
      </section>

      {/* ── Active Reminders ──────────────────────────────────────────── */}
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

      {/* ── Latest Diary Entry ────────────────────────────────────────── */}
      {latestDiary && (
        <section>
          <SectionHeader title="Latest Diary Entry" onMore={() => onNavigate("diary")} />
          <div className="card max-w-xl">
            {/* header row */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-sm text-gray-400 shrink-0">{latestDiary.date}</span>
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                  latestDiary.mood === "happy"
                    ? "bg-yellow-50 text-yellow-700"
                    : latestDiary.mood === "sleepy"
                    ? "bg-blue-50 text-blue-600"
                    : latestDiary.mood === "playful"
                    ? "bg-parchment-200 text-terracotta-500"
                    : latestDiary.mood === "grumpy"
                    ? "bg-gray-100 text-gray-500"
                    : latestDiary.mood === "sick"
                    ? "bg-red-50 text-[#B85C5C]"
                    : "bg-sage-50 text-sage-700"
                }`}
              >
                {moodEmoji[latestDiary.mood]} {latestDiary.mood}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              {latestDiary.food && (
                <div className="flex gap-2 min-w-0">
                  <span className="text-gray-400 w-16 shrink-0 text-xs mt-0.5">Food</span>
                  <span className="text-gray-700 min-w-0 break-words [overflow-wrap:anywhere]">
                    {latestDiary.food}
                  </span>
                </div>
              )}
              {latestDiary.activity && (
                <div className="flex gap-2 min-w-0">
                  <span className="text-gray-400 w-16 shrink-0 text-xs mt-0.5">Activity</span>
                  <span className="text-gray-700 min-w-0 break-words [overflow-wrap:anywhere]">
                    {latestDiary.activity}
                  </span>
                </div>
              )}
              {latestDiary.notes && (
                <div className="pt-2 border-t border-parchment-200 text-gray-500 text-xs italic line-clamp-3 break-words [overflow-wrap:anywhere]">
                  {latestDiary.notes}
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate("diary")}
              className="mt-3 text-xs text-sage-600 hover:text-sage-700 font-medium transition-colors"
            >
              Read full entry →
            </button>
          </div>
        </section>
      )}

      {/* ── Recent Photos ─────────────────────────────────────────────── */}
      {recentPhotos.length > 0 && (
        <section>
          <SectionHeader title="Recent Photos" onMore={() => onNavigate("gallery")} />
          <div className="grid grid-cols-3 gap-3">
            {recentPhotos.map((p) => (
              <button
                key={p.id}
                onClick={() => onNavigate("gallery")}
                className="group rounded-2xl overflow-hidden border border-parchment-300 bg-parchment-50 hover:shadow-sm transition-all"
              >
                {p.signedUrl ? (
                  <img
                    src={p.signedUrl}
                    alt={p.caption || "Photo"}
                    className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-32 sm:h-40 bg-parchment-100 flex items-center justify-center text-gray-300 text-3xl">
                    🐾
                  </div>
                )}
                {p.caption && (
                  <p className="px-3 py-2 text-xs text-gray-500 truncate text-left">
                    {p.caption}
                  </p>
                )}
              </button>
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
