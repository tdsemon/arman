-- ==============================================================================
-- ARMAN PORTFOLIO — SUPABASE LIVE CMS DATABASE SCHEMA & SEED SCRIPT
-- ==============================================================================
-- Run this complete script in the Supabase Dashboard -> SQL Editor.
-- It creates:
-- 1. Helper function is_admin() and admins role table
-- 2. projects, testimonials, faqs, tools, and site_settings tables
-- 3. Strict Row Level Security (RLS) policies (public read, admin-only write)
-- 4. "site-media" public storage bucket (2MB limit, image types only)
-- 5. Complete seed data matching the current site content
-- ==============================================================================

-- 1. EXTENSIONS & STORAGE SCHEMA SETUP
create extension if not exists "uuid-ossp";

-- 2. ADMINS TABLE & SECURITY HELPER
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'editor' check (role in ('owner', 'editor')),
  created_at timestamptz default now()
);

alter table public.admins enable row level security;

-- Function to check if the current session belongs to an authenticated admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

-- Function to check if the current session belongs to the site owner
create or replace function public.is_owner()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid() and role = 'owner'
  );
$$;

create policy "Admins can view admins list"
  on public.admins for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Owners can manage admins"
  on public.admins for all
  using (public.is_owner() or not exists (select 1 from public.admins))
  with check (public.is_owner() or not exists (select 1 from public.admins));

-- 3. PROJECTS TABLE
create table if not exists public.projects (
  id text primary key,
  type text not null check (type in ('short', 'long')),
  title text not null check (char_length(title) <= 250),
  category text not null check (char_length(category) <= 100),
  video_url text not null,
  thumbnail_url text not null,
  tools text[] not null default '{}',
  custom_fields jsonb not null default '[]'::jsonb,
  client text default '',
  description text default '',
  duration text default '',
  highlight_stat text default '',
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects enable row level security;

create policy "Public can read visible projects"
  on public.projects for select
  using (visible = true or public.is_admin());

create policy "Admin can insert projects"
  on public.projects for insert
  with check (public.is_admin());

create policy "Admin can update projects"
  on public.projects for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin can delete projects"
  on public.projects for delete
  using (public.is_admin());

-- 4. TESTIMONIALS TABLE
create table if not exists public.testimonials (
  id text primary key,
  name text not null check (char_length(name) <= 150),
  role text not null check (char_length(role) <= 150),
  client_channel_or_brand text default '',
  quote text not null check (char_length(quote) <= 1200),
  avatar_url text default '',
  avatar_placeholder text default '',
  link text default '',
  project_scope text default '',
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz default now()
);

alter table public.testimonials enable row level security;

create policy "Public can read visible testimonials"
  on public.testimonials for select
  using (visible = true or public.is_admin());

create policy "Admin can insert testimonials"
  on public.testimonials for insert
  with check (public.is_admin());

create policy "Admin can update testimonials"
  on public.testimonials for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin can delete testimonials"
  on public.testimonials for delete
  using (public.is_admin());

-- 5. FAQS TABLE
create table if not exists public.faqs (
  id text primary key,
  question text not null check (char_length(question) <= 300),
  answer text not null check (char_length(answer) <= 2500),
  category text default 'TIMELINE',
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz default now()
);

alter table public.faqs enable row level security;

create policy "Public can read visible faqs"
  on public.faqs for select
  using (visible = true or public.is_admin());

create policy "Admin can insert faqs"
  on public.faqs for insert
  with check (public.is_admin());

create policy "Admin can update faqs"
  on public.faqs for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin can delete faqs"
  on public.faqs for delete
  using (public.is_admin());

-- 6. TOOLS TABLE
create table if not exists public.tools (
  id text primary key,
  name text not null check (char_length(name) <= 100),
  logo_url text not null,
  alt text default '',
  category text default '',
  short_description text not null check (char_length(short_description) <= 300),
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz default now()
);

alter table public.tools enable row level security;

create policy "Public can read visible tools"
  on public.tools for select
  using (visible = true or public.is_admin());

create policy "Admin can insert tools"
  on public.tools for insert
  with check (public.is_admin());

create policy "Admin can update tools"
  on public.tools for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin can delete tools"
  on public.tools for delete
  using (public.is_admin());

-- 7. SITE SETTINGS TABLE (JSONB KV STORE)
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;

create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

create policy "Admin can insert site settings"
  on public.site_settings for insert
  with check (public.is_admin());

create policy "Admin can update site settings"
  on public.site_settings for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin can delete site settings"
  on public.site_settings for delete
  using (public.is_admin());


-- 7b. SITE TEXT REGISTRY (EVERY VISIBLE STRING IN SUPABASE)
create table if not exists public.site_text (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

alter table public.site_text enable row level security;

create policy "Public can read site_text"
  on public.site_text for select
  using (true);

create policy "Admin can insert site_text"
  on public.site_text for insert
  with check (public.is_admin());

create policy "Admin can update site_text"
  on public.site_text for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin can delete site_text"
  on public.site_text for delete
  using (public.is_admin());

-- 8. STORAGE BUCKET: site-media
-- Public bucket for uploaded project thumbnails and client avatars (max 2MB, images only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  2097152, -- 2MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];

-- Storage Policies
create policy "Public Access to Site Media"
  on storage.objects for select
  using (bucket_id = 'site-media');

create policy "Admin Upload to Site Media"
  on storage.objects for insert
  with check (bucket_id = 'site-media' and public.is_admin());

create policy "Admin Update Site Media"
  on storage.objects for update
  using (bucket_id = 'site-media' and public.is_admin());

create policy "Admin Delete Site Media"
  on storage.objects for delete
  using (bucket_id = 'site-media' and public.is_admin());

-- ==============================================================================
-- 9. SEED DATA (EXACT MATCH TO CURRENT ARMAN PORTFOLIO CONTENT)
-- ==============================================================================

-- Seed Tools
insert into public.tools (id, name, logo_url, alt, category, short_description, sort_order, visible)
values
  ('premiere-pro', 'Premiere Pro', '/tools/Premiere-Pro-logo.png', 'Adobe Premiere Pro logo', 'Long & Short-Form NLE', 'Assembly, pacing, rough cuts & audio sync', 1, true),
  ('after-effects', 'After Effects', '/tools/Adobe-After-Effects.png', 'Adobe After Effects logo', 'Motion & Animation', 'Kinetic titles, callouts & visual effects', 2, true),
  ('davinci-resolve', 'DaVinci Resolve', '/tools/DaVinci-Resolve-Icon.png', 'DaVinci Resolve logo', 'Color & Finishing', 'Color grading, balancing & final master export', 3, true),
  ('capcut', 'CapCut Pro', '/tools/CapCut-Logo-Video-Editing-App-Icon.png', 'CapCut logo', 'Mobile Short-Form', 'Fast vertical pacing & dynamic captions', 4, true)
on conflict (id) do nothing;

-- Seed Projects (Short-Form & Long-Form with real video URLs and thumbnails)
insert into public.projects (id, type, title, category, video_url, thumbnail_url, tools, client, description, duration, highlight_stat, sort_order, visible)
values
  -- Short-form 9:16 (Real YouTube Shorts)
  ('short-1', 'short', 'Viral High-Retention Social Cut', 'YouTube Shorts / 9:16', 'https://youtube.com/shorts/mgyOdnewW9A', 'https://img.youtube.com/vi/mgyOdnewW9A/hqdefault.jpg', array['Premiere Pro', 'CapCut', 'After Effects'], 'Content Creator', 'Fast-paced kinetic cuts, crisp sound effects, dynamic punch-ins, and retention hooks optimized for maximum viewer engagement.', '0:45', 'Hook: 0-2s retention boost', 1, true),
  ('short-2', 'short', 'Dynamic Storytelling Short Reel', 'Short-Form / Reels', 'https://youtu.be/2g9fS2Yfww4?si=E6agiiR23HbtHbJT', 'https://img.youtube.com/vi/2g9fS2Yfww4/hqdefault.jpg', array['After Effects', 'Premiere Pro'], 'Creator Brand', 'Seamless transitions, color-graded aesthetic visuals, and synchronized sound design designed to stop scrollers in their tracks.', '0:50', 'Clean Sound Design & SFX', 2, true),
  ('short-3', 'short', 'Kinetic Motion & Engagement Edit', 'Viral Reels / Short', 'https://youtu.be/jSdKHU28H78?si=ZQ1vqqjtOvt_Qcn5', 'https://img.youtube.com/vi/jSdKHU28H78/hqdefault.jpg', array['CapCut', 'Premiere Pro'], 'Digital Media', 'Word-by-word animated subtitles, visual callouts, zooms, and engaging B-roll overlays to maximize watch time.', '0:35', 'Word-by-word Captions', 3, true),
  ('short-4', 'short', 'High-Energy Visual Short Edit', 'Social Media / TikTok', 'https://youtu.be/7zZV17kjXo8?si=mKEgLVTwSaKpnqnd', 'https://img.youtube.com/vi/7zZV17kjXo8/hqdefault.jpg', array['DaVinci Resolve', 'Premiere Pro'], 'Creator Showcase', 'Speed ramping, visual beat-matching, custom sound effects, and color grading for high-impact social media delivery.', '0:40', 'Beat-Synced Dynamic Cuts', 4, true),
  ('short-5', 'short', 'Talking Head & Creator Podcast Hook', 'Podcast Cutdown / 9:16', 'https://youtube.com/shorts/mgyOdnewW9A', 'https://img.youtube.com/vi/mgyOdnewW9A/hqdefault.jpg', array['Premiere Pro', 'CapCut'], 'Minhaz Content Creator', 'Pacing optimization, animated graphic accents, high-contrast captions, and engaging audio enhancement.', '0:55', 'Retention Pacing & Captions', 5, true),
  ('short-6', 'short', 'Brand Anthem & Promo Hook', 'Brand Commercial / Reel', 'https://youtu.be/2g9fS2Yfww4?si=E6agiiR23HbtHbJT', 'https://img.youtube.com/vi/2g9fS2Yfww4/hqdefault.jpg', array['After Effects', 'Premiere Pro', 'DaVinci Resolve'], 'Hello Barishal Facebook Page', 'Polished brand presentation, crisp title cards, soundscapes, and color grading tailored for Facebook and Instagram feeds.', '0:30', 'Commercial Polish & Grade', 6, true),

  -- Long-form 16:9 (Real YouTube Features)
  ('long-featured-1', 'long', 'Cinematic Narrative & YouTube Edit', 'Featured Long-Form / YouTube', 'https://youtu.be/UzeXuQtjCUQ?si=Kbey4feSYpQOTrHv', 'https://img.youtube.com/vi/UzeXuQtjCUQ/hqdefault.jpg', array['Premiere Pro', 'After Effects', 'DaVinci Resolve'], 'Content Creator Lead', 'Full production edit: narrative structure, seamless A/B-roll integration, motion graphic callouts, sound design, and master color grade.', '12:40', 'Story Pacing & Retention', 1, true),
  ('long-featured-2', 'long', 'High-Production YouTube Video Edit', 'YouTube Long-Form', 'https://www.youtube.com/watch?v=U48itOQBfpQ', 'https://img.youtube.com/vi/U48itOQBfpQ/hqdefault.jpg', array['Premiere Pro', 'DaVinci Resolve'], 'YouTube Creator Channel', 'In-depth storytelling edit featuring dynamic pacing, custom title typography, audio leveling, and visual retention hooks throughout the runtime.', '15:20', 'Multi-Track Sound Design', 2, true),
  ('long-featured-3', 'long', 'Arman — Official Showreel & Highlights', 'Director Showreel / 4K', 'https://youtu.be/8YkP5xLwlis?si=GW391H1O2QgRCeg8', 'https://img.youtube.com/vi/8YkP5xLwlis/hqdefault.jpg', array['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'CapCut'], 'Arman Master Portfolio', 'High-octane showreel compiling cinematic color grades, fast-paced commercial cuts, kinetic typography, and immersive multi-channel soundscapes.', '02:15', 'Full Showreel Master', 3, true),
  ('long-4', 'long', 'Creator Documentary & Deep-Dive Film', 'Documentary / Narrative', 'https://youtu.be/UzeXuQtjCUQ?si=Kbey4feSYpQOTrHv', 'https://img.youtube.com/vi/UzeXuQtjCUQ/hqdefault.jpg', array['Premiere Pro', 'After Effects'], 'Abid Content Creator', 'Archival footage restoration, multi-camera synchronization, interview pacing, motion graphic maps, and orchestral mixing.', '18:45', 'Interview & Story Sync', 4, true),
  ('long-5', 'long', 'Commercial Brand Showcase & Color Pass', 'Brand Commercial / 4K', 'https://www.youtube.com/watch?v=U48itOQBfpQ', 'https://img.youtube.com/vi/U48itOQBfpQ/hqdefault.jpg', array['DaVinci Resolve', 'Premiere Pro', 'After Effects'], 'Ujjal CEO/UIUX Designer', 'Sleek product aesthetics, precise UI motion tracking, atmospheric lighting enhancements, and DaVinci Resolve color grading.', '03:10', 'DaVinci Resolve Color Grade', 5, true),
  ('long-6', 'long', 'Channel Production Vlog & Studio Episode', 'Studio Vlog / Long-Form', 'https://youtu.be/8YkP5xLwlis?si=GW391H1O2QgRCeg8', 'https://img.youtube.com/vi/8YkP5xLwlis/hqdefault.jpg', array['Premiere Pro', 'CapCut'], 'Rohan Manager', 'Dynamic jump-cut pacing, comedic timing, sound effects, meme inserts, and continuous retention graph optimization.', '14:30', 'Fast Turnaround Delivery', 6, true)
on conflict (id) do nothing;

-- Seed Testimonials
insert into public.testimonials (id, name, role, client_channel_or_brand, quote, avatar_url, avatar_placeholder, link, project_scope, sort_order, visible)
values
  ('testimonial-1', 'Ujjal', 'CEO & Lead UI/UX Designer', 'Design & Product Studio', 'Arman has an exceptional eye for design and pacing. His motion graphics and storytelling ability elevated our project videos into world-class presentations.', '/Ujjal.jpeg', 'UJ', 'https://dribbble.com', 'Brand Video & UI Motion Edits', 1, true),
  ('testimonial-2', 'Abid', 'Content Creator', 'YouTube Channel', 'Working with Arman leveled up our channel retention instantly. His sound design, comedic timing, and smooth transitions keep our audience hooked from start to finish.', '/Abid.jpeg', 'AB', 'https://youtube.com', 'Long-Form YouTube & Shorts Series', 2, true),
  ('testimonial-3', 'Minhaz HM', 'Video Editor & Graphics Designer', 'Digital Media & Vlogs', 'Super reliable, communicative, and fast turnaround without compromising quality. Arman knows exactly how to format hooks that generate viral reach on social media.', '/Minhaz.jpeg', 'MN', 'https://facebook.com', 'Viral Short-Form & YouTube Edits', 3, true),
  ('testimonial-4', 'Rohan', 'Channel Manager', 'Creator Management', 'Arman is our go-to video editor. He understands dead air removal, sound mixing, and graphic callouts better than most editors in the space.', '/Rohan.jpeg', 'RH', 'https://instagram.com', 'Full Channel Production Management', 4, true),
  ('testimonial-5', 'Maruf', 'Video Editor & Collab Partner', 'Post-Production Suite', 'Arman''s technical mastery over Premiere Pro and DaVinci Resolve color science is top tier. He delivers clean project files and hits every deadline seamlessly.', '/Maruf.jpeg', 'MR', 'https://linkedin.com', 'Post-Production & Color Finishing', 5, true),
  ('testimonial-6', 'Hello Barishal', 'Media & Editorial Page', 'Facebook Community Page', 'The visual clarity, music synchronization, and local storytelling Arman brought to our video productions helped our page reach thousands of active viewers.', '/Hello-barishal.jpeg', 'HB', 'https://facebook.com', 'Community Videos & Social Campaigns', 6, true)
on conflict (id) do nothing;

-- Seed FAQs
insert into public.faqs (id, question, answer, category, sort_order, visible)
values
  ('turnaround', 'What is your standard turnaround time for edits?', 'For short-form reels, TikToks, and Shorts, turnaround is typically 24 to 48 hours per video. For long-form YouTube videos (8–20 minutes), standard turnaround is 3 to 5 business days per rough cut, followed by 24-hour turnaround on revision passes. Rush options are available on request.', 'TIMELINE', 1, true),
  ('revisions', 'How do revisions and feedback cycles work?', 'Every project includes 2 revision rounds at no extra charge. I deliver review links via Frame.io or timestamped video portals so you can leave notes directly on the timeline. Revisions are usually turned around in under 24 hours.', 'PROCESS', 2, true),
  ('software', 'What editing suite and tools do you use?', 'My primary NLE is Adobe Premiere Pro, paired with After Effects for kinetic typography, VFX, and motion graphics. For finishing, I handle color grading in DaVinci Resolve Studio. I also use CapCut for rapid mobile-first pacing when requested.', 'WORKFLOW', 3, true),
  ('retainer', 'Do you offer monthly retainers or batch packages?', 'Yes. Most of my creator and brand clients work on recurring monthly retainers (such as 8–12 short-form videos/month or 4 long-form videos/month). Retainers lock in dedicated weekly calendar bandwidth, priority turnaround, and consistent visual style.', 'PRICING', 4, true),
  ('assets', 'How should I send footage and project assets?', 'You can share footage via Google Drive, Dropbox, Frame.io, or WeTransfer. I work with raw camera footage (4K Log/RAW), screen recordings, audio tracks, and brand kits. If needed, I also source licensed stock footage, sound effects, and music.', 'FOOTAGE', 5, true),
  ('style', 'Can you match my existing editing style or channel aesthetics?', 'Absolutely. Send over 2–3 reference links or your previous top-performing uploads. I will deconstruct the pacing, sound design, font hierarchy, and color tone to match your signature feel.', 'CREATIVE', 6, true)
on conflict (id) do nothing;

-- Seed Site Settings (Brand, Stats, Contact, Appearance, SEO)
insert into public.site_settings (key, value)
values
  ('brand', '{
    "name": "Arman",
    "role": "Freelance Video Editor",
    "oneLiner": "I edit videos for YouTube channels, social media creators, and brands.",
    "aboutCopy": "I make videos that people actually watch to the end. Simple cuts, tight pacing, and sound that fits the moment.",
    "extendedBio": "I work with raw footage and turn it into finished videos with clean pacing, sound design, and color. With 300+ finished projects delivered across YouTube, Reels, TikTok, and brand campaigns, I keep workflows smooth and hit deadlines every time.",
    "showreelUrl": "https://youtu.be/8YkP5xLwlis?si=GW391H1O2QgRCeg8",
    "statusBadge": "Open to work",
    "portraitUrl": ""
  }'::jsonb),
  ('stats', '[
    { "id": "stat-1", "value": "300+", "label": "Projects delivered", "subtext": "YouTube, Reels & brand edits" },
    { "id": "stat-2", "value": "25+", "label": "Happy clients", "subtext": "Creators, channels & founders" },
    { "id": "stat-3", "value": "2+", "label": "Years of experience", "subtext": "Full-time freelance editing" },
    { "id": "stat-4", "value": "4", "label": "Primary editing suites", "subtext": "Premiere, AE, DaVinci, CapCut" }
  ]'::jsonb),
  ('contact', '{
    "email": "emraninspired@gmail.com",
    "phone": "+880 1314768973",
    "whatsapp": "+8801823688022",
    "whatsappDisplay": "+880 1823-688022",
    "location": "Bangladesh · Available Worldwide (Remote)",
    "timezone": "UTC+6 (Flexible for global creators)",
    "status": "Open for freelance projects & retainer contracts",
    "socials": [
      { "name": "X (Twitter)", "url": "https://x.com/ArmanHossa66156", "handle": "@ArmanHossa66156" },
      { "name": "Facebook", "url": "https://www.facebook.com/profile.php?id=100038877474332", "handle": "Arman Hossain" },
      { "name": "WhatsApp", "url": "https://wa.me/8801823688022", "handle": "01823688022" }
    ]
  }'::jsonb),
  ('appearance', '{
    "defaultTheme": "midnight-cinema",
    "defaultPet": "tomoyo",
    "soundDefault": true
  }'::jsonb),
  ('seo_settings', '{
    "siteTitle": "Arman — Freelance Video Editor & Post-Production Artist",
    "metaDescription": "Independent video editor crafting high-retention cuts for creators, YouTube channels, and brands. Short-form reels, 4K long-form, DaVinci color grading, and dynamic sound design.",
    "ogImage": "https://img.youtube.com/vi/8YkP5xLwlis/hqdefault.jpg",
    "faviconUrl": "/favicon.svg"
  }'::jsonb)
on conflict (key) do nothing;
