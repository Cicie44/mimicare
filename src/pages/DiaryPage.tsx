import { useState } from "react";
import type { DiaryEntry } from "../types";
import DiaryCard from "../components/diary/DiaryCard";
import DiaryForm from "../components/diary/DiaryForm";

type Props = {
  entries: DiaryEntry[];
  onAdd: (entry: DiaryEntry) => void;
  onUpdate: (entry: DiaryEntry) => void;
  onDelete: (id: string) => void;
};

const moodEmoji: Record<DiaryEntry["mood"], string> = {
  happy: "😄",
  sleepy: "😴",
  playful: "🎉",
  grumpy: "😾",
  sick: "🤒",
  calm: "😌",
};

export default function DiaryPage({ entries, onAdd, onUpdate, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  function handleAdd(entry: DiaryEntry) {
    onAdd(entry);
    setShowForm(false);
  }

  function handleUpdate(entry: DiaryEntry) {
    onUpdate(entry);
    setEditingEntry(null);
  }

  function startEdit(entry: DiaryEntry) {
    setEditingEntry(entry);
    setShowForm(false);
  }

  function startAdd() {
    setShowForm(true);
    setEditingEntry(null);
  }

  const moodSummary = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.mood] = (acc[e.mood] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📖 Mimi's Diary
          </h1>
          <p className="text-gray-400 text-sm mt-1">Daily notes and mood tracking</p>
        </div>
        {!showForm && !editingEntry && (
          <button onClick={startAdd} className="btn-primary shrink-0">
            ＋ Add Entry
          </button>
        )}
      </div>

      {showForm && (
        <DiaryForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      )}
      {editingEntry && (
        <DiaryForm
          initialData={editingEntry}
          onSubmit={handleUpdate}
          onCancel={() => setEditingEntry(null)}
        />
      )}

      {entries.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-semibold text-gray-600 text-sm mb-3">Mood overview</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(moodSummary).map(([mood, count]) => (
              <div key={mood} className="flex items-center gap-1 text-sm">
                <span>{moodEmoji[mood as DiaryEntry["mood"]]}</span>
                <span className="text-gray-600 capitalize">{mood}</span>
                <span className="text-gray-400">×{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && !showForm ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">📝</p>
          <p className="font-medium text-gray-500">No diary entries yet</p>
          <p className="text-sm mt-1">Click "Add Entry" to write Mimi's first diary!</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-xl">
          {entries.map((entry) => (
            <DiaryCard
              key={entry.id}
              entry={entry}
              onEdit={() => startEdit(entry)}
              onDelete={() => onDelete(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
