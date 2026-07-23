-- ============================================================================
-- MimiCare — Demo Data Seed
-- ============================================================================
-- Populates ONE existing account with realistic pet-care + community data,
-- for portfolio screenshots and live demos. It does not create the account
-- itself and does not touch auth.users — Supabase manages authentication
-- separately, and inserting into auth.users directly is not supported.
--
-- HOW TO USE
--   1. Sign up normally in the app (or use an account you already have).
--   2. Find that user's id: Supabase Dashboard → Authentication → Users,
--      or run:
--        select id, email from auth.users order by created_at desc;
--   3. Paste that id into `demo_user_id` in Section 0 below.
--   4. Run this whole file in the Supabase SQL editor.
--
-- SAFE TO RE-RUN
--   Every row uses a fixed literal id and `on conflict ... do nothing`
--   (or `do update` where it mirrors the app's own upsert behavior), so
--   running this file again will not create duplicates or touch any other
--   data in the project. Nothing here deletes existing rows.
--
-- WHAT THIS DOES NOT DO
--   - Section 5 (photos) is intentionally NOT seeded — see the note there.
--   - Section 8 (a second account: messages/notifications/offers) is
--     OPTIONAL and left commented out, because it needs a second real
--     signed-up user. See that section for instructions.
--   - This does not touch community_posts/user_profiles data used to show
--     OTHER neighbors browsing the feed — that's already covered by the
--     app's built-in demo fallback in `src/data/mockCommunityPosts.ts`,
--     which appears automatically whenever a feed category has no real
--     posts yet. This seed only fills in the signed-in demo account's own
--     data (pet records + their own community posts + their own profile).
--
-- ASSUMPTIONS
--   Column names below were verified against src/services/*.ts as of this
--   writing. `pets.id` / `*.pet_id` are treated as the same value as the
--   user's auth id (matching src/services/petService.ts's upsertPet, which
--   sets `id: userId`). `post_reviews` has no insert path anywhere in the
--   app yet, so its columns are inferred from the snake_case convention
--   used consistently by every other table — double-check against your
--   actual schema if it differs.
-- ============================================================================

do $$
declare
  -- Section 0: the only thing you need to edit -----------------------------
  demo_user_id uuid := '00000000-0000-0000-0000-000000000000'; -- <-- REPLACE ME
  demo_pet_id  text; -- derived below; pets.id / pet_id columns are text
begin
  if demo_user_id = '00000000-0000-0000-0000-000000000000' then
    raise exception 'Set demo_user_id to a real auth.users id before running this seed (see the instructions at the top of this file).';
  end if;

  demo_pet_id := demo_user_id::text;

  -- ==========================================================================
  -- 1. Pet profile
  -- ==========================================================================
  insert into pets (
    id, user_id, name, species, breed, gender, birthday, age_label,
    neutered, indoor, personality, avatar_url
  )
  values (
    demo_pet_id, demo_user_id, 'Mimi', 'Cat', 'Ragdoll', 'Female',
    (CURRENT_DATE - interval '2 years' - interval '4 months')::date,
    '2 years old', true, true,
    array['Gentle', 'Sweet', 'Quiet', 'Curious', 'A little clingy'],
    null
  )
  on conflict (id) do update set
    name = excluded.name,
    species = excluded.species,
    breed = excluded.breed,
    gender = excluded.gender,
    birthday = excluded.birthday,
    age_label = excluded.age_label,
    neutered = excluded.neutered,
    indoor = excluded.indoor,
    personality = excluded.personality;

  -- ==========================================================================
  -- 2. Vaccines — 4 records: one due soon, two up to date, one completed
  --    one-off (no next due date)
  -- ==========================================================================
  insert into vaccines (id, user_id, pet_id, name, dose_number, date_given, next_due_date, clinic_name, notes)
  values
    ('a0000000-0000-4000-8000-000000000011', demo_user_id, demo_pet_id,
      'FVRCP (3-in-1)', 3, (CURRENT_DATE - interval '11 months')::date,
      (CURRENT_DATE + interval '18 days')::date, 'Happy Paws Vet Clinic',
      'Annual booster — due soon.'),
    ('a0000000-0000-4000-8000-000000000012', demo_user_id, demo_pet_id,
      'Rabies', 2, (CURRENT_DATE - interval '10 months')::date,
      (CURRENT_DATE + interval '26 months')::date, 'Happy Paws Vet Clinic',
      '3-year vaccine.'),
    ('a0000000-0000-4000-8000-000000000013', demo_user_id, demo_pet_id,
      'FeLV (Feline Leukemia)', 2, (CURRENT_DATE - interval '7 months')::date,
      (CURRENT_DATE + interval '5 months')::date, 'Sunshine Animal Hospital',
      'Annual booster, not urgent yet.'),
    ('a0000000-0000-4000-8000-000000000014', demo_user_id, demo_pet_id,
      'Deworming treatment', 1, (CURRENT_DATE - interval '2 months')::date,
      null, 'Happy Paws Vet Clinic',
      'One-time treatment, no follow-up scheduled.')
  on conflict (id) do nothing;

  -- ==========================================================================
  -- 3. Reminders — mix of overdue / pending / done
  -- ==========================================================================
  insert into reminders (id, user_id, pet_id, title, category, due_date, status, notes)
  values
    ('a0000000-0000-4000-8000-000000000021', demo_user_id, demo_pet_id,
      'Annual vet checkup', 'Health', (CURRENT_DATE - interval '5 days')::date,
      'overdue', 'Full physical exam and bloodwork.'),
    ('a0000000-0000-4000-8000-000000000022', demo_user_id, demo_pet_id,
      'Monthly flea & tick treatment', 'Health', (CURRENT_DATE + interval '4 days')::date,
      'pending', 'Apply the usual spot-on treatment.'),
    ('a0000000-0000-4000-8000-000000000023', demo_user_id, demo_pet_id,
      'Restock cat food', 'Nutrition', (CURRENT_DATE + interval '2 days')::date,
      'pending', 'Running low on the salmon variety.'),
    ('a0000000-0000-4000-8000-000000000024', demo_user_id, demo_pet_id,
      'Trim nails', 'Grooming', (CURRENT_DATE - interval '3 days')::date,
      'done', null),
    ('a0000000-0000-4000-8000-000000000025', demo_user_id, demo_pet_id,
      'Deep-clean litter box', 'Hygiene', (CURRENT_DATE + interval '6 days')::date,
      'pending', null)
  on conflict (id) do nothing;

  -- ==========================================================================
  -- 4. Diary entries — 6 entries, varied moods, dated over the past week
  -- ==========================================================================
  insert into diary_entries (id, user_id, pet_id, date, mood, food, activity, notes)
  values
    ('a0000000-0000-4000-8000-000000000031', demo_user_id, demo_pet_id,
      (CURRENT_DATE - interval '1 day')::date, 'playful',
      'Chicken and tuna wet food mix',
      'Chased the laser pointer until she flopped over dramatically, then demanded belly rubs.',
      'Zero regrets about knocking a pen off the desk three times in a row.'),
    ('a0000000-0000-4000-8000-000000000032', demo_user_id, demo_pet_id,
      (CURRENT_DATE - interval '2 days')::date, 'sleepy',
      'Regular kibble, half portion',
      'Slept in the sunny spot on the windowsill most of the afternoon.',
      'Barely opened her eyes when the doorbell rang. Very on brand.'),
    ('a0000000-0000-4000-8000-000000000033', demo_user_id, demo_pet_id,
      (CURRENT_DATE - interval '3 days')::date, 'happy',
      'Salmon pate, finished the whole bowl',
      'Followed me around the apartment purring the entire time.',
      'Sat on my laptop keyboard for ten minutes straight while I tried to work.'),
    ('a0000000-0000-4000-8000-000000000034', demo_user_id, demo_pet_id,
      (CURRENT_DATE - interval '4 days')::date, 'grumpy',
      'Barely touched breakfast',
      'Hid under the bed after the vacuum came out.',
      'Took about an hour and a bribery treat before she''d come back out.'),
    ('a0000000-0000-4000-8000-000000000035', demo_user_id, demo_pet_id,
      (CURRENT_DATE - interval '5 days')::date, 'calm',
      'Normal portion, ate slowly',
      'Watched birds from the window for a long time, very content.',
      'One of those quiet, easy days. No drama at all.'),
    ('a0000000-0000-4000-8000-000000000036', demo_user_id, demo_pet_id,
      (CURRENT_DATE - interval '6 days')::date, 'sick',
      'Skipped most meals, only a little water',
      'Mostly rested, seemed a bit off.',
      'Keeping an eye on her — scheduling a vet visit if it doesn''t improve by tomorrow.')
  on conflict (id) do nothing;

  -- ==========================================================================
  -- 5. Photos — NOT seeded here on purpose.
  --
  --    photos.storage_path must point to a real object in the private
  --    `pet-photos` Storage bucket, or signed URL generation for that row
  --    will fail and the Gallery will show a placeholder instead of a photo.
  --    There's no safe way to fabricate that from SQL alone.
  --
  --    Instead, upload 4-6 real photos through the app's own Gallery page
  --    (Gallery → Upload Photo) after running this seed. Suggested
  --    captions/tags to use, so it reads as a real gallery rather than
  --    lorem-ipsum placeholders:
  --      - "Sunday sunshine nap"        tags: cozy, sunlight
  --      - "Guarding the laundry basket" tags: catlife, mischief
  --      - "Fresh from the groomer"      tags: grooming, cute
  --      - "Judging me from the counter" tags: catlife, funny
  --      - "Post-zoomies collapse"       tags: playful, naptime
  -- ==========================================================================

  -- ==========================================================================
  -- 6. Community posts — the demo account's own posts (3 pet daily, 2 tips,
  --    4 community care), so "My Posts" and the profile's post count aren't
  --    empty. Realistic multi-neighbor browsing content already exists via
  --    src/data/mockCommunityPosts.ts and needs no DB seeding.
  -- ==========================================================================
  insert into community_posts (id, user_id, category, title, content, tags, status, created_at)
  values
    ('a0000000-0000-4000-8000-000000000041', demo_user_id, 'pet_daily', null,
      'Mimi discovered the empty moving box before I even finished unpacking it. She''s been guarding it like treasure for two days now.',
      array['catlife', 'boxlife'], 'open', now() - interval '1 day'),
    ('a0000000-0000-4000-8000-000000000042', demo_user_id, 'pet_daily', null,
      'Tried to get a nice photo of Mimi in the afternoon light. She blinked in literally every single shot. 15/15 blurry, 0/15 usable, still worth it.',
      array['catlife', 'photography'], 'open', now() - interval '3 days'),
    ('a0000000-0000-4000-8000-000000000043', demo_user_id, 'pet_daily', null,
      'She''s figured out that the sound of the treat bag carries through two closed doors. Impressive, honestly.',
      array['catlife', 'smartcat'], 'open', now() - interval '5 days'),

    ('a0000000-0000-4000-8000-000000000044', demo_user_id, 'tips',
      'A simple trick for smoother nail trims',
      'Mimi used to hate nail trims until I started doing just one paw at a time, spread across a few days instead of all at once in one sitting. Way less stress for both of us, and she still gets treats after each paw.',
      array['catcare', 'grooming', 'tips'], 'open', now() - interval '6 days'),
    ('a0000000-0000-4000-8000-000000000045', demo_user_id, 'tips',
      'What actually helped with litter box avoidance',
      'When Mimi started avoiding the litter box, switching to unscented litter and adding a second box in a different room fixed it within a week. Turns out it was pickier about scent and location than I expected.',
      array['catcare', 'littertraining', 'tips'], 'open', now() - interval '8 days'),

    ('a0000000-0000-4000-8000-000000000046', demo_user_id, 'sitter_help',
      'Feeding visits needed this weekend',
      'Heading out of town Friday to Sunday and need someone to stop by twice a day to feed Mimi and freshen her water. She''s friendly and mostly keeps to herself — just needs the basics covered.',
      array['catsitter', 'feedingvisit', 'daan'], 'open', now() - interval '2 days'),
    ('a0000000-0000-4000-8000-000000000047', demo_user_id, 'sitter_help',
      'Keep an eye out — orange tabby missing near the park',
      'A neighbor''s orange tabby, Tofu, has been missing since Tuesday evening near the community park. Friendly and collared. If anyone spots him nearby, please reach out so we can let his owner know right away.',
      array['lostpet', 'lookout', 'community'], 'open', now() - interval '4 days'),
    ('a0000000-0000-4000-8000-000000000048', demo_user_id, 'sitter_help',
      'Extra cat supplies up for grabs',
      'Ended up with an unopened bag of kitten food and a spare carrier after a foster situation wrapped up. Happy to pass them along to anyone nearby who could use them instead of letting them sit in my closet.',
      array['supplies', 'sharing', 'freetogoodhome'], 'open', now() - interval '7 days'),
    ('a0000000-0000-4000-8000-000000000049', demo_user_id, 'sitter_help',
      'Short-term help while I recover from surgery',
      'I''m having a minor procedure done next week and won''t be able to do much lifting or bending for about 10 days. Looking for someone nearby who could handle litter changes and feeding during that stretch.',
      array['shortnotice', 'recovery', 'zhongshan'], 'open', now() - interval '9 days')
  on conflict (id) do nothing;

  -- helpDetails child rows for the 4 sitter_help posts above
  insert into sitter_help_details (post_id, request_date, area, pet_type, duration, compensation, compensation_note)
  values
    ('a0000000-0000-4000-8000-000000000046', (CURRENT_DATE + interval '9 days')::date,
      'Da''an District', 'cat', 'Weekend (2 visits/day)', 'fixed', 'NT$150 per visit'),
    ('a0000000-0000-4000-8000-000000000047', null,
      'Near Da''an Park', 'cat', 'Ongoing', 'volunteer', null),
    ('a0000000-0000-4000-8000-000000000048', null,
      'Xinyi District', 'cat', 'One-time pickup', 'volunteer', null),
    ('a0000000-0000-4000-8000-000000000049', (CURRENT_DATE + interval '14 days')::date,
      'Zhongshan District', 'cat', 'About 10 days', 'open', null)
  on conflict (post_id) do nothing;

  -- ==========================================================================
  -- 7. Trust profile for the demo account itself
  --    (2-3 *other* neighbor profiles for browsing are already covered by
  --    DEMO_PROFILES in src/data/mockCommunityPosts.ts — no DB rows needed
  --    for that. This is just so "My Profile" isn't empty for the demo
  --    account. Feel free to edit display_name/bio to your own.)
  -- ==========================================================================
  insert into user_profiles (
    user_id, display_name, bio, area, has_cat_experience, has_dog_experience,
    available_days, preferred_service_types
  )
  values (
    demo_user_id, 'Alex M.',
    'Cat owner and occasional neighborhood pet-sitter. Happy to help nearby if you''re ever in a pinch.',
    'Da''an District, Taipei', true, false,
    array['Sat', 'Sun'],
    array['Feeding Visit', 'Drop-in Check']
  )
  on conflict (user_id) do update set
    display_name = excluded.display_name,
    bio = excluded.bio,
    area = excluded.area,
    has_cat_experience = excluded.has_cat_experience,
    has_dog_experience = excluded.has_dog_experience,
    available_days = excluded.available_days,
    preferred_service_types = excluded.preferred_service_types;

end $$;

-- ============================================================================
-- 8. OPTIONAL — a second account for messages / notifications / offers
-- ============================================================================
-- Everything above only needed one real user, because it's all owned by that
-- single account. Offers, messages, and notifications are inherently
-- between TWO people, so this section needs a second real signed-up user —
-- there's no safe way to fabricate that id; every table here has a foreign
-- key into auth.users, so a made-up id will fail with a foreign key error.
--
-- To use this section:
--   1. Sign up a second demo account in the app (e.g. a placeholder email
--      like demo.helper1@example.com — use an email you control, or any
--      address Supabase Auth will accept for your project's settings).
--   2. Look up its id the same way as demo_user_id above.
--   3. Replace BOTH placeholders below.
--   4. Remove the leading "-- " from every line in the block to enable it,
--      then run just this section.
--
-- do $$
-- declare
--   demo_user_id   uuid := '00000000-0000-0000-0000-000000000000'; -- owner (from Section 0)
--   demo_helper_id uuid := '00000000-0000-0000-0000-000000000000'; -- <-- REPLACE ME (second account)
-- begin
--   -- Helper offers to help with the "Feeding visits needed this weekend" post
--   insert into post_applications (id, post_id, applicant_user_id, message, status, created_at)
--   values (
--     'a0000000-0000-4000-8000-000000000051',
--     'a0000000-0000-4000-8000-000000000046',
--     demo_helper_id,
--     'Happy to help — I live two blocks away and have watched cats before.',
--     'pending', now() - interval '1 day'
--   )
--   on conflict (id) do nothing;
--
--   -- Notify the owner about the new offer
--   insert into notifications (id, user_id, type, post_id, message, read, created_at)
--   values (
--     'a0000000-0000-4000-8000-000000000052',
--     demo_user_id, 'new_application',
--     'a0000000-0000-4000-8000-000000000046',
--     'Someone offered help on your Community Care request.', false, now() - interval '1 day'
--   )
--   on conflict (id) do nothing;
--
--   -- A conversation + one message between the two, as if they're chatting
--   insert into conversations (id, participant_a, participant_b, status, initiated_by, last_message_at, created_at)
--   values (
--     'a0000000-0000-4000-8000-000000000053',
--     least(demo_user_id, demo_helper_id), greatest(demo_user_id, demo_helper_id),
--     'active', demo_user_id, now() - interval '1 hour', now() - interval '1 day'
--   )
--   on conflict (id) do nothing;
--
--   insert into messages (id, conversation_id, sender_id, content, created_at)
--   values (
--     'a0000000-0000-4000-8000-000000000054',
--     'a0000000-0000-4000-8000-000000000053',
--     demo_user_id,
--     'Thank you so much for offering — I''ll leave the spare key with the building manager.',
--     now() - interval '1 hour'
--   )
--   on conflict (id) do nothing;
-- end $$;

-- ============================================================================
-- Cleanup (optional) — removes only the rows this file created, identified
-- by the 'a0000000-0000-4000-8000-%' id prefix used throughout. Never
-- touches your pets/user_profiles rows (those are upserts, not tagged rows).
-- ============================================================================
-- delete from messages           where id::text like 'a0000000-0000-4000-8000-%';
-- delete from conversations      where id::text like 'a0000000-0000-4000-8000-%';
-- delete from notifications      where id::text like 'a0000000-0000-4000-8000-%';
-- delete from post_applications  where id::text like 'a0000000-0000-4000-8000-%';
-- delete from sitter_help_details where post_id::text like 'a0000000-0000-4000-8000-%';
-- delete from community_posts    where id::text like 'a0000000-0000-4000-8000-%';
-- delete from diary_entries      where id::text like 'a0000000-0000-4000-8000-%';
-- delete from reminders          where id::text like 'a0000000-0000-4000-8000-%';
-- delete from vaccines           where id::text like 'a0000000-0000-4000-8000-%';
