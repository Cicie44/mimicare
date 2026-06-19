import { useState } from "react";

type Props = {
  onSubmit: (message: string) => Promise<void>;
  onCancel: () => void;
};

export default function ApplicationForm({ onSubmit, onCancel }: Props) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(message.trim());
    } catch {
      // error toast shown by parent
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Introduce yourself and explain why you'd be a great sitter for this request..."
        rows={3}
        maxLength={500}
        required
        className="input resize-none text-sm"
      />
      <p className="text-xs text-gray-400 text-right">{message.length}/500</p>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} disabled={submitting} className="btn-secondary text-sm">
          Cancel
        </button>
        <button type="submit" disabled={submitting || !message.trim()} className="btn-primary text-sm disabled:opacity-60">
          {submitting ? "Sending..." : "Send Application 🐾"}
        </button>
      </div>
    </form>
  );
}
