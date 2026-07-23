# MimiCare

> A responsive web platform for pet care records and neighborhood pet care — built around Mimi, a real Ragdoll cat, and the everyday logistics of looking after her.

MimiCare started as a personal pet care diary and has grown into a small community platform: owners track their pet's health and daily life, and neighbors coordinate care for each other's pets through community posts, private offers, in-app messaging, and trust profiles.

This project is both a tool I use for real and a portfolio piece demonstrating product thinking, data modeling, and full-stack React/TypeScript development with Supabase.

---

## Overview

MimiCare has two connected halves:

- **Personal pet care** — a private space for one owner to track a pet's profile, vaccine history, care reminders, daily diary entries, and photo memories.
- **Community care** — a shared space where owners can post daily moments, share tips, or ask neighbors for help (feeding visits, drop-ins, short-term care). Requests for help work through private offers and an acceptance flow, backed by in-app messaging, activity notifications, and lightweight trust profiles.

The app is a responsive web app first — it works well on a phone browser, but it's built and designed as a website, not a native or app-store product.

---

## Why I Built This

I have a Ragdoll cat named Mimi, and I was tracking her vaccines, reminders, and daily routines across phone notes, calendar alerts, and memory — which meant things got missed. That's what started this project.

As I built it out, a second, more interesting problem showed up: pet care is rarely a one-person job. Neighbors feed each other's cats, watch pets during trips, and share supplies informally all the time, usually over text with no structure. The community side of MimiCare grew out of that — a lightweight way to ask for and offer help nearby, without needing a full marketplace with payments or contracts bolted on.

Along the way this became a good practice ground for schema design, Supabase Row Level Security, and making real product-direction decisions (including reworking an earlier version of the community feature into its current form) rather than just shipping a fixed spec.

---

## Core Features

**Pet care records**
- Email/password authentication with session persistence (Supabase Auth)
- Pet profile: name, species, breed, age, gender, indoor/neutered status, personality traits
- Vaccine tracker with dose number, date given, next due date, clinic, and status badges (up to date / due soon / overdue)
- Care reminders with status (pending / done / overdue), categories, and filtering
- Diary entries with mood, food, activity, and notes, plus a mood-frequency overview
- Photo gallery backed by private Supabase Storage — photos are served via short-lived signed URLs, never public links
- Meme Studio — pick a gallery photo, describe a mood, and get AI-generated caption options (OpenAI, called from a server-side function so the API key never reaches the browser), then overlay and download the result as a PNG

**Community care**
- Community feed with categories (pet daily moments, tips, community care requests)
- Community Care requests for neighborhood help, with only the area and public description visible until a request is accepted
- Private offers — instead of instantly claiming a request, users submit an offer/application; the owner reviews and accepts one, and the rest are automatically declined
- User trust profiles: display name, bio, area, pet experience, availability, and stats (completed visits, post count, average rating) computed from real activity
- Reviews — average rating and review count are aggregated from submitted reviews and shown on trust profiles (the in-app flow for *submitting* a new review isn't wired up yet — see Future Improvements)
- In-app messaging with a message-request pattern: a new conversation starts as a "request" until the recipient responds, conversations can be blocked, and unread counts are tracked per conversation
- Activity notifications for offers, acceptances, declines, likes, comments, replies, and new messages, with unread badges and mark-as-read
- Blocking, so a user can end contact with someone and their existing conversation is closed out

**Platform**
- Fully responsive layout, designed as a professional web app rather than a mobile-first "app-like" experience
- Installable as a Progressive Web App (offline app shell, home-screen install) as an optional enhancement — this is a bonus on top of the website, not the primary way MimiCare is meant to be used

---

## Product Highlights

A few details worth calling out beyond the feature list:

- **Privacy-conscious data model** — public community fields and private details are separated at the data level (e.g. community care details vs. the messaging that unlocks after acceptance), not just hidden in the UI.
- **Signed URLs for all photos** — both pet photos and community post images live in private Storage buckets; nothing is served from a public URL.
- **Offer/accept flow instead of first-come-first-served** — mirrors how people actually ask neighbors for help, and it's what the notification and messaging systems are built around.
- **Message requests, not open inboxes** — new conversations start as requests so a user can accept or ignore contact from someone they don't know yet, with blocking available at any point.
- **No overclaiming** — there's no payment processing, no real-time push (data is fetched on load/navigation, not via live subscriptions), and no emergency-dispatch feature. Compensation on a community request is a plain-text note (e.g. "volunteer" or "NT$200/visit"), not a payment integration.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI component framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety across app and API |
| [Vite](https://vitejs.dev/) | Dev server and build tool |
| [Tailwind CSS v3](https://tailwindcss.com/) | Utility-first styling |
| [Supabase](https://supabase.com/) | Postgres database, Auth, and Storage |
| [OpenAI API](https://platform.openai.com/) | Meme caption generation (`gpt-4o-mini`), called server-side only |
| [Vercel](https://vercel.com/) | Hosting + serverless function for the OpenAI call |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | Installable app shell / offline fallback |

Every user's data is isolated with Supabase Row Level Security, scoped by `user_id` (or by participant for conversations). Authentication is email/password via Supabase Auth.

---

## Architecture / Project Structure

```
api/
└── generate-caption.ts     # Vercel serverless function — calls OpenAI, keeps the key server-side

src/
├── components/
│   ├── layout/              # Navbar, Care/Inbox sub-navigation, Footer
│   ├── auth/                # Login / sign-up
│   ├── pet/                 # Pet profile card + edit form
│   ├── health/               # Vaccine card + form
│   ├── reminders/            # Reminder card + form
│   ├── diary/                 # Diary card + form
│   ├── gallery/               # Photo card + upload form
│   ├── activity/              # Activity/notification feed
│   ├── messages/              # Conversation list + chat window
│   ├── community/             # Post card/composer, comments, applications, trust profile card
│   └── services/
│       └── SitterProfileForm.tsx   # Trust profile edit form (shared by Community)
├── data/
│   ├── mockData.ts            # Default pet + sample vaccines/reminders/diary
│   └── mockCommunityPosts.ts   # Sample community posts shown for new/empty accounts
├── hooks/
│   └── useLocalStorage.ts
├── lib/
│   └── supabase.ts             # Supabase client instance
├── services/                    # One file per Supabase resource — see setup section below
│   ├── authService.ts
│   ├── petService.ts
│   ├── vaccineService.ts
│   ├── reminderService.ts
│   ├── diaryService.ts
│   ├── photoService.ts
│   ├── communityService.ts
│   ├── postApplicationService.ts
│   ├── userProfileService.ts
│   ├── messageService.ts
│   └── notificationService.ts
├── pages/                        # One page per route, composed from the components above
├── types/
│   └── index.ts                  # Shared TypeScript types (Pet, VaccineRecord, Reminder, DiaryEntry, PetPhoto, CommunityPost, UserProfile, Conversation, Message, AppNotification, Page, ...)
├── utils/
│   └── formatDate.ts
├── App.tsx                       # Auth state, page routing, data loading, all CRUD handlers
└── main.tsx
vercel.json                       # Vercel build config
```

---

## Supabase Setup Overview

MimiCare doesn't ship a committed SQL migration file yet (see Future Improvements) — the tables below are the ones actually queried by the code in `src/services/`, so you'll need equivalent tables in your own Supabase project. Every table is scoped with Row Level Security, generally: a user can read/write their own rows via a `user_id` column, plus a few narrower public-read policies for genuinely public content (open community posts, aggregate review stats).

**Personal pet care**

| Table | Used by | Purpose |
|---|---|---|
| `pets` | `petService.ts` | One profile row per user |
| `vaccines` | `vaccineService.ts` | Vaccine records linked to a pet |
| `reminders` | `reminderService.ts` | Care reminders linked to a pet |
| `diary_entries` | `diaryService.ts` | Daily diary entries linked to a pet |
| `photos` | `photoService.ts` | Photo metadata; files live in the private `pet-photos` Storage bucket |

**Community care**

| Table | Used by | Purpose |
|---|---|---|
| `community_posts` | `communityService.ts`, `postApplicationService.ts` | Feed posts (daily moments, tips, community care requests); images live in the private `community-posts` Storage bucket |
| `sitter_help_details` | `communityService.ts` | Extra fields for community-care-category posts (area, pet type, duration, compensation note) |
| `post_likes` | `communityService.ts` | Likes on a post |
| `post_comments` | `communityService.ts` | Comments on a post |
| `post_applications` | `postApplicationService.ts` | Offers to help on a community care post, with accept/decline status |
| `post_reviews` | `userProfileService.ts` | Ratings used to compute a profile's average rating and review count |
| `user_profiles` | `userProfileService.ts`, referenced across community/messaging | Public trust profile: display name, bio, area, experience, availability |

**Messaging & notifications**

| Table | Used by | Purpose |
|---|---|---|
| `conversations` | `messageService.ts` | One row per pair of users, with a status (`request` / `active` / `blocked`) |
| `messages` | `messageService.ts` | Messages within a conversation, with read receipts |
| `blocked_users` | `messageService.ts` | Blocklist entries between users |
| `notifications` | `notificationService.ts` | In-app activity notifications (offers, accept/decline, likes, comments, replies, new messages) |

**Storage buckets** (both private, served via signed URLs generated server-side):
- `pet-photos`
- `community-posts`

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your own values — never commit `.env`:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Server-side only — used by api/generate-caption.ts. Never expose this as a VITE_-prefixed variable.
OPENAI_API_KEY=
```

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — from your Supabase project settings. The anon key is safe to expose client-side; it's the RLS policies that actually protect the data.
- `OPENAI_API_KEY` — only read server-side (Vite dev middleware locally, a Vercel serverless function in production). Required only for the Meme Studio caption feature; the rest of the app works without it.

---

## How to Run Locally

**Requirements:** Node.js 18+, a free [Supabase](https://supabase.com/) account

```bash
git clone https://github.com/Cicie44/mimicare.git
cd mimicare
npm install
cp .env.example .env
```

1. Fill in `.env` with your Supabase project URL and anon key.
2. In your Supabase project, enable **Email** under Authentication → Providers.
3. Create the tables listed in the Supabase Setup Overview above, matching the field names used in the corresponding `src/services/*.ts` file, with Row Level Security enabled and policies scoping rows to the owning `user_id` (plus public-read policies where noted).
4. Create two **private** Storage buckets: `pet-photos` and `community-posts`, each with policies allowing a user to manage files under their own `userId/...` folder.
5. (Optional, for Meme Studio) Get a key from [platform.openai.com](https://platform.openai.com/) and add it as `OPENAI_API_KEY` in `.env`.

```bash
npm run dev       # start the dev server at http://localhost:5173
npm run build     # type-check and build for production
npm run preview   # preview the production build locally
```

On Vercel, set the same environment variables in your project settings — `api/generate-caption.ts` picks up `OPENAI_API_KEY` automatically as a serverless function.

---

## Screenshots

Screenshots coming soon.

---

## What I Learned

- Designing a data model where public and private information genuinely live in different tables/policies, instead of just hiding fields in the UI.
- Working with Supabase Row Level Security across a multi-table, multi-actor feature (a post, an applicant, an owner, and eventually a conversation) rather than a single-owner table.
- Serving user-uploaded images safely with private Storage buckets and short-lived signed URLs instead of public URLs.
- Calling a third-party LLM API from a serverless function so the API key never reaches the client, in both local dev (Vite middleware) and production (Vercel function).
- Recognizing when a feature's direction isn't working and reworking it — the community side of this app went through a full model change (from a formal service-request marketplace to a lighter post-and-offer community model) rather than being the original plan.
- Iterating on visual/product polish as a distinct pass from feature work: consistent color system, removing placeholder-feeling UI, and keeping navigation labels generic instead of hard-coded to one pet's name.

---

## Future Improvements

- A committed SQL schema/migration file, so setup doesn't rely on this README staying in sync with the services layer
- An in-app flow to actually submit a review after a completed community care visit (currently `post_reviews` is only read for aggregate stats/demo profiles)
- Multi-pet support
- Real-time updates for messages and notifications (currently fetched on load/navigation, not pushed live)
- Calendar view for vaccines and reminders
- Health record export
- Code-splitting the production JS bundle

---

## License

MIT — see [LICENSE](LICENSE).
