import React, { useEffect, useState } from 'react';

export const TimelineIndicator: React.FC = () => {
  const [scrollPercent, setScrollPercent] = useState<number>(0);
  const [timecode, setTimecode] = useState<string>("00:00:00:00");

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const percent = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
          setScrollPercent(percent);

          // Convert percentage to timeline timecode: 00:MM:SS:FF (at 24fps over 5 minutes sequence)
          const totalFrames = Math.floor((percent / 100) * (5 * 60 * 24));
          const frames = totalFrames % 24;
          const totalSeconds = Math.floor(totalFrames / 24);
          const seconds = totalSeconds % 60;
          const minutes = Math.floor(totalSeconds / 60) % 60;
          const hours = Math.floor(totalSeconds / 3600);

          const pad = (n: number) => n.toString().padStart(2, '0');
          setTimecode(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top Playhead Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-[var(--border-subtle)] pointer-events-none"
        aria-hidden="true"
      >
        <div 
          className="h-full bg-[var(--accent)] relative transition-all duration-75 ease-out"
          style={{ width: `${scrollPercent}%` }}
        >
          {/* Playhead needle diamond */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rotate-45 bg-[var(--accent)] border border-[var(--text-primary)]" />
        </div>
      </div>

      {/* Floating Bottom Timecode HUD (Desktop only) */}
      <aside 
        aria-label="Timeline timecode"
        className="fixed bottom-5 right-5 z-40 hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-[var(--surface-elevated)]/90 border border-[var(--border)] backdrop-blur-md font-mono text-xs text-[var(--text-muted)] select-none"
      >
        <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
        <span className="opacity-60 uppercase tracking-wider text-xs">TC</span>
        <span className="text-[var(--text-primary)] tabular-nums font-semibold tracking-wider">{timecode}</span>
        <span className="opacity-50 text-xs">24 FPS</span>
      </aside>
    </>
  );
};
