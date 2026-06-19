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
- Upload photos directly from the browser (JPEG, PNG, WebP · max 5MB)
- Preview before upload with file validation
- Photos stored in a **private** Supabase Storage bucket — no public URLs
- Display via signed URLs (expire in 1 hour, regenerated on each page load)
- Delete photo with confirmation (removes from both DB and storage)
- Responsive grid layout with caption, tags, and date
- Empty state for new users

### 🎨 Meme Studio
- Pick any photo from your gallery
- Describe the mood or situation in plain text
- AI generates 4 cute, cat-voiced meme captions via OpenAI (server-side — API key never exposed to client)
- Click a caption to overlay it on the photo using HTML Canvas
- Toggle caption position: top or bottom
- Download the finished meme as a PNG

### 📖 Diary
- Daily entries with mood, food, activity, and personal notes
- Add, edit, delete diary entries
- Mood badges with color coding (happy, sleepy, playful, grumpy, sick, calm)
- Mood frequency summary overview
- Persisted in Supabase database

### 🏡 Pet Sitting & Feeding — Community Marketplace
- **Owner** posts a service request (service type, date/time, duration, area, public description)
- **Community** tab shows open requests from other users — sensitive details hidden until accepted
- Users **apply** with a short message instead of instantly claiming a slot
- Owner reviews applicants, accepts one (others are auto-declined), sitter is then assigned
- **Sitter Profiles**: display name, bio, area, cat/dog experience, available days, preferred services
- Trust badges derived from real data: completed visit count, top-rated badge (≥ 4.5 avg, ≥ 3 reviews)
- **Reviews**: owner can leave a 1–5 star rating + comment after completion; shown on sitter's profile; one review per request enforced by unique DB constraint
- **In-app notifications**: new application, accepted/declined, visit completed, new review — bell icon in navbar with unread count badge and mark-all-read
- **My Jobs** tab: accepted sitter can start the visit, tick the checklist live, and submit a visit report to mark it complete
- Status workflow: **Open → Accepted → In Progress → Completed** (owner can cancel at Open or Accepted)
- Privacy enforced at both DB level (split table) and UI level (role-based field rendering)

---

## 🛠 Tech Stack

| Tool | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI component framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite](https://vitejs.dev/) | Fast dev server and bundler |
| [Tailwind CSS v3](https://tailwindcss.com/) | Utility-first styling |
| [Supabase](https://supabase.com/) | PostgreSQL database, Auth, and client |
| [OpenAI API](https://platform.openai.com/) | Caption generation via gpt-4o-mini (server-side only) |
| [Vercel](https://vercel.com/) | Hosting + serverless Edge Functions |

Pet profile, vaccines, diary entries, reminders, and photos are fully persisted in Supabase. User authentication uses Supabase Auth with email/password. Each user's data is isolated via Row Level Security (RLS). Meme caption generation uses a Vercel Edge Function so the OpenAI API key stays server-side.

---

## 🗂 Project Structure

```
api/
└── generate-caption.ts    # Vercel Edge Function — calls OpenAI, keeps API key server-side
src/
├── components/
│   ├── home/
│   │   └── CareSummaryDashboard.tsx   # 4-tile care overview
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── auth/
│   │   └── AuthPage.tsx               # Login / sign-up page
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
│   │   ├── PhotoCard.tsx
│   │   └── PhotoUploadForm.tsx
│   ├── diary/
│   │   ├── DiaryCard.tsx
│   │   └── DiaryForm.tsx
│   └── services/
│       ├── ServiceRequestCard.tsx  # Card with checklist, report, status actions
│       ├── ServiceRequestForm.tsx  # Create / edit form
│       └── VisitReportForm.tsx     # Post-visit report form
├── data/
│   └── mockData.ts        # Static mock data (pet profile default)
├── hooks/
│   └── useLocalStorage.ts
├── lib/
│   └── supabase.ts        # Supabase client instance
├── services/
│   ├── authService.ts     # Supabase Auth (signUp, signIn, signOut, session)
│   ├── petService.ts      # Supabase upsert/fetch for pets
│   ├── vaccineService.ts  # Supabase CRUD for vaccines
│   ├── diaryService.ts    # Supabase CRUD for diary_entries
│   ├── reminderService.ts        # Supabase CRUD for reminders
│   ├── photoService.ts           # Supabase Storage upload + signed URLs + CRUD for photos
│   └── serviceRequestService.ts  # Supabase CRUD + checklist/report helpers for service_requests
├── pages/
│   ├── HomePage.tsx
│   ├── PetProfilePage.tsx
│   ├── VaccinesPage.tsx
│   ├── RemindersPage.tsx
│   ├── GalleryPage.tsx
│   ├── DiaryPage.tsx
│   ├── MemeStudioPage.tsx        # Photo picker + AI caption generator + canvas download
│   └── ServiceRequestsPage.tsx   # Pet sitting / feeding service requests with tabs
├── types/
│   └── index.ts           # TypeScript types: Pet, VaccineRecord, Reminder, DiaryEntry, PetPhoto, ServiceRequest
├── App.tsx                # Auth state, page routing, Supabase data loading, CRUD handlers
└── main.tsx
vercel.json                # Vercel build config (framework: vite)
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

**4. Enable Supabase Auth**

In your Supabase project → Authentication → Providers, make sure **Email** is enabled.

**5. Create Supabase tables with RLS**

In your Supabase project's SQL editor, run:

```sql
-- Tables with user_id for row-level isolation
create table pets (
  id text primary key,
  user_id uuid references auth.users(id) not null,
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
  user_id uuid references auth.users(id) not null,
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
  user_id uuid references auth.users(id) not null,
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
  user_id uuid references auth.users(id) not null,
  pet_id text not null,
  title text not null,
  category text not null,
  due_date date not null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table pets enable row level security;
alter table vaccines enable row level security;
alter table diary_entries enable row level security;
alter table reminders enable row level security;

-- RLS policies — each user can only access their own rows
create policy "Users manage own pets"
  on pets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own vaccines"
  on vaccines for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own diary entries"
  on diary_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own reminders"
  on reminders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

**6. Create the `service_requests` and `service_request_private_details` tables**

Sensitive fields (care instructions, home access, emergency contact, checklist, visit report) live in a separate private table. Public marketplace queries never touch it — only the owner and the accepted sitter can read or write it via RLS.

```sql
-- Drop existing tables if re-running
drop table if exists service_request_private_details;
drop table if exists service_requests;

-- Public fields only — visible to any authenticated user for open requests
create table service_requests (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) not null,
  sitter_user_id uuid references auth.users(id),
  pet_id text not null,
  service_type text not null,
  visit_date date not null,
  visit_time text not null,
  duration_minutes integer not null default 60,
  area text,
  public_description text,
  status text not null default 'open',
  created_at timestamptz default now()
);

alter table service_requests enable row level security;

create policy "Owner full access"
  on service_requests for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create policy "Public read open requests"
  on service_requests for select
  using (status = 'open' and owner_user_id != auth.uid());

create policy "Sitter read jobs"
  on service_requests for select
  using (auth.uid() = sitter_user_id);

create policy "Sitter update jobs"
  on service_requests for update
  using (auth.uid() = sitter_user_id)
  with check (auth.uid() = sitter_user_id);

create policy "Accept open request"
  on service_requests for update
  using (status = 'open' and owner_user_id != auth.uid() and sitter_user_id is null)
  with check (sitter_user_id = auth.uid() and status = 'accepted');

-- Private fields — only the owner and the accepted sitter can access
create table service_request_private_details (
  request_id uuid primary key references service_requests(id) on delete cascade,
  care_instructions text,
  home_access_notes text,
  emergency_contact_name text not null,
  emergency_contact_phone text not null,
  checklist jsonb not null default '{"feedPet":false,"refillWater":false,"cleanLitter":false,"playComfortPet":false,"sendUpdate":false}',
  visit_report jsonb
);

alter table service_request_private_details enable row level security;

create policy "Owner read private"
  on service_request_private_details for select
  using (exists (select 1 from service_requests where id = request_id and owner_user_id = auth.uid()));

create policy "Owner insert private"
  on service_request_private_details for insert
  with check (exists (select 1 from service_requests where id = request_id and owner_user_id = auth.uid()));

create policy "Owner update private"
  on service_request_private_details for update
  using (exists (select 1 from service_requests where id = request_id and owner_user_id = auth.uid()));

create policy "Sitter read private"
  on service_request_private_details for select
  using (exists (select 1 from service_requests where id = request_id and sitter_user_id = auth.uid()));

create policy "Sitter update private"
  on service_request_private_details for update
  using (exists (select 1 from service_requests where id = request_id and sitter_user_id = auth.uid()));

notify pgrst, 'reload schema';
```

> **Privacy model:** `service_requests` holds only public fields and is readable by any authenticated user for open requests. `service_request_private_details` is a 1:1 child table protected by 5 separate RLS policies — the owner has insert/read/update, the accepted sitter has read/update. Public marketplace queries select only named public columns and never join the private table, so sensitive data cannot leak even indirectly.

**7. Create Phase 8 community tables**

```sql
-- Sitter public profiles
create table sitter_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  bio text,
  area text,
  has_cat_experience boolean not null default true,
  has_dog_experience boolean not null default false,
  available_days text[] not null default '{}',
  preferred_service_types text[] not null default '{}'
);

alter table sitter_profiles enable row level security;

create policy "Anyone can read sitter profiles"
  on sitter_profiles for select using (true);

create policy "Users manage own sitter profile"
  on sitter_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Applications to open requests
create table applications (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references service_requests(id) on delete cascade not null,
  applicant_user_id uuid references auth.users(id) not null,
  message text not null,
  status text not null default 'pending',
  created_at timestamptz default now(),
  unique(request_id, applicant_user_id)
);

alter table applications enable row level security;

create policy "Applicant reads own applications"
  on applications for select using (auth.uid() = applicant_user_id);

create policy "Applicant inserts own application"
  on applications for insert
  with check (
    auth.uid() = applicant_user_id
    and not exists (
      select 1 from service_requests where id = request_id and owner_user_id = auth.uid()
    )
  );

create policy "Owner reads applications on own requests"
  on applications for select
  using (exists (select 1 from service_requests where id = request_id and owner_user_id = auth.uid()));

create policy "Owner updates application status"
  on applications for update
  using (exists (select 1 from service_requests where id = request_id and owner_user_id = auth.uid()));

-- Reviews (one per completed request)
create table reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references service_requests(id) on delete cascade not null unique,
  sitter_user_id uuid references auth.users(id) not null,
  owner_user_id uuid references auth.users(id) not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

alter table reviews enable row level security;

create policy "Anyone can read reviews"
  on reviews for select using (true);

create policy "Owner submits review for completed request"
  on reviews for insert
  with check (
    auth.uid() = owner_user_id
    and exists (
      select 1 from service_requests
      where id = request_id and owner_user_id = auth.uid() and status = 'completed'
    )
  );

-- In-app notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null,
  request_id uuid references service_requests(id) on delete set null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;

create policy "Users read own notifications"
  on notifications for select using (auth.uid() = user_id);

create policy "Authenticated users create notifications"
  on notifications for insert with check (auth.uid() is not null);

create policy "Users update own notifications"
  on notifications for update using (auth.uid() = user_id);

notify pgrst, 'reload schema';
```

> **Phase 8 RLS notes:** `sitter_profiles` is fully public (read-only for others). `applications` uses 4 policies — applicants can insert/read their own, request owner can read/update status. `reviews` enforces one-per-request via `unique(request_id)` and only the verified owner of a completed request can insert. `notifications` allows any authenticated user to insert (needed for cross-user notifications) but read/update is scoped to `user_id`.

**8. Create the `photos` table**

In the SQL editor, also run:

```sql
create table photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  pet_id text not null,
  storage_path text not null,
  caption text not null,
  tags text[] not null default '{}',
  date date not null,
  created_at timestamptz default now()
);

alter table photos enable row level security;

create policy "Users manage own photos"
  on photos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

**7. Create the `pet-photos` private storage bucket**

In your Supabase project → Storage → Create bucket:
- Name: `pet-photos`
- Make sure **Public** is **OFF** (private bucket)

Then in the SQL editor, add storage RLS policies:

```sql
-- Allow users to upload photos to their own folder (userId/filename)
create policy "Users upload own photos"
  on storage.objects for insert
  with check (
    bucket_id = 'pet-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to read their own photos (used for signed URLs)
create policy "Users read own photos"
  on storage.objects for select
  using (
    bucket_id = 'pet-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own photos
create policy "Users delete own photos"
  on storage.objects for delete
  using (
    bucket_id = 'pet-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

> Photos are stored as `userId/timestamp-filename`. Signed URLs are generated server-side and expire after 1 hour — no public access to the bucket.

**8. Set up OpenAI for Meme Studio**

The Meme Studio page calls `/api/generate-caption`. In development, this is handled by a Vite dev-server middleware (in `vite.config.ts`). In production on Vercel, the same route is handled by `api/generate-caption.ts` (a Vercel serverless function). The `OPENAI_API_KEY` stays server-side in both cases — it is never sent to or accessible from the browser.

Get a key at [platform.openai.com](https://platform.openai.com/) (gpt-4o-mini is used — very cheap per request).

Add it to your `.env`:
```
OPENAI_API_KEY=sk-...
```

**Local development:**

```bash
npm run dev
```

That's it — the Vite dev server loads `OPENAI_API_KEY` from `.env` and handles `/api/generate-caption` automatically. Open `http://localhost:5173`.

**On Vercel (production):**

Add `OPENAI_API_KEY` in your Vercel project → Settings → Environment Variables. The serverless function (`api/generate-caption.ts`) picks it up automatically on deploy.

**9. (Optional) Configure Supabase Storage CORS for canvas**

The Meme Studio canvas loads your photo using `crossOrigin="anonymous"`. Supabase Storage supports CORS by default, so this should work in most cases. If you see a canvas error, go to your Supabase project → Storage → CORS and add your domain (e.g., `http://localhost:3000`, `https://your-app.vercel.app`) as an allowed origin.

```bash
# 10. Start the dev server (without Meme Studio)
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

**Phase 6 — AI Meme Studio (current)**

Meme Studio is now live. Users pick any gallery photo, describe a mood or situation, and the app calls a Vercel Edge Function to generate 4 cute cat-voiced captions via OpenAI gpt-4o-mini. Selecting a caption renders it onto the photo using HTML Canvas with classic meme typography (Impact font, white text, black outline). Users can toggle caption position (top/bottom) and download the finished meme as a PNG. The `OPENAI_API_KEY` stays server-side — it is never sent to or accessible from the browser.

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
- Photo gallery remains mock data

### ✅ Phase 4 — Auth & RLS (complete)
- Email/password authentication via Supabase Auth
- Login and sign-up page with cute MimiCare styling
- Session persistence across page refreshes
- Each user's data isolated by `user_id` column + RLS policies
- Logout button in the navbar

### ✅ Phase 5 — Private Photo Upload (complete)
- Photo upload via private Supabase Storage bucket
- File validation: JPEG / PNG / WebP, max 5MB
- Preview before upload
- Display via signed URLs (1-hour expiry, no public access)
- Delete removes both DB record and storage file
- Storage RLS policies scoped to per-user folder

### ✅ Phase 6 — AI Meme Studio (complete)
- Pick any gallery photo as the meme base
- Describe mood/situation in plain text
- AI generates 4 cute cat-voiced captions via OpenAI gpt-4o-mini (server-side Vercel Edge Function)
- Click to overlay caption on photo with HTML Canvas (Impact font, white text, black outline)
- Toggle text position: top or bottom
- Download finished meme as PNG
- `OPENAI_API_KEY` is server-side only — never exposed to client

### Phase 7 — Extra Features
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
