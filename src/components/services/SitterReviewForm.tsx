import { useState } from "react";

type Props = {
  onSubmit: (rating: number, comment?: string) => Promise<void>;
  onCancel: () => void;
};

export default function SitterReviewForm({ onSubmit, onCancel }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await onSubmit(rating, comment.trim() || undefined);
    } catch {
      // error toast shown by parent
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card border-yellow-100 bg-yellow-50/30 mt-3">
      <h4 className="font-semibold text-gray-700 mb-3">⭐ Leave a Review</h4>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="text-2xl transition-transform hover:scale-110"
              >
                {star <= (hovered || rating) ? "⭐" : "☆"}
              </button>
            ))}
          </div>
          {rating === 0 && (
            <p className="text-xs text-amber-500 mt-1">Please select a star rating</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was the visit? Was your pet well cared for?"
            rows={2}
            maxLength={300}
            className="input resize-none text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end mt-3">
        <button type="button" onClick={onCancel} disabled={submitting} className="btn-secondary text-sm">
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="btn-primary text-sm disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Review ⭐"}
        </button>
      </div>
    </form>
  );
}
