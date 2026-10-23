import React, { useEffect } from 'react';
import { Film, Home, ArrowLeft, Scissors, Play, Mail, AlertTriangle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  // Trigger oneko companion reaction if available on load
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('oneko-wake'));
  }, []);

  return (
    <div className="pt-32 pb-24 min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center relative">
        {/* Film slate badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-mono text-[var(--text-muted)] mb-8">
          <Scissors className="w-3.5 h-3.5 text-[var(--accent)]" strokeWidth={1.5} />
          <span>Cut! Scene not found on timeline</span>
        </div>

        {/* Timecode 404 Display */}
        <div className="mb-6">
          <div className="font-mono text-7xl sm:text-9xl font-black tracking-tight text-[var(--text-primary)] select-none">
            00:04:04
          </div>
          <div className="font-mono text-xs sm:text-sm text-[var(--text-muted)] tracking-widest uppercase mt-2">
            Scene offline · Missing clip
          </div>
        </div>

        {/* Message */}
        <p className="text-lg sm:text-xl text-[var(--text)] mb-3 font-medium">
          Cut! This scene ended up on the cutting room floor.
        </p>
        <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-lg mx-auto mb-10 leading-relaxed">
          The take or URL you were looking for doesn't exist on this timeline. Let's get you back to the master edit or review available footage.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-semibold text-sm tracking-wide uppercase transition-colors active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" strokeWidth={1.5} />
            <span>Back to Portfolio</span>
          </a>

          <a
            href="/#projects"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--border-accent)] text-[var(--text-primary)] font-semibold text-sm transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 text-[var(--accent)]" />
            <span>View Projects</span>
          </a>

          <a
            href="/#contact"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--border-accent)] text-[var(--text-primary)] font-semibold text-sm transition-colors cursor-pointer"
          >
            <Mail className="w-4 h-4 text-[var(--accent)]" />
            <span>Contact Arman</span>
          </a>
        </div>

        {/* Playful Editor Clapper Info */}
        <div className="mt-16 pt-8 border-t border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)] flex items-center justify-center gap-4">
          <span>ROLL: A01</span>
          <span>·</span>
          <span>SCENE: 404</span>
          <span>·</span>
          <span>TAKE: 01</span>
          <span>·</span>
          <span className="text-[var(--accent)]">FPS: 24.00</span>
        </div>
      </div>
    </div>
  );
};
