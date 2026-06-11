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

type Page = "home" | "profile" | "vaccines" | "reminders" | "gallery" | "diary";

export default function App() {
  const [page, setPage] = useState<Page>("home");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentPage={page} onNavigate={setPage} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {page === "home" && (
          <HomePage
            pet={mockPet}
            vaccines={mockVaccines}
            reminders={mockReminders}
            diary={mockDiary}
            photos={mockPhotos}
            onNavigate={setPage}
          />
        )}
        {page === "profile" && <PetProfilePage pet={mockPet} />}
        {page === "vaccines" && <VaccinesPage vaccines={mockVaccines} />}
        {page === "reminders" && <RemindersPage reminders={mockReminders} />}
        {page === "gallery" && <GalleryPage photos={mockPhotos} />}
        {page === "diary" && <DiaryPage entries={mockDiary} />}
      </main>

      <Footer />
    </div>
  );
}
