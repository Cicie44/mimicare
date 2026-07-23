import type { Pet, VaccineRecord, Reminder, DiaryEntry, PetPhoto, Page } from "../types";
import { formatDate } from "../utils/formatDate";

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

const moodColor: Record<DiaryEntry["mood"], string> = {
  happy: "bg-yellow-50 text-yellow-700",
  sleepy: "bg-blue-50 text-blue-600",
  playful: "bg-parchment-200 text-terracotta-500",
  grumpy: "bg-gray-100 text-gray-500",
  sick: "bg-red-50 text-[#B85C5C]",
  calm: "bg-sage-50 text-sage-700",
};

function daysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function HomePage({ pet, vaccines, reminders, diary, photos, onNavigate }: Props) {
  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const latestDiary = diary[0];
  const recentPhotos = photos.slice(0, 3);

  // Reminder buckets
  const overdueReminders = reminders.filter((r) => r.status === "overdue");
  const pendingReminders = reminders
    .filter((r) => r.status === "pending")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Vaccines due within 30 days (or overdue)
  const urgentVaccines = vaccines
    .filter((v) => v.nextDueDate)
    .map((v) => ({ ...v, daysLeft: daysUntil(v.nextDueDate!) }))
    .filter((v) => v.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Dynamic subtitle
  const overdueTotal =
    overdueReminders.length + urgentVaccines.filter((v) => v.daysLeft < 0).length;
  const upcomingTotal =
    pendingReminders.length + urgentVaccines.filter((v) => v.daysLeft >= 0).length;

  const subtitle =
    overdueTotal > 0
      ? `${overdueTotal} item${overdueTotal > 1 ? "s" : ""} overdue — needs attention.`
      : upcomingTotal > 0
      ? `${upcomingTotal} care item${upcomingTotal > 1 ? "s" : ""} coming up.`
      : "All caught up — great care today.";

  // Care items: overdue reminders first, then pending, capped at 5 total
  const careRows: Reminder[] = [
    ...overdueReminders.slice(0, 3),
    ...pendingReminders.slice(0, 3),
  ].slice(0, 5);

  const showCareSection = careRows.length > 0 || urgentVaccines.length > 0;

  return (
    <div className="space-y-7">
      {/* ── Greeting header ───────────────────────────────────────────────── */}
      <section className="pt-1">
        <p className="text-[11px] text-gray-400 mb-2 tracking-wide">{dateLabel}</p>
        <div className="flex items-center gap-3">
          {pet.avatarUrl ? (
            <img
              src={pet.avatarUrl}
              alt={pet.name}
              className="w-12 h-12 rounded-full object-cover border border-parchment-300 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-parchment-200 flex items-center justify-center text-2xl shrink-0">
              🐾
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-gray-800 leading-snug">
              {pet.name ? `${pet.name}'s Care Dashboard` : "Care Dashboard"}
            </h1>
            <p
              className={`text-sm mt-0.5 ${
                overdueTotal > 0 ? "text-[#B85C5C]" : "text-gray-400"
              }`}
            >
              {subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-4 gap-2">
          {(
            [
              { label: "Add diary", page: "diary" },
              { label: "Reminder", page: "reminders" },
              { label: "Care request", page: "community" },
              { label: "Add photo", page: "gallery" },
            ] as { label: string; page: Page }[]
          ).map((action) => (
            <button
              key={action.label}
              onClick={() => onNavigate(action.page)}
              className="py-2.5 px-1 bg-parchment-50 border border-parchment-300 rounded-xl text-xs font-medium text-gray-600 hover:bg-parchment-100 hover:border-sage-300 hover:text-sage-700 transition-all text-center leading-tight"
            >
              {action.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Today's care ──────────────────────────────────────────────────── */}
      {showCareSection && (
        <section>
          <SectionHeader title="Care needed" onMore={() => onNavigate("reminders")} />
          <div className="space-y-2">
            {careRows.map((r) => (
              <button
                key={r.id}
                onClick={() => onNavigate("reminders")}
                className="w-full flex items-center justify-between gap-3 bg-white border border-parchment-200 rounded-xl px-3.5 py-2.5 hover:border-parchment-300 hover:bg-parchment-50 transition-all text-left"
              >
                <span className="text-sm text-gray-700 font-medium truncate">{r.title}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">{formatDate(r.dueDate)}</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      r.status === "overdue"
                        ? "bg-red-50 text-[#B85C5C]"
                        : "bg-parchment-200 text-gray-500"
                    }`}
                  >
                    {r.status === "overdue" ? "Overdue" : "Pending"}
                  </span>
                </div>
              </button>
            ))}

            {urgentVaccines.slice(0, 2).map((v) => (
              <button
                key={v.id}
                onClick={() => onNavigate("vaccines")}
                className="w-full flex items-center justify-between gap-3 bg-white border border-parchment-200 rounded-xl px-3.5 py-2.5 hover:border-parchment-300 hover:bg-parchment-50 transition-all text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-parchment-200 text-gray-400 shrink-0">
                    Vaccine
                  </span>
                  <span className="text-sm text-gray-700 font-medium truncate">{v.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">{formatDate(v.nextDueDate!)}</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      v.daysLeft < 0
                        ? "bg-red-50 text-[#B85C5C]"
                        : v.daysLeft <= 7
                        ? "bg-orange-50 text-terracotta-500"
                        : "bg-parchment-200 text-gray-500"
                    }`}
                  >
                    {v.daysLeft < 0
                      ? "Overdue"
                      : v.daysLeft === 0
                      ? "Today"
                      : `In ${v.daysLeft}d`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Mimi check-in ─────────────────────────────────────────────────── */}
      {latestDiary && (
        <section>
          <SectionHeader
            title={`${pet.name}'s check-in`}
            onMore={() => onNavigate("diary")}
          />
          <div className="card">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs text-gray-400">{formatDate(latestDiary.date)}</span>
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                  moodColor[latestDiary.mood]
                }`}
              >
                {moodEmoji[latestDiary.mood]} {latestDiary.mood}
              </span>
            </div>
            <div className="space-y-1.5 text-sm">
              {latestDiary.food && (
                <div className="flex gap-2 min-w-0">
                  <span className="text-gray-400 text-xs w-16 shrink-0 mt-0.5">Food</span>
                  <span className="text-gray-700 min-w-0 break-words [overflow-wrap:anywhere]">
                    {latestDiary.food}
                  </span>
                </div>
              )}
              {latestDiary.activity && (
                <div className="flex gap-2 min-w-0">
                  <span className="text-gray-400 text-xs w-16 shrink-0 mt-0.5">Activity</span>
                  <span className="text-gray-700 min-w-0 break-words [overflow-wrap:anywhere]">
                    {latestDiary.activity}
                  </span>
                </div>
              )}
              {latestDiary.notes && (
                <div className="pt-2 border-t border-parchment-200 text-gray-500 text-xs italic line-clamp-2 break-words [overflow-wrap:anywhere]">
                  {latestDiary.notes}
                </div>
              )}
            </div>
            <button
              onClick={() => onNavigate("diary")}
              className="mt-3 text-xs text-sage-600 hover:text-sage-700 font-medium transition-colors"
            >
              View diary →
            </button>
          </div>
        </section>
      )}

      {/* ── Community care snapshot ────────────────────────────────────────── */}
      <section>
        <SectionHeader title="Community care" onMore={() => onNavigate("community")} />
        <button
          onClick={() => onNavigate("community")}
          className="w-full bg-parchment-50 border border-parchment-300 rounded-2xl p-4 text-left hover:bg-parchment-100 hover:shadow-sm transition-all group"
        >
          <p className="text-sm font-semibold text-gray-700 mb-1">
            Neighbors helping pets nearby.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Feeding visits, lost pet lookouts, supplies sharing, and short-term care — all from
            your community.
          </p>
          <p className="mt-3 text-xs text-sage-600 font-medium group-hover:text-sage-700 transition-colors">
            See community care →
          </p>
        </button>
      </section>

      {/* ── Recent moments ────────────────────────────────────────────────── */}
      {recentPhotos.length > 0 && (
        <section>
          <SectionHeader title="Recent moments" onMore={() => onNavigate("gallery")} />
          <div className="grid grid-cols-3 gap-2.5">
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
                    className="w-full h-28 sm:h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-28 sm:h-36 bg-parchment-100 flex items-center justify-center text-gray-300 text-2xl">
                    🐾
                  </div>
                )}
                {p.caption && (
                  <p className="px-2.5 py-1.5 text-[11px] text-gray-500 truncate text-left">
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
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{title}</h2>
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
