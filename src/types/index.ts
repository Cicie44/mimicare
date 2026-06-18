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
