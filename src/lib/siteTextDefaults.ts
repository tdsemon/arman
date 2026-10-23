/**
 * ==============================================================================
 * UNIVERSAL SITE TEXT REGISTRY DEFAULTS
 * ==============================================================================
 * Comprehensive dictionary of all human-facing strings across the entire portfolio.
 * Serves as the high-performance local fallback if Supabase is offline or unconfigured.
 * ==============================================================================
 */

export interface SiteTextEntry {
  key: string;
  value: string;
  category: 'navigation' | 'hero' | 'about' | 'projects' | 'faq' | 'testimonials' | 'contact' | 'footer' | 'error' | 'general';
  description?: string;
}

export const SITE_TEXT_DEFAULTS: Record<string, string> = {
  // Navigation
  'nav.home': 'Home',
  'nav.about': 'About',
  'nav.projects': 'Projects',
  'nav.faq': 'FAQ',
  'nav.testimonials': 'Testimonials',
  'nav.contact': 'Contact',
  'nav.cta': 'Book an Edit',

  // Hero Section
  'hero.badge_sequence': 'SEQUENCE 01',
  'hero.badge_format': '4K UHD · 24 FPS',
  'hero.role': 'Video Editor & Post-Production Artist',
  'hero.headline_prefix': "Hey, I'm",
  'hero.headline_suffix': '. I edit videos for creators and brands.',
  'hero.oneliner': 'I craft high-retention video edits for creators and brands. From kinetic short-form reels to long-form YouTube cuts with cinematic color grading and dynamic sound design.',
  'hero.cta_work': 'View my work',
  'hero.cta_contact': "Let's talk",
  'hero.discipline_reels': 'Short-form reels',
  'hero.discipline_youtube': 'YouTube long-form',
  'hero.discipline_color': 'Color & sound',
  'hero.monitor_label': 'SHOWREEL PREVIEW',
  'hero.monitor_fps': '23.98 FPS',
  'hero.monitor_watch': 'Watch showreel',
  'hero.scroll_down': 'About',

  // About Section
  'about.kicker': 'ABOUT',
  'about.subkicker': 'Arman · Video Editor',
  'about.headline': 'I make videos that people actually watch to the end.',
  'about.lead': 'I am an independent video editor specializing in rhythm, retention, and narrative pacing. Over the past 4+ years, I have cut hundreds of videos across YouTube, TikTok, and brand campaigns.',
  'about.bio_extended': 'My workflow revolves around three core pillars: tight pacing that removes dead air, legible kinetic subtitles with graphic callouts that emphasize key points, and meticulous sound design with DaVinci Resolve color grading for true skin tones.',
  'about.philosophy': 'Whether you send over a 60-minute raw podcast recording or 30 unorganized mobile clips, I organize the timeline, find the story beats, cut the dead air, and deliver clean, polished exports ready for upload.',
  'about.pillar1_title': 'Tight Pacing',
  'about.pillar1_desc': 'Zero filler, seamless cuts, and rhythmic pacing matched to audience retention.',
  'about.pillar2_title': 'Visual Polish',
  'about.pillar2_desc': 'Legible kinetic subtitles, graphic callouts, and clean zooms that emphasize key points.',
  'about.pillar3_title': 'Sound & Grade',
  'about.pillar3_desc': 'Balanced dialogue, crisp sound effects, and color grading for accurate skin tones.',
  'about.tools_heading': 'Software & Tools',
  'about.tools_subtitle': 'Primary NLE suites and finishing applications I use every day',
  'about.photo_badge': 'Available for projects',

  // Projects Section
  'projects.kicker': 'PROJECTS',
  'projects.subkicker': 'Selected Cuts',
  'projects.heading': 'Selected work.',
  'projects.intro': 'Recent short-form reels and long-form YouTube cuts. Click any video to open the player.',
  'projects.tab_short': 'Short-Form (9:16)',
  'projects.tab_long': 'Long-Form (16:9)',
  'projects.empty_short': 'No short-form projects published yet. Check back soon or request a custom sample.',
  'projects.empty_long': 'No long-form projects published yet. Check back soon or request a custom sample.',

  // FAQ Section
  'faq.kicker': 'FAQ',
  'faq.subkicker': 'Questions & Answers',
  'faq.heading': 'Questions people often ask.',
  'faq.intro': 'Turnaround times, project scopes, revisions, and how to get started. Have a question not listed here?',
  'faq.contact_link': 'Send me a message',

  // Testimonials Section
  'testimonials.kicker': 'TESTIMONIALS',
  'testimonials.subkicker': 'Client Feedback',
  'testimonials.heading': 'What clients say about working with me.',
  'testimonials.intro': 'Feedback on pacing, communication, fast turnaround, and channel retention.',

  // Contact Section
  'contact.kicker': 'CONTACT',
  'contact.subkicker': 'Start a Project',
  'contact.heading': "Let's work together.",
  'contact.intro': 'Have a project in mind, need recurring video editing, or want to discuss a new video idea? Drop me a message below or reach out directly.',
  'contact.form_heading': 'Project Inquiry',
  'contact.form_intro_prefix': 'Fill in the details below. Messages are routed directly to',
  'contact.field_name_label': 'Your Name',
  'contact.field_name_placeholder': 'Sarah Jenkins',
  'contact.field_email_label': 'Your Email',
  'contact.field_email_placeholder': 'sarah@creatorchannel.com',
  'contact.field_type_label': 'Project Scope',
  'contact.field_message_label': 'Project Details & Footage Link',
  'contact.field_message_placeholder': 'Tell me about your channel or brand, turnaround timeline, video length, or share a Drive/Dropbox link...',
  'contact.submit_idle': 'Send Inquiry Message',
  'contact.submit_sending': 'Sending Inquiry...',
  'contact.success_title': "Message sent, I'll reply soon!",
  'contact.success_desc': 'Thank you for reaching out. I usually review footage requests and return quotes within 24 hours.',
  'contact.footer_disclaimer': 'NDA & Confidentiality guaranteed · 24h typical response',

  // Footer
  'footer.status': 'Available for client projects & retainers',
  'footer.copyright_suffix': 'All rights reserved.',
  'footer.admin_link': 'Studio Admin',

  // 404 Error Page
  '404.badge': 'Scene offline · Missing clip',
  '404.heading': 'Timeline Clip Not Found',
  '404.description': 'The scene or timecode you were trying to access does not exist on this timeline. It might have been cut, renamed, or moved.',
  '404.button': 'Return to Main Timeline',
};
