import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Volume2, VolumeX } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { BRAND } from '../data/portfolioData';
import { useSound } from '../lib/sound';
import { useContent, DEFAULT_SECTION_ORDER } from '../lib/content';

interface NavbarProps {
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { isMuted, toggleMute } = useSound();
  const { content, t } = useContent();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute dynamic navigation links synchronized with sectionOrder
  const sections = content.sectionOrder && content.sectionOrder.length > 0
    ? content.sectionOrder
    : DEFAULT_SECTION_ORDER;

  const navLinks = sections
    .filter((sec) => sec.id !== 'hero' && sec.visible !== false)
    .map((sec) => ({
      name: sec.label || t(`nav.${sec.id}`, sec.id.charAt(0).toUpperCase() + sec.id.slice(1)),
      href: `/#${sec.id}`,
      sectionId: sec.id,
    }));

  const brandName = content.brand.name || BRAND.name;
  const statusBadge = content.brand.statusBadge || BRAND.statusBadge;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        scrolled
          ? 'bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--border)] py-3.5 shadow-2xl shadow-black/20'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* ZONE 1: Single text element wordmark */}
          <Link
            to="/"
            className="group flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
          >
            <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
              {brandName}
            </span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-80 group-hover:scale-125 transition-transform" />
          </Link>

          {/* ZONE 2: Clean navigation links auto-synced with section manager */}
          <nav 
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-muted)]"
          >
            {navLinks.map((link) => {
              const isActive = isHomePage && activeSection === link.sectionId;
              return (
                <a
                  key={link.sectionId}
                  href={link.href}
                  className={`relative py-1 transition-colors hover:text-[var(--text-primary)] ${
                    isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span 
                      aria-hidden="true"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[var(--accent)] rounded-full" 
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* ZONE 3: Primary Action + "Open to work" badge */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Status badge with pulsing green dot */}
            <div 
              aria-label={`Current status: ${statusBadge}`}
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-medium tracking-tight select-none"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="whitespace-nowrap">{statusBadge}</span>
            </div>

            {/* Sound mute toggle button */}
            <button
              type="button"
              onClick={() => toggleMute()}
              aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
              className="p-2 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title={isMuted ? 'Unmute UI sounds' : 'Mute UI sounds'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-[var(--accent)]" />
              )}
            </button>

            {/* Primary Action Button */}
            <a
              href="/#contact"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] text-xs font-mono font-semibold tracking-wide uppercase transition-all duration-150 shadow-md shadow-[var(--accent)]/20 active:translate-y-px"
            >
              <span>{t('nav.cta', 'Book an Edit')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-xl animate-fadeIn">
          <div className="max-w-7xl mx-auto px-4 pt-3 pb-6 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.sectionId}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-base font-medium text-[var(--text)] hover:bg-[var(--surface-hover)] hover:text-[var(--accent)] transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-3 border-t border-[var(--border)]">
              <a
                href="/#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-[var(--accent)] text-[var(--on-accent)] font-mono text-sm font-semibold tracking-wide uppercase shadow-lg shadow-[var(--accent)]/25"
              >
                <span>{t('nav.cta', 'Book an Edit')}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
