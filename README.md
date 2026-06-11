# 🐾 MimiCare

> A warm, personal pet care diary app — built for Mimi, a real Ragdoll cat who demands cuddles at 3am.

MimiCare is a frontend pet care web application that helps cat owners track health records, vaccine schedules, daily care reminders, diary entries, and photo memories — all in one cozy place.

This project is both a real-use personal tool and a portfolio project demonstrating React, TypeScript, and component-based UI design.

---

## 🐱 Why I Built This

I have a Ragdoll cat named Mimi. She is gentle, a little clingy, and has a talent for sitting on my laptop at the worst possible moments.

When it came to tracking her vaccines, vet appointments, and daily routines, I was using a mix of phone notes, calendar reminders, and memory — which meant things got missed. I wanted something friendlier and more personal than a generic health app.

So I built MimiCare: a small, warm, focused app designed around one cat's life. It also gave me the chance to practice building a real-world React + TypeScript frontend from the ground up, with thoughtful UI design and clean component structure.

---

## ✨ Features (Phase 1 — Static Frontend)

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
- Category icons (Health, Grooming, Nutrition, Hygiene)
- Color-coded status badges

### 📸 Photo Gallery
- Responsive grid of photo memory cards
- Caption, tags, and date for each photo
- Hover zoom effect

### 📖 Diary
- Daily entries with mood, food, activity, and personal notes
- Mood badges with color coding (happy, sleepy, playful, grumpy, sick, calm)
- Mood frequency summary overview

---

## 🛠 Tech Stack

| Tool | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI component framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite](https://vitejs.dev/) | Fast dev server and bundler |
| [Tailwind CSS v3](https://tailwindcss.com/) | Utility-first styling |

No backend, no database, no authentication in Phase 1. All data is static mock data.

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
│   │   └── PetProfileCard.tsx
│   ├── health/
│   │   └── VaccineCard.tsx
│   ├── reminders/
│   │   └── ReminderCard.tsx
│   ├── gallery/
│   │   └── PhotoCard.tsx
│   └── diary/
│       └── DiaryCard.tsx
├── data/
│   └── mockData.ts        # All static mock data for Mimi
├── pages/
│   ├── HomePage.tsx
│   ├── PetProfilePage.tsx
│   ├── VaccinesPage.tsx
│   ├── RemindersPage.tsx
│   ├── GalleryPage.tsx
│   └── DiaryPage.tsx
├── types/
│   └── index.ts           # TypeScript types: Pet, VaccineRecord, Reminder, DiaryEntry, PetPhoto
├── App.tsx                # Page routing via useState
└── main.tsx
```

---

## 🚀 How to Run Locally

**Requirements:** Node.js 18+

```bash
# 1. Clone the repo
git clone https://github.com/Cicie44/mimicare.git
cd mimicare

# 2. Install dependencies
npm install

# 3. Start the dev server
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

**Phase 1 — Static Frontend (complete)**

All pages are built with mock data. No backend, no database, no login required.

The app is fully navigable and responsive across mobile, tablet, and desktop.

---

## 🗺 Roadmap

### Phase 2 — Local CRUD
- Add, edit, and delete diary entries
- Add and complete reminders
- Edit pet profile
- Data stored in browser `localStorage`

### Phase 3 — Supabase Integration
- Replace mock data with a real PostgreSQL database via Supabase
- Persistent storage for: `pets`, `vaccines`, `reminders`, `diary_entries`, `photos`

### Phase 4 — Auth & Uploads
- User authentication with Supabase Auth
- Photo upload via Supabase Storage
- User-specific pet data

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
