import { useState } from "react";
import { validateFile } from "../../services/photoService";

type Props = {
  onSubmit: (file: File, caption: string, tags: string[], date: string) => Promise<void>;
  onCancel: () => void;
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function PhotoUploadForm({ onSubmit, onCancel }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;

    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      setFile(null);
      setPreview(null);
      return;
    }

    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please choose a photo.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(
        file,
        caption.trim(),
        tags.split(",").map((t) => t.trim()).filter(Boolean),
        date
      );
    } catch {
      // error toast shown by App.tsx; form stays open
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card border-rose-100 mb-6">
      <h3 className="font-semibold text-gray-700 mb-4">📸 Upload New Photo</h3>

      {/* File picker + preview */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
          Photo
        </label>
        {preview ? (
          <div className="relative mb-2 inline-block">
            <img
              src={preview}
              alt="Preview"
              className="w-40 h-40 object-cover rounded-2xl border border-rose-100 shadow-sm"
            />
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(preview);
                setPreview(null);
                setFile(null);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-red-400 text-xs flex items-center justify-center shadow"
              aria-label="Remove photo"
            >
              ✕
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-rose-200 rounded-2xl cursor-pointer hover:bg-rose-50 transition-colors text-gray-400">
            <span className="text-3xl mb-1">📷</span>
            <span className="text-xs text-center px-2">Click to choose<br />JPEG · PNG · WebP<br />Max 5MB</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <FormField label="Caption">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="e.g. Sunday sunshine ☀️"
            required
            className="input"
          />
        </FormField>

        <FormField label="Date">
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            required
            className="input"
          />
        </FormField>
      </div>

      <FormField label="Tags (comma-separated)">
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. cozy, window, sunbathing"
          className="input"
        />
      </FormField>

      <div className="flex gap-2 mt-6 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !file}
          className="btn-primary disabled:opacity-60"
        >
          {isSubmitting ? "Uploading..." : "Upload Photo 📸"}
        </button>
      </div>
    </form>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
