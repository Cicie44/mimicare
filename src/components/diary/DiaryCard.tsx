import type { DiaryEntry } from "../../types";

type Props = {
  entry: DiaryEntry;
  onEdit?: () => void;
  onDelete?: () => void;
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

export default function DiaryCard({ entry, onEdit, onDelete }: Props) {
  function handleDelete() {
    if (window.confirm("Delete this diary entry? This cannot be undone.")) {
      onDelete?.();
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-sm text-gray-400 shrink-0">{entry.date}</span>
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${moodColor[entry.mood]}`}
          >
            {moodEmoji[entry.mood]} {entry.mood}
          </span>
          {onEdit && (
            <button
              onClick={onEdit}
              aria-label="Edit diary entry"
              className="text-gray-300 hover:text-sage-600 text-sm leading-none transition-colors"
            >
              ✏
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              aria-label="Delete diary entry"
              className="text-gray-300 hover:text-[#B85C5C] text-lg leading-none transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {entry.food && (
          <div className="flex gap-2 min-w-0">
            <span className="text-gray-400 w-16 shrink-0 text-xs mt-0.5">Food</span>
            <span className="text-gray-700 min-w-0 break-words [overflow-wrap:anywhere]">{entry.food}</span>
          </div>
        )}
        {entry.activity && (
          <div className="flex gap-2 min-w-0">
            <span className="text-gray-400 w-16 shrink-0 text-xs mt-0.5">Activity</span>
            <span className="text-gray-700 min-w-0 break-words [overflow-wrap:anywhere]">{entry.activity}</span>
          </div>
        )}
        {entry.notes && (
          <div className="pt-2 border-t border-parchment-200 text-gray-500 text-xs italic whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
            {entry.notes}
          </div>
        )}
      </div>
    </div>
  );
}
