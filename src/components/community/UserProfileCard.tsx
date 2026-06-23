import type { UserProfile, PostReview } from "../../types";

type Props = {
  profile: UserProfile;
  recentReviews?: PostReview[];
  isOwn?: boolean;
  onEdit?: () => void;
  onSendMessage?: (userId: string) => void;
  onBlock?: (userId: string) => void;
};

type Badge = { label: string; color: string };

function getBadges(profile: UserProfile): Badge[] {
  const badges: Badge[] = [];
  if (profile.displayName && profile.bio) {
    badges.push({ label: "Profile Complete", color: "bg-green-50 text-green-700" });
  }
  if (profile.hasCatExperience) {
    badges.push({ label: "Cat-Friendly", color: "bg-sage-50 text-sage-700" });
  }
  if (profile.hasDogExperience) {
    badges.push({ label: "Dog-Friendly", color: "bg-parchment-200 text-gray-600" });
  }
  if (profile.postCount >= 3) {
    badges.push({ label: "Community Member", color: "bg-parchment-200 text-gray-600" });
  }
  if (profile.completedVisitsCount >= 3) {
    badges.push({ label: "Experienced Helper", color: "bg-sage-50 text-sage-700" });
  }
  if (profile.reviewCount >= 3 && (profile.averageRating ?? 0) >= 4.5) {
    badges.push({ label: "Top Rated", color: "bg-parchment-200 text-terracotta-500" });
  }
  return badges;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-terracotta-500 text-xs tracking-wide">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

export default function UserProfileCard({ profile, recentReviews = [], isOwn, onEdit, onSendMessage, onBlock }: Props) {
  const badges = getBadges(profile);

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-parchment-200 flex items-center justify-center text-xl font-semibold text-sage-600 shrink-0">
          {profile.displayName[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-800">{profile.displayName}</h3>
            {isOwn ? (
              <button
                onClick={onEdit}
                className="text-xs px-2 py-0.5 rounded-lg border border-parchment-300 text-gray-400 hover:border-sage-400 hover:text-sage-600 transition-colors"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-1.5">
                {onSendMessage && (
                  <button
                    onClick={() => onSendMessage(profile.userId)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-sage-100 text-sage-700 hover:bg-sage-200 transition-colors font-medium"
                  >
                    Message
                  </button>
                )}
                {onBlock && (
                  <button
                    onClick={() => onBlock(profile.userId)}
                    className="text-xs px-2 py-1 rounded-lg border border-parchment-300 text-gray-400 hover:border-red-200 hover:text-[#B85C5C] transition-colors"
                    title="Block user"
                  >
                    Block
                  </button>
                )}
              </div>
            )}
          </div>
          {profile.area && (
            <p className="text-xs text-gray-400 mt-0.5">{profile.area}</p>
          )}
          {profile.averageRating !== undefined && profile.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              <StarDisplay rating={Math.round(profile.averageRating)} />
              <span className="text-xs text-gray-400">
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
          <div key={s.label} className="text-center bg-parchment-100 rounded-xl py-2.5">
            <p className="text-base font-semibold text-sage-600">{s.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {badges.map((b) => (
            <span key={b.label} className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.color}`}>
              {b.label}
            </span>
          ))}
        </div>
      )}

      {/* Availability */}
      {profile.availableDays.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
            Available
          </p>
          <div className="flex flex-wrap gap-1">
            {profile.availableDays.map((d) => (
              <span key={d} className="text-xs bg-sage-50 text-sage-700 px-2 py-0.5 rounded-full">
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Service types */}
      {profile.preferredServiceTypes.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
            Services
          </p>
          <div className="flex flex-wrap gap-1">
            {profile.preferredServiceTypes.map((s) => (
              <span key={s} className="text-xs bg-parchment-200 text-gray-600 px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent reviews */}
      {recentReviews.length > 0 && (
        <div className="mt-3 pt-3 border-t border-parchment-200">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Reviews
          </p>
          <div className="space-y-2">
            {recentReviews.slice(0, 3).map((r) => (
              <div key={r.id} className="bg-parchment-100 rounded-xl px-3 py-2">
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
