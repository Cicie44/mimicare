export type Pet = {
  id: string;
  name: string;
  species: string;
  breed?: string;
  gender: string;
  birthday?: string;
  ageLabel: string;
  neutered: boolean;
  indoor: boolean;
  personality: string[];
  avatarUrl?: string;
};

export type VaccineRecord = {
  id: string;
  petId: string;
  name: string;
  doseNumber: number;
  dateGiven: string;
  nextDueDate?: string;
  clinicName?: string;
  notes?: string;
};

export type Reminder = {
  id: string;
  petId: string;
  title: string;
  category: string;
  dueDate: string;
  status: "pending" | "done" | "overdue";
  notes?: string;
};

export type DiaryEntry = {
  id: string;
  petId: string;
  date: string;
  mood: "happy" | "sleepy" | "playful" | "grumpy" | "sick" | "calm";
  food?: string;
  activity?: string;
  notes?: string;
};

export type PetPhoto = {
  id: string;
  petId: string;
  storagePath: string;
  signedUrl?: string;
  caption: string;
  tags: string[];
  date: string;
};

export type ServiceRequestStatus =
  | "open"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export type VisitChecklist = {
  feedPet: boolean;
  refillWater: boolean;
  cleanLitter: boolean;
  playComfortPet: boolean;
  sendUpdate: boolean;
};

export type VisitReport = {
  arrivalTime: string;
  departureTime: string;
  foodGiven: boolean;
  waterRefilled: boolean;
  litterCleaned: boolean;
  petMood: string;
  notes?: string;
};

export type ServiceRequest = {
  id: string;
  ownerUserId: string;
  sitterUserId?: string;
  petId: string;
  serviceType: string;
  visitDate: string;
  visitTime: string;
  durationMinutes: number;
  area?: string;
  publicDescription?: string;
  careInstructions?: string;
  homeAccessNotes?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  status: ServiceRequestStatus;
  checklist: VisitChecklist;
  visitReport?: VisitReport;
  createdAt?: string;
};

// ── Phase 8 types ─────────────────────────────────────────────────────────────

export type SitterProfile = {
  userId: string;
  displayName: string;
  bio?: string;
  area?: string;
  hasCatExperience: boolean;
  hasDogExperience: boolean;
  availableDays: string[];
  preferredServiceTypes: string[];
  completedVisitsCount: number;
  averageRating?: number;
  reviewCount: number;
};

export type ApplicationStatus = "pending" | "accepted" | "declined";

export type Application = {
  id: string;
  requestId: string;
  applicantUserId: string;
  applicantDisplayName?: string;
  message: string;
  status: ApplicationStatus;
  createdAt: string;
};

export type Review = {
  id: string;
  requestId: string;
  sitterUserId: string;
  ownerUserId: string;
  rating: number;
  comment?: string;
  createdAt: string;
};

export type NotificationType =
  | "new_application"
  | "application_accepted"
  | "application_declined"
  | "visit_completed"
  | "new_review";

export type AppNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  requestId?: string;
  message: string;
  read: boolean;
  createdAt: string;
};
