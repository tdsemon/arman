/**
 * ==============================================================================
 * ARMAN PORTFOLIO — UNIVERSAL DATA LAYER & CMS STATE ENGINE
 * ==============================================================================
 * Central reactive data store with:
 * 1. Resilient multi-tier architecture:
 *    - Memory state (React Context)
 *    - Instant localStorage cache (renders in 0ms on revisit)
 *    - Cloud persistence via Supabase Postgres + Storage
 *    - Pristine built-in fallback constants if Supabase is offline
 * 2. Universal String Registry (site_text table + t() helper)
 * 3. Section Manager state (reorder & toggle visibility)
 * 4. 6-Theme Color Customizer with live variable overrides
 * 5. SEO & Social Meta state (per-page title, meta, og:image, favicon)
 * 6. Legal documents state (Privacy & Terms with sections & lastUpdated)
 * 7. Snapshot Revision History (last 20 saves, one-click restore)
 * 8. Project enhancements: quick import, custom fields, duplication, bulk actions
 * 9. In-situ Live Edit Mode state & controller
 * ==============================================================================
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  BRAND as DEFAULT_BRAND,
  STATS as DEFAULT_STATS,
  EDITING_TOOLS as DEFAULT_TOOLS,
  PROJECTS as DEFAULT_PROJECTS,
  TESTIMONIALS as DEFAULT_TESTIMONIALS,
  CONTACT as DEFAULT_CONTACT,
  ProjectItem,
  ToolItem,
  StatItem,
  TestimonialItem,
  BrandInfo,
  ContactInfo,
} from '../data/portfolioData';
import { SITE_TEXT_DEFAULTS } from './siteTextDefaults';

// -----------------------------------------------------------------------------
// TYPES & INTERFACES
// -----------------------------------------------------------------------------

export interface FAQItem {
  id: string;
  category?: string;
  question: string;
  answer: string;
  sortOrder?: number;
  visible?: boolean;
}

export interface AppearanceSettings {
  defaultTheme: string;
  defaultPet: string;
  soundDefault: boolean;
}

export interface SectionConfig {
  id: string;
  label: string;
  visible: boolean;
}

export interface SeoSettings {
  siteTitle: string;
  metaDescription: string;
  ogImage: string;
  faviconUrl: string;
}

export interface LegalSection {
  heading: string;
  content: string;
}

export interface LegalDocState {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export interface ContentRevision {
  id: string;
  timestamp: string;
  label: string;
  data: Partial<PortfolioContentState>;
}

export interface PortfolioContentState {
  brand: BrandInfo;
  stats: StatItem[];
  tools: ToolItem[];
  projects: {
    short: ProjectItem[];
    long: ProjectItem[];
  };
  testimonials: TestimonialItem[];
  faqs: FAQItem[];
  contact: ContactInfo;
  appearance: AppearanceSettings;
  siteText: Record<string, string>;
  sectionOrder: SectionConfig[];
  themeOverrides: Record<string, Record<string, string>>;
  seoSettings: SeoSettings;
  legalPrivacy: LegalDocState;
  legalTerms: LegalDocState;
  revisions: ContentRevision[];
}

// -----------------------------------------------------------------------------
// DEFAULT SECTION ORDER & LEGAL DOCS
// -----------------------------------------------------------------------------

export const DEFAULT_SECTION_ORDER: SectionConfig[] = [
  { id: 'hero', label: 'Home', visible: true },
  { id: 'about', label: 'About', visible: true },
  { id: 'projects', label: 'Projects', visible: true },
  { id: 'faq', label: 'FAQ', visible: true },
  { id: 'testimonials', label: 'Testimonials', visible: true },
  { id: 'contact', label: 'Contact', visible: true },
];

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  siteTitle: 'Arman — Freelance Video Editor & Post-Production Artist',
  metaDescription:
    'Independent video editor crafting high-retention cuts for creators, YouTube channels, and brands. Short-form reels, 4K long-form, DaVinci color grading, and dynamic sound design.',
  ogImage: 'https://img.youtube.com/vi/8YkP5xLwlis/hqdefault.jpg',
  faviconUrl: '/favicon.svg',
};

export const DEFAULT_LEGAL_PRIVACY: LegalDocState = {
  title: 'Privacy Policy',
  subtitle: 'Transparent, minimal, and respectful data practices. How Arman handles your inquiry information and browser storage.',
  lastUpdated: 'OCTOBER 2025',
  sections: [
    {
      heading: 'Information Collected',
      content:
        'We only collect information you voluntarily provide through our contact inquiry form, including your name, email address, project requirements, and footage links. No passive tracking, third-party advertising cookies, or fingerprinting scripts are used on this website.',
    },
    {
      heading: 'How Form Data Is Used',
      content:
        'Inquiry details are strictly used to evaluate your video editing scope, prepare quotes, and communicate regarding deliverables. We do not sell, rent, or distribute your email or project data to any third parties.',
    },
    {
      heading: 'Footage & Asset Confidentiality',
      content:
        'All client footage, sound recordings, scripts, and pre-release materials are treated under strict confidentiality. We can sign Non-Disclosure Agreements (NDAs) prior to receiving footage upon request.',
    },
    {
      heading: 'Cookies & Browser Storage',
      content:
        'This site uses localStorage solely to store your visual theme selection, cursor pet companion preference, and audio mute setting. These settings stay purely inside your browser.',
    },
  ],
};

export const DEFAULT_LEGAL_TERMS: LegalDocState = {
  title: 'Terms & Conditions',
  subtitle: 'Standard terms governing project engagements, footage handling, intellectual property rights, and turnaround times.',
  lastUpdated: 'OCTOBER 2025',
  sections: [
    {
      heading: 'Project Engagement & Turnaround',
      content:
        'Every project begins with a confirmed scope outlining deliverable formats (9:16 or 16:9), target duration, and turnaround timeline. Standard packages include 2 rounds of creative revisions at no extra cost.',
    },
    {
      heading: 'Footage & Asset Delivery',
      content:
        'Clients provide raw camera footage, audio stems, and brand kits via cloud links (Google Drive, Dropbox, Frame.io, or WeTransfer). Turnaround clocks begin once all required assets are accessible.',
    },
    {
      heading: 'Intellectual Property Rights',
      content:
        'Upon receipt of final payment, full commercial usage rights for the finished video exports transfer to the client. Arman retains the right to feature clips in professional showreels and portfolios unless an explicit white-label agreement is executed.',
    },
    {
      heading: 'Payment & Retainers',
      content:
        'Retainer agreements are billed monthly in advance to guarantee weekly editing bandwidth. One-off projects require a 50% deposit with the balance due upon final watermarked approval before delivery of clean master files.',
    },
  ],
};

export const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 'turnaround',
    category: 'TIMELINE',
    question: 'What is your standard turnaround time for edits?',
    answer:
      'For short-form reels, TikToks, and Shorts, turnaround is typically 24 to 48 hours per video. For long-form YouTube videos (8–20 minutes), standard turnaround is 3 to 5 business days per rough cut, followed by 24-hour turnaround on revision passes. Rush options are available on request.',
  },
  {
    id: 'revisions',
    category: 'PROCESS',
    question: 'How do revisions and feedback cycles work?',
    answer:
      'Every project includes 2 revision rounds at no extra charge. I deliver review links via Frame.io or timestamped video portals so you can leave notes directly on the timeline. Revisions are usually turned around in under 24 hours.',
  },
  {
    id: 'software',
    category: 'WORKFLOW',
    question: 'What editing suite and tools do you use?',
    answer:
      'My primary NLE is Adobe Premiere Pro, paired with After Effects for kinetic typography, VFX, and motion graphics. For finishing, I handle color grading in DaVinci Resolve Studio. I also use CapCut for rapid mobile-first pacing when requested.',
  },
  {
    id: 'retainer',
    category: 'PRICING',
    question: 'Do you offer monthly retainers or batch packages?',
    answer:
      'Yes. Most of my creator and brand clients work on recurring monthly retainers (such as 8–12 short-form videos/month or 4 long-form videos/month). Retainers lock in dedicated weekly calendar bandwidth, priority turnaround, and consistent visual style.',
  },
  {
    id: 'assets',
    category: 'FOOTAGE',
    question: 'How should I send footage and project assets?',
    answer:
      'You can share footage via Google Drive, Dropbox, Frame.io, or WeTransfer. I work with raw camera footage (4K Log/RAW), screen recordings, audio tracks, and brand kits. If needed, I also source licensed stock footage, sound effects, and music.',
  },
  {
    id: 'style',
    category: 'CREATIVE',
    question: 'Can you match my existing editing style or channel aesthetics?',
    answer:
      'Absolutely. Send over 2–3 reference links or your previous top-performing uploads. I will deconstruct the pacing, sound design, font hierarchy, and color tone to match your signature feel.',
  },
];

export const DEFAULT_PORTFOLIO_CONTENT: PortfolioContentState = {
  brand: {
    ...DEFAULT_BRAND,
    portraitUrl: '',
  },
  stats: DEFAULT_STATS,
  tools: DEFAULT_TOOLS.map((t) => ({
    ...t,
    file: t.file || `/tools/${t.id}.png`,
    shortDescription: t.proficiency,
  })),
  projects: DEFAULT_PROJECTS,
  testimonials: DEFAULT_TESTIMONIALS,
  faqs: DEFAULT_FAQS,
  contact: DEFAULT_CONTACT,
  appearance: {
    defaultTheme: 'midnight-cinema',
    defaultPet: 'tomoyo',
    soundDefault: true,
  },
  siteText: SITE_TEXT_DEFAULTS,
  sectionOrder: DEFAULT_SECTION_ORDER,
  themeOverrides: {},
  seoSettings: DEFAULT_SEO_SETTINGS,
  legalPrivacy: DEFAULT_LEGAL_PRIVACY,
  legalTerms: DEFAULT_LEGAL_TERMS,
  revisions: [],
};

const CACHE_KEY = 'arman_portfolio_cached_content_v3';

// -----------------------------------------------------------------------------
// CACHE HELPERS (LOCAL STORAGE)
// -----------------------------------------------------------------------------
function loadCachedContent(): PortfolioContentState {
  if (typeof window === 'undefined') return DEFAULT_PORTFOLIO_CONTENT;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.brand && parsed.projects) {
        return {
          ...DEFAULT_PORTFOLIO_CONTENT,
          ...parsed,
          brand: { ...DEFAULT_PORTFOLIO_CONTENT.brand, ...(parsed.brand || {}) },
          contact: { ...DEFAULT_PORTFOLIO_CONTENT.contact, ...(parsed.contact || {}) },
          appearance: { ...DEFAULT_PORTFOLIO_CONTENT.appearance, ...(parsed.appearance || {}) },
          siteText: { ...SITE_TEXT_DEFAULTS, ...(parsed.siteText || {}) },
          sectionOrder: parsed.sectionOrder && parsed.sectionOrder.length > 0 ? parsed.sectionOrder : DEFAULT_SECTION_ORDER,
          themeOverrides: parsed.themeOverrides || {},
          seoSettings: { ...DEFAULT_SEO_SETTINGS, ...(parsed.seoSettings || {}) },
          legalPrivacy: { ...DEFAULT_LEGAL_PRIVACY, ...(parsed.legalPrivacy || {}) },
          legalTerms: { ...DEFAULT_LEGAL_TERMS, ...(parsed.legalTerms || {}) },
          revisions: parsed.revisions || [],
        };
      }
    }
  } catch {
    // ignore parse error
  }
  return DEFAULT_PORTFOLIO_CONTENT;
}

function saveCachedContent(content: PortfolioContentState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(content));
  } catch {
    // storage quota limit
  }
}

// -----------------------------------------------------------------------------
// MEDIA COMPRESSION & UPLOAD UTILITY
// -----------------------------------------------------------------------------
export async function compressAndUploadMedia(file: File, folder = 'general'): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured yet. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.');
  }

  // Reject files over 2MB
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('File size exceeds the 2MB limit. Please select an image under 2MB.');
  }

  // If SVG or ICO, upload directly
  if (file.type === 'image/svg+xml' || file.type === 'image/x-icon' || file.name.endsWith('.ico') || file.name.endsWith('.svg')) {
    const filename = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { error } = await supabase.storage.from('site-media').upload(filename, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/svg+xml',
    });
    if (error) throw error;
    const { data } = supabase.storage.from('site-media').getPublicUrl(filename);
    return data.publicUrl;
  }

  // Compress & convert to WebP max 1600px
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context unavailable'));

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          async (blob) => {
            if (!blob) return reject(new Error('Image compression failed'));
            try {
              if (!supabase) throw new Error('Supabase client unavailable');
              const cleanBase = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
              const filename = `${folder}/${Date.now()}-${cleanBase.replace(/[^a-zA-Z0-9_-]/g, '_')}.webp`;
              const { error } = await supabase.storage.from('site-media').upload(filename, blob, {
                contentType: 'image/webp',
                cacheControl: '31536000',
                upsert: true,
              });
              if (error) throw error;
              const { data } = supabase.storage.from('site-media').getPublicUrl(filename);
              resolve(data.publicUrl);
            } catch (err) {
              reject(err);
            }
          },
          'image/webp',
          0.85
        );
      };
      img.onerror = () => reject(new Error('Invalid image file format'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

// -----------------------------------------------------------------------------
// CONTEXT TYPE DEFINITION
// -----------------------------------------------------------------------------
export interface ContentContextType {
  content: PortfolioContentState;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  refreshContent: () => Promise<void>;
  // Text Registry & i18n
  t: (key: string, fallback?: string) => string;
  updateSiteText: (key: string, value: string) => Promise<void>;
  updateBatchSiteText: (entries: Record<string, string>) => Promise<void>;
  // Live Edit Mode
  isEditMode: boolean;
  setIsEditMode: (active: boolean) => void;
  // Core CMS Mutators
  saveProject: (project: ProjectItem) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<void>;
  bulkUpdateProjects: (ids: string[], update: Partial<ProjectItem>) => Promise<void>;
  bulkDeleteProjects: (ids: string[]) => Promise<void>;
  reorderProjects: (items: ProjectItem[]) => Promise<void>;
  saveTestimonial: (item: TestimonialItem) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  reorderTestimonials: (items: TestimonialItem[]) => Promise<void>;
  saveFaq: (item: FAQItem) => Promise<void>;
  deleteFaq: (id: string) => Promise<void>;
  reorderFaqs: (items: FAQItem[]) => Promise<void>;
  saveTool: (tool: ToolItem) => Promise<void>;
  deleteTool: (id: string) => Promise<void>;
  reorderTools: (items: ToolItem[]) => Promise<void>;
  saveBrand: (brand: BrandInfo) => Promise<void>;
  saveStats: (stats: StatItem[]) => Promise<void>;
  saveContact: (contact: ContactInfo) => Promise<void>;
  saveAppearance: (appearance: AppearanceSettings) => Promise<void>;
  // Advanced CMS Controls
  saveSectionOrder: (sections: SectionConfig[]) => Promise<void>;
  saveThemeOverrides: (overrides: Record<string, Record<string, string>>) => Promise<void>;
  saveSeoSettings: (seo: SeoSettings) => Promise<void>;
  saveLegalDoc: (type: 'privacy' | 'terms', doc: LegalDocState) => Promise<void>;
  saveRawSetting: (key: string, value: any) => Promise<void>;
  // Backup & Revision Operations
  exportBackupJson: () => string;
  importBackupJson: (jsonString: string) => Promise<{ success: boolean; stats: any }>;
  createRevision: (label: string) => Promise<void>;
  restoreRevision: (revisionId: string) => Promise<void>;
}

const ContentContext = createContext<ContentContextType | null>(null);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<PortfolioContentState>(loadCachedContent);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Translation / universal string lookup helper
  const t = useCallback(
    (key: string, fallback?: string): string => {
      if (content.siteText && typeof content.siteText[key] === 'string') {
        return content.siteText[key];
      }
      if (SITE_TEXT_DEFAULTS[key]) {
        return SITE_TEXT_DEFAULTS[key];
      }
      return fallback || key;
    },
    [content.siteText]
  );

  // Apply SEO meta tags dynamically whenever seoSettings change
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const { seoSettings } = content;
    if (seoSettings.siteTitle) {
      document.title = seoSettings.siteTitle;
    }
    if (seoSettings.metaDescription) {
      let descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.setAttribute('name', 'description');
        document.head.appendChild(descMeta);
      }
      descMeta.setAttribute('content', seoSettings.metaDescription);
    }
    if (seoSettings.ogImage) {
      let ogImg = document.querySelector('meta[property="og:image"]');
      if (!ogImg) {
        ogImg = document.createElement('meta');
        ogImg.setAttribute('property', 'og:image');
        document.head.appendChild(ogImg);
      }
      ogImg.setAttribute('content', seoSettings.ogImage);
    }
    if (seoSettings.faviconUrl) {
      let fav = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
      if (!fav) {
        fav = document.createElement('link');
        fav.rel = 'icon';
        document.head.appendChild(fav);
      }
      fav.href = seoSettings.faviconUrl;
    }
  }, [content.seoSettings]);

  // Apply theme color customizer overrides to document.documentElement
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const currentTheme = document.documentElement.getAttribute('data-theme') || content.appearance.defaultTheme || 'midnight-cinema';
    const overrides = content.themeOverrides?.[currentTheme];
    if (overrides) {
      Object.entries(overrides).forEach(([varName, val]) => {
        document.documentElement.style.setProperty(varName, val);
      });
    }
  }, [content.themeOverrides, content.appearance.defaultTheme]);

  /**
   * Fetch fresh content from Supabase
   */
  const refreshContent = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      const [
        projectsRes,
        testimonialsRes,
        faqsRes,
        toolsRes,
        settingsRes,
        siteTextRes,
      ] = await Promise.all([
        supabase.from('projects').select('*').order('sort_order', { ascending: true }),
        supabase.from('testimonials').select('*').order('sort_order', { ascending: true }),
        supabase.from('faqs').select('*').order('sort_order', { ascending: true }),
        supabase.from('tools').select('*').order('sort_order', { ascending: true }),
        supabase.from('site_settings').select('*'),
        supabase.from('site_text').select('key, value'),
      ]);

      const newContent: PortfolioContentState = { ...content };

      // Process Projects
      if (projectsRes.data) {
        if (projectsRes.data.length > 0) {
          const shortList: ProjectItem[] = [];
          const longList: ProjectItem[] = [];
          projectsRes.data.forEach((p: any) => {
            const item: ProjectItem = {
              id: p.id,
              type: p.type,
              title: p.title,
              category: p.category,
              aspectRatio: p.type === 'short' ? '9:16' : '16:9',
              duration: p.duration || undefined,
              client: p.client || undefined,
              description: p.description || '',
              toolsUsed: Array.isArray(p.tools) ? p.tools : [],
              thumbnail: p.thumbnail_url,
              fallbackGradient: 'from-zinc-900 via-neutral-900 to-zinc-950',
              videoUrl: p.video_url,
              highlightStat: p.highlight_stat || undefined,
              visible: p.visible !== false,
              sortOrder: p.sort_order || 0,
              customFields: Array.isArray(p.custom_fields) ? p.custom_fields : [],
            };
            if (p.type === 'short') shortList.push(item);
            else longList.push(item);
          });
          newContent.projects = { short: shortList, long: longList };
        } else if (!projectsRes.error && projectsRes.data.length === 0) {
          // Empty table in Supabase — show friendly empty state instead of placeholders
          newContent.projects = { short: [], long: [] };
        }
      }

      // Process Testimonials
      if (testimonialsRes.data && testimonialsRes.data.length > 0) {
        newContent.testimonials = testimonialsRes.data.map((t: any) => ({
          id: t.id,
          clientName: t.name,
          clientRole: t.role,
          clientChannelOrBrand: t.client_channel_or_brand || '',
          clientUrl: t.link || undefined,
          avatarPlaceholder: t.avatar_placeholder || t.name.substring(0, 2).toUpperCase(),
          avatarImage: t.avatar_url || undefined,
          quote: t.quote,
          projectScope: t.project_scope || 'Video Production',
        }));
      }

      // Process FAQs
      if (faqsRes.data && faqsRes.data.length > 0) {
        newContent.faqs = faqsRes.data.map((f: any) => ({
          id: f.id,
          category: f.category || 'TIMELINE',
          question: f.question,
          answer: f.answer,
          sortOrder: f.sort_order,
          visible: f.visible,
        }));
      }

      // Process Tools
      if (toolsRes.data && toolsRes.data.length > 0) {
        newContent.tools = toolsRes.data.map((tool: any) => ({
          id: tool.id,
          name: tool.name,
          iconName: tool.id,
          file: tool.logo_url,
          iconImage: tool.logo_url,
          alt: tool.alt || `${tool.name} logo`,
          category: tool.category || '',
          proficiency: tool.short_description,
          shortDescription: tool.short_description,
        }));
      }

      // Process Settings (Brand, Stats, Contact, Appearance, Section Order, Themes, SEO, Legal)
      if (settingsRes.data && settingsRes.data.length > 0) {
        settingsRes.data.forEach((s: any) => {
          if (s.key === 'brand' && s.value) {
            newContent.brand = { ...newContent.brand, ...s.value };
          } else if (s.key === 'stats' && Array.isArray(s.value)) {
            newContent.stats = s.value;
          } else if (s.key === 'contact' && s.value) {
            newContent.contact = { ...newContent.contact, ...s.value };
          } else if (s.key === 'appearance' && s.value) {
            newContent.appearance = { ...newContent.appearance, ...s.value };
          } else if (s.key === 'section_order' && Array.isArray(s.value)) {
            newContent.sectionOrder = s.value;
          } else if (s.key === 'theme_overrides' && s.value) {
            newContent.themeOverrides = s.value;
          } else if (s.key === 'seo_settings' && s.value) {
            newContent.seoSettings = { ...newContent.seoSettings, ...s.value };
          } else if (s.key === 'legal_privacy' && s.value) {
            newContent.legalPrivacy = { ...newContent.legalPrivacy, ...s.value };
          } else if (s.key === 'legal_terms' && s.value) {
            newContent.legalTerms = { ...newContent.legalTerms, ...s.value };
          } else if (s.key === 'content_revisions' && Array.isArray(s.value)) {
            newContent.revisions = s.value;
          }
        });
      }

      // Process Universal Site Text Registry
      if (siteTextRes.data && siteTextRes.data.length > 0) {
        const textMap: Record<string, string> = { ...SITE_TEXT_DEFAULTS };
        siteTextRes.data.forEach((row: { key: string; value: string }) => {
          textMap[row.key] = row.value;
        });
        newContent.siteText = textMap;
      }

      setContent(newContent);
      saveCachedContent(newContent);
    } catch (err: any) {
      console.warn('[Content Sync Warning] Using local cache/defaults:', err?.message || err);
      setError(err?.message || 'Sync failed');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [content]);

  // Initial fetch on mount
  useEffect(() => {
    refreshContent();
  }, []);

  // ---------------------------------------------------------------------------
  // REVISION SNAPSHOT HELPER
  // ---------------------------------------------------------------------------
  const createRevision = async (label: string) => {
    const newRev: ContentRevision = {
      id: `rev-${Date.now()}`,
      timestamp: new Date().toISOString(),
      label,
      data: {
        brand: content.brand,
        stats: content.stats,
        tools: content.tools,
        projects: content.projects,
        testimonials: content.testimonials,
        faqs: content.faqs,
        contact: content.contact,
        appearance: content.appearance,
        siteText: content.siteText,
        sectionOrder: content.sectionOrder,
        themeOverrides: content.themeOverrides,
        seoSettings: content.seoSettings,
      },
    };
    const nextRevs = [newRev, ...(content.revisions || [])].slice(0, 20);
    const nextContent = { ...content, revisions: nextRevs };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('site_settings').upsert({
        key: 'content_revisions',
        value: nextRevs,
        updated_at: new Date().toISOString(),
      });
    }
  };

  const restoreRevision = async (revisionId: string) => {
    const rev = content.revisions.find((r) => r.id === revisionId);
    if (!rev || !rev.data) throw new Error('Revision snapshot not found.');

    const restored: PortfolioContentState = {
      ...content,
      ...rev.data,
    };
    setContent(restored);
    saveCachedContent(restored);

    // Persist restored settings to Supabase
    if (isSupabaseConfigured && supabase) {
      const keysToSync = ['brand', 'stats', 'contact', 'appearance', 'section_order', 'theme_overrides', 'seo_settings'];
      for (const k of keysToSync) {
        const val = (restored as any)[k === 'section_order' ? 'sectionOrder' : k === 'theme_overrides' ? 'themeOverrides' : k === 'seo_settings' ? 'seoSettings' : k];
        if (val) {
          await supabase.from('site_settings').upsert({
            key: k,
            value: val,
            updated_at: new Date().toISOString(),
          });
        }
      }
    }
  };

  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // SITE TEXT REGISTRY MUTATORS
  // ---------------------------------------------------------------------------
  const updateSiteText = async (key: string, value: string) => {
    const nextText = { ...content.siteText, [key]: value };
    const nextContent = { ...content, siteText: nextText };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('site_text').upsert(
        {
          key,
          value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      ).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Save failed: 0 rows affected. RLS policy blocked write to site_text.');
      }
    }
  };

  const updateBatchSiteText = async (entries: Record<string, string>) => {
    const nextText = { ...content.siteText, ...entries };
    const nextContent = { ...content, siteText: nextText };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const rows = Object.entries(entries).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }));
      const { data, error } = await supabase.from('site_text').upsert(rows, { onConflict: 'key' }).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Save failed: 0 rows affected. RLS policy blocked write to site_text.');
      }
    }
  };

  // ---------------------------------------------------------------------------
  // PROJECTS MUTATORS (WITH DUPLICATION & BULK ACTIONS)
  // ---------------------------------------------------------------------------
  const saveProject = async (project: ProjectItem) => {
    const isShort = project.type === 'short';
    const listKey = isShort ? 'short' : 'long';
    const exists = content.projects[listKey].some((p) => p.id === project.id);

    const updatedList = exists
      ? content.projects[listKey].map((p) => (p.id === project.id ? project : p))
      : [project, ...content.projects[listKey]];

    const nextProjects = {
      ...content.projects,
      [listKey]: updatedList,
    };
    const nextContent = { ...content, projects: nextProjects };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const { data, error: upsertErr } = await supabase.from('projects').upsert(
        {
          id: project.id,
          type: project.type,
          title: project.title,
          category: project.category,
          video_url: project.videoUrl,
          thumbnail_url: project.thumbnail,
          tools: project.toolsUsed,
          client: project.client || '',
          description: project.description || '',
          duration: project.duration || '',
          highlight_stat: project.highlightStat || '',
          custom_fields: project.customFields || [],
          sort_order: project.sortOrder || 0,
          visible: project.visible !== false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      ).select();
      if (upsertErr) throw upsertErr;
      if (!data || data.length === 0) {
        throw new Error('Save failed: 0 rows affected. Your account may lack admin permissions (RLS blocked write).');
      }
    }
  };

  const deleteProject = async (id: string) => {
    const nextShort = content.projects.short.filter((p) => p.id !== id);
    const nextLong = content.projects.long.filter((p) => p.id !== id);
    const nextContent = {
      ...content,
      projects: { short: nextShort, long: nextLong },
    };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('projects').delete().eq('id', id).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Delete failed: 0 rows affected. Your account may lack admin permissions.');
      }
    }
  };

  const duplicateProject = async (id: string) => {
    const isShort = content.projects.short.some((p) => p.id === id);
    const listKey = isShort ? 'short' : 'long';
    const existing = content.projects[listKey].find((p) => p.id === id);
    if (!existing) return;

    const duplicated: ProjectItem = {
      ...existing,
      id: `${existing.type}-${Date.now().toString(36)}`,
      title: `${existing.title} (Copy)`,
      sortOrder: (existing.sortOrder || 0) + 1,
    };

    await saveProject(duplicated);
  };

  const bulkUpdateProjects = async (ids: string[], update: Partial<ProjectItem>) => {
    const applyTo = (list: ProjectItem[]) =>
      list.map((p) => (ids.includes(p.id) ? { ...p, ...update } : p));

    const nextProjects = {
      short: applyTo(content.projects.short),
      long: applyTo(content.projects.long),
    };
    const nextContent = { ...content, projects: nextProjects };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const updatePayload: any = {};
      if (update.visible !== undefined) updatePayload.visible = update.visible;
      if (update.category !== undefined) updatePayload.category = update.category;
      if (Object.keys(updatePayload).length > 0) {
        const { data, error } = await supabase.from('projects').update(updatePayload).in('id', ids).select();
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('Bulk update failed: 0 rows affected. RLS blocked update.');
        }
      }
    }
  };

  const bulkDeleteProjects = async (ids: string[]) => {
    const nextShort = content.projects.short.filter((p) => !ids.includes(p.id));
    const nextLong = content.projects.long.filter((p) => !ids.includes(p.id));
    const nextContent = {
      ...content,
      projects: { short: nextShort, long: nextLong },
    };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('projects').delete().in('id', ids).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Bulk delete failed: 0 rows affected. RLS blocked delete.');
      }
    }
  };

  const reorderProjects = async (items: ProjectItem[]) => {
    if (items.length === 0) return;
    const type = items[0].type;
    const listKey = type === 'short' ? 'short' : 'long';
    const nextProjects = { ...content.projects, [listKey]: items };
    const nextContent = { ...content, projects: nextProjects };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const updates = items.map((item, idx) =>
        client.from('projects').update({ sort_order: idx + 1 }).eq('id', item.id).select()
      );
      const results = await Promise.all(updates);
      for (const res of results) {
        if (res.error) throw res.error;
        if (!res.data || res.data.length === 0) {
          throw new Error('Reorder failed: 0 rows affected. RLS policy blocked update.');
        }
      }
    }
  };

  // ---------------------------------------------------------------------------
  // TESTIMONIALS MUTATORS
  // ---------------------------------------------------------------------------
  const saveTestimonial = async (item: TestimonialItem) => {
    const exists = content.testimonials.some((t) => t.id === item.id);
    const nextList = exists
      ? content.testimonials.map((t) => (t.id === item.id ? item : t))
      : [item, ...content.testimonials];

    const nextContent = { ...content, testimonials: nextList };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('testimonials').upsert(
        {
          id: item.id,
          name: item.clientName,
          role: item.clientRole,
          client_channel_or_brand: item.clientChannelOrBrand || '',
          quote: item.quote,
          avatar_url: item.avatarImage || '',
          avatar_placeholder: item.avatarPlaceholder || '',
          link: item.clientUrl || '',
          project_scope: item.projectScope || '',
          sort_order: 0,
          visible: true,
        },
        { onConflict: 'id' }
      ).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Save failed: 0 rows affected. RLS policy blocked testimonial write.');
      }
    }
  };

  const deleteTestimonial = async (id: string) => {
    const nextContent = {
      ...content,
      testimonials: content.testimonials.filter((t) => t.id !== id),
    };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('testimonials').delete().eq('id', id).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Delete failed: 0 rows affected. RLS policy blocked testimonial deletion.');
      }
    }
  };

  const reorderTestimonials = async (items: TestimonialItem[]) => {
    const nextContent = { ...content, testimonials: items };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const updates = items.map((item, idx) =>
        client.from('testimonials').update({ sort_order: idx + 1 }).eq('id', item.id).select()
      );
      const results = await Promise.all(updates);
      for (const res of results) {
        if (res.error) throw res.error;
        if (!res.data || res.data.length === 0) {
          throw new Error('Reorder failed: 0 rows affected. RLS policy blocked update.');
        }
      }
    }
  };

  // ---------------------------------------------------------------------------
  // FAQS MUTATORS
  // ---------------------------------------------------------------------------
  const saveFaq = async (item: FAQItem) => {
    const exists = content.faqs.some((f) => f.id === item.id);
    const nextList = exists
      ? content.faqs.map((f) => (f.id === item.id ? item : f))
      : [...content.faqs, item];

    const nextContent = { ...content, faqs: nextList };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('faqs').upsert(
        {
          id: item.id,
          question: item.question,
          answer: item.answer,
          category: item.category || 'TIMELINE',
          sort_order: item.sortOrder || 0,
          visible: item.visible !== false,
        },
        { onConflict: 'id' }
      ).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Save failed: 0 rows affected. RLS policy blocked FAQ write.');
      }
    }
  };

  const deleteFaq = async (id: string) => {
    const nextContent = {
      ...content,
      faqs: content.faqs.filter((f) => f.id !== id),
    };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('faqs').delete().eq('id', id).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Delete failed: 0 rows affected. RLS policy blocked FAQ deletion.');
      }
    }
  };

  const reorderFaqs = async (items: FAQItem[]) => {
    const nextContent = { ...content, faqs: items };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const updates = items.map((item, idx) =>
        client.from('faqs').update({ sort_order: idx + 1 }).eq('id', item.id).select()
      );
      const results = await Promise.all(updates);
      for (const res of results) {
        if (res.error) throw res.error;
        if (!res.data || res.data.length === 0) {
          throw new Error('Reorder failed: 0 rows affected. RLS policy blocked update.');
        }
      }
    }
  };

  // ---------------------------------------------------------------------------
  // TOOLS MUTATORS
  // ---------------------------------------------------------------------------
  const saveTool = async (tool: ToolItem) => {
    const exists = content.tools.some((t) => t.id === tool.id);
    const nextList = exists
      ? content.tools.map((t) => (t.id === tool.id ? tool : t))
      : [...content.tools, tool];

    const nextContent = { ...content, tools: nextList };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('tools').upsert(
        {
          id: tool.id,
          name: tool.name,
          logo_url: tool.file || tool.iconImage || '',
          alt: tool.alt || '',
          category: tool.category || '',
          short_description: tool.shortDescription || tool.proficiency || '',
          sort_order: 0,
          visible: true,
        },
        { onConflict: 'id' }
      ).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Save failed: 0 rows affected. RLS policy blocked tool write.');
      }
    }
  };

  const deleteTool = async (id: string) => {
    const nextContent = {
      ...content,
      tools: content.tools.filter((t) => t.id !== id),
    };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('tools').delete().eq('id', id).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Delete failed: 0 rows affected. RLS policy blocked tool deletion.');
      }
    }
  };

  const reorderTools = async (items: ToolItem[]) => {
    const nextContent = { ...content, tools: items };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const updates = items.map((item, idx) =>
        client.from('tools').update({ sort_order: idx + 1 }).eq('id', item.id).select()
      );
      const results = await Promise.all(updates);
      for (const res of results) {
        if (res.error) throw res.error;
        if (!res.data || res.data.length === 0) {
          throw new Error('Reorder failed: 0 rows affected. RLS policy blocked update.');
        }
      }
    }
  };

  // ---------------------------------------------------------------------------
  // SETTINGS MUTATORS (BRAND, STATS, CONTACT, APPEARANCE)
  // ---------------------------------------------------------------------------
  const saveBrand = async (brand: BrandInfo) => {
    const nextContent = { ...content, brand };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('site_settings').upsert({
        key: 'brand',
        value: brand,
        updated_at: new Date().toISOString(),
      }).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Save failed: 0 rows affected. RLS policy blocked write to site_settings.');
      }
    }
  };

  const saveStats = async (stats: StatItem[]) => {
    const nextContent = { ...content, stats };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('site_settings').upsert({
        key: 'stats',
        value: stats,
        updated_at: new Date().toISOString(),
      }).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Save failed: 0 rows affected. RLS policy blocked write to site_settings.');
      }
    }
  };

  const saveContact = async (contact: ContactInfo) => {
    const nextContent = { ...content, contact };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('site_settings').upsert({
        key: 'contact',
        value: contact,
        updated_at: new Date().toISOString(),
      }).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Save failed: 0 rows affected. RLS policy blocked write to site_settings.');
      }
    }
  };

  const saveAppearance = async (appearance: AppearanceSettings) => {
    const nextContent = { ...content, appearance };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('site_settings').upsert({
        key: 'appearance',
        value: appearance,
        updated_at: new Date().toISOString(),
      }).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Save failed: 0 rows affected. RLS policy blocked write to site_settings.');
      }
    }
  };

  const saveSectionOrder = async (sections: SectionConfig[]) => {
    const nextContent = { ...content, sectionOrder: sections };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('site_settings').upsert({
        key: 'section_order',
        value: sections,
        updated_at: new Date().toISOString(),
      }).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Save failed: 0 rows affected. RLS policy blocked write to site_settings.');
      }
    }
  };

  const saveThemeOverrides = async (overrides: Record<string, Record<string, string>>) => {
    const nextContent = { ...content, themeOverrides: overrides };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('site_settings').upsert({
        key: 'theme_overrides',
        value: overrides,
        updated_at: new Date().toISOString(),
      }).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Save failed: 0 rows affected. RLS policy blocked write to site_settings.');
      }
    }
  };

  const saveSeoSettings = async (seo: SeoSettings) => {
    const nextContent = { ...content, seoSettings: seo };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('site_settings').upsert({
        key: 'seo_settings',
        value: seo,
        updated_at: new Date().toISOString(),
      }).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Save failed: 0 rows affected. RLS policy blocked write to site_settings.');
      }
    }
  };

  const saveLegalDoc = async (type: 'privacy' | 'terms', doc: LegalDocState) => {
    const key = type === 'privacy' ? 'legal_privacy' : 'legal_terms';
    const stateKey = type === 'privacy' ? 'legalPrivacy' : 'legalTerms';
    const nextDoc = {
      ...doc,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase(),
    };
    const nextContent = { ...content, [stateKey]: nextDoc };
    setContent(nextContent);
    saveCachedContent(nextContent);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('site_settings').upsert({
        key,
        value: nextDoc,
        updated_at: new Date().toISOString(),
      }).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Save failed: 0 rows affected. RLS policy blocked write to site_settings.');
      }
    }
  };

  const saveRawSetting = async (key: string, value: any) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('site_settings').upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      }).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Save failed: 0 rows affected. RLS policy blocked write to site_settings.');
      }
    }
    await refreshContent();
  };

  // ---------------------------------------------------------------------------
  // BACKUP EXPORT & IMPORT
  // ---------------------------------------------------------------------------
  const exportBackupJson = (): string => {
    const dump = {
      exportedAt: new Date().toISOString(),
      version: '3.0',
      brand: content.brand,
      stats: content.stats,
      tools: content.tools,
      projects: content.projects,
      testimonials: content.testimonials,
      faqs: content.faqs,
      contact: content.contact,
      appearance: content.appearance,
      siteText: content.siteText,
      sectionOrder: content.sectionOrder,
      themeOverrides: content.themeOverrides,
      seoSettings: content.seoSettings,
      legalPrivacy: content.legalPrivacy,
      legalTerms: content.legalTerms,
    };
    return JSON.stringify(dump, null, 2);
  };

  const importBackupJson = async (jsonString: string): Promise<{ success: boolean; stats: any }> => {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON backup file structure.');
    }

    const nextContent: PortfolioContentState = {
      ...content,
      brand: data.brand || content.brand,
      stats: data.stats || content.stats,
      tools: data.tools || content.tools,
      projects: data.projects || content.projects,
      testimonials: data.testimonials || content.testimonials,
      faqs: data.faqs || content.faqs,
      contact: data.contact || content.contact,
      appearance: data.appearance || content.appearance,
      siteText: data.siteText || content.siteText,
      sectionOrder: data.sectionOrder || content.sectionOrder,
      themeOverrides: data.themeOverrides || content.themeOverrides,
      seoSettings: data.seoSettings || content.seoSettings,
      legalPrivacy: data.legalPrivacy || content.legalPrivacy,
      legalTerms: data.legalTerms || content.legalTerms,
    };

    setContent(nextContent);
    saveCachedContent(nextContent);

    // Save snapshot revision before replacing
    await createRevision('Pre-import snapshot');

    // Batch sync to Supabase if connected
    if (isSupabaseConfigured && supabase) {
      const settingsPairs = [
        ['brand', nextContent.brand],
        ['stats', nextContent.stats],
        ['contact', nextContent.contact],
        ['appearance', nextContent.appearance],
        ['section_order', nextContent.sectionOrder],
        ['theme_overrides', nextContent.themeOverrides],
        ['seo_settings', nextContent.seoSettings],
        ['legal_privacy', nextContent.legalPrivacy],
        ['legal_terms', nextContent.legalTerms],
      ];
      for (const [k, val] of settingsPairs) {
        const { data: sData, error: sErr } = await supabase.from('site_settings').upsert({
          key: k,
          value: val,
          updated_at: new Date().toISOString(),
        }).select();
        if (sErr) throw sErr;
        if (!sData || sData.length === 0) {
          throw new Error(`Import failed: 0 rows affected when updating setting '${k}'. RLS blocked write.`);
        }
      }

      if (data.siteText) {
        const textRows = Object.entries(data.siteText).map(([key, value]) => ({
          key,
          value: String(value),
          updated_at: new Date().toISOString(),
        }));
        const { data: tData, error: tErr } = await supabase.from('site_text').upsert(textRows, { onConflict: 'key' }).select();
        if (tErr) throw tErr;
        if (!tData || tData.length === 0) {
          throw new Error('Import failed: 0 rows affected when updating site_text. RLS blocked write.');
        }
      }
    }

    return {
      success: true,
      stats: {
        shortProjects: nextContent.projects.short.length,
        longProjects: nextContent.projects.long.length,
        testimonials: nextContent.testimonials.length,
        faqs: nextContent.faqs.length,
        textEntries: Object.keys(nextContent.siteText).length,
      },
    };
  };

  return React.createElement(
    ContentContext.Provider,
    {
      value: {
        content,
        isLoading,
        isSyncing,
        error,
        refreshContent,
        t,
        updateSiteText,
        updateBatchSiteText,
        isEditMode,
        setIsEditMode,
        saveProject,
        deleteProject,
        duplicateProject,
        bulkUpdateProjects,
        bulkDeleteProjects,
        reorderProjects,
        saveTestimonial,
        deleteTestimonial,
        reorderTestimonials,
        saveFaq,
        deleteFaq,
        reorderFaqs,
        saveTool,
        deleteTool,
        reorderTools,
        saveBrand,
        saveStats,
        saveContact,
        saveAppearance,
        saveSectionOrder,
        saveThemeOverrides,
        saveSeoSettings,
        saveLegalDoc,
        saveRawSetting,
        exportBackupJson,
        importBackupJson,
        createRevision,
        restoreRevision,
      },
    },
    children
  );
};

export function useContent(): ContentContextType {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
