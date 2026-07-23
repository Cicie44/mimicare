import type { CommunityPost, UserProfile, PostReview } from "../types";

export const DEMO_POST_IDS = new Set([
  "demo-pd-1", "demo-pd-2", "demo-pd-3", "demo-pd-4",
  "demo-tip-1", "demo-tip-2", "demo-tip-3",
  "demo-sh-1", "demo-sh-2", "demo-sh-3", "demo-sh-4",
]);

export const mockCommunityPosts: CommunityPost[] = [
  // ── Pet Daily ──────────────────────────────────────────────────────────────
  {
    id: "demo-pd-1",
    userId: "demo-user-1",
    authorName: "Cherry C.",
    category: "pet_daily",
    content:
      "Mochi found the laundry basket this morning. Three attempts to move her failed. I now have no clean shirts. 10/10 would recommend owning a cat.",
    tags: ["catlife", "morningchaos"],
    status: "open",
    createdAt: "2026-06-25T08:12:00Z",
    likesCount: 24,
    commentsCount: 7,
    likedByMe: false,
  },
  {
    id: "demo-pd-2",
    userId: "demo-user-2",
    authorName: "James T.",
    category: "pet_daily",
    content:
      "Luna stared at the empty corner of the ceiling for 10 straight minutes. I checked. Nothing there. She knows something I don't.",
    tags: ["catbehavior", "livingwithacreature"],
    status: "open",
    createdAt: "2026-06-24T14:30:00Z",
    likesCount: 41,
    commentsCount: 12,
    likedByMe: false,
  },
  {
    id: "demo-pd-3",
    userId: "demo-user-3",
    authorName: "Maya L.",
    category: "pet_daily",
    content:
      "After 8 months, Maple finally sat on my lap voluntarily — for 4 whole minutes. I didn't breathe. I didn't move. I told her everything was fine. She left when I exhaled.\n\nProgress.",
    tags: ["rescuecat", "trust", "slowprogress"],
    status: "open",
    createdAt: "2026-06-23T20:45:00Z",
    likesCount: 88,
    commentsCount: 19,
    likedByMe: true,
  },
  {
    id: "demo-pd-4",
    userId: "demo-user-4",
    authorName: "Nora W.",
    category: "pet_daily",
    content:
      "Oreo free-roamed the living room for two hours while I worked. He reorganized my cable situation completely. Also ate part of my notebook. Not sure if I'm mad.",
    tags: ["rabbitlife", "wfhwithpets"],
    status: "open",
    createdAt: "2026-06-22T11:00:00Z",
    likesCount: 16,
    commentsCount: 5,
    likedByMe: false,
  },

  // ── Tips ───────────────────────────────────────────────────────────────────
  {
    id: "demo-tip-1",
    userId: "demo-user-5",
    authorName: "Jennifer W.",
    category: "tips",
    title: "Getting picky cats to drink more water",
    content:
      "After trying everything for my Persian, what finally worked was switching to a running fountain. Cats instinctively distrust still water.\n\nTwo things that helped:\n· Place the fountain away from the food bowl — cats prefer drinking away from where they eat\n· Add a small amount of low-sodium tuna water as a flavor bridge for the first week",
    tags: ["catcare", "hydration", "tips"],
    status: "open",
    createdAt: "2026-06-21T09:00:00Z",
    likesCount: 56,
    commentsCount: 14,
    likedByMe: false,
  },
  {
    id: "demo-tip-2",
    userId: "demo-user-6",
    authorName: "Helen C.",
    category: "tips",
    title: "Signs your indoor cat is actually thriving",
    content:
      "A lot of people worry indoor cats are bored or depressed. Here's what I watch for with my three:\n\n· Slow blinks during eye contact — that's trust\n· Sleeping stretched out, not curled tight — that's comfort\n· Chattering at birds, bringing you toys — that's play drive\n· Purring while kneading — that's contentment\n\nA happy cat doesn't need to go outside. They need vertical space, rotated toys, and 10–15 min of real interactive play each day.",
    tags: ["indoorcat", "catcare", "wellbeing"],
    status: "open",
    createdAt: "2026-06-20T16:30:00Z",
    likesCount: 73,
    commentsCount: 22,
    likedByMe: true,
  },
  {
    id: "demo-tip-3",
    userId: "demo-user-7",
    authorName: "Daniel P.",
    category: "tips",
    title: "Managing separation anxiety — what actually helped my Shiba",
    content:
      "My Shiba used to destroy things every time I left. After trying everything, here's what made a real difference:\n\n1. Leave without fanfare — no long goodbyes. Boring departures lower anticipation anxiety.\n2. A frozen Kong with peanut butter for the first 10 minutes (the hardest window).\n3. Consistent return time, even on weekends.\n\nTook 6 weeks. We went from three destroyed cushions a week to zero.",
    tags: ["dogcare", "separationanxiety", "behaviortraining"],
    status: "open",
    createdAt: "2026-06-19T10:15:00Z",
    likesCount: 61,
    commentsCount: 18,
    likedByMe: false,
  },

  // ── Sitter Help ────────────────────────────────────────────────────────────
  {
    id: "demo-sh-1",
    userId: "demo-user-1",
    authorName: "Cherry C.",
    category: "sitter_help",
    title: "Cat sitter needed — long weekend, Da'an area",
    content:
      "Heading to Hualien for 3 nights and need someone reliable to check on Mochi. She's 4 years old, friendly, and mostly independent — just needs feeding twice a day and a litter scoop. Happy to do a meet-and-greet beforehand.",
    tags: ["catsitter", "daan", "taipei"],
    status: "open",
    createdAt: "2026-06-26T09:00:00Z",
    likesCount: 3,
    commentsCount: 2,
    likedByMe: false,
    helpDetails: {
      postId: "demo-sh-1",
      requestDate: "2026-07-05",
      area: "Da'an District, Taipei",
      petType: "cat",
      duration: "Multiple days",
      compensation: "open",
    },
  },
  {
    id: "demo-sh-2",
    userId: "demo-user-8",
    authorName: "Wendy S.",
    category: "sitter_help",
    title: "Daily feeding visits this week — cat + rabbit",
    content:
      "Working extra shifts Mon–Fri and need someone to pop in around noon to feed my cat Dumpling and bunny Oreo. Should take 30–45 minutes total. Step-by-step guides are on the fridge.",
    tags: ["feedingvisit", "songshan", "catandrabbit"],
    status: "open",
    createdAt: "2026-06-25T12:00:00Z",
    likesCount: 2,
    commentsCount: 1,
    likedByMe: false,
    helpDetails: {
      postId: "demo-sh-2",
      requestDate: "2026-06-30",
      area: "Songshan District, Taipei",
      petType: "other",
      duration: "1–2 hours",
      compensation: "fixed",
      compensationNote: "NT$200 / visit",
    },
  },
  {
    id: "demo-sh-3",
    userId: "demo-user-9",
    authorName: "Ken H.",
    category: "sitter_help",
    title: "Overnight sitter needed — 5 nights in July",
    content:
      "Going to Japan for a work trip and need an experienced overnight sitter for Leo, my 2-year-old tabby. He's playful and social. Prefer someone staying overnight so he's not alone. Happy to meet twice beforehand.",
    tags: ["overnight", "xinyi", "taipei", "catsitter"],
    status: "accepted",
    createdAt: "2026-06-24T08:00:00Z",
    likesCount: 5,
    commentsCount: 3,
    likedByMe: false,
    helpDetails: {
      postId: "demo-sh-3",
      requestDate: "2026-07-12",
      area: "Xinyi District, Taipei",
      petType: "cat",
      duration: "Overnight Stay",
      compensation: "open",
    },
  },
  {
    id: "demo-sh-4",
    userId: "demo-user-3",
    authorName: "Maya L.",
    category: "sitter_help",
    title: "Short-notice evening check-in — shy cat, Zhongshan",
    content:
      "Unexpected out-of-town meeting this Thursday — need someone to feed Maple around 6pm. She's shy with new people so bringing a treat helps. I'll send her hiding spot photos so you know where to look.",
    tags: ["shortnotice", "zhongshan", "shycat"],
    status: "open",
    createdAt: "2026-06-27T17:30:00Z",
    likesCount: 1,
    commentsCount: 0,
    likedByMe: false,
    helpDetails: {
      postId: "demo-sh-4",
      requestDate: "2026-06-30",
      area: "Zhongshan District, Taipei",
      petType: "cat",
      duration: "1–2 hours",
      compensation: "volunteer",
    },
  },
];

// ── Demo sitter profiles (shown in profile modal for experienced demo users) ──

export const DEMO_PROFILES: Record<string, UserProfile> = {
  "demo-user-5": {
    userId: "demo-user-5",
    displayName: "Jennifer Wu",
    bio: "Vet tech with 6 years of clinic experience. I specialize in cats and small animals, and treat every pet I watch like my own. Full updates with photos included.",
    area: "Da'an District, Taipei",
    hasCatExperience: true,
    hasDogExperience: false,
    availableDays: ["Sat", "Sun"],
    preferredServiceTypes: ["Feeding Visit", "Medication Administration", "Drop-in Check"],
    completedVisitsCount: 34,
    averageRating: 4.9,
    reviewCount: 21,
    postCount: 12,
  },
  "demo-user-6": {
    userId: "demo-user-6",
    displayName: "Helen Chang",
    bio: "Work-from-home cat owner of three. I've been sitting for friends for 4 years and recently started taking community requests. Calm, reliable, and completely cat-obsessed.",
    area: "Zhongshan District, Taipei",
    hasCatExperience: true,
    hasDogExperience: true,
    availableDays: ["Mon", "Wed", "Fri", "Sat", "Sun"],
    preferredServiceTypes: ["Feeding Visit", "Full Day Sitting", "Drop-in Check"],
    completedVisitsCount: 17,
    averageRating: 4.8,
    reviewCount: 11,
    postCount: 8,
  },
};

// ── Reviews for demo profiles ─────────────────────────────────────────────────

export const DEMO_REVIEWS: Record<string, PostReview[]> = {
  "demo-user-5": [
    {
      id: "rev-5-1",
      postId: "demo-sh-old-1",
      reviewerUserId: "demo-r-1",
      sitterUserId: "demo-user-5",
      rating: 5,
      comment:
        "Jennifer sent photos twice a day and my cats were completely comfortable with her. Will book again without hesitation.",
      createdAt: "2026-05-10T10:00:00Z",
    },
    {
      id: "rev-5-2",
      postId: "demo-sh-old-2",
      reviewerUserId: "demo-r-2",
      sitterUserId: "demo-user-5",
      rating: 5,
      comment:
        "Handled my cat's daily medication with no trouble at all. You can tell she genuinely knows animals.",
      createdAt: "2026-04-22T09:00:00Z",
    },
    {
      id: "rev-5-3",
      postId: "demo-sh-old-3",
      reviewerUserId: "demo-r-3",
      sitterUserId: "demo-user-5",
      rating: 5,
      comment: "My very shy rescue came out to say hello by day two. That says everything.",
      createdAt: "2026-03-05T14:00:00Z",
    },
  ],
  "demo-user-6": [
    {
      id: "rev-6-1",
      postId: "demo-sh-old-4",
      reviewerUserId: "demo-r-4",
      sitterUserId: "demo-user-6",
      rating: 5,
      comment:
        "Helen is exactly what you want — calm, communicative, and clearly loves cats. My three were in good hands.",
      createdAt: "2026-05-28T11:00:00Z",
    },
    {
      id: "rev-6-2",
      postId: "demo-sh-old-5",
      reviewerUserId: "demo-r-5",
      sitterUserId: "demo-user-6",
      rating: 5,
      comment:
        "Flexible with short notice and treated my apartment with complete respect. Highly recommend.",
      createdAt: "2026-04-15T16:00:00Z",
    },
  ],
};
