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

const INBOX_TABS: { label: string; page: Page }[] = [
  { label: "Messages", page: "messages" },
  { label: "Activity", page: "activity" },
];

export default function InboxSubNav({ currentPage, onNavigate }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-6">
      {INBOX_TABS.map((tab) => (
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
