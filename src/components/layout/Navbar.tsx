import { useState, useRef, useEffect } from "react";
import type { AppNotification, Page } from "../../types";

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
  { label: "Home",         pages: ["home"],                                          defaultPage: "home"      },
  { label: "Care Records", pages: ["reminders","vaccines","diary","gallery","meme"], defaultPage: "reminders" },
  { label: "Community",    pages: ["community"],                                     defaultPage: "community" },
  { label: "Inbox",        pages: ["messages","activity"],                           defaultPage: "messages"  },
  { label: "Profile",      pages: ["profile"],                                       defaultPage: "profile"   },
];

export default function Navbar({
  currentPage,
  onNavigate,
  userEmail,
  onLogout,
  notifications = [],
  unreadMessageCount = 0,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const unreadInboxCount = unreadMessageCount + unreadNotifCount;

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handler(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  function navigate(page: Page) {
    onNavigate(page);
    setMenuOpen(false);
  }

  return (
    <nav ref={navRef} className="bg-parchment-50 border-b border-parchment-300 sticky top-0 z-50 shadow-sm">

      {/* ── Main nav row ─────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-1.5 font-bold text-xl text-sage-700 hover:text-sage-600 transition-colors shrink-0"
        >
          <span className="text-base">🐾</span>
          <span>MimiCare</span>
        </button>

        {/* Desktop: section links */}
        <div className="hidden md:flex items-center gap-0.5">
          {SECTIONS.map((section) => {
            const isActive = (section.pages as string[]).includes(currentPage);
            const isInbox = section.label === "Inbox";
            return (
              <button
                key={section.label}
                onClick={() => navigate(section.defaultPage)}
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

        {/* Desktop: user email + logout */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {userEmail && (
            <span className="hidden lg:block text-xs text-gray-400 truncate max-w-[140px]">
              {userEmail}
            </span>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-xs px-3 py-1.5 rounded-xl border border-parchment-300 text-gray-500 hover:bg-red-50 hover:border-red-100 hover:text-[#B85C5C] transition-all"
            >
              Log Out
            </button>
          )}
        </div>

        {/* Mobile: inbox badge + hamburger */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
          {!menuOpen && unreadInboxCount > 0 && (
            <span className="min-w-[20px] h-5 px-1 rounded-full bg-terracotta-500 text-white text-[10px] font-bold flex items-center justify-center pointer-events-none">
              {unreadInboxCount > 9 ? "9+" : unreadInboxCount}
            </span>
          )}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className={`p-2.5 rounded-xl transition-all ${
              menuOpen
                ? "bg-sage-100 text-sage-700"
                : "text-gray-500 hover:bg-parchment-100 hover:text-sage-600"
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>

      </div>

      {/* ── Mobile dropdown menu ─────────────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden border-t border-parchment-200 bg-parchment-50 pb-3">
          <div className="max-w-5xl mx-auto px-3 pt-2 space-y-0.5">
            {SECTIONS.map((section) => {
              const isActive = (section.pages as string[]).includes(currentPage);
              const isInbox = section.label === "Inbox";
              return (
                <button
                  key={section.label}
                  onClick={() => navigate(section.defaultPage)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-sage-100 text-sage-700"
                      : "text-gray-600 hover:bg-parchment-100 hover:text-sage-600"
                  }`}
                >
                  <span>{section.label}</span>
                  {isInbox && unreadInboxCount > 0 && (
                    <span className="min-w-[18px] h-[18px] px-0.5 rounded-full bg-terracotta-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadInboxCount > 9 ? "9+" : unreadInboxCount}
                    </span>
                  )}
                </button>
              );
            })}

            {onLogout && (
              <>
                <div className="border-t border-parchment-200 my-2" />
                {userEmail && (
                  <p className="px-3 py-1 text-xs text-gray-400 truncate">{userEmail}</p>
                )}
                <button
                  onClick={() => { onLogout(); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-gray-500 font-medium hover:bg-red-50 hover:text-[#B85C5C] transition-all"
                >
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </nav>
  );
}
