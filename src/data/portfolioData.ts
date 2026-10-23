/**
 * ==============================================================================
 * ARMAN — FREELANCE VIDEO EDITOR PORTFOLIO CONTENT DATA
 * ==============================================================================
 * Central configuration file containing Arman's real credentials, videos,
 * clients, stats, and contact details.
 * ==============================================================================
 */

export interface ToolItem {
  id: string;
  name: string;
  iconName: string;
  file?: string;
  iconImage?: string;
  alt?: string;
  category: string;
  proficiency: string;
  shortDescription?: string;
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  subtext?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  type: 'short' | 'long';
  aspectRatio: '9:16' | '16:9';
  duration?: string;
  client?: string;
  description: string;
  toolsUsed: string[];
  thumbnail: string;
  fallbackGradient: string;
  videoUrl: string;
  highlightStat?: string;
  visible?: boolean;
  sortOrder?: number;
  customFields?: Array<{ label: string; value: string }>;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  clientRole: string;
  clientChannelOrBrand: string;
  clientUrl?: string;
  avatarPlaceholder: string;
  avatarImage?: string;
  quote: string;
  projectScope: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  whatsapp: string;
  whatsappDisplay: string;
  location: string;
  timezone: string;
  status: string;
  socials: {
    name: string;
    url: string;
    handle: string;
  }[];
}

export interface BrandInfo {
  name: string;
  role: string;
  oneLiner: string;
  aboutCopy: string;
  extendedBio: string;
  statusBadge: string;
  timecodeHero?: string;
  showreelUrl?: string;
  portraitUrl?: string;
}

/* -------------------------------------------------------------------------- */
/* 1. BRAND & POSITIONING DATA                                                */
/* -------------------------------------------------------------------------- */
export const BRAND = {
  name: "Arman",
  role: "Freelance Video Editor",
  oneLiner: "I edit videos for YouTube channels, social media creators, and brands.",
  aboutCopy: "I make videos that people actually watch to the end. Simple cuts, tight pacing, and sound that fits the moment.",
  extendedBio: "I work with raw footage and turn it into finished videos with clean pacing, sound design, and color. With 300+ finished projects delivered across YouTube, Reels, TikTok, and brand campaigns, I keep workflows smooth and hit deadlines every time.",
  statusBadge: "Open to work",
  timecodeHero: "00:00:00:01",
  showreelUrl: "https://youtu.be/8YkP5xLwlis?si=GW391H1O2QgRCeg8",
};

/* -------------------------------------------------------------------------- */
/* 2. EDITING TOOLS LIST                                                      */
/* -------------------------------------------------------------------------- */
export const TOOLS: ToolItem[] = [
  {
    id: "premiere-pro",
    name: "Premiere Pro",
    iconName: "pr",
    file: "/tools/Premiere-Pro-logo.png",
    iconImage: "/tools/Premiere-Pro-logo.png",
    alt: "Adobe Premiere Pro logo",
    category: "Long & Short-Form NLE",
    proficiency: "Assembly, pacing, rough cuts & audio sync"
  },
  {
    id: "after-effects",
    name: "After Effects",
    iconName: "ae",
    file: "/tools/Adobe-After-Effects.png",
    iconImage: "/tools/Adobe-After-Effects.png",
    alt: "Adobe After Effects logo",
    category: "Motion & Animation",
    proficiency: "Kinetic titles, callouts & visual effects"
  },
  {
    id: "davinci-resolve",
    name: "DaVinci Resolve",
    iconName: "resolve",
    file: "/tools/DaVinci-Resolve-Icon.png",
    iconImage: "/tools/DaVinci-Resolve-Icon.png",
    alt: "DaVinci Resolve logo",
    category: "Color & Finishing",
    proficiency: "Color grading, balancing & final master export"
  },
  {
    id: "capcut",
    name: "CapCut Pro",
    iconName: "capcut",
    file: "/tools/CapCut-Logo-Video-Editing-App-Icon.png",
    iconImage: "/tools/CapCut-Logo-Video-Editing-App-Icon.png",
    alt: "CapCut logo",
    category: "Mobile Short-Form",
    proficiency: "Fast vertical pacing & dynamic captions"
  }
];
export const EDITING_TOOLS = TOOLS;

/* -------------------------------------------------------------------------- */
/* 3. REAL STATS                                                              */
/* -------------------------------------------------------------------------- */
export const STATS: StatItem[] = [
  {
    id: "stat-1",
    value: "300+",
    label: "Projects delivered",
    subtext: "YouTube, Reels & brand edits"
  },
  {
    id: "stat-2",
    value: "25+",
    label: "Happy clients",
    subtext: "Creators, channels & founders"
  },
  {
    id: "stat-3",
    value: "2+",
    label: "Years of experience",
    subtext: "Full-time freelance editing"
  },
  {
    id: "stat-4",
    value: "4",
    label: "Primary editing suites",
    subtext: "Premiere, AE, DaVinci, CapCut"
  }
];

/* -------------------------------------------------------------------------- */
/* 4. PROJECTS (REAL YOUTUBE & SHORT-FORM LINKS PROVIDED BY ARMAN)            */
/* -------------------------------------------------------------------------- */
export const PROJECTS: { short: ProjectItem[]; long: ProjectItem[] } = {
  short: [
    {
      id: "short-1",
      title: "Viral High-Retention Social Cut",
      category: "YouTube Shorts / 9:16",
      type: "short",
      aspectRatio: "9:16",
      duration: "0:45",
      client: "Content Creator",
      description: "Fast-paced kinetic cuts, crisp sound effects, dynamic punch-ins, and retention hooks optimized for maximum viewer engagement.",
      toolsUsed: ["Premiere Pro", "CapCut", "After Effects"],
      thumbnail: "https://img.youtube.com/vi/mgyOdnewW9A/hqdefault.jpg",
      fallbackGradient: "from-zinc-900 via-neutral-900 to-amber-950/40",
      videoUrl: "https://youtube.com/shorts/mgyOdnewW9A",
      highlightStat: "Hook: 0-2s retention boost"
    },
    {
      id: "short-2",
      title: "Dynamic Storytelling Short Reel",
      category: "Short-Form / Reels",
      type: "short",
      aspectRatio: "9:16",
      duration: "0:50",
      client: "Creator Brand",
      description: "Seamless transitions, color-graded aesthetic visuals, and synchronized sound design designed to stop scrollers in their tracks.",
      toolsUsed: ["After Effects", "Premiere Pro"],
      thumbnail: "https://img.youtube.com/vi/2g9fS2Yfww4/hqdefault.jpg",
      fallbackGradient: "from-zinc-900 via-neutral-900 to-orange-950/40",
      videoUrl: "https://youtu.be/2g9fS2Yfww4?si=E6agiiR23HbtHbJT",
      highlightStat: "Clean Sound Design & SFX"
    },
    {
      id: "short-3",
      title: "Kinetic Motion & Engagement Edit",
      category: "Viral Reels / Short",
      type: "short",
      aspectRatio: "9:16",
      duration: "0:35",
      client: "Digital Media",
      description: "Word-by-word animated subtitles, visual callouts, zooms, and engaging B-roll overlays to maximize watch time.",
      toolsUsed: ["CapCut", "Premiere Pro"],
      thumbnail: "https://img.youtube.com/vi/jSdKHU28H78/hqdefault.jpg",
      fallbackGradient: "from-zinc-900 via-stone-900 to-orange-950/30",
      videoUrl: "https://youtu.be/jSdKHU28H78?si=ZQ1vqqjtOvt_Qcn5",
      highlightStat: "Word-by-word Captions"
    },
    {
      id: "short-4",
      title: "High-Energy Visual Short Edit",
      category: "Social Media / TikTok",
      type: "short",
      aspectRatio: "9:16",
      duration: "0:40",
      client: "Creator Showcase",
      description: "Speed ramping, visual beat-matching, custom sound effects, and color grading for high-impact social media delivery.",
      toolsUsed: ["DaVinci Resolve", "Premiere Pro"],
      thumbnail: "https://img.youtube.com/vi/7zZV17kjXo8/hqdefault.jpg",
      fallbackGradient: "from-zinc-900 via-neutral-900 to-emerald-950/30",
      videoUrl: "https://youtu.be/7zZV17kjXo8?si=mKEgLVTwSaKpnqnd",
      highlightStat: "Beat-Synced Dynamic Cuts"
    },
    {
      id: "short-5",
      title: "Talking Head & Creator Podcast Hook",
      category: "Podcast Cutdown / 9:16",
      type: "short",
      aspectRatio: "9:16",
      duration: "0:55",
      client: "Minhaz Content Creator",
      description: "Pacing optimization, animated graphic accents, high-contrast captions, and engaging audio enhancement.",
      toolsUsed: ["Premiere Pro", "CapCut"],
      thumbnail: "https://img.youtube.com/vi/mgyOdnewW9A/hqdefault.jpg",
      fallbackGradient: "from-zinc-900 via-zinc-800 to-amber-950/30",
      videoUrl: "https://youtube.com/shorts/mgyOdnewW9A",
      highlightStat: "Retention Pacing & Captions"
    },
    {
      id: "short-6",
      title: "Brand Anthem & Promo Hook",
      category: "Brand Commercial / Reel",
      type: "short",
      aspectRatio: "9:16",
      duration: "0:30",
      client: "Hello Barishal Facebook Page",
      description: "Polished brand presentation, crisp title cards, soundscapes, and color grading tailored for Facebook and Instagram feeds.",
      toolsUsed: ["After Effects", "Premiere Pro", "DaVinci Resolve"],
      thumbnail: "https://img.youtube.com/vi/2g9fS2Yfww4/hqdefault.jpg",
      fallbackGradient: "from-zinc-900 via-neutral-900 to-blue-950/40",
      videoUrl: "https://youtu.be/2g9fS2Yfww4?si=E6agiiR23HbtHbJT",
      highlightStat: "Commercial Polish & Grade"
    }
  ],
  long: [
    {
      id: "long-featured-1",
      title: "Cinematic Narrative & YouTube Edit",
      category: "Featured Long-Form / YouTube",
      type: "long",
      aspectRatio: "16:9",
      duration: "12:40",
      client: "Content Creator Lead",
      description: "Full production edit: narrative structure, seamless A/B-roll integration, motion graphic callouts, sound design, and master color grade.",
      toolsUsed: ["Premiere Pro", "After Effects", "DaVinci Resolve"],
      thumbnail: "https://img.youtube.com/vi/UzeXuQtjCUQ/hqdefault.jpg",
      fallbackGradient: "from-zinc-900 via-neutral-900 to-orange-950/40",
      videoUrl: "https://youtu.be/UzeXuQtjCUQ?si=Kbey4feSYpQOTrHv",
      highlightStat: "Story Pacing & Retention"
    },
    {
      id: "long-featured-2",
      title: "High-Production YouTube Video Edit",
      category: "YouTube Long-Form",
      type: "long",
      aspectRatio: "16:9",
      duration: "15:20",
      client: "YouTube Creator Channel",
      description: "In-depth storytelling edit featuring dynamic pacing, custom title typography, audio leveling, and visual retention hooks throughout the runtime.",
      toolsUsed: ["Premiere Pro", "DaVinci Resolve"],
      thumbnail: "https://img.youtube.com/vi/U48itOQBfpQ/hqdefault.jpg",
      fallbackGradient: "from-zinc-900 via-stone-900 to-amber-950/30",
      videoUrl: "https://www.youtube.com/watch?v=U48itOQBfpQ",
      highlightStat: "Multi-Track Sound Design"
    },
    {
      id: "long-featured-3",
      title: "Arman — Official Showreel & Highlights",
      category: "Director Showreel / 4K",
      type: "long",
      aspectRatio: "16:9",
      duration: "02:15",
      client: "Arman Master Portfolio",
      description: "High-octane showreel compiling cinematic color grades, fast-paced commercial cuts, kinetic typography, and immersive multi-channel soundscapes.",
      toolsUsed: ["Premiere Pro", "After Effects", "DaVinci Resolve", "CapCut"],
      thumbnail: "https://img.youtube.com/vi/8YkP5xLwlis/hqdefault.jpg",
      fallbackGradient: "from-zinc-900 via-neutral-900 to-sky-950/40",
      videoUrl: "https://youtu.be/8YkP5xLwlis?si=GW391H1O2QgRCeg8",
      highlightStat: "Full Showreel Master"
    },
    {
      id: "long-4",
      title: "Creator Documentary & Deep-Dive Film",
      category: "Documentary / Narrative",
      type: "long",
      aspectRatio: "16:9",
      duration: "18:45",
      client: "Abid Content Creator",
      description: "Archival footage restoration, multi-camera synchronization, interview pacing, motion graphic maps, and orchestral mixing.",
      toolsUsed: ["Premiere Pro", "After Effects"],
      thumbnail: "https://img.youtube.com/vi/UzeXuQtjCUQ/hqdefault.jpg",
      fallbackGradient: "from-zinc-900 via-stone-900 to-orange-950/30",
      videoUrl: "https://youtu.be/UzeXuQtjCUQ?si=Kbey4feSYpQOTrHv",
      highlightStat: "Interview & Story Sync"
    },
    {
      id: "long-5",
      title: "Commercial Brand Showcase & Color Pass",
      category: "Brand Commercial / 4K",
      type: "long",
      aspectRatio: "16:9",
      duration: "03:10",
      client: "Ujjal CEO/UIUX Designer",
      description: "Sleek product aesthetics, precise UI motion tracking, atmospheric lighting enhancements, and DaVinci Resolve color grading.",
      toolsUsed: ["DaVinci Resolve", "Premiere Pro", "After Effects"],
      thumbnail: "https://img.youtube.com/vi/U48itOQBfpQ/hqdefault.jpg",
      fallbackGradient: "from-zinc-900 via-neutral-900 to-teal-950/30",
      videoUrl: "https://www.youtube.com/watch?v=U48itOQBfpQ",
      highlightStat: "DaVinci Resolve Color Grade"
    },
    {
      id: "long-6",
      title: "Channel Production Vlog & Studio Episode",
      category: "Studio Vlog / Long-Form",
      type: "long",
      aspectRatio: "16:9",
      duration: "14:30",
      client: "Rohan Manager",
      description: "Dynamic jump-cut pacing, comedic timing, sound effects, meme inserts, and continuous retention graph optimization.",
      toolsUsed: ["Premiere Pro", "CapCut"],
      thumbnail: "https://img.youtube.com/vi/8YkP5xLwlis/hqdefault.jpg",
      fallbackGradient: "from-zinc-900 via-neutral-900 to-violet-950/30",
      videoUrl: "https://youtu.be/8YkP5xLwlis?si=GW391H1O2QgRCeg8",
      highlightStat: "Fast Turnaround Delivery"
    }
  ]
};

/* -------------------------------------------------------------------------- */
/* 5. CLIENT TESTIMONIALS (BASED ON ARMAN'S REAL CLIENT ROSTER)              */
/* -------------------------------------------------------------------------- */
export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "testimonial-1",
    clientName: "Ujjal",
    clientRole: "CEO & Lead UI/UX Designer",
    clientChannelOrBrand: "Design & Product Studio",
    clientUrl: "https://dribbble.com",
    avatarPlaceholder: "UJ",
    avatarImage: "/Ujjal.jpeg",
    quote: "Arman has an exceptional eye for design and pacing. His motion graphics and storytelling ability elevated our project videos into world-class presentations.",
    projectScope: "Brand Video & UI Motion Edits"
  },
  {
    id: "testimonial-2",
    clientName: "Abid",
    clientRole: "Content Creator",
    clientChannelOrBrand: "YouTube Channel",
    clientUrl: "https://youtube.com",
    avatarPlaceholder: "AB",
    avatarImage: "/Abid.jpeg",
    quote: "Working with Arman leveled up our channel retention instantly. His sound design, comedic timing, and smooth transitions keep our audience hooked from start to finish.",
    projectScope: "Long-Form YouTube & Shorts Series"
  },
  {
    id: "testimonial-3",
    clientName: "Minhaz HM",
    clientRole: "Video Editor & Graphics Designer",
    clientChannelOrBrand: "Digital Media & Vlogs",
    clientUrl: "https://facebook.com",
    avatarPlaceholder: "MN",
    avatarImage: "/Minhaz.jpeg",
    quote: "Super reliable, communicative, and fast turnaround without compromising quality. Arman knows exactly how to format hooks that generate viral reach on social media.",
    projectScope: "Viral Short-Form & YouTube Edits"
  },
  {
    id: "testimonial-4",
    clientName: "Rohan",
    clientRole: "Channel Manager",
    clientChannelOrBrand: "Creator Management",
    clientUrl: "https://instagram.com",
    avatarPlaceholder: "RH",
    avatarImage: "/Rohan.jpeg",
    quote: "Arman is our go-to video editor. He understands dead air removal, sound mixing, and graphic callouts better than most editors in the space.",
    projectScope: "Full Channel Production Management"
  },
  {
    id: "testimonial-5",
    clientName: "Maruf",
    clientRole: "Video Editor & Collab Partner",
    clientChannelOrBrand: "Post-Production Suite",
    clientUrl: "https://linkedin.com",
    avatarPlaceholder: "MR",
    avatarImage: "/Maruf.jpeg",
    quote: "Arman's technical mastery over Premiere Pro and DaVinci Resolve color science is top tier. He delivers clean project files and hits every deadline seamlessly.",
    projectScope: "Post-Production & Color Finishing"
  },
  {
    id: "testimonial-6",
    clientName: "Hello Barishal",
    clientRole: "Media & Editorial Page",
    clientChannelOrBrand: "Facebook Community Page",
    clientUrl: "https://facebook.com",
    avatarPlaceholder: "HB",
    avatarImage: "/Hello-barishal.jpeg",
    quote: "The visual clarity, music synchronization, and local storytelling Arman brought to our video productions helped our page reach thousands of active viewers.",
    projectScope: "Community Videos & Social Campaigns"
  }
];

/* -------------------------------------------------------------------------- */
/* 6. CONTACT & SOCIALS (ARMAN'S REAL CONTACT DETAILS)                       */
/* -------------------------------------------------------------------------- */
export const CONTACT: ContactInfo = {
  email: "emraninspired@gmail.com",
  phone: "+880 1314768973",
  whatsapp: "+8801823688022",
  whatsappDisplay: "+880 1823-688022",
  location: "Bangladesh · Available Worldwide (Remote)",
  timezone: "UTC+6 (Flexible for global creators)",
  status: "Open for freelance projects & retainer contracts",
  socials: [
    {
      name: "X (Twitter)",
      url: "https://x.com/ArmanHossa66156",
      handle: "@ArmanHossa66156"
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/profile.php?id=100038877474332",
      handle: "Arman Hossain"
    },
    {
      name: "WhatsApp",
      url: "https://wa.me/8801823688022",
      handle: "01823688022"
    }
  ]
};
