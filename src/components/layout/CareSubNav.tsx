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
};

const CARE_TABS: { label: string; page: Page }[] = [
  { label: "Reminders", page: "reminders" },
  { label: "Vaccines",  page: "vaccines"  },
  { label: "Diary",     page: "diary"     },
  { label: "Photos",    page: "gallery"   },
  { label: "Meme",      page: "meme"      },
];

export default function CareSubNav({ currentPage, onNavigate }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-6">
      {CARE_TABS.map((tab) => (
        <button
          key={tab.page}
          onClick={() => onNavigate(tab.page)}
          className={`px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
            currentPage === tab.page
              ? "bg-sage-100 text-sage-700"
              : "text-gray-500 bg-parchment-50 border border-parchment-300 hover:bg-parchment-100 hover:text-sage-600"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
