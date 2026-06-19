import type { Review, SitterProfile } from "../../types";

type Props = {
  profile: SitterProfile;
  reviews?: Review[];
  onClose?: () => void;
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-sm">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}>
          ★
        </span>
      ))}
    </span>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-500 border border-rose-100 font-medium">
      {label}
    </span>
  );
}

export default function SitterProfileCard({ profile, reviews = [], onClose }: Props) {
  const badges: string[] = [];
  if (profile.hasCatExperience) badges.push("🐱 Cat-Friendly");
  if (profile.hasDogExperience) badges.push("🐶 Dog-Friendly");
  if (profile.completedVisitsCount >= 1) badges.push(`🏡 ${profile.completedVisitsCount} Visit${profile.completedVisitsCount !== 1 ? "s" : ""}`);
  if (profile.reviewCount >= 3 && (profile.averageRating ?? 0) >= 4.5) badges.push("⭐ Top Rated");

  return (
    <div className="card border-rose-100">
      {onClose && (
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-2xl shrink-0">
          🐾
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-gray-800 text-lg leading-snug">{profile.displayName}</h3>
          {profile.area && (
            <p className="text-xs text-gray-400 mt-0.5">📍 {profile.area}</p>
          )}
          {profile.averageRating !== undefined && profile.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              <Stars rating={profile.averageRating} />
              <span className="text-xs text-gray-400">
                {profile.averageRating.toFixed(1)} · {profile.reviewCount} review{profile.reviewCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Trust badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {badges.map((b) => <Badge key={b} label={b} />)}
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{profile.bio}</p>
      )}

      {/* Details */}
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        {profile.availableDays.length > 0 && (
          <p>
            <span className="font-semibold text-gray-500">📅 Available:</span>{" "}
            {profile.availableDays.join(", ")}
          </p>
        )}
        {profile.preferredServiceTypes.length > 0 && (
          <p>
            <span className="font-semibold text-gray-500">🐾 Services:</span>{" "}
            {profile.preferredServiceTypes.join(", ")}
          </p>
        )}
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="border-t border-orange-100 pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Recent Reviews
          </p>
          <div className="space-y-2.5">
            {reviews.slice(0, 5).map((r) => (
              <div key={r.id} className="bg-orange-50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Stars rating={r.rating} />
                  <span className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {r.comment && (
                  <p className="text-xs text-gray-600 italic">"{r.comment}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {reviews.length === 0 && profile.completedVisitsCount === 0 && (
        <p className="text-xs text-gray-400 italic text-center py-2">
          No completed visits yet — be the first to book!
        </p>
      )}
    </div>
  );
}
