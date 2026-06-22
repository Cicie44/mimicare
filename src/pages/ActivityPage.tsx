import type { AppNotification } from "../types";
import ActivityFeed from "../components/activity/ActivityFeed";

type Props = {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigateToCommunity: () => void;
  onNavigateToMessages: () => void;
};

export default function ActivityPage({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigateToCommunity,
  onNavigateToMessages,
}: Props) {
  return (
    <div className="max-w-2xl mx-auto">
      <ActivityFeed
        notifications={notifications}
        onMarkRead={onMarkRead}
        onMarkAllRead={onMarkAllRead}
        onNavigateToCommunity={onNavigateToCommunity}
        onNavigateToMessages={onNavigateToMessages}
      />
    </div>
  );
}
