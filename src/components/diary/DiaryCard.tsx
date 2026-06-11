import type { DiaryEntry } from "../../types";

type Props = { entry: DiaryEntry };

const moodEmoji: Record<DiaryEntry["mood"], string> = {
  happy: "😄",
  sleepy: "😴",
  playful: "🎉",
  grumpy: "😾",
  sick: "🤒",
  calm: "😌",
};

const moodColor: Record<DiaryEntry["mood"], string> = {
  happy: "bg-yellow-100 text-yellow-600",
  sleepy: "bg-blue-100 text-blue-500",
  playful: "bg-pink-100 text-pink-500",
  grumpy: "bg-gray-100 text-gray-500",
  sick: "bg-red-100 text-red-500",
  calm: "bg-green-100 text-green-500",
};

export default function DiaryCard({ entry }: Props) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{entry.date}</span>
        <span
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${moodColor[entry.mood]}`}
        >
          {moodEmoji[entry.mood]} {entry.mood}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        {entry.food && (
          <div className="flex gap-2">
            <span className="text-gray-400 w-20 shrink-0">🍽 Food</span>
            <span className="text-gray-700">{entry.food}</span>
          </div>
        )}
        {entry.activity && (
          <div className="flex gap-2">
            <span className="text-gray-400 w-20 shrink-0">🎯 Activity</span>
            <span className="text-gray-700">{entry.activity}</span>
          </div>
        )}
        {entry.notes && (
          <div className="pt-2 border-t border-gray-50 text-gray-500 text-xs italic">
            {entry.notes}
          </div>
        )}
      </div>
    </div>
  );
}
