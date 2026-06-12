type Page = "home" | "profile" | "vaccines" | "reminders" | "gallery" | "diary";

type Props = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userEmail?: string;
  onLogout?: () => void;
};

const navLinks: { label: string; page: Page; emoji: string }[] = [
  { label: "Home", page: "home", emoji: "🏠" },
  { label: "Profile", page: "profile", emoji: "🐱" },
  { label: "Vaccines", page: "vaccines", emoji: "💉" },
  { label: "Reminders", page: "reminders", emoji: "🔔" },
  { label: "Gallery", page: "gallery", emoji: "📸" },
  { label: "Diary", page: "diary", emoji: "📖" },
];

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

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-nowrap">
          {navLinks.map(({ label, page, emoji }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`flex-shrink-0 px-2.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                currentPage === page
                  ? "bg-rose-100 text-rose-600"
                  : "text-gray-500 hover:bg-orange-50 hover:text-rose-400"
              }`}
            >
              <span className="mr-0.5 sm:mr-1">{emoji}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
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
