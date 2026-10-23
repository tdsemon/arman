import React, { useEffect, useState } from 'react';
import { ThemeId } from '../types/theme';

interface ThemeTransitionOverlayProps {
  transitionState: {
    themeId: ThemeId;
    x: number;
    y: number;
  } | null;
  onComplete: () => void;
}

export const ThemeTransitionOverlay: React.FC<ThemeTransitionOverlayProps> = ({
  transitionState,
  onComplete,
}) => {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!transitionState) {
      setAnimating(false);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    setAnimating(true);
    const duration = transitionState.themeId === 'neon-tokyo' ? 420 : 680;

    const timer = setTimeout(() => {
      setAnimating(false);
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [transitionState, onComplete]);

  if (!transitionState || !animating) return null;

  const { themeId, x, y } = transitionState;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[99998] overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. MIDNIGHT CINEMA: Circular iris-in reveal like camera aperture */}
      {themeId === 'midnight-cinema' && (
        <div
          className="absolute inset-0 will-change-[clip-path]"
          style={{
            animation: 'apertureIris 650ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
            background: 'radial-gradient(circle, #08080A 80%, #FF5500 100%)',
          }}
        >
          {/* Glowing Aperture ring */}
          <div
            className="absolute rounded-full border-2 border-[#FF5500] shadow-[0_0_40px_#FF5500]"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: 'translate(-50%, -50%)',
              animation: 'apertureRing 650ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          />
        </div>
      )}

      {/* 2. SAKURA: Soft pink radial bloom expanding outward */}
      {themeId === 'sakura' && (
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            background: `radial-gradient(circle at ${x}px ${y}px, rgba(224,83,122,0.95) 0%, rgba(253,246,246,0.9) 60%, transparent 100%)`,
            animation: 'sakuraBloom 680ms ease-out forwards',
          }}
        >
          {/* Subtle floral petal accents */}
          <div
            className="absolute w-48 h-48 -ml-24 -mt-24 rounded-full bg-pink-300/40 blur-xl"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              animation: 'sakuraPetals 680ms ease-out forwards',
            }}
          />
        </div>
      )}

      {/* 3. NEON TOKYO: 400ms glitch/RGB-split flicker */}
      {themeId === 'neon-tokyo' && (
        <div
          className="absolute inset-0 bg-[#0A0612]/80 will-change-transform"
          style={{
            animation: 'cyberGlitch 420ms steps(8, end) forwards',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#FF007A]/20 via-transparent to-[#00F0FF]/25 mix-blend-screen" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,240,255,0.15) 0px, transparent 2px, transparent 4px)',
            }}
          />
        </div>
      )}

      {/* 4. TERMINAL: Top-to-bottom scanline wipe with blinking block cursor */}
      {themeId === 'terminal' && (
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            animation: 'terminalScanline 680ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
          }}
        >
          <div className="absolute inset-0 bg-[#050805]/95 border-b-2 border-[#00FF66] shadow-[0_4px_30px_#00FF66]">
            {/* Blinking green prompt cursor on the wipe border */}
            <div className="absolute bottom-2 left-6 flex items-center gap-2 font-mono text-xs text-[#00FF66]">
              <span>INITIALIZING MATRIX_THEME</span>
              <span className="inline-block w-2.5 h-4 bg-[#00FF66] animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* 5. SUNSET REEL: Film-burn sweep, warm orange flare crossing left to right */}
      {themeId === 'sunset-reel' && (
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            animation: 'filmBurnSweep 680ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF4500]/60 to-[#FFA000]/70 blur-sm mix-blend-screen" />
          <div className="absolute inset-0 border-l-8 border-[#FFD54F] shadow-[0_0_60px_#FF4500]" />
        </div>
      )}

      {/* 6. PAPER CUT: Sharp diagonal paper tear / slide-away reveal */}
      {themeId === 'paper-cut' && (
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            animation: 'paperTearSlide 650ms cubic-bezier(0.25, 1, 0.5, 1) forwards',
            background: '#F4F1EA',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-black/15 to-transparent" />
          <div className="absolute bottom-6 right-6 font-mono text-xs text-[#141414] tracking-widest uppercase">
            SWISS_GRID_1964
          </div>
        </div>
      )}
    </div>
  );
};
