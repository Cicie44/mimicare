import { useState, useRef } from "react";
import type { PostCategory, CompensationType } from "../../types";
import type { CreatePostInput } from "../../services/communityService";

const CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: "pet_daily", label: "Pet Daily" },
  { value: "tips", label: "Tips & Knowledge" },
  { value: "sitter_help", label: "Community Care" },
];

const PET_TYPES: { value: string; label: string }[] = [
  { value: "cat", label: "Cat" },
  { value: "dog", label: "Dog" },
  { value: "rabbit", label: "Rabbit" },
  { value: "bird", label: "Bird" },
  { value: "other", label: "Other" },
];
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
    <form onSubmit={handleSubmit} className="card mb-6">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">New Post</h3>

      {/* Category selector */}
      <div className="flex gap-2 mb-4">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${
              category === c.value
                ? "bg-sage-50 border-sage-400 text-sage-700"
                : "bg-white border-parchment-300 text-gray-500 hover:border-sage-300 hover:text-sage-600"
            }`}
          >
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
              ? "Describe the care support you're looking for..."
              : category === "tips"
              ? "Share your pet care tip or experience..."
              : "What's your pet up to today?"
          }
          rows={3}
          maxLength={800}
          className="input resize-none text-sm"
        />

        {/* Sitter Help specific */}
        {category === "sitter_help" && (
          <div className="bg-parchment-100 rounded-xl p-3 space-y-3 border border-parchment-300">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Help details</p>
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
                    <option key={t.value} value={t.value}>{t.label}</option>
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
              <label className="block text-xs text-gray-400 mb-1">Support type</label>
              <p className="text-[10px] text-gray-400 mb-1.5">Choose how this help will be appreciated.</p>
              <div className="flex gap-2">
                {(["volunteer", "open", "fixed"] as CompensationType[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCompensation(c)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      compensation === c
                        ? "bg-sage-50 border-sage-400 text-sage-700"
                        : "bg-white border-parchment-300 text-gray-500 hover:border-sage-300"
                    }`}
                  >
                    {c === "volunteer" ? "Volunteer" : c === "open" ? "Flexible" : "Paid thank-you"}
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
              Community Care can be volunteer, paid, flexible, or an exchange of help.
            </p>
          </div>
        )}

        {/* Tags */}
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated)"
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
              <img src={imagePreview} alt="preview" className="w-full max-h-48 object-cover rounded-xl border border-parchment-300" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="absolute top-2 right-2 bg-white/80 rounded-full w-6 h-6 flex items-center justify-center text-xs text-gray-500 hover:text-[#B85C5C]"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full py-2.5 border border-dashed border-parchment-300 rounded-xl text-xs text-gray-400 hover:border-sage-400 hover:text-sage-600 transition-colors"
            >
              Add photo (optional)
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-[#B85C5C] mt-2">{error}</p>}

      <div className="flex gap-2 justify-end mt-4">
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary text-sm disabled:opacity-60"
        >
          {submitting ? "Publishing..." : "Publish"}
        </button>
      </div>
    </form>
  );
}
