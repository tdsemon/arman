# Arman Studio — Full-Control Live Frontend CMS Upgrade

An enterprise-grade administrative upgrade transforming the existing portfolio into a fully dynamic, client-authoritative editing system while preserving 100% of the existing dark-glass visual aesthetic, themes, cursor pet, sounds, and performance.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were clarified and confirmed with the user in Phase 1:
> - **Edit Mode Trigger**: A discreet, floating pill toggle anchored at the bottom-right of the viewport (`z-40`), visible strictly to authenticated sessions.
> - **Video Auto-Fill Strategy**: Automatic title and thumbnail retrieval via YouTube/Vimeo oEmbed APIs with immediate inline manual override.
> - **Section & Navigation Ordering**: Reordering sections on the homepage automatically keeps the primary navbar link order synchronized.

---

### 1. Overview & Core Concept

This upgrade delivers zero-redeploy administrative sovereignty to the portfolio owner:
- **Universal String Registry (`site_text`)**: Every visible label, heading, button text, placeholder, and 404 message is loaded from Supabase with resilient built-in fallbacks.
- **In-Situ Live Edit Mode**: Authenticated admins toggle visual editing directly on the live site. Editable text surfaces subtle dashed boundary indicators, with inline modal popovers and image replace overlays.
- **Enhanced Showcase Engine**: Fast YouTube/Vimeo URL ingestion, extensible metadata fields (client, duration, metrics), project duplication, and bulk operations with clean zero-state handlers.
- **Theme Palette & Asset Studio**: Live 6-theme color adjustments with WCAG AA contrast checking, a visual media browser for Supabase Storage, and one-click JSON backup/restore with snapshot versioning.
- **Role-Based Access Control**: Hierarchical permissions distinguishing the primary `owner` from delegated `editor` roles with dedicated invitation management.

---

### 2. User Experience & Visual Design

#### A. In-Situ Live Edit Mode
```
┌────────────────────────────────────────────────────────┐
│  Portfolio Live Viewport                               │
│                                                        │
│  ┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐ │
│  ┆ Hey, I'm Arman. I edit videos for creators...      ┆ │
│  └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘ │
│         ▲                                              │
│   (Click to Edit)                                      │
│                                                        │
│                                      ┌───────────────┐ │
│                                      │ ✎ Edit Mode   │ │
│                                      └───────────────┘ │
└────────────────────────────────────────────────────────┘
```
- **Visual Affordances**: When Edit Mode is active, editable elements feature a subtle 1px dashed hairline outline (`outline-dashed outline-1 outline-[var(--accent)]/40 hover:outline-[var(--accent)]`).
- **Inline Popover**: Clicking an editable node opens an unobtrusive floating dialog with plain-text input, character count, character limits, `Save`, and `Cancel` actions.
- **Media Replacement**: Hovering over photos or video monitors displays a sleek camera icon button (`Replace Media`) linking to the storage upload workflow.
- **Visitor Isolation**: The floating toggle and edit-mode code are lazily loaded only when an active authenticated admin session is verified.

#### B. Administrative Panel Expansion
- **Section Manager**: Drag-and-drop or arrow reordering of `hero`, `about`, `projects`, `faq`, `testimonials`, and `contact` blocks, with instant navbar synchronization and section visibility switches.
- **Theme Color Customizer**: Per-theme palette sliders/pickers (`--bg`, `--surface`, `--text`, `--accent`, `--border`) with automated real-time WCAG 2.1 AA luminance contrast calculations and warnings.
- **Media Library**: Visual grid displaying all objects in `site-media` with file sizes, dimensions, upload dates, direct URL copy, and deletion protection warnings for in-use assets.
- **Backup & Snapshot History**: Download comprehensive JSON state dumps, preview and restore past revisions (last 20 saves per table), and import verified backups.
- **SEO & Social Share Cards**: Live fields for `<title>`, `<meta name="description">`, OpenGraph images, and favicon uploads.

---

### 3. Key Product Decisions & Trade-Offs

- **Universal String Fallbacks**:
  - *Decision*: Maintain a complete, hardcoded dictionary of default strings in the application code.
  - *Rationale*: Guarantees instant first-paint performance with zero layout shift (CLS = 0) and uninterrupted uptime even if the Supabase connection is offline or keys are not yet configured.
- **oEmbed Auto-Fill with Manual Overrides**:
  - *Decision*: Query YouTube & Vimeo public oEmbed endpoints on URL input to extract video titles and high-resolution thumbnail images, while allowing the editor to edit or replace both.
  - *Rationale*: Eliminates repetitive data entry while preserving full artistic control.
- **Client-Authoritative Color Tokens**:
  - *Decision*: Store custom theme overrides in `site_settings.theme_overrides` and dynamically inject them via CSS custom property variables on `document.documentElement`.
  - *Rationale*: Supports arbitrary user color tuning without modifying stylesheet source code or requiring runtime CSS processors.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION RUNTIME                           │
│                                                                        │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────────┐  │
│  │  Site Visitors │     │ Authenticated  │     │ Authenticated      │  │
│  │  (Read-Only)   │     │ Editor         │     │ Owner              │  │
│  └───────┬────────┘     └───────┬────────┘     └─────────┬──────────┘  │
│          │                      │                        │             │
│          │ Cached Reads         │ Edits & Media          │ Full Admin  │
│          ▼                      ▼                        ▼             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    CENTRAL CONTENT LAYER                         │  │
│  │            (LocalStorage Cache + React Context)                 │  │
│  │                                                                  │  │
│  │  • site_text registry      • project custom fields               │  │
│  │  • section ordering        • theme color overrides               │  │
│  │  • SEO meta tags           • revision history (20 snapshots)     │  │
│  └──────────────────────────────┬───────────────────────────────────┘  │
│                                 │ RLS Authenticated                    │
│                                 ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     SUPABASE BACKEND                             │  │
│  │                                                                  │  │
│  │  • public.admins (role: owner | editor)                          │  │
│  │  • public.site_text (key PK, value text)                         │  │
│  │  • public.projects (custom_fields jsonb, visible, sort_order)    │  │
│  │  • public.site_settings (sections, themes, seo, legal, raw)      │  │
│  │  • storage.objects (bucket: site-media, WebP optimized)          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

#### A. Database Schema Migration Plan
- **`public.admins`**: Add `role text not null default 'editor' check (role in ('owner', 'editor'))`. The initial bootstrap user receives `owner`.
- **`public.site_text`**: `key text primary key, value text not null, updated_at timestamptz default now()`. Public read, admin write via `is_admin()`.
- **`public.projects`**: Add `custom_fields jsonb not null default '[]'::jsonb`.
- **`public.site_settings`**: Keys for `section_order`, `theme_overrides`, `seo_meta`, `legal_privacy`, `legal_terms`, and `revisions`.
- **`public.content_revisions`**: Store last 20 content snapshots for rollbacks.

#### B. Component & State Implementation Mapping
1. `src/lib/content.ts`: Add `siteText` state, `updateSiteText`, `updateSectionOrder`, `updateThemeColors`, `exportBackupJson`, `importBackupJson`, and `restoreRevision`.
2. `src/lib/auth.ts`: Add `role: 'owner' | 'editor'` detection and owner-only admin invitation/removal RPCs.
3. `src/components/LiveEditOverlay.tsx`: Floating bottom-right action pill + inline editable element wrapper component (`<EditableText />`).
4. `src/components/AdminDrawer.tsx`: Expanded with Media Library, Theme Studio (with contrast math), SEO, Legal Editor, Backup/Restore, Admins Manager, and Raw JSON Settings tabs.
5. `src/components/Navbar.tsx` & Section Blocks: Synchronized dynamically with `section_order`.
