/**
 * ==============================================================================
 * ARMAN PORTFOLIO — LIVE CMS STUDIO ADMIN DRAWER
 * ==============================================================================
 * Enterprise-grade in-situ administrative console providing 100% frontend
 * control over the portfolio website without code changes or redeployments.
 *
 * Supported Tabs:
 * 1. Projects: Short (9:16) & Long (16:9), YouTube/Vimeo oEmbed auto-fill,
 *    custom fields (client, duration, metrics), duplicate project, bulk actions.
 * 2. Sections & Nav: Section ordering (syncs navbar), show/hide, rename links.
 * 3. Testimonials: Client quotes, avatars, roles, channel links, reordering.
 * 4. FAQ: Questions, answers, categories, reordering, live JSON-LD sync.
 * 5. Tools: Software stack, logo uploads, descriptions, sorting.
 * 6. Hero & About: Taglines, role, bio paragraphs, portrait photo, status.
 * 7. Stats: Numbers, labels, subtexts.
 * 8. Contact & Social: Email, WhatsApp, location, timezone, social links.
 * 9. Legal Pages: Privacy Policy & Terms blocks with auto lastUpdated date.
 * 10. SEO & Social: Title, meta description, OG image, site favicon.
 * 11. Appearance & Colors: 6-theme color customizer with WCAG AA contrast math.
 * 12. Media Library: Visual storage bucket browser, upload, copy URL, in-use check.
 * 13. Backup & History: Export JSON, Import with preview/confirm, 20-save snapshots.
 * 14. Admins (Owner only): View roles, add editor by email, remove editor.
 * 15. Raw JSON Editor: Direct interactive JSON manipulation for site_settings.
 * ==============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Eye,
  EyeOff,
  Video,
  MessageSquare,
  HelpCircle,
  Wrench,
  User,
  BarChart3,
  PhoneCall,
  Palette,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Film,
  LogOut,
  Copy,
  RefreshCw,
  Download,
  FileText,
  Globe,
  ShieldCheck,
  Database,
  Code2,
  CopyCheck,
  AlertTriangle,
  ListOrdered,
  Link as LinkIcon,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  useContent,
  compressAndUploadMedia,
  SectionConfig,
  SeoSettings,
  LegalDocState,
  AppearanceSettings,
  FAQItem,
  DEFAULT_SECTION_ORDER,
} from '../lib/content';
import { useAuth } from '../lib/auth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  ProjectItem,
  TestimonialItem,
  ToolItem,
  StatItem,
  ContactInfo,
  BrandInfo,
} from '../data/portfolioData';
import { THEMES, PETS, ThemeId } from '../types/theme';
import { PermissionsModal } from './PermissionsModal';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey =
  | 'projects'
  | 'sections'
  | 'testimonials'
  | 'faq'
  | 'tools'
  | 'hero-about'
  | 'stats'
  | 'contact'
  | 'legal'
  | 'seo'
  | 'appearance'
  | 'media'
  | 'backup'
  | 'admins'
  | 'raw';

// -----------------------------------------------------------------------------
// WCAG AA COLOR CONTRAST MATHEMATICS
// -----------------------------------------------------------------------------
function hexToRgb(hex: string): [number, number, number] | null {
  if (!hex || typeof hex !== 'string') return null;
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : [r, g, b];
  }
  return null;
}

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 7; // fallback
  const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Default themes base variables for color editor reset
const DEFAULT_THEME_PALETTES: Record<string, Record<string, string>> = {
  'midnight-cinema': {
    '--bg': '#08080A',
    '--surface': '#121216',
    '--surface-elevated': '#1B1B24',
    '--text': '#EDEDEE',
    '--text-primary': '#FFFFFF',
    '--accent': '#FF5500',
    '--border': 'rgba(255, 255, 255, 0.12)',
  },
  'sakura': {
    '--bg': '#FDF6F6',
    '--surface': '#FFFFFF',
    '--surface-elevated': '#FFEBF1',
    '--text': '#2A1B22',
    '--text-primary': '#170912',
    '--accent': '#E0537A',
    '--border': 'rgba(224, 83, 122, 0.22)',
  },
  'neon-tokyo': {
    '--bg': '#0A0612',
    '--surface': '#150D24',
    '--surface-elevated': '#281747',
    '--text': '#F5F2FF',
    '--text-primary': '#FFFFFF',
    '--accent': '#FF007A',
    '--border': 'rgba(255, 0, 122, 0.25)',
  },
  'terminal': {
    '--bg': '#050805',
    '--surface': '#0B120B',
    '--surface-elevated': '#152415',
    '--text': '#33FF77',
    '--text-primary': '#4DFF88',
    '--accent': '#00FF66',
    '--border': 'rgba(0, 255, 102, 0.28)',
  },
  'sunset-reel': {
    '--bg': '#0C0806',
    '--surface': '#17100D',
    '--surface-elevated': '#2D1D17',
    '--text': '#FFF5EE',
    '--text-primary': '#FFFFFF',
    '--accent': '#FF4500',
    '--border': 'rgba(255, 100, 30, 0.25)',
  },
  'paper-cut': {
    '--bg': '#F4F1EA',
    '--surface': '#FFFFFF',
    '--surface-elevated': '#E7E2D6',
    '--text': '#141414',
    '--text-primary': '#000000',
    '--accent': '#E52E2E',
    '--border': 'rgba(20, 20, 20, 0.18)',
  },
};

export const AdminDrawer: React.FC<AdminDrawerProps> = ({ isOpen, onClose }) => {
  const {
    content,
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
    restoreRevision,
    createRevision,
  } = useContent();

  const { isOwner, role, logout, getAdminsList, addEditor, removeAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>('projects');
  const [projectSubTab, setProjectSubTab] = useState<'short' | 'long'>('short');
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);

  // Form working copy states
  const [brandForm, setBrandForm] = useState<BrandInfo>(content.brand);
  const [statsForm, setStatsForm] = useState<StatItem[]>(content.stats);
  const [contactForm, setContactForm] = useState<ContactInfo>(content.contact);
  const [appearanceForm, setAppearanceForm] = useState<AppearanceSettings>(content.appearance);
  const [sectionsForm, setSectionsForm] = useState<SectionConfig[]>(content.sectionOrder || DEFAULT_SECTION_ORDER);
  const [seoForm, setSeoForm] = useState<SeoSettings>(content.seoSettings);
  const [privacyForm, setPrivacyForm] = useState<LegalDocState>(content.legalPrivacy);
  const [termsForm, setTermsForm] = useState<LegalDocState>(content.legalTerms);
  const [themeCustomizerId, setThemeCustomizerId] = useState<ThemeId>('midnight-cinema');
  const [themeOverridesForm, setThemeOverridesForm] = useState<Record<string, Record<string, string>>>(content.themeOverrides || {});

  // Bulk actions & item selection
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  // Item modal editors
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [editingTool, setEditingTool] = useState<ToolItem | null>(null);

  // Quick Video Import
  const [importVideoUrl, setImportVideoUrl] = useState('');
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

  // Media Library state
  const [mediaFiles, setMediaFiles] = useState<Array<{ name: string; size: number; updated_at: string; publicUrl: string }>>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaWarning, setMediaWarning] = useState<string | null>(null);

  // Backup & Import state
  const [importJsonText, setImportJsonText] = useState('');
  const [importPreviewStats, setImportPreviewStats] = useState<any | null>(null);

  // Admins state
  const [adminsList, setAdminsList] = useState<Array<{ user_id: string; email: string; role: 'owner' | 'editor' }>>([]);
  const [newEditorEmail, setNewEditorEmail] = useState('');
  const [newEditorUserId, setNewEditorUserId] = useState('');
  const [isAdminActionLoading, setIsAdminActionLoading] = useState(false);

  // Raw Settings Editor
  const [rawSettingsJson, setRawSettingsJson] = useState('');

  // Status feedback & warnings
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Sync working state when content updates
  useEffect(() => {
    setBrandForm(content.brand);
    setStatsForm(content.stats);
    setContactForm(content.contact);
    setAppearanceForm(content.appearance);
    setSectionsForm(content.sectionOrder || DEFAULT_SECTION_ORDER);
    setSeoForm(content.seoSettings);
    setPrivacyForm(content.legalPrivacy);
    setTermsForm(content.legalTerms);
    setThemeOverridesForm(content.themeOverrides || {});
  }, [content]);

  // Load drafts from localStorage on open
  useEffect(() => {
    if (isOpen) {
      try {
        const savedDraft = localStorage.getItem('arman_admin_drafts');
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.brand) setBrandForm(parsed.brand);
          if (parsed.stats) setStatsForm(parsed.stats);
          if (parsed.contact) setContactForm(parsed.contact);
          if (parsed.seo) setSeoForm(parsed.seo);
        }
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  // Autosave working draft changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      try {
        localStorage.setItem(
          'arman_admin_drafts',
          JSON.stringify({
            brand: brandForm,
            stats: statsForm,
            contact: contactForm,
            seo: seoForm,
            timestamp: Date.now(),
          })
        );
      } catch {
        // ignore
      }
    }
  }, [brandForm, statsForm, contactForm, seoForm, hasUnsavedChanges]);

  // Warn before browser unload if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Clear toast feedback
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Load media library files when Media tab is clicked
  const loadMediaFiles = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setIsLoadingMedia(true);
    try {
      const { data, error } = await supabase.storage.from('site-media').list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });
      if (error) throw error;
      if (data) {
        const mapped = data.map((item: any) => {
          const publicUrl = supabase ? supabase.storage.from('site-media').getPublicUrl(item.name).data.publicUrl : '';
          return {
            name: item.name,
            size: item.metadata?.size || 0,
            updated_at: item.updated_at || item.created_at || '',
            publicUrl,
          };
        });
        setMediaFiles(mapped);
      }
    } catch (err: any) {
      console.warn('Could not list media files:', err?.message);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  // Load admins list when Admins tab is clicked
  const loadAdminsList = async () => {
    try {
      const list = await getAdminsList();
      setAdminsList(list);
    } catch (err) {
      console.warn('Could not load admins list:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'media') {
      loadMediaFiles();
    } else if (activeTab === 'admins') {
      loadAdminsList();
    } else if (activeTab === 'raw') {
      setRawSettingsJson(
        JSON.stringify(
          {
            brand: content.brand,
            stats: content.stats,
            contact: content.contact,
            appearance: content.appearance,
            section_order: content.sectionOrder,
            theme_overrides: content.themeOverrides,
            seo_settings: content.seoSettings,
            legal_privacy: content.legalPrivacy,
            legal_terms: content.legalTerms,
          },
          null,
          2
        )
      );
    }
  }, [activeTab]);

  const handleCloseAttempt = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved edits in the editor. Are you sure you want to close?')) {
        return;
      }
    }
    setHasUnsavedChanges(false);
    onClose();
  };

  // Helper for media upload
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    folder: string,
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const publicUrl = await compressAndUploadMedia(file, folder);
      onSuccess(publicUrl);
      setHasUnsavedChanges(true);
      setStatusMessage({ type: 'success', text: 'Media uploaded and compressed to WebP!' });
      if (activeTab === 'media') loadMediaFiles();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Media upload failed' });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Quick video auto-fetch
  const handleAutoFetchVideoDetails = async () => {
    if (!importVideoUrl.trim() || !editingProject) return;
    setIsFetchingMetadata(true);
    const clean = importVideoUrl.trim();

    try {
      let title = editingProject.title;
      let thumbnail = editingProject.thumbnail;

      // YouTube match
      const ytMatch = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (ytMatch) {
        const id = ytMatch[1];
        thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
        try {
          const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.title) title = data.title;
          }
        } catch {
          // ignore network failure
        }
      } else if (clean.includes('vimeo.com')) {
        try {
          const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(clean)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.title) title = data.title;
            if (data.thumbnail_url) thumbnail = data.thumbnail_url;
          }
        } catch {
          // ignore
        }
      }

      setEditingProject({
        ...editingProject,
        videoUrl: clean,
        title,
        thumbnail,
      });
      setStatusMessage({ type: 'success', text: 'Fetched video metadata! You can override fields below.' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Could not auto-fetch video metadata.' });
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  // WCAG Contrast calculation for active customizer theme
  const activeCustomizerPalette = {
    ...DEFAULT_THEME_PALETTES[themeCustomizerId],
    ...(themeOverridesForm[themeCustomizerId] || {}),
  };
  const contrastRatio = getContrastRatio(activeCustomizerPalette['--bg'] || '#08080A', activeCustomizerPalette['--text'] || '#EDEDEE');
  const isContrastPass = contrastRatio >= 4.5;

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Studio Admin Content Management Drawer"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden flex justify-end"
    >
      {/* Backdrop */}
      <div
        onClick={handleCloseAttempt}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Main Drawer Container */}
      <div className="relative w-full max-w-5xl h-full bg-[var(--surface-elevated)] border-l border-[var(--border)] shadow-2xl flex flex-col z-10 text-[var(--text)] overflow-hidden">
        
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                  Studio Admin CMS
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[10px] font-mono text-[var(--accent)] uppercase font-semibold">
                  {role || 'Admin'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-mono">
                Full-control site manager · Zero redeployments
              </p>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-3">
            {statusMessage && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsPermissionsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] text-[var(--accent)] border border-[var(--border)] text-xs font-mono transition-colors cursor-pointer"
              title="Test database permissions across all tables"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Test Permissions</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                if (hasUnsavedChanges) {
                  if (!window.confirm('You have unsaved changes. Log out anyway?')) return;
                }
                await logout();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-hover)] hover:bg-rose-950/40 text-[var(--text-muted)] hover:text-rose-300 border border-[var(--border)] hover:border-rose-600/40 text-xs font-mono transition-colors cursor-pointer"
              title="Log out of admin session"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">Log out</span>
            </button>

            <button
              type="button"
              onClick={handleCloseAttempt}
              className="p-2 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)] transition-colors cursor-pointer"
              aria-label="Close Admin Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Ribbon (15 Comprehensive Tabs) */}
        <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--surface)] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs font-mono">
          {[
            { id: 'projects', label: 'Projects', icon: Video },
            { id: 'sections', label: 'Sections & Nav', icon: ListOrdered },
            { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
            { id: 'faq', label: 'FAQ', icon: HelpCircle },
            { id: 'tools', label: 'Tools', icon: Wrench },
            { id: 'hero-about', label: 'Hero & About', icon: User },
            { id: 'stats', label: 'Stats', icon: BarChart3 },
            { id: 'contact', label: 'Contact', icon: PhoneCall },
            { id: 'legal', label: 'Legal Pages', icon: FileText },
            { id: 'seo', label: 'SEO & Meta', icon: Globe },
            { id: 'appearance', label: 'Themes & Colors', icon: Palette },
            { id: 'media', label: 'Media Library', icon: ImageIcon },
            { id: 'backup', label: 'Backup & History', icon: Database },
            ...(isOwner ? [{ id: 'admins', label: 'Admins', icon: ShieldCheck }] : []),
            { id: 'raw', label: 'Raw JSON', icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabKey)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent)] text-[var(--on-accent)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ================================================================= */}
          {/* TAB 1: PROJECTS (QUICK IMPORT, CUSTOM FIELDS, DUPLICATION, BULK)   */}
          {/* ================================================================= */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {/* Header and Sub-tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Project Showcase Manager
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] font-mono">
                    Short-form vertical reels (9:16) & long-form YouTube cuts (16:9)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Segmented Switcher */}
                  <div className="p-1 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center">
                    <button
                      type="button"
                      onClick={() => setProjectSubTab('short')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                        projectSubTab === 'short'
                          ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      Shorts ({content.projects.short.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setProjectSubTab('long')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                        projectSubTab === 'long'
                          ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      Long-Form ({content.projects.long.length})
                    </button>
                  </div>

                  {/* Add Project Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setImportVideoUrl('');
                      setEditingProject({
                        id: `${projectSubTab}-${Date.now().toString(36)}`,
                        type: projectSubTab,
                        title: '',
                        category: projectSubTab === 'short' ? 'Reels & Shorts / 9:16' : 'YouTube Feature / 16:9',
                        aspectRatio: projectSubTab === 'short' ? '9:16' : '16:9',
                        videoUrl: '',
                        thumbnail: '',
                        toolsUsed: ['Premiere Pro', 'After Effects'],
                        client: '',
                        duration: '',
                        highlightStat: '',
                        description: '',
                        fallbackGradient: 'from-zinc-900 to-black',
                        visible: true,
                        sortOrder: 0,
                        customFields: [],
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono transition-opacity hover:opacity-90 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Project</span>
                  </button>
                </div>
              </div>

              {/* Bulk Actions Bar if items selected */}
              {selectedProjectIds.length > 0 && (
                <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border-accent)] flex items-center justify-between gap-3 text-xs font-mono animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                    <span>{selectedProjectIds.length} project(s) selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await bulkUpdateProjects(selectedProjectIds, { visible: true });
                        setSelectedProjectIds([]);
                        setStatusMessage({ type: 'success', text: 'Selected projects set to visible.' });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)]"
                    >
                      Show Selected
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await bulkUpdateProjects(selectedProjectIds, { visible: false });
                        setSelectedProjectIds([]);
                        setStatusMessage({ type: 'success', text: 'Selected projects hidden.' });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-muted)]"
                    >
                      Hide Selected
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm(`Permanently delete ${selectedProjectIds.length} selected project(s)?`)) return;
                        await bulkDeleteProjects(selectedProjectIds);
                        setSelectedProjectIds([]);
                        setStatusMessage({ type: 'success', text: 'Selected projects deleted.' });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40"
                    >
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}

              {/* Projects List */}
              {content.projects[projectSubTab].length === 0 ? (
                <div className="py-16 text-center rounded-2xl bg-[var(--surface)] border border-dashed border-[var(--border)] p-6">
                  <Film className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    No {projectSubTab === 'short' ? 'short-form' : 'long-form'} projects published yet.
                  </p>
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
                    Click "Add Project" above to create or quick-import your first cut.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {content.projects[projectSubTab].map((p, index) => {
                    const isSelected = selectedProjectIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-colors ${
                          p.visible === false
                            ? 'bg-[var(--surface)]/50 border-[var(--border)] opacity-60'
                            : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-accent)]'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProjectIds([...selectedProjectIds, p.id]);
                              } else {
                                setSelectedProjectIds(selectedProjectIds.filter((id) => id !== p.id));
                              }
                            }}
                            className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                          />

                          <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-black shrink-0 border border-[var(--border)]">
                            <img
                              src={p.thumbnail}
                              alt={p.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                                {p.title || 'Untitled Project'}
                              </h4>
                              {p.duration && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-muted)]">
                                  {p.duration}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[var(--text-muted)] font-mono truncate mt-0.5">
                              {p.category} {p.client ? `· Client: ${p.client}` : ''}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons on project row */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Reorder Up */}
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => {
                              const list = [...content.projects[projectSubTab]];
                              const temp = list[index - 1];
                              list[index - 1] = list[index];
                              list[index] = temp;
                              reorderProjects(list);
                            }}
                            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] disabled:opacity-20 text-[var(--text-muted)]"
                            title="Move up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>

                          {/* Reorder Down */}
                          <button
                            type="button"
                            disabled={index === content.projects[projectSubTab].length - 1}
                            onClick={() => {
                              const list = [...content.projects[projectSubTab]];
                              const temp = list[index + 1];
                              list[index + 1] = list[index];
                              list[index] = temp;
                              reorderProjects(list);
                            }}
                            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] disabled:opacity-20 text-[var(--text-muted)]"
                            title="Move down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>

                          {/* Visibility Toggle */}
                          <button
                            type="button"
                            onClick={() => saveProject({ ...p, visible: p.visible === false ? true : false })}
                            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            title={p.visible === false ? 'Show project' : 'Hide project'}
                          >
                            {p.visible === false ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                          </button>

                          {/* Duplicate Project */}
                          <button
                            type="button"
                            onClick={() => duplicateProject(p.id)}
                            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--accent)]"
                            title="Duplicate project"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Edit Project */}
                          <button
                            type="button"
                            onClick={() => {
                              setImportVideoUrl(p.videoUrl || '');
                              setEditingProject(p);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--accent)] hover:text-[var(--on-accent)] text-xs font-mono font-semibold transition-colors"
                          >
                            Edit
                          </button>

                          {/* Delete Project */}
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(p.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-950/40 text-[var(--text-muted)] hover:text-rose-400"
                            title="Delete project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PROJECT EDIT MODAL WITH QUICK IMPORT & CUSTOM FIELDS */}
          {editingProject && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-6 text-[var(--text)] space-y-5 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <h4 className="text-base font-bold text-[var(--text-primary)]">
                    {editingProject.title ? `Edit: ${editingProject.title}` : 'Add New Project'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="p-1.5 rounded-lg hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Auto-Fill oEmbed Section */}
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-accent)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[var(--accent)] uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Quick Import (YouTube / Vimeo Link)
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      Auto-extracts title & thumbnail
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                      value={importVideoUrl}
                      onChange={(e) => setImportVideoUrl(e.target.value)}
                      className="flex-1 text-xs font-mono bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg px-3 py-2 outline-none focus:border-[var(--accent)]"
                    />
                    <button
                      type="button"
                      onClick={handleAutoFetchVideoDetails}
                      disabled={isFetchingMetadata || !importVideoUrl.trim()}
                      className="px-3 py-2 rounded-lg bg-[var(--accent)] text-[var(--on-accent)] text-xs font-mono font-bold shrink-0 disabled:opacity-50"
                    >
                      {isFetchingMetadata ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Auto-Fetch'}
                    </button>
                  </div>
                </div>

                {/* Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="sm:col-span-2">
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Project Title</label>
                    <input
                      type="text"
                      value={editingProject.title}
                      onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                      placeholder="Viral Kinetic Shorts Cut"
                      className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Category Tag</label>
                    <input
                      type="text"
                      value={editingProject.category}
                      onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                      className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Duration (e.g. 0:45, 14:22)</label>
                    <input
                      type="text"
                      value={editingProject.duration || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, duration: e.target.value })}
                      className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Video Stream URL</label>
                    <input
                      type="url"
                      value={editingProject.videoUrl}
                      onChange={(e) => setEditingProject({ ...editingProject, videoUrl: e.target.value })}
                      className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  {/* Thumbnail URL with Upload & Live Preview */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="block text-[var(--text-muted)] uppercase">Thumbnail Image</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="url"
                        value={editingProject.thumbnail}
                        onChange={(e) => setEditingProject({ ...editingProject, thumbnail: e.target.value })}
                        placeholder="https://..."
                        className="flex-1 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-[var(--accent)]"
                      />
                      <label className="px-3 py-2.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] cursor-pointer flex items-center gap-1.5 shrink-0">
                        <Upload className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileUpload(e, 'thumbnails', (url) =>
                              setEditingProject({ ...editingProject, thumbnail: url })
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    </div>

                    {editingProject.thumbnail && (
                      <div className="relative w-40 h-24 rounded-lg overflow-hidden bg-black border border-[var(--border)] mt-2">
                        <img
                          src={editingProject.thumbnail}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[10px] font-mono text-emerald-300">
                          Live Preview
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Client Name</label>
                    <input
                      type="text"
                      value={editingProject.client || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })}
                      placeholder="Creator or Channel Name"
                      className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Highlight Stat / Badge</label>
                    <input
                      type="text"
                      value={editingProject.highlightStat || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, highlightStat: e.target.value })}
                      placeholder="4K Master Grade"
                      className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Tools Used (Comma Separated)</label>
                    <input
                      type="text"
                      value={editingProject.toolsUsed.join(', ')}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          toolsUsed: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      placeholder="Premiere Pro, After Effects, DaVinci Resolve"
                      className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  {/* Optional Custom Fields List */}
                  <div className="sm:col-span-2 pt-2 border-t border-[var(--border)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)] uppercase font-semibold">
                        Custom Metadata Fields (Optional)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const current = editingProject.customFields || [];
                          setEditingProject({
                            ...editingProject,
                            customFields: [...current, { label: '', value: '' }],
                          });
                        }}
                        className="inline-flex items-center gap-1 text-[var(--accent)] text-xs font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Field</span>
                      </button>
                    </div>

                    {(editingProject.customFields || []).map((cf, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Label (e.g. Result)"
                          value={cf.label}
                          onChange={(e) => {
                            const next = [...(editingProject.customFields || [])];
                            next[idx].label = e.target.value;
                            setEditingProject({ ...editingProject, customFields: next });
                          }}
                          className="w-1/3 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. 2.4M Views)"
                          value={cf.value}
                          onChange={(e) => {
                            const next = [...(editingProject.customFields || [])];
                            next[idx].value = e.target.value;
                            setEditingProject({ ...editingProject, customFields: next });
                          }}
                          className="flex-1 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = (editingProject.customFields || []).filter((_, i) => i !== idx);
                            setEditingProject({ ...editingProject, customFields: next });
                          }}
                          className="p-1.5 text-[var(--text-muted)] hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Description / Project Notes</label>
                    <textarea
                      rows={3}
                      value={editingProject.description}
                      onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                      className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="px-4 py-2 rounded-xl bg-[var(--surface)] text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!editingProject.title.trim()) {
                        alert('Please provide a title');
                        return;
                      }
                      setIsSaving(true);
                      try {
                        await saveProject(editingProject);
                        setEditingProject(null);
                        setStatusMessage({ type: 'success', text: 'Project saved!' });
                      } catch (err: any) {
                        setStatusMessage({ type: 'error', text: err?.message || 'Save failed' });
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Project</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: SECTIONS & NAVIGATION MANAGER                             */}
          {/* ================================================================= */}
          {activeTab === 'sections' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[var(--border)]">
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Homepage Section & Navigation Manager
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
                  Reorder sections, toggle visibility, and rename navbar links. The navbar automatically stays in sync with this order.
                </p>
              </div>

              <div className="space-y-3">
                {sectionsForm.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[var(--accent)] w-6">
                        0{idx + 1}
                      </span>
                      <div className="space-y-1">
                        <span className="text-xs font-mono uppercase text-[var(--text-muted)]">
                          Section ID: #{sec.id}
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-[var(--text-muted)] font-mono">Navbar Label:</label>
                          <input
                            type="text"
                            value={sec.label}
                            onChange={(e) => {
                              const next = [...sectionsForm];
                              next[idx].label = e.target.value;
                              setSectionsForm(next);
                              setHasUnsavedChanges(true);
                            }}
                            className="bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] rounded px-2.5 py-1 text-xs font-bold font-mono outline-none focus:border-[var(--accent)]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Reorder Up */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          const next = [...sectionsForm];
                          const temp = next[idx - 1];
                          next[idx - 1] = next[idx];
                          next[idx] = temp;
                          setSectionsForm(next);
                          setHasUnsavedChanges(true);
                        }}
                        className="p-2 rounded-lg hover:bg-[var(--surface-hover)] disabled:opacity-20 text-[var(--text-muted)]"
                        title="Move Section Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      {/* Reorder Down */}
                      <button
                        type="button"
                        disabled={idx === sectionsForm.length - 1}
                        onClick={() => {
                          const next = [...sectionsForm];
                          const temp = next[idx + 1];
                          next[idx + 1] = next[idx];
                          next[idx] = temp;
                          setSectionsForm(next);
                          setHasUnsavedChanges(true);
                        }}
                        className="p-2 rounded-lg hover:bg-[var(--surface-hover)] disabled:opacity-20 text-[var(--text-muted)]"
                        title="Move Section Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      {/* Visible Switch */}
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...sectionsForm];
                          next[idx].visible = !next[idx].visible;
                          setSectionsForm(next);
                          setHasUnsavedChanges(true);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                          sec.visible
                            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{sec.visible ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      await saveSectionOrder(sectionsForm);
                      setHasUnsavedChanges(false);
                      setStatusMessage({ type: 'success', text: 'Section order & Navbar synchronized!' });
                    } catch (err: any) {
                      setStatusMessage({ type: 'error', text: err?.message || 'Failed to save sections' });
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Section Configuration</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: TESTIMONIALS (ADD/EDIT/DELETE/HIDE/AVATAR UPLOAD)          */}
          {/* ================================================================= */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Testimonials & Client Feedback
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] font-mono">
                    Client quotes, real avatars, roles, and project scopes
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingTestimonial({
                      id: `test-${Date.now().toString(36)}`,
                      clientName: '',
                      clientRole: 'Creator / Founder',
                      clientChannelOrBrand: '',
                      quote: '',
                      projectScope: 'Long-Form Video Editing',
                      avatarPlaceholder: 'CL',
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Feedback</span>
                </button>
              </div>

              <div className="space-y-3">
                {content.testimonials.map((t, idx) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[var(--surface-elevated)] overflow-hidden shrink-0 border border-[var(--border)] flex items-center justify-center font-bold text-xs">
                        {t.avatarImage ? (
                          <img src={t.avatarImage} alt={t.clientName} className="w-full h-full object-cover" />
                        ) : (
                          t.avatarPlaceholder || t.clientName.substring(0, 2)
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">{t.clientName}</h4>
                        <p className="text-xs text-[var(--text-muted)] font-mono truncate">
                          {t.clientRole} · {t.clientChannelOrBrand}
                        </p>
                        <p className="text-xs text-[var(--text)] italic line-clamp-1 mt-1">"{t.quote}"</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingTestimonial(t)}
                        className="px-3 py-1.5 rounded-lg bg-[var(--surface-hover)] text-xs font-mono font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(t.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-950/40 text-[var(--text-muted)] hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TESTIMONIAL EDIT MODAL */}
          {editingTestimonial && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-lg w-full bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-6 text-[var(--text)] space-y-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <h4 className="text-base font-bold text-[var(--text-primary)]">Edit Testimonial</h4>
                  <button type="button" onClick={() => setEditingTestimonial(null)} className="p-1.5">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Client Name</label>
                    <input
                      type="text"
                      value={editingTestimonial.clientName}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, clientName: e.target.value })}
                      className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Role & Title</label>
                    <input
                      type="text"
                      value={editingTestimonial.clientRole}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, clientRole: e.target.value })}
                      className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Channel / Brand</label>
                    <input
                      type="text"
                      value={editingTestimonial.clientChannelOrBrand}
                      onChange={(e) =>
                        setEditingTestimonial({ ...editingTestimonial, clientChannelOrBrand: e.target.value })
                      }
                      className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Avatar Image URL (or upload)</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={editingTestimonial.avatarImage || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, avatarImage: e.target.value })}
                        className="flex-1 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                      />
                      <label className="px-3 py-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] cursor-pointer flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileUpload(e, 'avatars', (url) =>
                              setEditingTestimonial({ ...editingTestimonial, avatarImage: url })
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Quote</label>
                    <textarea
                      rows={4}
                      value={editingTestimonial.quote}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                      className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setEditingTestimonial(null)}
                    className="px-4 py-2 rounded-xl bg-[var(--surface)] text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsSaving(true);
                      try {
                        await saveTestimonial(editingTestimonial);
                        setEditingTestimonial(null);
                        setStatusMessage({ type: 'success', text: 'Testimonial saved!' });
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: FAQ (QUESTIONS, ANSWERS, CATEGORIES)                       */}
          {/* ================================================================= */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Frequently Asked Questions</h3>
                  <p className="text-xs text-[var(--text-muted)] font-mono">
                    Turnaround, pricing, footage scopes & live JSON-LD schema sync
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingFaq({
                      id: `faq-${Date.now().toString(36)}`,
                      question: '',
                      answer: '',
                      category: 'TIMELINE',
                      visible: true,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add FAQ</span>
                </button>
              </div>

              <div className="space-y-3">
                {content.faqs.map((f) => (
                  <div
                    key={f.id}
                    className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--accent)]">
                        {f.category || 'TIMELINE'}
                      </span>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">{f.question}</h4>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2">{f.answer}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingFaq(f)}
                        className="px-3 py-1.5 rounded-lg bg-[var(--surface-hover)] text-xs font-mono font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(f.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-950/40 text-[var(--text-muted)] hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ EDIT MODAL */}
          {editingFaq && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-lg w-full bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-6 text-[var(--text)] space-y-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <h4 className="text-base font-bold text-[var(--text-primary)]">Edit FAQ</h4>
                  <button type="button" onClick={() => setEditingFaq(null)} className="p-1.5">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Category Tag</label>
                    <input
                      type="text"
                      value={editingFaq.category || 'TIMELINE'}
                      onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                      className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Question</label>
                    <input
                      type="text"
                      value={editingFaq.question}
                      onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                      className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Answer</label>
                    <textarea
                      rows={5}
                      value={editingFaq.answer}
                      onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                      className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setEditingFaq(null)}
                    className="px-4 py-2 rounded-xl bg-[var(--surface)] text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsSaving(true);
                      try {
                        await saveFaq(editingFaq);
                        setEditingFaq(null);
                        setStatusMessage({ type: 'success', text: 'FAQ saved!' });
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: TOOLS & STACK                                              */}
          {/* ================================================================= */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Software Suites & NLE Tools</h3>
                  <p className="text-xs text-[var(--text-muted)] font-mono">
                    Primary editing applications displayed in the About section (clean borderless slots)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingTool({
                      id: `tool-${Date.now().toString(36)}`,
                      name: '',
                      iconName: 'custom',
                      file: '',
                      category: 'NLE Suite',
                      proficiency: 'Workflow proficiency description',
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Tool</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--surface-elevated)] flex items-center justify-center p-1.5 overflow-hidden">
                        <img src={tool.file} alt={tool.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">{tool.name}</h4>
                        <p className="text-xs text-[var(--text-muted)] font-mono">{tool.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingTool(tool)}
                        className="px-3 py-1.5 rounded-lg bg-[var(--surface-hover)] text-xs font-mono font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(tool.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-950/40 text-[var(--text-muted)] hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TOOL EDIT MODAL */}
          {editingTool && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-6 text-[var(--text)] space-y-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <h4 className="text-base font-bold text-[var(--text-primary)]">Edit Tool</h4>
                  <button type="button" onClick={() => setEditingTool(null)} className="p-1.5">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Tool Name</label>
                    <input
                      type="text"
                      value={editingTool.name}
                      onChange={(e) => setEditingTool({ ...editingTool, name: e.target.value })}
                      className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Category</label>
                    <input
                      type="text"
                      value={editingTool.category}
                      onChange={(e) => setEditingTool({ ...editingTool, category: e.target.value })}
                      className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Logo URL or Path (e.g. /tools/...)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingTool.file || ''}
                        onChange={(e) => setEditingTool({ ...editingTool, file: e.target.value })}
                        className="flex-1 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                      />
                      <label className="px-3 py-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] cursor-pointer flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileUpload(e, 'tools', (url) => setEditingTool({ ...editingTool, file: url }))
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[var(--text-muted)] uppercase mb-1">Proficiency / Short Description</label>
                    <input
                      type="text"
                      value={editingTool.shortDescription || editingTool.proficiency}
                      onChange={(e) =>
                        setEditingTool({
                          ...editingTool,
                          shortDescription: e.target.value,
                          proficiency: e.target.value,
                        })
                      }
                      className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setEditingTool(null)}
                    className="px-4 py-2 rounded-xl bg-[var(--surface)] text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsSaving(true);
                      try {
                        await saveTool(editingTool);
                        setEditingTool(null);
                        setStatusMessage({ type: 'success', text: 'Tool saved!' });
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 6: HERO & ABOUT (BIO, PORTRAIT, SHOWREEL)                     */}
          {/* ================================================================= */}
          {activeTab === 'hero-about' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[var(--border)]">
                <h3 className="text-base font-bold text-[var(--text-primary)]">Hero & About Bio Configuration</h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Manage headline strings, first-person philosophy, showreel link, and portrait photo
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-[var(--text-muted)] uppercase mb-1">Editor Name</label>
                  <input
                    type="text"
                    value={brandForm.name}
                    onChange={(e) => {
                      setBrandForm({ ...brandForm, name: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] uppercase mb-1">Professional Role</label>
                  <input
                    type="text"
                    value={brandForm.role}
                    onChange={(e) => {
                      setBrandForm({ ...brandForm, role: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[var(--text-muted)] uppercase mb-1">One-Liner Hook (Hero)</label>
                  <textarea
                    rows={2}
                    value={brandForm.oneLiner}
                    onChange={(e) => {
                      setBrandForm({ ...brandForm, oneLiner: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[var(--text-muted)] uppercase mb-1">Showreel Master URL</label>
                  <input
                    type="url"
                    value={brandForm.showreelUrl || ''}
                    onChange={(e) => {
                      setBrandForm({ ...brandForm, showreelUrl: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                  />
                </div>

                {/* Portrait Photo Upload & Preview */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-[var(--text-muted)] uppercase">About Section Portrait Photo</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={brandForm.portraitUrl || ''}
                      onChange={(e) => {
                        setBrandForm({ ...brandForm, portraitUrl: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="flex-1 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                    />
                    <label className="px-3.5 py-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] cursor-pointer flex items-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Upload Portrait</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUpload(e, 'portraits', (url) => setBrandForm({ ...brandForm, portraitUrl: url }))
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                  {brandForm.portraitUrl && (
                    <div className="w-24 h-32 rounded-xl overflow-hidden bg-black border border-[var(--border)] mt-2">
                      <img src={brandForm.portraitUrl} alt="Portrait" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[var(--text-muted)] uppercase mb-1">Lead About Statement</label>
                  <textarea
                    rows={2}
                    value={brandForm.aboutCopy}
                    onChange={(e) => {
                      setBrandForm({ ...brandForm, aboutCopy: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[var(--text-muted)] uppercase mb-1">Extended Bio & Workflow Details</label>
                  <textarea
                    rows={4}
                    value={brandForm.extendedBio}
                    onChange={(e) => {
                      setBrandForm({ ...brandForm, extendedBio: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      await saveBrand(brandForm);
                      setHasUnsavedChanges(false);
                      setStatusMessage({ type: 'success', text: 'Hero & About details saved!' });
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 7: STATS & METRICS                                            */}
          {/* ================================================================= */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[var(--border)]">
                <h3 className="text-base font-bold text-[var(--text-primary)]">Key Portfolio Metrics</h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Large numerical highlights shown at the bottom of the About section
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {statsForm.map((st, idx) => (
                  <div key={st.id} className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
                    <div className="text-[10px] font-mono text-[var(--accent)] font-bold">METRIC 0{idx + 1}</div>
                    <div className="space-y-2 text-xs font-mono">
                      <div>
                        <label className="block text-[var(--text-muted)] uppercase mb-1">Value (e.g. 300+, 2+)</label>
                        <input
                          type="text"
                          value={st.value}
                          onChange={(e) => {
                            const next = [...statsForm];
                            next[idx].value = e.target.value;
                            setStatsForm(next);
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full bg-[var(--surface-elevated)] text-[var(--text-primary)] font-bold text-base border border-[var(--border)] rounded-lg p-2 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[var(--text-muted)] uppercase mb-1">Primary Label</label>
                        <input
                          type="text"
                          value={st.label}
                          onChange={(e) => {
                            const next = [...statsForm];
                            next[idx].label = e.target.value;
                            setStatsForm(next);
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[var(--text-muted)] uppercase mb-1">Subtext / Scope</label>
                        <input
                          type="text"
                          value={st.subtext || ''}
                          onChange={(e) => {
                            const next = [...statsForm];
                            next[idx].subtext = e.target.value;
                            setStatsForm(next);
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      await saveStats(statsForm);
                      setHasUnsavedChanges(false);
                      setStatusMessage({ type: 'success', text: 'Stats metrics saved!' });
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Stats</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 8: CONTACT & SOCIAL DETAILS                                   */}
          {/* ================================================================= */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[var(--border)]">
                <h3 className="text-base font-bold text-[var(--text-primary)]">Contact & Channels Setup</h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Primary email, WhatsApp link, status badge, and social handles
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-[var(--text-muted)] uppercase mb-1">Inquiry Routing Email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => {
                      setContactForm({ ...contactForm, email: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] uppercase mb-1">WhatsApp Phone Number</label>
                  <input
                    type="text"
                    value={contactForm.whatsapp}
                    onChange={(e) => {
                      setContactForm({ ...contactForm, whatsapp: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] uppercase mb-1">Location / Working Base</label>
                  <input
                    type="text"
                    value={contactForm.location}
                    onChange={(e) => {
                      setContactForm({ ...contactForm, location: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-muted)] uppercase mb-1">Timezone Flexibility</label>
                  <input
                    type="text"
                    value={contactForm.timezone}
                    onChange={(e) => {
                      setContactForm({ ...contactForm, timezone: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[var(--text-muted)] uppercase mb-1">Availability Status</label>
                  <input
                    type="text"
                    value={contactForm.status}
                    onChange={(e) => {
                      setContactForm({ ...contactForm, status: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                  />
                </div>

                {/* Social Channels List */}
                <div className="sm:col-span-2 pt-2 border-t border-[var(--border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)] uppercase font-semibold">Social Links & Portals</span>
                    <button
                      type="button"
                      onClick={() => {
                        const current = contactForm.socials || [];
                        setContactForm({
                          ...contactForm,
                          socials: [...current, { name: 'Social', url: 'https://', handle: '@handle' }],
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="inline-flex items-center gap-1 text-[var(--accent)] font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Social Link</span>
                    </button>
                  </div>

                  {(contactForm.socials || []).map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={s.name}
                        placeholder="Platform"
                        onChange={(e) => {
                          const next = [...(contactForm.socials || [])];
                          next[idx].name = e.target.value;
                          setContactForm({ ...contactForm, socials: next });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-28 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2 outline-none"
                      />
                      <input
                        type="url"
                        value={s.url}
                        placeholder="https://..."
                        onChange={(e) => {
                          const next = [...(contactForm.socials || [])];
                          next[idx].url = e.target.value;
                          setContactForm({ ...contactForm, socials: next });
                          setHasUnsavedChanges(true);
                        }}
                        className="flex-1 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2 outline-none"
                      />
                      <input
                        type="text"
                        value={s.handle}
                        placeholder="@handle"
                        onChange={(e) => {
                          const next = [...(contactForm.socials || [])];
                          next[idx].handle = e.target.value;
                          setContactForm({ ...contactForm, socials: next });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-32 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = (contactForm.socials || []).filter((_, i) => i !== idx);
                          setContactForm({ ...contactForm, socials: next });
                          setHasUnsavedChanges(true);
                        }}
                        className="p-1.5 text-[var(--text-muted)] hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      await saveContact(contactForm);
                      setHasUnsavedChanges(false);
                      setStatusMessage({ type: 'success', text: 'Contact & social details saved!' });
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Contact Details</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 9: LEGAL PAGES (PRIVACY POLICY & TERMS EDITABLE BLOCKS)       */}
          {/* ================================================================= */}
          {activeTab === 'legal' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[var(--border)]">
                <h3 className="text-base font-bold text-[var(--text-primary)]">Legal Documents Editor</h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Edit Privacy Policy and Terms & Conditions as plain text heading + paragraph blocks. "Last updated" date automatically refreshes on save.
                </p>
              </div>

              {/* Document Switcher */}
              <div className="space-y-6">
                {/* Privacy Policy Block */}
                <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">Privacy Policy Document</h4>
                      <p className="text-xs text-[var(--text-muted)] font-mono">
                        Last Updated: {privacyForm.lastUpdated}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const nextSecs = [
                          ...(privacyForm.sections || []),
                          { heading: 'New Section', content: 'Section contents...' },
                        ];
                        setPrivacyForm({ ...privacyForm, sections: nextSecs });
                        setHasUnsavedChanges(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-mono text-[var(--accent)]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Section Block</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(privacyForm.sections || []).map((sec, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={sec.heading}
                            onChange={(e) => {
                              const next = [...privacyForm.sections];
                              next[idx].heading = e.target.value;
                              setPrivacyForm({ ...privacyForm, sections: next });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-2/3 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded px-2.5 py-1 text-xs font-bold font-mono outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = privacyForm.sections.filter((_, i) => i !== idx);
                              setPrivacyForm({ ...privacyForm, sections: next });
                              setHasUnsavedChanges(true);
                            }}
                            className="p-1 text-[var(--text-muted)] hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={sec.content}
                          onChange={(e) => {
                            const next = [...privacyForm.sections];
                            next[idx].content = e.target.value;
                            setPrivacyForm({ ...privacyForm, sections: next });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded p-2 text-xs font-sans outline-none leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={async () => {
                        setIsSaving(true);
                        try {
                          await saveLegalDoc('privacy', privacyForm);
                          setHasUnsavedChanges(false);
                          setStatusMessage({ type: 'success', text: 'Privacy Policy saved and timestamp updated!' });
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Privacy Policy</span>
                    </button>
                  </div>
                </div>

                {/* Terms and Conditions Block */}
                <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">Terms & Conditions Document</h4>
                      <p className="text-xs text-[var(--text-muted)] font-mono">
                        Last Updated: {termsForm.lastUpdated}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const nextSecs = [
                          ...(termsForm.sections || []),
                          { heading: 'New Terms Block', content: 'Terms contents...' },
                        ];
                        setTermsForm({ ...termsForm, sections: nextSecs });
                        setHasUnsavedChanges(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-mono text-[var(--accent)]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Terms Block</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(termsForm.sections || []).map((sec, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={sec.heading}
                            onChange={(e) => {
                              const next = [...termsForm.sections];
                              next[idx].heading = e.target.value;
                              setTermsForm({ ...termsForm, sections: next });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-2/3 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded px-2.5 py-1 text-xs font-bold font-mono outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = termsForm.sections.filter((_, i) => i !== idx);
                              setTermsForm({ ...termsForm, sections: next });
                              setHasUnsavedChanges(true);
                            }}
                            className="p-1 text-[var(--text-muted)] hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={sec.content}
                          onChange={(e) => {
                            const next = [...termsForm.sections];
                            next[idx].content = e.target.value;
                            setTermsForm({ ...termsForm, sections: next });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded p-2 text-xs font-sans outline-none leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={async () => {
                        setIsSaving(true);
                        try {
                          await saveLegalDoc('terms', termsForm);
                          setHasUnsavedChanges(false);
                          setStatusMessage({ type: 'success', text: 'Terms & Conditions saved!' });
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Terms & Conditions</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 10: SEO & META TAGS                                           */}
          {/* ================================================================= */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[var(--border)]">
                <h3 className="text-base font-bold text-[var(--text-primary)]">Search Engine Optimization & Social Cards</h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Custom page title, meta description, OpenGraph share preview, and site favicon
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="sm:col-span-2">
                  <label className="block text-[var(--text-muted)] uppercase mb-1">Global Site Title Tag</label>
                  <input
                    type="text"
                    value={seoForm.siteTitle}
                    onChange={(e) => {
                      setSeoForm({ ...seoForm, siteTitle: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[var(--text-muted)] uppercase mb-1">Meta Description (140-160 chars recommended)</label>
                  <textarea
                    rows={3}
                    value={seoForm.metaDescription}
                    onChange={(e) => {
                      setSeoForm({ ...seoForm, metaDescription: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none leading-relaxed"
                  />
                  <div className="text-[10px] text-[var(--text-muted)] text-right mt-1">
                    {seoForm.metaDescription.length} characters
                  </div>
                </div>

                {/* OpenGraph Image URL */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-[var(--text-muted)] uppercase">Open Graph Social Image (1200x630)</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={seoForm.ogImage}
                      onChange={(e) => {
                        setSeoForm({ ...seoForm, ogImage: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="flex-1 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                    />
                    <label className="px-3.5 py-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] cursor-pointer flex items-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Upload OG</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUpload(e, 'seo', (url) => setSeoForm({ ...seoForm, ogImage: url }))
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Favicon URL */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-[var(--text-muted)] uppercase">Site Favicon URL (SVG, ICO, PNG)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={seoForm.faviconUrl}
                      onChange={(e) => {
                        setSeoForm({ ...seoForm, faviconUrl: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="flex-1 bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 outline-none"
                    />
                    <label className="px-3.5 py-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] cursor-pointer flex items-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Upload Favicon</span>
                      <input
                        type="file"
                        accept="image/*,.ico"
                        onChange={(e) =>
                          handleFileUpload(e, 'seo', (url) => setSeoForm({ ...seoForm, faviconUrl: url }))
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Live Search Snippet Preview */}
              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
                <div className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Google Search Preview</div>
                <div className="text-xs font-mono text-emerald-400 truncate">https://arman-portfolio.com</div>
                <div className="text-sm font-semibold text-sky-400 hover:underline cursor-pointer leading-snug">
                  {seoForm.siteTitle}
                </div>
                <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {seoForm.metaDescription}
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      await saveSeoSettings(seoForm);
                      setHasUnsavedChanges(false);
                      setStatusMessage({ type: 'success', text: 'SEO meta tags updated and applied live!' });
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save SEO Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 11: APPEARANCE & THEME COLOR STUDIO WITH WCAG AA CHECK        */}
          {/* ================================================================= */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[var(--border)]">
                <h3 className="text-base font-bold text-[var(--text-primary)]">Theme Studio & Appearance</h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Default visitor theme, companion pet, audio toggle, and custom 6-theme color tuning with WCAG AA compliance check
                </p>
              </div>

              {/* Default Theme & Pet Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
                  <label className="block text-xs font-mono text-[var(--text-muted)] uppercase">Default Initial Theme</label>
                  <select
                    value={appearanceForm.defaultTheme}
                    onChange={(e) => {
                      setAppearanceForm({ ...appearanceForm, defaultTheme: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 text-xs font-mono outline-none"
                  >
                    {THEMES.map((th) => (
                      <option key={th.id} value={th.id}>
                        {th.name} ({th.subtitle})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
                  <label className="block text-xs font-mono text-[var(--text-muted)] uppercase">Default Companion Pet</label>
                  <select
                    value={appearanceForm.defaultPet}
                    onChange={(e) => {
                      setAppearanceForm({ ...appearanceForm, defaultPet: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2.5 text-xs font-mono outline-none"
                  >
                    {PETS.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sound toggle */}
              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">Sound Effects Enabled by Default</div>
                  <div className="text-xs font-mono text-[var(--text-muted)]">Play subtle click feedback for new visitors</div>
                </div>
                <input
                  type="checkbox"
                  checked={appearanceForm.soundDefault}
                  onChange={(e) => {
                    setAppearanceForm({ ...appearanceForm, soundDefault: e.target.checked });
                    setHasUnsavedChanges(true);
                  }}
                  className="rounded border-[var(--border)] text-[var(--accent)] w-5 h-5"
                />
              </div>

              {/* 6-THEME COLOR CUSTOMIZER WITH WCAG AA WARNING */}
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Theme Color Palette Studio</h4>
                    <p className="text-xs text-[var(--text-muted)] font-mono">
                      Edit CSS variables per theme. Live preview updates dynamically.
                    </p>
                  </div>

                  {/* Pick theme to customize */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[var(--text-muted)]">Customizing:</span>
                    <select
                      value={themeCustomizerId}
                      onChange={(e) => setThemeCustomizerId(e.target.value as ThemeId)}
                      className="bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] rounded px-3 py-1.5 text-xs font-mono font-bold outline-none"
                    >
                      {THEMES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* WCAG Contrast Ratio Feedback Banner */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                    isContrastPass
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isContrastPass ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span>
                      Contrast Ratio: <strong>{contrastRatio.toFixed(2)}:1</strong> —{' '}
                      {isContrastPass ? 'Passes WCAG AA (>= 4.5:1)' : '⚠️ Warning: Fails WCAG AA (Requires >= 4.5:1)'}
                    </span>
                  </div>
                  <span className="text-[10px] opacity-75">Relative Luminance</span>
                </div>

                {/* Color Pickers Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
                  {[
                    { key: '--bg', label: 'Background (--bg)' },
                    { key: '--surface', label: 'Surface (--surface)' },
                    { key: '--text', label: 'Body Text (--text)' },
                    { key: '--text-primary', label: 'Headings (--text-primary)' },
                    { key: '--accent', label: 'Brand Accent (--accent)' },
                    { key: '--border', label: 'Border Color (--border)' },
                  ].map((colorField) => {
                    const currentVal =
                      themeOverridesForm[themeCustomizerId]?.[colorField.key] ||
                      DEFAULT_THEME_PALETTES[themeCustomizerId]?.[colorField.key] ||
                      '#000000';
                    return (
                      <div key={colorField.key} className="space-y-1.5">
                        <label className="block text-[var(--text-muted)] text-[11px] truncate">
                          {colorField.label}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={currentVal.startsWith('#') ? currentVal : '#FF5500'}
                            onChange={(e) => {
                              const nextTheme = {
                                ...(themeOverridesForm[themeCustomizerId] || DEFAULT_THEME_PALETTES[themeCustomizerId]),
                                [colorField.key]: e.target.value,
                              };
                              const nextOverrides = {
                                ...themeOverridesForm,
                                [themeCustomizerId]: nextTheme,
                              };
                              setThemeOverridesForm(nextOverrides);
                              setHasUnsavedChanges(true);
                              document.documentElement.style.setProperty(colorField.key, e.target.value);
                            }}
                            className="w-8 h-8 rounded border border-[var(--border)] cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={currentVal}
                            onChange={(e) => {
                              const nextTheme = {
                                ...(themeOverridesForm[themeCustomizerId] || DEFAULT_THEME_PALETTES[themeCustomizerId]),
                                [colorField.key]: e.target.value,
                              };
                              const nextOverrides = {
                                ...themeOverridesForm,
                                [themeCustomizerId]: nextTheme,
                              };
                              setThemeOverridesForm(nextOverrides);
                              setHasUnsavedChanges(true);
                              document.documentElement.style.setProperty(colorField.key, e.target.value);
                            }}
                            className="w-full bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] rounded px-2 py-1 text-xs outline-none"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reset Theme Defaults Button */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...themeOverridesForm };
                      delete next[themeCustomizerId];
                      setThemeOverridesForm(next);
                      setHasUnsavedChanges(true);
                      const base = DEFAULT_THEME_PALETTES[themeCustomizerId];
                      if (base) {
                        Object.entries(base).forEach(([k, v]) => {
                          document.documentElement.style.setProperty(k, v);
                        });
                      }
                      setStatusMessage({ type: 'success', text: `Reset ${themeCustomizerId} to built-in defaults!` });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-xs font-mono text-[var(--text-muted)] border border-[var(--border)]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Theme to Defaults</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsSaving(true);
                      try {
                        await saveAppearance(appearanceForm);
                        await saveThemeOverrides(themeOverridesForm);
                        setHasUnsavedChanges(false);
                        setStatusMessage({ type: 'success', text: 'Theme appearance & custom colors saved!' });
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Theme Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 12: MEDIA LIBRARY BROWSER                                     */}
          {/* ================================================================= */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Supabase Media Storage (site-media)</h3>
                  <p className="text-xs text-[var(--text-muted)] font-mono">
                    Browse uploaded photos, thumbnails, and logos. Copy public CDN links or delete unused assets.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadMediaFiles}
                    className="p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] border border-[var(--border)]"
                    title="Refresh media files"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingMedia ? 'animate-spin' : ''}`} />
                  </button>

                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Upload Media</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(e, 'library', (url) => {
                          setStatusMessage({ type: 'success', text: `Uploaded to: ${url}` });
                          loadMediaFiles();
                        })
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {mediaWarning && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center justify-between">
                  <span>{mediaWarning}</span>
                  <button type="button" onClick={() => setMediaWarning(null)} className="p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Media Grid */}
              {isLoadingMedia ? (
                <div className="py-16 text-center text-xs font-mono text-[var(--text-muted)] flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
                  <span>Loading storage files...</span>
                </div>
              ) : mediaFiles.length === 0 ? (
                <div className="py-16 text-center rounded-2xl bg-[var(--surface)] border border-dashed border-[var(--border)] p-6">
                  <ImageIcon className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    No files found in site-media bucket
                  </p>
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
                    Upload thumbnails or avatars using the button above.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mediaFiles.map((f) => (
                    <div
                      key={f.name}
                      className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden flex flex-col justify-between group"
                    >
                      <div className="relative aspect-video bg-black/40 overflow-hidden">
                        <img src={f.publicUrl} alt={f.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3 text-xs font-mono space-y-2">
                        <div className="truncate font-semibold text-[var(--text-primary)]" title={f.name}>
                          {f.name}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          {(f.size / 1024).toFixed(1)} KB
                        </div>
                        <div className="flex items-center gap-1 pt-1 border-t border-[var(--border)]">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(f.publicUrl);
                              setStatusMessage({ type: 'success', text: 'CDN URL copied to clipboard!' });
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1 py-1 rounded bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[10px] text-[var(--text-primary)] font-mono"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy URL</span>
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              // Check if file is in use
                              const isUsed =
                                content.projects.short.some((p) => p.thumbnail.includes(f.name)) ||
                                content.projects.long.some((p) => p.thumbnail.includes(f.name)) ||
                                content.testimonials.some((t) => t.avatarImage?.includes(f.name)) ||
                                content.brand.portraitUrl?.includes(f.name);

                              if (isUsed) {
                                if (
                                  !window.confirm(
                                    '⚠️ Warning: This file appears to be in use as a thumbnail, avatar, or portrait on the website. Deleting it may result in a broken image. Delete anyway?'
                                  )
                                ) {
                                  return;
                                }
                              } else {
                                if (!window.confirm(`Delete ${f.name} from storage?`)) return;
                              }

                              if (supabase) {
                                const { error } = await supabase.storage.from('site-media').remove([f.name]);
                                if (error) {
                                  setStatusMessage({ type: 'error', text: error.message });
                                } else {
                                  setStatusMessage({ type: 'success', text: 'File deleted from storage.' });
                                  loadMediaFiles();
                                }
                              }
                            }}
                            className="p-1 rounded hover:bg-rose-950/40 text-[var(--text-muted)] hover:text-rose-400"
                            title="Delete file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 13: BACKUP, EXPORT & SNAPSHOT VERSION HISTORY                 */}
          {/* ================================================================= */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[var(--border)]">
                <h3 className="text-base font-bold text-[var(--text-primary)]">Data Backup & Version Snapshots</h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Export complete portfolio data as a JSON file, restore from file with confirmation, or revert to past snapshots
                </p>
              </div>

              {/* Action Buttons: Export & Import */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Download className="w-4 h-4 text-[var(--accent)]" />
                      Export Complete Site Data
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
                      Download a single JSON file containing all projects, testimonials, faqs, tools, text registry, and settings.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const json = exportBackupJson();
                      const blob = new Blob([json], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `arman-portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      setStatusMessage({ type: 'success', text: 'Backup downloaded successfully!' });
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Backup</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Upload className="w-4 h-4 text-[var(--accent)]" />
                      Import from JSON File
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
                      Upload a previous backup file. You will see a preview of data counts before confirming.
                    </p>
                  </div>
                  <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] cursor-pointer">
                    <FileText className="w-4 h-4 text-[var(--accent)]" />
                    <span>Select JSON File to Preview</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          try {
                            const str = ev.target?.result as string;
                            setImportJsonText(str);
                            const parsed = JSON.parse(str);
                            setImportPreviewStats({
                              shortProjects: parsed.projects?.short?.length || 0,
                              longProjects: parsed.projects?.long?.length || 0,
                              testimonials: parsed.testimonials?.length || 0,
                              faqs: parsed.faqs?.length || 0,
                              tools: parsed.tools?.length || 0,
                              textKeys: Object.keys(parsed.siteText || {}).length,
                            });
                          } catch {
                            alert('Invalid JSON file.');
                          }
                        };
                        reader.readAsText(file);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Import Confirmation Preview Modal */}
              {importPreviewStats && (
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-accent)] space-y-3 animate-fadeIn">
                  <div className="text-xs font-bold text-[var(--text-primary)]">
                    Backup File Ready to Import — Preview:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-[var(--text-muted)]">
                    <div>Short Projects: <strong className="text-[var(--text-primary)]">{importPreviewStats.shortProjects}</strong></div>
                    <div>Long Projects: <strong className="text-[var(--text-primary)]">{importPreviewStats.longProjects}</strong></div>
                    <div>Testimonials: <strong className="text-[var(--text-primary)]">{importPreviewStats.testimonials}</strong></div>
                    <div>FAQs: <strong className="text-[var(--text-primary)]">{importPreviewStats.faqs}</strong></div>
                    <div>Tools: <strong className="text-[var(--text-primary)]">{importPreviewStats.tools}</strong></div>
                    <div>Text Keys: <strong className="text-[var(--text-primary)]">{importPreviewStats.textKeys}</strong></div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                    <button
                      type="button"
                      onClick={() => setImportPreviewStats(null)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--surface-elevated)] text-xs font-mono text-[var(--text-muted)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await importBackupJson(importJsonText);
                          setImportPreviewStats(null);
                          setStatusMessage({ type: 'success', text: 'Backup data imported successfully!' });
                        } catch (err: any) {
                          alert(err?.message || 'Import failed');
                        }
                      }}
                      className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono"
                    >
                      Confirm & Overwrite Site Data
                    </button>
                  </div>
                </div>
              )}

              {/* Snapshot Version History (Last 20 Saves) */}
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Snapshot Version History</h4>
                    <p className="text-xs text-[var(--text-muted)] font-mono">
                      Last 20 saved states with one-click restore
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await createRevision('Manual snapshot');
                      setStatusMessage({ type: 'success', text: 'Snapshot created!' });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)]"
                  >
                    <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Create Snapshot Now</span>
                  </button>
                </div>

                {(content.revisions || []).length === 0 ? (
                  <p className="text-xs font-mono text-[var(--text-muted)] py-4 text-center">
                    No historical snapshots yet. Snapshots are recorded when major imports or settings updates occur.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {content.revisions.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-between gap-3 text-xs font-mono"
                      >
                        <div>
                          <div className="font-bold text-[var(--text-primary)]">{rev.label}</div>
                          <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                            {new Date(rev.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm(`Restore site to snapshot from ${new Date(rev.timestamp).toLocaleString()}?`)) return;
                            try {
                              await restoreRevision(rev.id);
                              setStatusMessage({ type: 'success', text: 'Restored snapshot!' });
                            } catch (err: any) {
                              alert(err?.message || 'Restore failed');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold"
                        >
                          Restore
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 14: ADMINS MANAGER (OWNER ROLE ONLY)                          */}
          {/* ================================================================= */}
          {activeTab === 'admins' && isOwner && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Admin Accounts & Delegated Editors</h3>
                </div>
                <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
                  Owner-only administrative controls. Add or remove editors by email.
                </p>
              </div>

              {/* Add Editor Form */}
              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
                <div className="text-xs font-bold text-[var(--text-primary)]">Add or Authorize an Editor</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <label className="block text-[var(--text-muted)] mb-1">Editor Email</label>
                    <input
                      type="email"
                      placeholder="editor@creator.com"
                      value={newEditorEmail}
                      onChange={(e) => setNewEditorEmail(e.target.value)}
                      className="w-full bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-muted)] mb-1">Supabase User UUID (from Auth dashboard)</label>
                    <input
                      type="text"
                      placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                      value={newEditorUserId}
                      onChange={(e) => setNewEditorUserId(e.target.value)}
                      className="w-full bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg p-2 outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={isAdminActionLoading || !newEditorEmail.trim() || !newEditorUserId.trim()}
                    onClick={async () => {
                      setIsAdminActionLoading(true);
                      try {
                        const res = await addEditor(newEditorEmail.trim(), newEditorUserId.trim());
                        if (res.success) {
                          setNewEditorEmail('');
                          setNewEditorUserId('');
                          setStatusMessage({ type: 'success', text: 'Editor added successfully!' });
                          loadAdminsList();
                        } else {
                          alert(res.error || 'Failed to add editor');
                        }
                      } finally {
                        setIsAdminActionLoading(false);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Authorize Editor</span>
                  </button>
                </div>
              </div>

              {/* Admins List */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-[var(--text-muted)] uppercase">Active Authorized Admins</div>
                {adminsList.map((admin) => (
                  <div
                    key={admin.user_id}
                    className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)]">{admin.email}</span>
                        <span className="px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-[10px] font-mono uppercase text-[var(--accent)]">
                          {admin.role}
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{admin.user_id}</div>
                    </div>

                    {admin.role !== 'owner' && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm(`Revoke admin access for ${admin.email}?`)) return;
                          await removeAdmin(admin.user_id);
                          setStatusMessage({ type: 'success', text: 'Admin revoked.' });
                          loadAdminsList();
                        }}
                        className="p-1.5 rounded hover:bg-rose-950/40 text-[var(--text-muted)] hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Permissions Diagnostic Card */}
              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div>
                  <div className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Database Permissions Diagnostics</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Live check across all tables to confirm RLS policies and write permissions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPermissionsOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] font-bold text-xs shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Test my permissions</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 15: RAW JSON SETTINGS EDITOR                                 */}
          {/* ================================================================= */}
          {activeTab === 'raw' && (
            <div className="space-y-4">
              <div className="pb-4 border-b border-[var(--border)]">
                <h3 className="text-base font-bold text-[var(--text-primary)]">Raw Site Settings JSON</h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Direct JSON interface to inspect or emergency-edit values stored in public.site_settings
                </p>
              </div>

              <textarea
                rows={16}
                value={rawSettingsJson}
                onChange={(e) => setRawSettingsJson(e.target.value)}
                className="w-full bg-[var(--surface)] text-[var(--text-primary)] font-mono text-xs p-4 rounded-xl border border-[var(--border)] outline-none leading-relaxed"
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(rawSettingsJson);
                      setRawSettingsJson(JSON.stringify(parsed, null, 2));
                      setStatusMessage({ type: 'success', text: 'Formatted JSON syntax!' });
                    } catch {
                      alert('Invalid JSON syntax');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-mono text-[var(--text-muted)]"
                >
                  Beautify / Validate JSON
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const parsed = JSON.parse(rawSettingsJson);
                      for (const [k, v] of Object.entries(parsed)) {
                        await saveRawSetting(k, v);
                      }
                      setStatusMessage({ type: 'success', text: 'Saved raw settings to Supabase!' });
                    } catch (err: any) {
                      alert(err?.message || 'Failed to save raw settings');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--accent)] text-[var(--on-accent)] text-xs font-bold font-mono"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Raw Settings</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Delete Confirmation Modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-sm w-full bg-[var(--surface)] border border-rose-500/40 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[var(--text-primary)]">Confirm Permanent Deletion</h4>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Are you sure you want to permanently delete this item? This action will sync with Supabase and cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 rounded-lg hover:bg-[var(--surface-hover)] text-xs font-mono text-[var(--text-muted)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const id = confirmDeleteId;
                    setConfirmDeleteId(null);
                    setIsSaving(true);
                    try {
                      if (activeTab === 'projects') await deleteProject(id);
                      else if (activeTab === 'testimonials') await deleteTestimonial(id);
                      else if (activeTab === 'faq') await deleteFaq(id);
                      else if (activeTab === 'tools') await deleteTool(id);
                      setStatusMessage({ type: 'success', text: 'Item deleted permanently!' });
                    } catch (err: any) {
                      setStatusMessage({ type: 'error', text: err?.message || 'Delete failed' });
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Database Permissions Diagnostics Modal */}
        <PermissionsModal
          isOpen={isPermissionsOpen}
          onClose={() => setIsPermissionsOpen(false)}
        />
      </div>
    </div>
  );
};
