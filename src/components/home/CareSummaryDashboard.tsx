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
      <SummaryTile label="Vaccines" onClick={() => onNavigate("vaccines")}>
        <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">
          {nextVaccine?.name ?? "—"}
        </p>
        {vaccineDays !== null && (
          <span
            className={`text-xs font-medium mt-1 ${
              vaccineDays < 0 ? "text-[#B85C5C]" : vaccineDays <= 60 ? "text-terracotta-500" : "text-gray-400"
            }`}
          >
            {vaccineDays < 0
              ? `${Math.abs(vaccineDays)}d overdue`
              : vaccineDays === 0
              ? "Due today"
              : `In ${vaccineDays} days`}
          </span>
        )}
      </SummaryTile>

      {/* Reminders */}
      <SummaryTile label="Reminders" onClick={() => onNavigate("reminders")}>
        <p className="font-semibold text-gray-800 text-sm">
          {pendingCount} pending
        </p>
        {overdueCount > 0 ? (
          <span className="text-xs font-medium text-[#B85C5C] mt-1">
            {overdueCount} overdue
          </span>
        ) : (
          <span className="text-xs text-gray-400 mt-1">All caught up</span>
        )}
      </SummaryTile>

      {/* Today's Mood */}
      <SummaryTile label="Latest Mood" onClick={() => onNavigate("diary")}>
        <p className="font-semibold text-gray-800 text-sm capitalize flex items-center gap-1">
          {latestEntry ? (
            <>{moodEmoji[latestEntry.mood]} {latestEntry.mood}</>
          ) : (
            "No entry yet"
          )}
        </p>
        {latestEntry && (
          <span className="text-xs text-gray-400 mt-1">{latestEntry.date}</span>
        )}
      </SummaryTile>

      {/* Photo Memories */}
      <SummaryTile label="Memories" onClick={() => onNavigate("gallery")}>
        <p className="font-semibold text-gray-800 text-sm">
          {photoCount} {photoCount === 1 ? "photo" : "photos"}
        </p>
        {latestPhotoDate && (
          <span className="text-xs text-gray-400 mt-1">Latest: {latestPhotoDate}</span>
        )}
      </SummaryTile>
    </div>
  );
}

type TileProps = {
  label: string;
  onClick: () => void;
  children: ReactNode;
};

function SummaryTile({ label, onClick, children }: TileProps) {
  return (
    <button
      onClick={onClick}
      className="bg-parchment-50 border border-parchment-300 rounded-2xl p-4 text-left hover:bg-parchment-100 hover:shadow-sm active:scale-95 transition-all w-full"
    >
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <div className="flex flex-col">{children}</div>
    </button>
  );
}
