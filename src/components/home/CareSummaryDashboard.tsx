import type { ReactNode } from "react";
import type { VaccineRecord, Reminder, DiaryEntry, PetPhoto } from "../../types";

type Page = "home" | "profile" | "vaccines" | "reminders" | "gallery" | "diary";

type Props = {
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

function daysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function CareSummaryDashboard({ vaccines, reminders, diary, photos, onNavigate }: Props) {
  const nextVaccine = vaccines
    .filter((v) => v.nextDueDate)
    .sort((a, b) => new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime())[0];

  const pendingCount = reminders.filter((r) => r.status === "pending").length;
  const overdueCount = reminders.filter((r) => r.status === "overdue").length;
  const latestEntry = diary[0];
  const photoCount = photos.length;
  const latestPhotoDate = photos[0]?.date;

  const vaccineDays = nextVaccine?.nextDueDate ? daysUntil(nextVaccine.nextDueDate) : null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Next Vaccine */}
      <SummaryTile
        emoji="💉"
        label="Next Vaccine"
        onClick={() => onNavigate("vaccines")}
        bg="bg-amber-50"
        border="border-amber-200"
        labelColor="text-amber-500"
      >
        <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">
          {nextVaccine?.name ?? "—"}
        </p>
        {vaccineDays !== null && (
          <span
            className={`text-xs font-medium mt-1 ${
              vaccineDays < 0
                ? "text-red-500"
                : vaccineDays <= 60
                ? "text-amber-600"
                : "text-gray-400"
            }`}
          >
            {vaccineDays < 0
              ? `⚠️ ${Math.abs(vaccineDays)}d overdue`
              : vaccineDays === 0
              ? "⚡ Due today!"
              : `In ${vaccineDays} days`}
          </span>
        )}
      </SummaryTile>

      {/* Reminders */}
      <SummaryTile
        emoji="🔔"
        label="Reminders"
        onClick={() => onNavigate("reminders")}
        bg="bg-rose-50"
        border="border-rose-200"
        labelColor="text-rose-400"
      >
        <p className="font-semibold text-gray-800 text-sm">
          {pendingCount} pending
        </p>
        {overdueCount > 0 ? (
          <span className="text-xs font-medium text-red-500 mt-1">
            ⚠️ {overdueCount} overdue
          </span>
        ) : (
          <span className="text-xs text-gray-400 mt-1">All caught up 🎉</span>
        )}
      </SummaryTile>

      {/* Today's Mood */}
      <SummaryTile
        emoji={latestEntry ? moodEmoji[latestEntry.mood] : "📖"}
        label="Latest Mood"
        onClick={() => onNavigate("diary")}
        bg="bg-pink-50"
        border="border-pink-200"
        labelColor="text-pink-400"
      >
        <p className="font-semibold text-gray-800 text-sm capitalize">
          {latestEntry?.mood ?? "No entry yet"}
        </p>
        {latestEntry && (
          <span className="text-xs text-gray-400 mt-1">{latestEntry.date}</span>
        )}
      </SummaryTile>

      {/* Photo Memories */}
      <SummaryTile
        emoji="📸"
        label="Memories"
        onClick={() => onNavigate("gallery")}
        bg="bg-orange-50"
        border="border-orange-200"
        labelColor="text-orange-400"
      >
        <p className="font-semibold text-gray-800 text-sm">
          {photoCount} photos
        </p>
        {latestPhotoDate && (
          <span className="text-xs text-gray-400 mt-1">Latest: {latestPhotoDate}</span>
        )}
      </SummaryTile>
    </div>
  );
}

type TileProps = {
  emoji: string;
  label: string;
  onClick: () => void;
  bg: string;
  border: string;
  labelColor: string;
  children: ReactNode;
};

function SummaryTile({ emoji, label, onClick, bg, border, labelColor, children }: TileProps) {
  return (
    <button
      onClick={onClick}
      className={`${bg} border ${border} rounded-2xl p-4 text-left hover:shadow-md active:scale-95 transition-all w-full`}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-base">{emoji}</span>
        <span className={`text-xs font-semibold uppercase tracking-wide ${labelColor}`}>
          {label}
        </span>
      </div>
      <div className="flex flex-col">{children}</div>
    </button>
  );
}
