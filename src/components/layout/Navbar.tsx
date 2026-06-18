import { useState, useRef, useEffect } from "react";

type Page = "home" | "profile" | "vaccines" | "reminders" | "gallery" | "diary" | "meme" | "services";

type Props = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userEmail?: string;
  onLogout?: () => void;
};

type NavGroup = {
  label: string;
  emoji: string;
  pages: { label: string; page: Page; emoji: string }[];
};

const standaloneLinks: { label: string; page: Page; emoji: string }[] = [
  { label: "Home", page: "home", emoji: "🏠" },
  { label: "Profile", page: "profile", emoji: "🐱" },
];

const navGroups: NavGroup[] = [
  {
    label: "Health",
    emoji: "🏥",
    pages: [
      { label: "Vaccines", page: "vaccines", emoji: "💉" },
      { label: "Reminders", page: "reminders", emoji: "🔔" },
    ],
  },
  {
    label: "Memories",
    emoji: "📸",
    pages: [
      { label: "Gallery", page: "gallery", emoji: "📷" },
      { label: "Diary", page: "diary", emoji: "📖" },
      { label: "Meme Studio", page: "meme", emoji: "🎨" },
    ],
  },
  {
    label: "Services",
    emoji: "🏡",
    pages: [
      { label: "Pet Sitting", page: "services", emoji: "🐾" },
    ],
  },
];

function DropdownGroup({
  group,
  currentPage,
  onNavigate,
}: {
  group: NavGroup;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const isActive = group.pages.some((p) => p.page === currentPage);

  function openMenu() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  }

  function scheduleClose() {
    timerRef.current = window.setTimeout(() => setOpen(false), 120);
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? "bg-rose-100 text-rose-600"
            : "text-gray-500 hover:bg-orange-50 hover:text-rose-400"
        }`}
      >
        <span>{group.emoji}</span>
        <span className="hidden sm:inline">{group.label}</span>
        <span className="text-[10px] opacity-60">▾</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-orange-100 rounded-2xl shadow-lg py-1.5 min-w-[140px] z-50">
          {group.pages.map(({ label, page, emoji }) => (
            <button
              key={page}
              onClick={() => { onNavigate(page); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                currentPage === page
                  ? "text-rose-500 bg-rose-50"
                  : "text-gray-600 hover:bg-orange-50 hover:text-rose-400"
              }`}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar({ currentPage, onNavigate, userEmail, onLogout }: Props) {
  return (
    <nav className="bg-white border-b border-orange-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 font-bold text-xl text-rose-400 hover:text-rose-500 transition-colors shrink-0"
        >
          <span>🐾</span>
          <span>MimiCare</span>
        </button>

        <div className="flex items-center gap-1">
          {standaloneLinks.map(({ label, page, emoji }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                currentPage === page
                  ? "bg-rose-100 text-rose-600"
                  : "text-gray-500 hover:bg-orange-50 hover:text-rose-400"
              }`}
            >
              <span>{emoji}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}

          {navGroups.map((group) => (
            <DropdownGroup
              key={group.label}
              group={group}
              currentPage={currentPage}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {onLogout && (
          <div className="flex items-center gap-2 shrink-0">
            {userEmail && (
              <span className="hidden md:block text-xs text-gray-400 truncate max-w-[120px]">
                {userEmail}
              </span>
            )}
            <button
              onClick={onLogout}
              className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-400 transition-all"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
