/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Projects } from './components/Projects';
import { FAQ } from './components/FAQ';
import { VideoModal } from './components/VideoModal';
import { Testimonials } from './components/Testimonials';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { TimelineIndicator } from './components/TimelineIndicator';
import { OnekoPet } from './components/OnekoPet';
import { ContextMenu } from './components/ContextMenu';
import { ThemeTransitionOverlay } from './components/ThemeTransitionOverlay';
import { ScrollToTop } from './components/ScrollToTop';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsAndConditions } from './pages/TermsAndConditions';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminPage } from './pages/AdminPage';
import { AdminDrawer } from './components/AdminDrawer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { LiveEditOverlay } from './components/LiveEditOverlay';
import { ProjectItem, BRAND } from './data/portfolioData';
import { PetConfig, PETS, ThemeId } from './types/theme';
import { soundManager } from './lib/sound';
import { AuthProvider, useAuth } from './lib/auth';
import { ContentProvider, useContent, DEFAULT_SECTION_ORDER } from './lib/content';

function PortfolioHome({
  onSelectProject,
  onOpenShowreel,
}: {
  onSelectProject: (proj: ProjectItem) => void;
  onOpenShowreel: () => void;
}) {
  const { content } = useContent();

  const sectionMap: Record<string, React.ReactNode> = {
    hero: <Hero key="hero" onOpenShowreel={onOpenShowreel} />,
    about: <About key="about" />,
    projects: <Projects key="projects" onSelectProject={onSelectProject} />,
    faq: <FAQ key="faq" />,
    testimonials: <Testimonials key="testimonials" />,
    contact: <Contact key="contact" />,
  };

  const sectionsToRender = (content.sectionOrder && content.sectionOrder.length > 0
    ? content.sectionOrder
    : DEFAULT_SECTION_ORDER
  ).filter((s) => s.visible !== false);

  return (
    <main id="main-content" className="relative z-10">
      {sectionsToRender.map((sec) => sectionMap[sec.id] || null)}
    </main>
  );
}

function MainAppShell() {
  const { isAdmin } = useAuth();
  const { content } = useContent();
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const location = useLocation();

  // Theme state: default Midnight Cinema, restored from localStorage
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('arman_portfolio_theme');
      if (
        saved &&
        ['midnight-cinema', 'sakura', 'neon-tokyo', 'terminal', 'sunset-reel', 'paper-cut'].includes(saved)
      ) {
        return saved as ThemeId;
      }
    } catch {
      // Ignore localStorage error
    }
    return 'midnight-cinema';
  });

  // Pet state: default Tomoyo, restored from localStorage
  const [currentPet, setCurrentPet] = useState<PetConfig>(() => {
    try {
      const savedPetId = localStorage.getItem('arman_portfolio_pet');
      if (savedPetId) {
        const found = PETS.find((p) => p.id === savedPetId);
        if (found) return found;
      }
    } catch {
      // Ignore localStorage error
    }
    return PETS[0]; // tomoyo
  });

  // State for active theme transformation animation
  const [transitionState, setTransitionState] = useState<{
    themeId: ThemeId;
    x: number;
    y: number;
  } | null>(null);

  // Initialize sound manager and delegated click listeners
  useEffect(() => {
    soundManager.init();
  }, []);

  // Apply data-theme attribute on root document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Handler to switch pet without page reload
  const handleSelectPet = useCallback((pet: PetConfig) => {
    setCurrentPet(pet);
    try {
      localStorage.setItem('arman_portfolio_pet', pet.id);
    } catch {
      // Ignore storage error
    }
  }, []);

  // Handler to open admin drawer or login modal
  const handleOpenAdmin = useCallback(() => {
    if (isAdmin) {
      setIsAdminDrawerOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  }, [isAdmin]);

  // Handler to switch theme with unique per-theme transition and pet reaction
  const handleSelectTheme = useCallback((themeId: ThemeId, clickCoords: { x: number; y: number }) => {
    if (themeId === currentTheme) return;

    // Trigger theme sound effect timed with visual transition
    soundManager.playTheme(themeId);

    // Trigger pet reaction: wake up / celebratory lap!
    window.dispatchEvent(new CustomEvent('oneko-wake'));

    // Trigger visual transformation overlay starting at click point
    setTransitionState({
      themeId,
      x: clickCoords.x,
      y: clickCoords.y,
    });

    const applyThemeChange = () => {
      setCurrentTheme(themeId);
      document.documentElement.setAttribute('data-theme', themeId);
      try {
        localStorage.setItem('arman_portfolio_theme', themeId);
      } catch {
        // Ignore storage error
      }
    };

    // Use native View Transition API if supported by browser
    if (typeof (document as any).startViewTransition === 'function') {
      try {
        (document as any).startViewTransition(() => {
          applyThemeChange();
        });
      } catch {
        applyThemeChange();
      }
    } else {
      applyThemeChange();
    }
  }, [currentTheme]);

  const handleTransitionComplete = useCallback(() => {
    setTransitionState(null);
  }, []);

  // Track active section for navigation highlighting on home page
  useEffect(() => {
    if (location.pathname !== '/') return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sections = ['hero', 'about', 'projects', 'faq', 'testimonials', 'contact'];
          const scrollPosition = window.scrollY + 200;

          for (const sectionId of sections) {
            const el = document.getElementById(sectionId);
            if (el) {
              const top = el.offsetTop;
              const height = el.offsetHeight;
              if (scrollPosition >= top && scrollPosition < top + height) {
                setActiveSection(sectionId);
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Handler to open showreel in modal from hero
  const handleOpenShowreel = () => {
    const featuredReel: ProjectItem = {
      id: 'hero-showreel',
      title: 'Arman — Official Video Editing Showreel',
      category: 'Master Reel / Highlights',
      type: 'long',
      aspectRatio: '16:9',
      duration: '02:15',
      client: content.brand.name || 'Arman',
      description: 'A showcase of high-retention editing, cinematic color grading in DaVinci Resolve, dynamic sound design, and kinetic typography for YouTube & social media.',
      toolsUsed: ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'CapCut'],
      thumbnail: 'https://img.youtube.com/vi/8YkP5xLwlis/hqdefault.jpg',
      fallbackGradient: 'from-zinc-900 via-neutral-900 to-orange-950/40',
      videoUrl: content.brand.showreelUrl || BRAND.showreelUrl,
      highlightStat: '4K Master Grade',
    };
    setSelectedProject(featuredReel);
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)]/30 selection:text-[var(--text-primary)] transition-colors duration-200">
      {/* Scroll restoration helper */}
      <ScrollToTop />

      {/* Background Film Grain Overlay */}
      <div className="film-grain fixed inset-0 pointer-events-none z-30" aria-hidden="true" />

      {/* Oneko Cursor Companion Pet (Follows mouse, Tomoyo default) */}
      <OnekoPet currentPet={currentPet} />

      {/* Right-Click / Long-Press Context Menu (Pet & Theme switchers + Admin) */}
      <ContextMenu
        currentPet={currentPet}
        currentTheme={currentTheme}
        onSelectPet={handleSelectPet}
        onSelectTheme={handleSelectTheme}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Unique Transition Per Theme Animation Overlay */}
      <ThemeTransitionOverlay
        transitionState={transitionState}
        onComplete={handleTransitionComplete}
      />

      {/* Top Playhead Progress Bar and HUD Timecode */}
      <TimelineIndicator />

      {/* Sticky Top Navigation */}
      <Navbar activeSection={activeSection} />

      {/* Dynamic Route Content */}
      <Routes>
        <Route
          path="/"
          element={
            <PortfolioHome
              onSelectProject={(proj) => setSelectedProject(proj)}
              onOpenShowreel={handleOpenShowreel}
            />
          }
        />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Global Site Footer with legal links & Admin trigger */}
      <Footer />

      {/* FULLSCREEN LIGHTBOX VIDEO PLAYER */}
      <VideoModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* Admin Login Dialog for visitors requesting Admin from context menu */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsAdminDrawerOpen(true);
        }}
      />

      {/* Live In-Situ Edit Mode Floating Action Pill (Authenticated admins only) */}
      {isAdmin && (
        <LiveEditOverlay onOpenAdminDrawer={() => setIsAdminDrawerOpen(true)} />
      )}

      {/* Admin CMS Editor Drawer - Only rendered if authenticated as admin */}
      {isAdmin && (
        <AdminDrawer
          isOpen={isAdminDrawerOpen}
          onClose={() => setIsAdminDrawerOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ContentProvider>
          <MainAppShell />
        </ContentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
