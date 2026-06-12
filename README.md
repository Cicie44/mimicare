# 🐾 MimiCare

> A warm, personal pet care diary app — built for Mimi, a real Ragdoll cat who demands cuddles at 3am.

MimiCare is a frontend pet care web application that helps cat owners track health records, vaccine schedules, daily care reminders, diary entries, and photo memories — all in one cozy place.

This project is both a real-use personal tool and a portfolio project demonstrating React, TypeScript, Supabase, and component-based UI design.

---

## 🐱 Why I Built This

I have a Ragdoll cat named Mimi. She is gentle, a little clingy, and has a talent for sitting on my laptop at the worst possible moments.

When it came to tracking her vaccines, vet appointments, and daily routines, I was using a mix of phone notes, calendar reminders, and memory — which meant things got missed. I wanted something friendlier and more personal than a generic health app.

So I built MimiCare: a small, warm, focused app designed around one cat's life. It also gave me the chance to practice building a real-world React + TypeScript frontend from the ground up, with thoughtful UI design and clean component structure.

---

## ✨ Features

### 🏠 Home Dashboard
- Hero section with Mimi's avatar and welcome message
- **Care Overview** — 4-tile summary card showing:
  - Next vaccine due (with countdown in days)
  - Pending and overdue reminders count
  - Latest diary mood entry
  - Total photo memories count
- Quick-access sections for reminders, diary, and photos

### 🐱 Pet Profile
- Full profile card: name, breed, age, gender, birthday
- Indoor/outdoor and neutered status
- Personality trait badges

### 💉 Vaccine Tracker
- Cards for each vaccine record with date given, next due date, and clinic
- Smart status badges: ✅ Up to date / 📅 Due soon / ⚠️ Overdue
- Sorted by nearest upcoming due date

### 🔔 Care Reminders
- Grouped by status: Overdue / Pending / Done
- Filter tabs: All / Pending / Overdue / Done
- Add, edit, delete reminders
- Category icons (Health, Grooming, Nutrition, Hygiene)
- Color-coded status badges
- Persisted in Supabase database

### 📸 Photo Gallery
- Responsive grid of photo memory cards
- Caption, tags, and date for each photo
- Hover zoom effect

### 📖 Diary
- Daily entries with mood, food, activity, and personal notes
- Add, edit, delete diary entries
- Mood badges with color coding (happy, sleepy, playful, grumpy, sick, calm)
- Mood frequency summary overview
- Persisted in Supabase database

---

## 🛠 Tech Stack

| Tool | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI component framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite](https://vitejs.dev/) | Fast dev server and bundler |
| [Tailwind CSS v3](https://tailwindcss.com/) | Utility-first styling |
| [Supabase](https://supabase.com/) | PostgreSQL database and client |

Pet profile, vaccines, diary entries, and reminders are persisted in Supabase. Photo gallery uses static mock data for now. Authentication is planned for a future phase.

---

## 🗂 Project Structure

```
src/
├── components/
│   ├── home/
│   │   └── CareSummaryDashboard.tsx   # 4-tile care overview
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── pet/
│   │   ├── PetProfileCard.tsx
│   │   └── PetForm.tsx
│   ├── health/
│   │   ├── VaccineCard.tsx
│   │   └── VaccineForm.tsx
│   ├── reminders/
│   │   ├── ReminderCard.tsx
│   │   └── ReminderForm.tsx
│   ├── gallery/
│   │   └── PhotoCard.tsx
│   └── diary/
│       ├── DiaryCard.tsx
│       └── DiaryForm.tsx
├── data/
│   └── mockData.ts        # Static mock data (pet, vaccines, photos)
├── hooks/
│   └── useLocalStorage.ts # Retained for potential future use
├── lib/
│   └── supabase.ts        # Supabase client instance
├── services/
│   ├── petService.ts      # Supabase upsert/fetch for pets
│   ├── vaccineService.ts  # Supabase CRUD for vaccines
│   ├── diaryService.ts    # Supabase CRUD for diary_entries
│   └── reminderService.ts # Supabase CRUD for reminders
├── pages/
│   ├── HomePage.tsx
│   ├── PetProfilePage.tsx
│   ├── VaccinesPage.tsx
│   ├── RemindersPage.tsx
│   ├── GalleryPage.tsx
│   └── DiaryPage.tsx
├── types/
│   └── index.ts           # TypeScript types: Pet, VaccineRecord, Reminder, DiaryEntry, PetPhoto
├── App.tsx                # Page routing, Supabase data loading, CRUD handlers
└── main.tsx
```

---

## 🚀 How to Run Locally

**Requirements:** Node.js 18+, a free [Supabase](https://supabase.com/) account

```bash
# 1. Clone the repo
git clone https://github.com/Cicie44/mimicare.git
cd mimicare

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Then edit .env and fill in your Supabase project URL and anon key
```

**4. Create Supabase tables**

In your Supabase project's SQL editor, run:

```sql
create table pets (
  id text primary key,
  name text not null,
  species text not null,
  breed text,
  gender text not null,
  birthday date,
  age_label text not null,
  neutered boolean not null default false,
  indoor boolean not null default true,
  personality text[] not null default '{}',
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table vaccines (
  id uuid primary key default gen_random_uuid(),
  pet_id text not null,
  name text not null,
  dose_number integer not null default 1,
  date_given date not null,
  next_due_date date,
  clinic_name text,
  notes text,
  created_at timestamptz default now()
);

create table diary_entries (
  id uuid primary key default gen_random_uuid(),
  pet_id text not null,
  date date not null,
  mood text not null,
  food text,
  activity text,
  notes text,
  created_at timestamptz default now()
);

create table reminders (
  id uuid primary key default gen_random_uuid(),
  pet_id text not null,
  title text not null,
  category text not null,
  due_date date not null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz default now()
);
```

```bash
# 5. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

---

## 📸 Screenshots

> Screenshots to be added. Run the app locally to see the full UI.

| Page | Preview |
|---|---|
| Home | `./screenshots/home.png` |
| Pet Profile | `./screenshots/profile.png` |
| Vaccine Tracker | `./screenshots/vaccines.png` |
| Care Reminders | `./screenshots/reminders.png` |
| Photo Gallery | `./screenshots/gallery.png` |
| Diary | `./screenshots/diary.png` |

---

## 📍 Current Status

**Phase 3.5 — Extended Supabase Integration (current)**

Pet profile, vaccines, diary entries, and reminders are all persisted in Supabase PostgreSQL. Full CRUD is supported across all four data types. Photo gallery is the only remaining mock data section.

UX polish: loading state on startup, retry button on connection failure, submit loading states on all forms, success/error toast notifications for every operation.

---

## 🗺 Roadmap

### ✅ Phase 1 — Static Frontend (complete)
All pages built with mock data. Fully navigable and responsive.

### ✅ Phase 2 — Local CRUD (complete)
Add, edit, delete diary entries and reminders. Data stored in `localStorage`.

### ✅ Phase 3 — Supabase Integration (complete)
- Diary entries and reminders persisted in Supabase PostgreSQL
- Service layer with mapper functions (snake_case DB ↔ camelCase frontend)
- Loading state on initial data fetch, retry button on failure
- Toast notifications for all CRUD operations

### ✅ Phase 3.5 — Extended Supabase Integration (complete)
- Pet profile and vaccine records now also persisted in Supabase
- Edit Pet Profile form with all fields
- Vaccine CRUD: add, edit, delete vaccine records with status badges preserved
- Inline form validation and submit loading states across all forms
- Photo gallery remains mock data (upload planned for Phase 4)

### Phase 4 — Auth & Uploads
- User authentication with Supabase Auth
- Photo upload via Supabase Storage
- User-specific pet data
- Row Level Security policies

### Phase 5 — Extra Features
- Multi-pet support
- Reminder notifications (browser push or email)
- Calendar view for vaccines and appointments
- Health record export (PDF)

---

## 🧡 About the Cat

**Mimi** is a real Ragdoll cat. She is 2 years old, indoor, spayed, and extremely clingy.

She enjoys: sunny windowsills, shoulder cuddles, and sitting on keyboards during important meetings.

She does not enjoy: nail trimming, Mondays, or being ignored for more than 4 minutes.

---

## 📄 License

MIT — feel free to use this as a template for your own pet care app.

---

*Built with 🐾 and too much cat hair.*
