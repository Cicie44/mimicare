import { useState } from "react";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import PetProfilePage from "./pages/PetProfilePage";
import VaccinesPage from "./pages/VaccinesPage";
import RemindersPage from "./pages/RemindersPage";
import GalleryPage from "./pages/GalleryPage";
import DiaryPage from "./pages/DiaryPage";
import { mockPet, mockVaccines, mockReminders, mockDiary, mockPhotos } from "./data/mockData";
import type { DiaryEntry, Reminder } from "./types";
import { useLocalStorage } from "./hooks/useLocalStorage";

type Page = "home" | "profile" | "vaccines" | "reminders" | "gallery" | "diary";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [diary, setDiary] = useLocalStorage<DiaryEntry[]>("mimicare-diary", mockDiary);
  const [reminders, setReminders] = useLocalStorage<Reminder[]>("mimicare-reminders", mockReminders);

  function addDiaryEntry(entry: DiaryEntry) {
    setDiary([entry, ...diary]);
  }

  function addReminder(reminder: Reminder) {
    setReminders([reminder, ...reminders]);
  }

  function markReminderDone(id: string) {
    setReminders(reminders.map((r) => (r.id === id ? { ...r, status: "done" } : r)));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentPage={page} onNavigate={setPage} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {page === "home" && (
          <HomePage
            pet={mockPet}
            vaccines={mockVaccines}
            reminders={reminders}
            diary={diary}
            photos={mockPhotos}
            onNavigate={setPage}
          />
        )}
        {page === "profile" && <PetProfilePage pet={mockPet} />}
        {page === "vaccines" && <VaccinesPage vaccines={mockVaccines} />}
        {page === "reminders" && (
          <RemindersPage
            reminders={reminders}
            onAdd={addReminder}
            onMarkDone={markReminderDone}
          />
        )}
        {page === "gallery" && <GalleryPage photos={mockPhotos} />}
        {page === "diary" && (
          <DiaryPage entries={diary} onAdd={addDiaryEntry} />
        )}
      </main>

      <Footer />
    </div>
  );
}
