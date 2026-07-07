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
  userEmail?: string;
  onLogout?: () => void;
  notifications?: AppNotification[];
  unreadMessageCount?: number;
};

type Section = {
  label: string;
  pages: Page[];
  defaultPage: Page;
};

const SECTIONS: Section[] = [
  { label: "Today",     pages: ["home"],                                          defaultPage: "home"      },
  { label: "Care",      pages: ["reminders", "vaccines", "diary", "gallery", "meme"], defaultPage: "reminders" },
  { label: "Community", pages: ["community"],                                     defaultPage: "community" },
  { label: "Inbox",     pages: ["messages", "activity"],                          defaultPage: "messages"  },
  { label: "Mimi",      pages: ["profile"],                                       defaultPage: "profile"   },
];

export default function Navbar({
  currentPage,
  onNavigate,
  userEmail,
  onLogout,
  notifications = [],
  unreadMessageCount = 0,
}: Props) {
  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const unreadInboxCount = unreadMessageCount + unreadNotifCount;

  return (
    <nav className="bg-parchment-50 border-b border-parchment-300 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-1.5 font-bold text-xl text-sage-700 hover:text-sage-600 transition-colors shrink-0"
        >
          <span className="text-base">🐾</span>
          <span>MimiCare</span>
        </button>

        {/* Desktop section links — hidden on mobile (BottomNav handles mobile) */}
        <div className="hidden md:flex items-center gap-0.5">
          {SECTIONS.map((section) => {
            const isActive = (section.pages as string[]).includes(currentPage);
            const isInbox = section.label === "Inbox";

            return (
              <button
                key={section.label}
                onClick={() => onNavigate(section.defaultPage)}
                className={`relative px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sage-100 text-sage-700"
                    : "text-gray-500 hover:bg-parchment-100 hover:text-sage-600"
                }`}
              >
                {section.label}
                {isInbox && unreadInboxCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-terracotta-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadInboxCount > 9 ? "9+" : unreadInboxCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: user email + logout */}
        {onLogout && (
          <div className="flex items-center gap-2 shrink-0">
            {userEmail && (
              <span className="hidden lg:block text-xs text-gray-400 truncate max-w-[140px]">
                {userEmail}
              </span>
            )}
            <button
              onClick={onLogout}
              className="text-xs px-3 py-1.5 rounded-xl border border-parchment-300 text-gray-500 hover:bg-red-50 hover:border-red-100 hover:text-[#B85C5C] transition-all"
            >
              Log Out
            </button>
          </div>
        )}

      </div>
    </nav>
  );
}
