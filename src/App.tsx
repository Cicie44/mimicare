import { useState, useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AuthPage from "./components/auth/AuthPage";
import HomePage from "./pages/HomePage";
import PetProfilePage from "./pages/PetProfilePage";
import VaccinesPage from "./pages/VaccinesPage";
import RemindersPage from "./pages/RemindersPage";
import GalleryPage from "./pages/GalleryPage";
import DiaryPage from "./pages/DiaryPage";
import MemeStudioPage from "./pages/MemeStudioPage";
import ServiceRequestsPage from "./pages/ServiceRequestsPage";
import { mockPet } from "./data/mockData";
import type { DiaryEntry, Pet, PetPhoto, Reminder, ServiceRequest, ServiceRequestStatus, VaccineRecord, VisitChecklist, VisitReport } from "./types";
import * as diaryService from "./services/diaryService";
import * as reminderService from "./services/reminderService";
import * as petService from "./services/petService";
import * as vaccineService from "./services/vaccineService";
import * as authService from "./services/authService";
import * as photoService from "./services/photoService";
import * as serviceRequestService from "./services/serviceRequestService";

type Page = "home" | "profile" | "vaccines" | "reminders" | "gallery" | "diary" | "meme" | "services";
type Toast = { type: "success" | "error"; message: string };

export default function App() {
  const [page, setPage] = useState<Page>("home");

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Data state
  const [pet, setPet] = useState<Pet>(mockPet);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [photos, setPhotos] = useState<PetPhoto[]>([]);
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([]);
  const [publicRequests, setPublicRequests] = useState<ServiceRequest[]>([]);
  const [myJobs, setMyJobs] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number | null>(null);

  // ── Auth session ─────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadData(user.id);
    } else {
      // Clear data when logged out
      setPet(mockPet);
      setDiary([]);
      setReminders([]);
      setVaccines([]);
      setPhotos([]);
      setMyRequests([]);
      setPublicRequests([]);
      setMyJobs([]);
      setPage("home");
    }
  }, [user]);

  // ── Toast ────────────────────────────────────────────────────────────────────

  function showToast(type: Toast["type"], message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = window.setTimeout(() => setToast(null), 3000);
  }

  // ── Data loading ─────────────────────────────────────────────────────────────

  async function loadData(userId: string) {
    setLoading(true);
    setLoadError(null);
    try {
      const [entries, rems, fetchedPet, vaxes, fetchedPhotos, myReqs, pubReqs, jobs] = await Promise.all([
        diaryService.fetchDiaryEntries(),
        reminderService.fetchReminders(),
        petService.fetchPet(),
        vaccineService.fetchVaccines(),
        photoService.fetchPhotos(),
        serviceRequestService.fetchMyRequests(userId),
        serviceRequestService.fetchPublicRequests(userId),
        serviceRequestService.fetchMyJobs(userId),
      ]);
      setDiary(entries);
      setReminders(rems);
      setVaccines(vaxes);
      setPhotos(fetchedPhotos);
      setMyRequests(myReqs);
      setPublicRequests(pubReqs);
      setMyJobs(jobs);

      if (fetchedPet) {
        setPet(fetchedPet);
      } else {
        // New user — start with a blank profile (user fills it in themselves)
        setPet({
          id: userId,
          name: "",
          species: "Cat",
          gender: "",
          ageLabel: "",
          neutered: false,
          indoor: true,
          personality: [],
        });
      }
    } catch (err) {
      console.error(err);
      setLoadError("Could not load data. Please check your Supabase connection.");
    } finally {
      setLoading(false);
    }
  }

  // ── Auth actions ──────────────────────────────────────────────────────────────

  async function handleLogout() {
    try {
      await authService.signOut();
    } catch (err) {
      console.error(err);
    }
  }

  // ── Photos ───────────────────────────────────────────────────────────────────

  async function addPhoto(file: File, caption: string, tags: string[], date: string): Promise<void> {
    try {
      const storagePath = await photoService.uploadPhoto(file, user!.id);
      const created = await photoService.createPhotoRecord(
        { petId: pet.id, storagePath, caption, tags, date },
        user!.id
      );
      const signedUrl = await photoService.createSignedUrl(storagePath);
      setPhotos((prev) => [{ ...created, signedUrl }, ...prev]);
      showToast("success", "Photo uploaded! 📸");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to upload photo. Please try again.");
      throw err;
    }
  }

  async function removePhoto(photoId: string, storagePath: string): Promise<void> {
    try {
      await photoService.deletePhoto(photoId, storagePath);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      showToast("success", "Photo deleted.");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to delete photo.");
    }
  }

  // ── Pet ──────────────────────────────────────────────────────────────────────

  async function savePet(updated: Pet): Promise<void> {
    try {
      const saved = await petService.upsertPet(updated, user!.id);
      setPet(saved);
      showToast("success", "Profile updated! 🐾");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to update profile.");
      throw err;
    }
  }

  // ── Vaccines ──────────────────────────────────────────────────────────────────

  async function addVaccine(vaccine: VaccineRecord): Promise<void> {
    try {
      const created = await vaccineService.createVaccine(
        {
          petId: pet.id,
          name: vaccine.name,
          doseNumber: vaccine.doseNumber,
          dateGiven: vaccine.dateGiven,
          nextDueDate: vaccine.nextDueDate,
          clinicName: vaccine.clinicName,
          notes: vaccine.notes,
        },
        user!.id
      );
      setVaccines((prev) => [created, ...prev]);
      showToast("success", "Vaccine record added! 💉");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to save vaccine record.");
      throw err;
    }
  }

  async function editVaccine(vaccine: VaccineRecord): Promise<void> {
    try {
      await vaccineService.updateVaccine(vaccine);
      setVaccines((prev) => prev.map((v) => (v.id === vaccine.id ? vaccine : v)));
      showToast("success", "Vaccine record updated! 💉");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to update vaccine record.");
      throw err;
    }
  }

  async function removeVaccine(id: string): Promise<void> {
    try {
      await vaccineService.deleteVaccine(id);
      setVaccines((prev) => prev.filter((v) => v.id !== id));
      showToast("success", "Vaccine record deleted.");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to delete vaccine record.");
    }
  }

  // ── Diary ─────────────────────────────────────────────────────────────────────

  async function addDiaryEntry(entry: DiaryEntry): Promise<void> {
    try {
      const created = await diaryService.createDiaryEntry(
        {
          petId: pet.id,
          date: entry.date,
          mood: entry.mood,
          food: entry.food,
          activity: entry.activity,
          notes: entry.notes,
        },
        user!.id
      );
      setDiary((prev) => [created, ...prev]);
      showToast("success", "Diary entry saved! 🐾");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to save diary entry. Please try again.");
      throw err;
    }
  }

  async function updateDiaryEntry(entry: DiaryEntry): Promise<void> {
    try {
      await diaryService.updateDiaryEntry(entry);
      setDiary((prev) => prev.map((e) => (e.id === entry.id ? entry : e)));
      showToast("success", "Diary entry updated! 🐾");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to update diary entry.");
      throw err;
    }
  }

  async function deleteDiaryEntry(id: string): Promise<void> {
    try {
      await diaryService.deleteDiaryEntry(id);
      setDiary((prev) => prev.filter((e) => e.id !== id));
      showToast("success", "Diary entry deleted.");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to delete. Please try again.");
    }
  }

  // ── Reminders ─────────────────────────────────────────────────────────────────

  async function addReminder(reminder: Reminder): Promise<void> {
    try {
      const created = await reminderService.createReminder(
        {
          petId: pet.id,
          title: reminder.title,
          category: reminder.category,
          dueDate: reminder.dueDate,
          status: reminder.status,
          notes: reminder.notes,
        },
        user!.id
      );
      setReminders((prev) => [created, ...prev]);
      showToast("success", "Reminder added! 🔔");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to save reminder. Please try again.");
      throw err;
    }
  }

  async function markReminderDone(id: string): Promise<void> {
    try {
      await reminderService.markReminderDone(id);
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "done" as const } : r))
      );
      showToast("success", "Marked as done! ✅");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to update reminder.");
    }
  }

  async function updateReminder(reminder: Reminder): Promise<void> {
    try {
      await reminderService.updateReminder(reminder);
      setReminders((prev) =>
        prev.map((r) => (r.id === reminder.id ? reminder : r))
      );
      showToast("success", "Reminder updated! 🔔");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to update reminder.");
      throw err;
    }
  }

  async function deleteReminder(id: string): Promise<void> {
    try {
      await reminderService.deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      showToast("success", "Reminder deleted.");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to delete. Please try again.");
    }
  }

  // ── Service Requests ──────────────────────────────────────────────────────────

  function updateInMyRequests(id: string, patch: Partial<ServiceRequest>) {
    setMyRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function updateInMyJobs(id: string, patch: Partial<ServiceRequest>) {
    setMyJobs((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function addServiceRequest(req: ServiceRequest): Promise<void> {
    try {
      const created = await serviceRequestService.createServiceRequest(req, user!.id);
      setMyRequests((prev) => [created, ...prev]);
      showToast("success", "Request posted! 🏡");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to post request.");
      throw err;
    }
  }

  async function updateServiceRequest(req: ServiceRequest): Promise<void> {
    try {
      await serviceRequestService.updateServiceRequest(req);
      updateInMyRequests(req.id, req);
      showToast("success", "Request updated! 🐾");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to update request.");
      throw err;
    }
  }

  async function deleteServiceRequest(id: string): Promise<void> {
    try {
      await serviceRequestService.deleteServiceRequest(id);
      setMyRequests((prev) => prev.filter((r) => r.id !== id));
      showToast("success", "Request deleted.");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to delete request.");
    }
  }

  async function cancelServiceRequest(id: string): Promise<void> {
    try {
      await serviceRequestService.updateStatus(id, "cancelled");
      updateInMyRequests(id, { status: "cancelled" });
      showToast("success", "Request cancelled.");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to cancel request.");
    }
  }

  async function acceptServiceRequest(id: string): Promise<void> {
    try {
      const accepted = await serviceRequestService.acceptRequest(id, user!.id);
      setPublicRequests((prev) => prev.filter((r) => r.id !== id));
      setMyJobs((prev) => [accepted, ...prev]);
      showToast("success", "You accepted the request! 🐾");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to accept request.");
    }
  }

  async function handleChecklistToggle(id: string, checklist: VisitChecklist): Promise<void> {
    try {
      await serviceRequestService.updateChecklist(id, checklist);
      updateInMyJobs(id, { checklist });
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to update checklist.");
    }
  }

  async function handleSaveReport(id: string, report: VisitReport): Promise<void> {
    try {
      await serviceRequestService.saveVisitReport(id, report);
      updateInMyJobs(id, { visitReport: report, status: "completed" });
      showToast("success", "Visit report saved! ✅");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to save visit report.");
      throw err;
    }
  }

  async function handleServiceStatusUpdate(id: string, status: ServiceRequestStatus): Promise<void> {
    try {
      await serviceRequestService.updateStatus(id, status);
      updateInMyJobs(id, { status });
      showToast("success", `Status updated to ${status.replace("_", " ")}!`);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to update status.");
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  // Checking auth session on startup
  if (authLoading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-5xl mb-3">🐾</p>
          <p className="text-sm font-medium">Loading MimiCare...</p>
        </div>
      </div>
    );
  }

  // Not logged in — show auth page
  if (!user) {
    return <AuthPage onAuthSuccess={() => {}} />;
  }

  function renderContent() {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <p className="text-5xl mb-3">🐱</p>
          <p className="text-sm font-medium">Loading Mimi's data...</p>
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-5xl mb-3">😿</p>
          <p className="font-medium text-gray-600 text-center max-w-sm mb-1">{loadError}</p>
          <p className="text-xs text-gray-400 text-center max-w-sm mb-5">
            Make sure your{" "}
            <code className="bg-gray-100 px-1 rounded">.env</code> file has the
            correct Supabase URL and anon key.
          </p>
          <button onClick={() => loadData(user!.id)} className="btn-primary">
            🔄 Retry
          </button>
        </div>
      );
    }

    return (
      <>
        {page === "home" && (
          <HomePage
            pet={pet}
            vaccines={vaccines}
            reminders={reminders}
            diary={diary}
            photos={photos}
            onNavigate={setPage}
          />
        )}
        {page === "profile" && (
          <PetProfilePage pet={pet} onUpdate={savePet} />
        )}
        {page === "vaccines" && (
          <VaccinesPage
            vaccines={vaccines}
            petId={pet.id}
            onAdd={addVaccine}
            onUpdate={editVaccine}
            onDelete={removeVaccine}
          />
        )}
        {page === "reminders" && (
          <RemindersPage
            reminders={reminders}
            petId={pet.id}
            onAdd={addReminder}
            onUpdate={updateReminder}
            onMarkDone={markReminderDone}
            onDelete={deleteReminder}
          />
        )}
        {page === "gallery" && (
          <GalleryPage
            photos={photos}
            petId={pet.id}
            onAdd={addPhoto}
            onDelete={removePhoto}
          />
        )}
        {page === "meme" && (
          <MemeStudioPage
            photos={photos}
            onNavigateToGallery={() => setPage("gallery")}
          />
        )}
        {page === "diary" && (
          <DiaryPage
            entries={diary}
            petId={pet.id}
            onAdd={addDiaryEntry}
            onUpdate={updateDiaryEntry}
            onDelete={deleteDiaryEntry}
          />
        )}
        {page === "services" && (
          <ServiceRequestsPage
            myRequests={myRequests}
            publicRequests={publicRequests}
            myJobs={myJobs}
            petId={pet.id}
            onAdd={addServiceRequest}
            onUpdate={updateServiceRequest}
            onDelete={deleteServiceRequest}
            onCancel={cancelServiceRequest}
            onAccept={acceptServiceRequest}
            onChecklistToggle={handleChecklistToggle}
            onSaveReport={handleSaveReport}
            onUpdateStatus={handleServiceStatusUpdate}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        currentPage={page}
        onNavigate={setPage}
        userEmail={user.email}
        onLogout={handleLogout}
      />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {renderContent()}
      </main>
      <Footer />

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium border ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-500"
          }`}
        >
          <span>{toast.type === "success" ? "✓" : "😿"}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
