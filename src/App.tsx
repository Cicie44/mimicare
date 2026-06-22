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
import CommunityPage from "./pages/CommunityPage";
import MessagesPage from "./pages/MessagesPage";
import ActivityPage from "./pages/ActivityPage";
import { mockPet } from "./data/mockData";
import type {
  AppNotification,
  CommunityPost,
  DiaryEntry,
  Pet,
  PetPhoto,
  PostApplication,
  Reminder,
  UserProfile,
  VaccineRecord,
} from "./types";
import * as diaryService from "./services/diaryService";
import * as reminderService from "./services/reminderService";
import * as petService from "./services/petService";
import * as vaccineService from "./services/vaccineService";
import * as authService from "./services/authService";
import * as photoService from "./services/photoService";
import * as notificationService from "./services/notificationService";
import * as userProfileService from "./services/userProfileService";
import * as postApplicationService from "./services/postApplicationService";
import * as communityService from "./services/communityService";
import * as messageService from "./services/messageService";

type Page = "home" | "profile" | "vaccines" | "reminders" | "gallery" | "diary" | "meme" | "community" | "messages" | "activity";
type Toast = { type: "success" | "error"; message: string };

export default function App() {
  const [page, setPage] = useState<Page>("home");

  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Core data
  const [pet, setPet] = useState<Pet>(mockPet);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [photos, setPhotos] = useState<PetPhoto[]>([]);

  // Community
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [postApplications, setPostApplications] = useState<PostApplication[]>([]);
  const [myPostApplications, setMyPostApplications] = useState<PostApplication[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Messages & blocking
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [initialConversationId, setInitialConversationId] = useState<string | undefined>();

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number | null>(null);

  // ── Auth ──────────────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadData(user.id);
    } else {
      setPet(mockPet);
      setDiary([]);
      setReminders([]);
      setVaccines([]);
      setPhotos([]);
      setUserProfile(null);
      setPostApplications([]);
      setMyPostApplications([]);
      setNotifications([]);
      setBlockedUserIds([]);
      setUnreadMessageCount(0);
      setPage("home");
    }
  }, [user]);

  // ── Toast ─────────────────────────────────────────────────────────────────────

  function showToast(type: Toast["type"], message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = window.setTimeout(() => setToast(null), 3000);
  }

  // ── Data loading ──────────────────────────────────────────────────────────────

  async function loadData(userId: string) {
    setLoading(true);
    setLoadError(null);
    try {
      const [
        entries, rems, fetchedPet, vaxes, fetchedPhotos,
        profile, postApps, myApps, notifs, blocked, unreadMsgs,
      ] = await Promise.all([
        diaryService.fetchDiaryEntries(),
        reminderService.fetchReminders(),
        petService.fetchPet(),
        vaccineService.fetchVaccines(),
        photoService.fetchPhotos(),
        userProfileService.fetchProfile(userId),
        postApplicationService.fetchApplicationsForMyPosts(userId),
        postApplicationService.fetchMyPostApplications(userId),
        notificationService.fetchNotifications(userId),
        messageService.fetchBlockedUserIds(userId),
        messageService.fetchUnreadMessageCount(userId),
      ]);
      setDiary(entries);
      setReminders(rems);
      setVaccines(vaxes);
      setPhotos(fetchedPhotos);
      setUserProfile(profile);
      setPostApplications(postApps);
      setMyPostApplications(myApps);
      setNotifications(notifs);
      setBlockedUserIds(blocked);
      setUnreadMessageCount(unreadMsgs);

      if (fetchedPet) {
        setPet(fetchedPet);
      } else {
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
    try { await authService.signOut(); } catch (err) { console.error(err); }
  }

  // ── Photos ────────────────────────────────────────────────────────────────────

  async function addPhoto(file: File, caption: string, tags: string[], date: string): Promise<void> {
    try {
      const storagePath = await photoService.uploadPhoto(file, user!.id);
      const created = await photoService.createPhotoRecord(
        { petId: pet.id, storagePath, caption, tags, date }, user!.id
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

  // ── Pet ───────────────────────────────────────────────────────────────────────

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
        { petId: pet.id, name: vaccine.name, doseNumber: vaccine.doseNumber,
          dateGiven: vaccine.dateGiven, nextDueDate: vaccine.nextDueDate,
          clinicName: vaccine.clinicName, notes: vaccine.notes }, user!.id
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
        { petId: pet.id, date: entry.date, mood: entry.mood,
          food: entry.food, activity: entry.activity, notes: entry.notes }, user!.id
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
        { petId: pet.id, title: reminder.title, category: reminder.category,
          dueDate: reminder.dueDate, status: reminder.status, notes: reminder.notes }, user!.id
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
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, status: "done" as const } : r)));
      showToast("success", "Marked as done! ✅");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to update reminder.");
    }
  }

  async function updateReminder(reminder: Reminder): Promise<void> {
    try {
      await reminderService.updateReminder(reminder);
      setReminders((prev) => prev.map((r) => (r.id === reminder.id ? reminder : r)));
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

  // ── Community ─────────────────────────────────────────────────────────────────

  async function handleSaveProfile(
    profile: Omit<UserProfile, "completedVisitsCount" | "averageRating" | "reviewCount" | "postCount">
  ): Promise<void> {
    try {
      const saved = await userProfileService.upsertProfile(profile, user!.id);
      setUserProfile(saved);
      showToast("success", "Profile saved! 🐾");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to save profile.");
      throw err;
    }
  }

  async function handleApply(postId: string, message: string, postOwnerId: string): Promise<void> {
    try {
      const app = await postApplicationService.applyToPost(postId, message, user!.id);
      setMyPostApplications((prev) => [app, ...prev]);
      showToast("success", "Application sent! 🐾");
      notificationService.createNotification(
        postOwnerId, "new_application",
        "🙋 Someone applied to your Sitter Help post!", { postId }
      ).catch(console.error);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to send application.");
      throw err;
    }
  }

  async function handleAcceptApplicant(
    postId: string, appId: string, applicantUserId: string
  ): Promise<void> {
    try {
      await postApplicationService.acceptPostApplication(postId, appId, applicantUserId);
      setPostApplications((prev) =>
        prev.map((a) =>
          a.postId === postId
            ? { ...a, status: a.id === appId ? "accepted" : "declined" }
            : a
        ) as PostApplication[]
      );
      await messageService.activateConversation(user!.id, applicantUserId);
      await notificationService.createNotification(
        applicantUserId, "application_accepted",
        "✅ Your Sitter Help application was accepted!", { postId }
      );
      showToast("success", "Applicant accepted! ✅");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to accept applicant.");
    }
  }

  async function handleDeclineApplicant(appId: string, applicantUserId: string): Promise<void> {
    try {
      await postApplicationService.declinePostApplication(appId);
      setPostApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: "declined" as const } : a))
      );
      showToast("success", "Application declined.");
      notificationService.createNotification(
        applicantUserId, "application_declined",
        "Your Sitter Help application was not selected this time."
      ).catch(console.error);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to decline application.");
    }
  }

  async function handleCompletePost(postId: string): Promise<void> {
    try {
      await communityService.updatePostStatus(postId, "completed");
      showToast("success", "Marked as completed! 🎉");
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to update status.");
      throw err;
    }
  }

  function handlePostCreated(_post: CommunityPost) {
    if (user) {
      postApplicationService.fetchApplicationsForMyPosts(user.id)
        .then(setPostApplications)
        .catch(console.error);
    }
  }

  function handlePostDeleted(_postId: string) {}

  // ── Messages ──────────────────────────────────────────────────────────────────

  async function handleStartConversation(otherUserId: string): Promise<void> {
    try {
      const conv = await messageService.findOrCreateConversation(user!.id, otherUserId, "request");
      setInitialConversationId(conv.id);
      setPage("messages");
    } catch (err) {
      console.error(err);
      showToast("error", "Could not open conversation.");
    }
  }

  async function handleBlockUser(userId: string): Promise<void> {
    try {
      await messageService.blockUser(user!.id, userId);
      setBlockedUserIds((prev) => [...prev, userId]);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to block user.");
      throw err;
    }
  }

  // ── Notifications ─────────────────────────────────────────────────────────────

  function handleMarkNotificationRead(id: string) {
    notificationService.markAsRead(id).catch(console.error);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function handleMarkAllNotificationsRead() {
    notificationService.markAllAsRead(user!.id).catch(console.error);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  // ── Render ────────────────────────────────────────────────────────────────────

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

  if (!user) return <AuthPage onAuthSuccess={() => {}} />;

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
            Make sure your <code className="bg-gray-100 px-1 rounded">.env</code> file has the
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
            pet={pet} vaccines={vaccines} reminders={reminders}
            diary={diary} photos={photos} onNavigate={setPage}
          />
        )}
        {page === "profile" && <PetProfilePage pet={pet} onUpdate={savePet} />}
        {page === "vaccines" && (
          <VaccinesPage
            vaccines={vaccines} petId={pet.id}
            onAdd={addVaccine} onUpdate={editVaccine} onDelete={removeVaccine}
          />
        )}
        {page === "reminders" && (
          <RemindersPage
            reminders={reminders} petId={pet.id}
            onAdd={addReminder} onUpdate={updateReminder}
            onMarkDone={markReminderDone} onDelete={deleteReminder}
          />
        )}
        {page === "gallery" && (
          <GalleryPage
            photos={photos} petId={pet.id}
            onAdd={addPhoto} onDelete={removePhoto}
          />
        )}
        {page === "meme" && (
          <MemeStudioPage photos={photos} onNavigateToGallery={() => setPage("gallery")} />
        )}
        {page === "diary" && (
          <DiaryPage
            entries={diary} petId={pet.id}
            onAdd={addDiaryEntry} onUpdate={updateDiaryEntry} onDelete={deleteDiaryEntry}
          />
        )}
        {page === "community" && (
          <CommunityPage
            currentUserId={user!.id}
            userProfile={userProfile}
            postApplications={postApplications}
            myPostApplications={myPostApplications}
            blockedUserIds={blockedUserIds}
            onSaveProfile={handleSaveProfile}
            onApply={handleApply}
            onAcceptApplicant={handleAcceptApplicant}
            onDeclineApplicant={handleDeclineApplicant}
            onComplete={handleCompletePost}
            onPostCreated={handlePostCreated}
            onPostDeleted={handlePostDeleted}
            onStartConversation={handleStartConversation}
            onBlockUser={handleBlockUser}
            showToast={showToast}
          />
        )}
        {page === "messages" && (
          <MessagesPage
            currentUserId={user!.id}
            initialConversationId={initialConversationId}
            onUnreadCountChange={setUnreadMessageCount}
            onBlock={handleBlockUser}
            showToast={showToast}
          />
        )}
        {page === "activity" && (
          <ActivityPage
            notifications={notifications}
            onMarkRead={handleMarkNotificationRead}
            onMarkAllRead={handleMarkAllNotificationsRead}
            onNavigateToCommunity={() => setPage("community")}
            onNavigateToMessages={() => setPage("messages")}
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
        notifications={notifications}
        unreadMessageCount={unreadMessageCount}
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
