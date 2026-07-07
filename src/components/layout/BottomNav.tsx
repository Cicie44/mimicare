import type { AppNotification } from "../../types";

type Page =
  | "home"
  | "profile"
  | "vaccines"
  | "reminders"
  | "gallery"
  | "diary"
  | "meme"
  | "community"
  | "messages"
  | "activity";

type Props = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  notifications: AppNotification[];
  unreadMessageCount: number;
};

type TabDef = {
  id: string;
  label: string;
  pages: Page[];
  defaultPage: Page;
};

const TABS: TabDef[] = [
  { id: "today",     label: "Today",     pages: ["home"],                                         defaultPage: "home"      },
  { id: "care",      label: "Care",       pages: ["reminders", "vaccines", "diary", "gallery", "meme"], defaultPage: "reminders" },
  { id: "community", label: "Community", pages: ["community"],                                    defaultPage: "community" },
  { id: "inbox",     label: "Inbox",     pages: ["messages", "activity"],                         defaultPage: "messages"  },
  { id: "mimi",      label: "Mimi",      pages: ["profile"],                                      defaultPage: "profile"   },
];

function TabIcon({ id }: { id: string }) {
  const cls = "w-[22px] h-[22px]";
  switch (id) {
    case "today":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      );
    case "care":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    case "community":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      );
    case "inbox":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      );
    case "mimi":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function BottomNav({
  currentPage,
  onNavigate,
  notifications,
  unreadMessageCount,
}: Props) {
  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const unreadInboxCount = unreadMessageCount + unreadNotifCount;

  return (
    /* md:hidden — only visible on mobile/small screens */
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-parchment-50 border-t border-parchment-300 flex md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((tab) => {
        const isActive = (tab.pages as string[]).includes(currentPage);
        const showBadge = tab.id === "inbox" && unreadInboxCount > 0;

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.defaultPage)}
            className={`flex-1 flex flex-col items-center pt-2.5 pb-2 gap-0.5 transition-colors min-h-[60px] active:bg-parchment-100 ${
              isActive ? "text-sage-700" : "text-gray-400 hover:text-gray-500"
            }`}
          >
            {/* Icon with optional badge */}
            <div className="relative">
              <TabIcon id={tab.id} />
              {showBadge && (
                <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-terracotta-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                  {unreadInboxCount > 9 ? "9+" : unreadInboxCount}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              className={`text-[10px] font-medium tracking-wide leading-none ${
                isActive ? "text-sage-700" : "text-gray-400"
              }`}
            >
              {tab.label}
            </span>

            {/* Active indicator dot */}
            <span
              className={`w-1 h-1 rounded-full mt-0.5 transition-opacity ${
                isActive ? "bg-sage-600 opacity-100" : "opacity-0"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
