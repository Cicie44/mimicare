import { useState, useRef } from "react";
import type { PostCategory, CompensationType } from "../../types";
import type { CreatePostInput } from "../../services/communityService";

const CATEGORIES: { value: PostCategory; label: string; emoji: string }[] = [
  { value: "pet_daily", label: "Pet Daily", emoji: "🐾" },
  { value: "tips", label: "Tips & Knowledge", emoji: "💡" },
  { value: "sitter_help", label: "Sitter Help", emoji: "🏡" },
];

const PET_TYPES = ["cat", "dog", "rabbit", "bird", "other"];
const DURATIONS = ["1–2 hours", "Half day", "Full day", "Overnight", "Multiple days"];

type Props = {
  onSubmit: (input: CreatePostInput, imageFile?: File) => Promise<void>;
  onCancel: () => void;
};

export default function PostComposer({ onSubmit, onCancel }: Props) {
  const [category, setCategory] = useState<PostCategory>("pet_daily");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Sitter Help fields
  const [requestDate, setRequestDate] = useState("");
  const [area, setArea] = useState("");
  const [petType, setPetType] = useState("cat");
  const [duration, setDuration] = useState("");
  const [compensation, setCompensation] = useState<CompensationType>("open");
  const [compensationNote, setCompensationNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) { setError("Post content is required."); return; }
    setError("");
    setSubmitting(true);
    try {
      const input: CreatePostInput = {
        category,
        title: title.trim() || undefined,
        content: content.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        helpDetails:
          category === "sitter_help"
            ? {
                requestDate: requestDate || undefined,
                area: area.trim() || undefined,
                petType: petType || undefined,
                duration: duration || undefined,
                compensation,
                compensationNote: compensation === "fixed" ? compensationNote.trim() || undefined : undefined,
              }
            : undefined,
      };
      await onSubmit(input, imageFile ?? undefined);
    } catch {
      setError("Failed to post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card border-rose-100 mb-6">
      <h3 className="font-semibold text-gray-700 mb-4">✍️ New Post</h3>

      {/* Category selector */}
      <div className="flex gap-2 mb-4">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={`flex-1 flex flex-col items-center py-2 rounded-xl border text-xs font-medium transition-all ${
              category === c.value
                ? "bg-rose-50 border-rose-300 text-rose-600"
                : "bg-white border-gray-200 text-gray-500 hover:border-rose-200"
            }`}
          >
            <span className="text-base mb-0.5">{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* Common fields */}
      <div className="space-y-3">
        {category !== "pet_daily" && (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="input text-sm"
          />
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            category === "sitter_help"
              ? "Describe what kind of help you need..."
              : category === "tips"
              ? "Share your pet care tip or experience..."
              : "What's your pet up to today? 🐱"
          }
          rows={3}
          maxLength={800}
          className="input resize-none text-sm"
        />

        {/* Sitter Help specific */}
        {category === "sitter_help" && (
          <div className="bg-orange-50/60 rounded-2xl p-3 space-y-3">
            <p className="text-xs font-semibold text-orange-500">Help details (public info only)</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Date needed</label>
                <input
                  type="date"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                  className="input text-sm py-1.5"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Pet type</label>
                <select
                  value={petType}
                  onChange={(e) => setPetType(e.target.value)}
                  className="input text-sm py-1.5"
                >
                  {PET_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">General area</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Taipei Da'an"
                  className="input text-sm py-1.5"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="input text-sm py-1.5"
                >
                  <option value="">Select...</option>
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Compensation</label>
              <div className="flex gap-2">
                {(["volunteer", "open", "fixed"] as CompensationType[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCompensation(c)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      compensation === c
                        ? "bg-rose-100 border-rose-300 text-rose-600"
                        : "bg-white border-gray-200 text-gray-500 hover:border-rose-200"
                    }`}
                  >
                    {c === "volunteer" ? "💛 Volunteer" : c === "open" ? "🤝 Open" : "💵 Fixed"}
                  </button>
                ))}
              </div>
              {compensation === "fixed" && (
                <input
                  type="text"
                  value={compensationNote}
                  onChange={(e) => setCompensationNote(e.target.value)}
                  placeholder="e.g. NT$200/hour"
                  className="input text-sm mt-2"
                />
              )}
            </div>
            <p className="text-[10px] text-gray-400">
              🔒 Do not include your home address, key codes, or personal phone number in public posts.
            </p>
          </div>
        )}

        {/* Tags */}
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated, e.g. cat, feeding)"
          className="input text-sm"
        />

        {/* Image upload */}
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImage}
          />
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="preview" className="w-full max-h-48 object-cover rounded-2xl" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="absolute top-2 right-2 bg-white/80 rounded-full w-6 h-6 flex items-center justify-center text-xs text-gray-500 hover:text-red-400"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full py-2.5 border-2 border-dashed border-orange-200 rounded-2xl text-xs text-gray-400 hover:border-rose-300 hover:text-rose-400 transition-colors"
            >
              📷 Add photo (optional)
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

      <div className="flex gap-2 justify-end mt-4">
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary text-sm disabled:opacity-60"
        >
          {submitting ? "Posting..." : "Post 🐾"}
        </button>
      </div>
    </form>
  );
}
