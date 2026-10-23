import React from 'react';
import { ArrowUp, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../lib/content';
import { useAuth } from '../lib/auth';

export const Footer: React.FC = () => {
  const { content, t } = useContent();
  const { isAdmin } = useAuth();
  const brand = content.brand;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer 
      id="footer-trigger"
      aria-label="Site Footer"
      className="relative border-t border-[var(--border)] bg-[var(--surface)] py-14"
    >
      {/* Video timeline tick mark hairline bar */}
      <div 
        className="absolute top-0 inset-x-0 h-2 timeline-ticks-dense opacity-40 pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Footer Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-10 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
              {brand.name || 'Arman'}
            </Link>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="font-mono text-xs text-[var(--text-muted)]">
              {brand.role || 'Freelance Video Editor'}
            </span>
          </div>

          {/* Quick Anchor Links */}
          <div className="flex items-center gap-6 text-xs font-mono text-[var(--text-muted)]">
            <a href="/#about" className="hover:text-[var(--text-primary)] transition-colors">About</a>
            <span className="opacity-40">·</span>
            <a href="/#projects" className="hover:text-[var(--text-primary)] transition-colors">Projects</a>
            <span className="opacity-40">·</span>
            <a href="/#faq" className="hover:text-[var(--text-primary)] transition-colors">FAQ</a>
            <span className="opacity-40">·</span>
            <a href="/#testimonials" className="hover:text-[var(--text-primary)] transition-colors">Testimonials</a>
            <span className="opacity-40">·</span>
            <a href="/#contact" className="hover:text-[var(--text-primary)] transition-colors">Contact</a>
          </div>

          {/* Scroll to Top */}
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Back to top"
          >
            <span>TOP</span>
            <ArrowUp className="w-3.5 h-3.5 text-[var(--accent)]" />
          </button>
        </div>

        {/* Bottom Sequence Markers, Legal Links, Admin Link & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[var(--text-muted)]">
              {t('footer.status', 'Available for client projects & retainers')}
            </span>
          </div>

          {/* Legal Pages & Admin Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center md:text-right">
            <span>Copyright © {new Date().getFullYear()} {brand.name || 'Arman'}. {t('footer.copyright_suffix', 'All rights reserved.')}</span>
            <span className="opacity-40">·</span>
            <Link to="/privacy" className="hover:text-[var(--accent)] transition-colors underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            <span className="opacity-40">·</span>
            <Link to="/terms" className="hover:text-[var(--accent)] transition-colors underline-offset-4 hover:underline">
              Terms & Conditions
            </Link>
            <span className="opacity-40">·</span>
            <Link 
              to="/admin" 
              className="inline-flex items-center gap-1 hover:text-[var(--accent)] transition-colors text-[var(--text-muted)] underline-offset-4 hover:underline"
              title="Studio Admin Dashboard"
            >
              <Sliders className="w-3 h-3 text-[var(--accent)]" />
              <span>{t('footer.admin_link', 'Admin')}</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
