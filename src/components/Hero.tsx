import React, { useState, useEffect } from 'react';
import { Play, Pause, ArrowDown, Film, Sliders, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { useContent } from '../lib/content';
import { EditableText } from './EditableText';

interface HeroProps {
  onOpenShowreel: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenShowreel }) => {
  const { content } = useContent();
  const brand = content.brand;
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [heroTimecode, setHeroTimecode] = useState("00:01:14:08");

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const frames = Math.floor((now / 41) % 24);
      const seconds = Math.floor((now / 1000) % 60);
      const minutes = Math.floor((now / 60000) % 60);
      const pad = (n: number) => n.toString().padStart(2, '0');
      setHeroTimecode(`00:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`);
    }, 41); // ~24 fps update

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section 
      id="hero"
      aria-label="Introduction and Showreel"
      className="relative min-h-[90vh] pt-28 pb-16 flex flex-col justify-center overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Single subtle sequence detail */}
        <div className="flex items-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-xs text-[var(--text-muted)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[var(--text-primary)] font-medium">SEQUENCE 01</span>
            <span className="opacity-40">·</span>
            <span className="tabular-nums">4K UHD · 24 FPS</span>
          </div>
        </div>

        {/* 2-Column Split: Hero Typography & NLE Showreel Monitor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-6 flex flex-col">
            <p className="mb-3">
              <EditableText
                textKey="hero.role"
                defaultText={brand.role}
                className="text-xs font-mono tracking-wider text-[var(--accent)] uppercase font-semibold"
              />
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] mb-6 leading-[1.1] text-balance">
              <EditableText textKey="hero.headline_prefix" defaultText="Hey, I'm" />{' '}
              <span>{brand.name}</span>
              <EditableText textKey="hero.headline_suffix" defaultText=". I edit videos for creators and brands." />
            </h1>

            <EditableText
              textKey="hero.oneliner"
              defaultText={brand.oneLiner}
              as="p"
              multiline
              className="text-base sm:text-lg text-[var(--text-muted)] font-normal leading-relaxed mb-8 max-w-xl text-pretty"
            />

            {/* CTAs - Accent only on primary CTA */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <a
                href="#projects"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] text-xs font-semibold tracking-wider uppercase transition-colors duration-150 active:scale-95 cursor-pointer"
              >
                <Film className="w-4 h-4" strokeWidth={1.5} />
                <EditableText textKey="hero.cta_work" defaultText="View my work" />
              </a>

              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-accent)] text-xs font-semibold tracking-wider transition-colors duration-150 active:scale-95 cursor-pointer"
              >
                <EditableText textKey="hero.cta_contact" defaultText="Let's talk" />
                <span className="text-[var(--accent)] text-sm leading-none">→</span>
              </a>
            </div>

            {/* Editing Discipline Bullets */}
            <div className="mt-10 pt-8 border-t border-[var(--border)] flex items-center gap-6 text-xs text-[var(--text-muted)] font-mono">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <EditableText textKey="hero.discipline_reels" defaultText="Short-form reels" />
              </div>
              <span className="opacity-40">/</span>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                <EditableText textKey="hero.discipline_youtube" defaultText="YouTube long-form" />
              </div>
              <span className="opacity-40 hidden sm:inline">/</span>
              <div className="hidden sm:flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <EditableText textKey="hero.discipline_color" defaultText="Color & sound" />
              </div>
            </div>
          </div>

          {/* Right Column: NLE Showreel Monitor Frame */}
          <div className="lg:col-span-6">
            <div className="relative group rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-2 sm:p-3 shadow-xl overflow-hidden">
              {/* Monitor Top Bar */}
              <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg)] rounded-lg mb-2 text-xs font-mono text-[var(--text-muted)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 text-[var(--text-primary)] font-medium text-xs tracking-wide">SHOWREEL PREVIEW</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--accent)] font-semibold tabular-nums text-xs">{heroTimecode}</span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-xs text-[var(--text-muted)]">
                    23.98 FPS
                  </span>
                </div>
              </div>

              {/* Video Player Display Container */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center">
                {/* Background Video Simulation */}
                <img
                  src="https://img.youtube.com/vi/8YkP5xLwlis/hqdefault.jpg"
                  alt="Arman Official Video Editing Showreel"
                  className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
                    isPlaying ? 'opacity-90' : 'opacity-40 grayscale-[30%]'
                  }`}
                  loading="eager"
                />

                {/* Film grain */}
                <div className="film-grain absolute inset-0 pointer-events-none" />
                
                {/* Center Big Play Button (Click to trigger Fullscreen Lightbox) */}
                <button
                  type="button"
                  onClick={onOpenShowreel}
                  className="absolute z-20 flex flex-col items-center gap-3 group/btn focus-visible:outline-none"
                  aria-label="Open Full Showreel Video in Lightbox"
                >
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[var(--accent)] text-[var(--on-accent)] flex items-center justify-center group-hover/btn:scale-105 transition-transform duration-200 cursor-pointer shadow-lg">
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" strokeWidth={1.5} />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-mono tracking-wider uppercase group-hover/btn:border-[var(--border-accent)] transition-colors">
                    Watch showreel
                  </span>
                </button>

                {/* Bottom Overlay Controls Bar */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--bg)_95%,transparent)] via-[color-mix(in_srgb,var(--bg)_60%,transparent)] to-transparent p-3 sm:p-4 flex items-center justify-between text-[var(--text)] text-xs font-mono z-10">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-[var(--text)] transition-colors cursor-pointer"
                      aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" strokeWidth={1.5} /> : <Play className="w-4 h-4 fill-current" strokeWidth={1.5} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" strokeWidth={1.5} /> : <Volume2 className="w-4 h-4" strokeWidth={1.5} />}
                    </button>
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <span className="text-[var(--text-primary)]">ProRes 422</span>
                      <span>·</span>
                      <span>4K Master</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Simulated live audio level meter bars */}
                    <div className="flex items-end gap-[2px] h-4 w-10" aria-hidden="true">
                      <span className={`w-1 bg-[var(--accent)] rounded-sm transition-all duration-150 ${isPlaying ? 'h-3 animate-pulse' : 'h-1'}`} />
                      <span className={`w-1 bg-[var(--accent)] rounded-sm transition-all duration-150 ${isPlaying ? 'h-4' : 'h-1.5'}`} />
                      <span className={`w-1 bg-amber-400 rounded-sm transition-all duration-150 ${isPlaying ? 'h-2.5 animate-pulse' : 'h-1'}`} />
                      <span className={`w-1 bg-emerald-400 rounded-sm transition-all duration-150 ${isPlaying ? 'h-3.5' : 'h-1'}`} />
                    </div>

                    <button
                      type="button"
                      onClick={onOpenShowreel}
                      className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      title="Fullscreen Lightbox"
                      aria-label="Expand Showreel in Fullscreen Modal"
                    >
                      <Maximize2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>

              {/* NLE Timeline Track Drawer simulation below preview */}
              <div className="mt-2.5 p-2 bg-[var(--bg)] rounded-lg border border-[var(--border-subtle)] space-y-1.5 font-mono text-xs">
                {/* Video Track 1 */}
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)] w-6 shrink-0">V1</span>
                  <div className="flex-1 h-3.5 rounded bg-[var(--surface-elevated)] overflow-hidden relative border border-[var(--border-subtle)]">
                    <div className="absolute inset-y-0 left-0 w-3/4 bg-blue-900/50 flex items-center px-2 text-xs text-blue-200">
                      Showreel_Master.mp4
                    </div>
                    <div className="absolute top-0 bottom-0 left-[48%] w-[2px] bg-[var(--accent)]" />
                  </div>
                </div>
                {/* Audio Track 1 */}
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)] w-6 shrink-0">A1</span>
                  <div className="flex-1 h-3.5 rounded bg-[var(--surface-elevated)] overflow-hidden relative border border-[var(--border-subtle)]">
                    <div className="absolute inset-y-0 left-0 w-3/4 bg-emerald-950/70 flex items-center px-2 text-xs text-emerald-300">
                      SoundDesign_Master.wav
                    </div>
                    <div className="absolute top-0 bottom-0 left-[48%] w-[2px] bg-[var(--accent)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom scroll down indicator */}
        <div className="mt-14 flex justify-center">
          <a
            href="#about"
            className="group inline-flex flex-col items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Scroll to About section"
          >
            <span>About</span>
            <ArrowDown className="w-4 h-4 text-[var(--accent)] group-hover:translate-y-1 transition-transform" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </section>
  );
};
