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

// ── User profile (replaces SitterProfile) ────────────────────────────────────

export type UserProfile = {
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
  postCount: number;
};

// Keep legacy alias so old service files still compile during transition
export type SitterProfile = UserProfile;

// ── Legacy Phase 8 types (kept for existing service files) ────────────────────

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
  | "new_review"
  | "post_comment"
  | "post_like"
  | "help_application";

export type AppNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  requestId?: string;
  postId?: string;
  message: string;
  read: boolean;
  createdAt: string;
};

// ── Community types ───────────────────────────────────────────────────────────

export type PostCategory = "pet_daily" | "tips" | "sitter_help";
export type PostStatus = "open" | "accepted" | "completed";
export type CompensationType = "volunteer" | "open" | "fixed";

export type SitterHelpDetails = {
  postId: string;
  requestDate?: string;
  area?: string;
  petType?: string;
  duration?: string;
  compensation: CompensationType;
  compensationNote?: string;
};

export type CommunityPost = {
  id: string;
  userId: string;
  authorName?: string;
  category: PostCategory;
  title?: string;
  content: string;
  storagePath?: string;
  signedUrl?: string;
  tags: string[];
  status: PostStatus;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  helpDetails?: SitterHelpDetails;
};

export type PostComment = {
  id: string;
  postId: string;
  userId: string;
  authorName?: string;
  content: string;
  createdAt: string;
};

export type PostApplication = {
  id: string;
  postId: string;
  applicantUserId: string;
  applicantDisplayName?: string;
  message?: string;
  status: ApplicationStatus;
  createdAt: string;
};

export type PostReview = {
  id: string;
  postId: string;
  reviewerUserId: string;
  sitterUserId: string;
  rating: number;
  comment?: string;
  createdAt: string;
};

// ── Messaging ─────────────────────────────────────────────────────────────────

export type ConversationStatus = "active" | "request" | "blocked";

export type Conversation = {
  id: string;
  participantA: string;
  participantB: string;
  status: ConversationStatus;
  initiatedBy?: string;
  lastMessageAt: string;
  createdAt: string;
  // enriched client-side
  otherUserId: string;
  otherUserName?: string;
  lastMessagePreview?: string;
  unreadCount: number;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt?: string;
  createdAt: string;
};
