import type { UserProfile, PostReview } from "../../types";

type Props = {
  profile: UserProfile;
  recentReviews?: PostReview[];
  isOwn?: boolean;
  onEdit?: () => void;
  onSendMessage?: (userId: string) => void;
  onBlock?: (userId: string) => void;
};

type Badge = { label: string; emoji: string; color: string };

function getBadges(profile: UserProfile): Badge[] {
  const badges: Badge[] = [];
  if (profile.displayName && profile.bio) {
    badges.push({ label: "Profile Complete", emoji: "✅", color: "bg-green-50 text-green-600" });
  }
  if (profile.hasCatExperience) {
    badges.push({ label: "Cat-Friendly", emoji: "🐱", color: "bg-rose-50 text-rose-500" });
  }
  if (profile.hasDogExperience) {
    badges.push({ label: "Dog-Friendly", emoji: "🐶", color: "bg-amber-50 text-amber-600" });
  }
  if (profile.postCount >= 3) {
    badges.push({ label: "Community Member", emoji: "🌟", color: "bg-purple-50 text-purple-500" });
  }
  if (profile.completedVisitsCount >= 3) {
    badges.push({ label: "Experienced Helper", emoji: "🏅", color: "bg-blue-50 text-blue-600" });
  }
  if (profile.reviewCount >= 3 && (profile.averageRating ?? 0) >= 4.5) {
    badges.push({ label: "Top Rated", emoji: "⭐", color: "bg-yellow-50 text-yellow-600" });
  }
  return badges;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

export default function UserProfileCard({ profile, recentReviews = [], isOwn, onEdit, onSendMessage, onBlock }: Props) {
  const badges = getBadges(profile);

  return (
    <div className="card border-rose-100">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center text-2xl font-bold text-rose-400 shrink-0">
          {profile.displayName[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-800 text-lg">{profile.displayName}</h3>
            {isOwn ? (
              <button
                onClick={onEdit}
                className="text-xs px-2 py-0.5 rounded-lg border border-gray-200 text-gray-400 hover:border-rose-300 hover:text-rose-400 transition-colors"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-1.5">
                {onSendMessage && (
                  <button
                    onClick={() => onSendMessage(profile.userId)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-rose-100 text-rose-500 hover:bg-rose-200 transition-colors font-medium"
                  >
                    ✉️ Message
                  </button>
                )}
                {onBlock && (
                  <button
                    onClick={() => onBlock(profile.userId)}
                    className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400 transition-colors"
                    title="Block user"
                  >
                    🚫
                  </button>
                )}
              </div>
            )}
          </div>
          {profile.area && (
            <p className="text-xs text-gray-400 mt-0.5">📍 {profile.area}</p>
          )}
          {profile.averageRating !== undefined && profile.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              <StarDisplay rating={Math.round(profile.averageRating)} />
              <span className="text-xs text-gray-500">
                {profile.averageRating.toFixed(1)} ({profile.reviewCount} reviews)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{profile.bio}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { value: profile.postCount, label: "Posts" },
          { value: profile.completedVisitsCount, label: "Visits" },
          { value: profile.reviewCount, label: "Reviews" },
        ].map((s) => (
          <div key={s.label} className="text-center bg-orange-50/60 rounded-xl py-2">
            <p className="text-lg font-bold text-rose-400">{s.value}</p>
            <p className="text-[10px] text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {badges.map((b) => (
            <span key={b.label} className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.color}`}>
              {b.emoji} {b.label}
            </span>
          ))}
        </div>
      )}

      {/* Availability */}
      {profile.availableDays.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Available
          </p>
          <div className="flex flex-wrap gap-1">
            {profile.availableDays.map((d) => (
              <span key={d} className="text-xs bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full">
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Service types */}
      {profile.preferredServiceTypes.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Services
          </p>
          <div className="flex flex-wrap gap-1">
            {profile.preferredServiceTypes.map((s) => (
              <span key={s} className="text-xs bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent reviews */}
      {recentReviews.length > 0 && (
        <div className="mt-3 pt-3 border-t border-orange-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Recent Reviews
          </p>
          <div className="space-y-2">
            {recentReviews.slice(0, 3).map((r) => (
              <div key={r.id} className="bg-gray-50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <StarDisplay rating={r.rating} />
                  <span className="text-[10px] text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {r.comment && <p className="text-xs text-gray-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
