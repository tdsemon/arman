/**
 * ==============================================================================
 * ARMAN PORTFOLIO — SOUND SYSTEM CONFIG & AUDIO MANAGER
 * ==============================================================================
 * Central sound mapping, preloading, pooling, and global mute management.
 * Follows Web Audio / HTMLAudio best practices:
 * - Silent catch on blocked playback or missing files
 * - Preloads on first user interaction to satisfy browser autoplay policies
 * - Audio pooling (max 4 instances per sound) to allow rapid overlapping clicks
 *   without memory leaks
 * ==============================================================================
 */

import { useState, useEffect } from 'react';

// -----------------------------------------------------------------------------
// 1. SOUNDS CONFIGURATION (SINGLE EDITABLE MAPPING)
// -----------------------------------------------------------------------------
export const SOUND_CONFIG = {
  defaultVolume: 0.35, // Low default volume for subtle, non-intrusive feedback
  storageKey: 'arman_sound_muted',
};

export const SOUNDS = {
  click: '/sound/click.mp3', // generic button/link click (52ms snappy click)
  menuOpen: '/sound/pop.MP3.mp3', // right-click menu opens (crisp pop)
  menuSelect: '/sound/select .MP3.mp3', // picking a pet
  themes: {
    'midnight-cinema': '/sound/Transitions 3.wav', // cinematic whoosh
    'sakura': '/sound/1015(1).MP3.mp3', // TODO: replace with dedicated sakura floral chime
    'neon-tokyo': '/sound/glitch.MP3.mp3', // cybernetic glitch effect
    'terminal': '/sound/terminal.MP3.mp3', // retro CRT console chirp
    'sunset-reel': '/sound/Transitions 4.wav', // TODO: trim to shorter <100KB reel sweep
    'paper-cut': '/sound/pop.MP3.mp3', // TODO: replace with crisp paper slice sound
  },
  success: '/sound/1015(1).MP3.mp3', // contact form sent
  error: '/sound/glitch.MP3.mp3', // contact form failed
} as const;

export type ThemeKey = keyof typeof SOUNDS.themes;

// -----------------------------------------------------------------------------
// 2. GLOBAL SOUND MANAGER CLASS
// -----------------------------------------------------------------------------
type SoundListener = (muted: boolean) => void;

class SoundManager {
  private isMuted: boolean = false;
  private volume: number = SOUND_CONFIG.defaultVolume;
  private pool: Map<string, HTMLAudioElement[]> = new Map();
  private maxPoolPerSound = 4;
  private isPreloaded = false;
  private listeners: Set<SoundListener> = new Set();
  private initialized = false;

  constructor() {
    this.initMutePreference();
  }

  /**
   * Initializes mute preference:
   * Defaults to ON, unless prefers-reduced-motion is active (defaults to OFF).
   * Restores existing choice from localStorage if present.
   */
  private initMutePreference(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(SOUND_CONFIG.storageKey);
      if (stored !== null) {
        this.isMuted = stored === 'true';
        return;
      }
    } catch {
      // localStorage unavailable
    }

    // Default: ON at low volume. If prefers-reduced-motion is set, default to OFF.
    try {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.isMuted = prefersReducedMotion;
    } catch {
      this.isMuted = false;
    }
  }

  /**
   * Register global first-gesture listeners to preload audio safely.
   */
  public init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    const handleFirstGesture = () => {
      this.preload();
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });

    // Setup global delegated click listener
    this.setupGlobalClickListener();
  }

  /**
   * Preload key short sounds (click, pop, select) on first interaction
   */
  public preload(): void {
    if (this.isPreloaded || typeof window === 'undefined') return;
    this.isPreloaded = true;

    const keySounds = [
      SOUNDS.click,
      SOUNDS.menuOpen,
      SOUNDS.menuSelect,
      SOUNDS.themes['terminal'],
      SOUNDS.themes['neon-tokyo'],
    ];

    keySounds.forEach((url) => {
      try {
        const audio = this.createAudio(url);
        audio.load();
      } catch {
        // fail silently
      }
    });
  }

  private createAudio(src: string): HTMLAudioElement {
    const audio = new Audio(encodeURI(src));
    audio.preload = 'auto';
    audio.volume = this.volume;
    return audio;
  }

  /**
   * Get an available audio instance from pool or create a new one.
   */
  private getAudioInstance(src: string): HTMLAudioElement {
    let list = this.pool.get(src);
    if (!list) {
      list = [];
      this.pool.set(src, list);
    }

    // Try finding an idle or ended instance
    for (const a of list) {
      if (a.paused || a.ended) {
        return a;
      }
    }

    // If pool has room, allocate a new element
    if (list.length < this.maxPoolPerSound) {
      const newAudio = this.createAudio(src);
      list.push(newAudio);
      return newAudio;
    }

    // Pool full: cycle oldest
    const oldest = list[0];
    list.push(list.shift()!);
    return oldest;
  }

  /**
   * Play any sound by URL or key with graceful error swallowing
   */
  public play(src: string, overrideVolume?: number): void {
    if (this.isMuted || !src || typeof window === 'undefined') return;

    try {
      const audio = this.getAudioInstance(src);
      audio.volume = Math.max(0, Math.min(1, overrideVolume ?? this.volume));
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Playback blocked or file missing: fail completely silently
        });
      }
    } catch {
      // Fail silently
    }
  }

  /**
   * Play theme specific sound
   */
  public playTheme(themeId: string): void {
    const themeSound = (SOUNDS.themes as Record<string, string>)[themeId];
    if (themeSound) {
      this.play(themeSound);
    }
  }

  /**
   * Setup global delegated click listener for buttons, links, tabs, and interactive elements
   */
  private setupGlobalClickListener(): void {
    if (typeof document === 'undefined') return;

    document.addEventListener(
      'click',
      (event: MouseEvent) => {
        // If sound already handled specifically by a specialized component, skip generic click
        if ((event as any).__soundHandled) return;

        const target = event.target as HTMLElement | null;
        if (!target) return;

        // Skip anything explicitly flagged with data-no-sound or no-sound class
        if (target.closest('[data-no-sound="true"]') || target.closest('.no-sound')) {
          return;
        }

        // Check if click was on or within an interactive element
        const interactive = target.closest<HTMLElement>(
          'button, a, [role="button"], [role="tab"], [role="menuitem"], [role="menuitemradio"], input[type="submit"], input[type="button"], summary, [data-project-card]'
        );

        if (!interactive) return;

        // Skip disabled elements
        if (
          interactive.hasAttribute('disabled') ||
          interactive.getAttribute('aria-disabled') === 'true' ||
          interactive.classList.contains('disabled') ||
          interactive.classList.contains('pointer-events-none')
        ) {
          return;
        }

        // Play subtle click
        this.play(SOUNDS.click);
      },
      { capture: true, passive: true }
    );
  }

  // ---------------------------------------------------------------------------
  // Mute State Controls
  // ---------------------------------------------------------------------------
  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem(SOUND_CONFIG.storageKey, muted ? 'true' : 'false');
    } catch {
      // localStorage unavailable
    }
    this.notify();
  }

  public toggleMute(): boolean {
    const nextState = !this.isMuted;
    this.setMuted(nextState);
    if (!nextState) {
      // If unmuting, provide a quiet audible confirmation
      this.play(SOUNDS.click);
    }
    return nextState;
  }

  public subscribe(listener: SoundListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.isMuted));
  }
}

// Global singleton instance
export const soundManager = new SoundManager();

// -----------------------------------------------------------------------------
// 3. REACT HOOK: useSound
// -----------------------------------------------------------------------------
export function useSound() {
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getMuted());

  useEffect(() => {
    // Ensure manager is initialized
    soundManager.init();
    return soundManager.subscribe((muted) => setIsMuted(muted));
  }, []);

  return {
    isMuted,
    toggleMute: () => soundManager.toggleMute(),
    setMuted: (val: boolean) => soundManager.setMuted(val),
    play: (src: string, vol?: number) => soundManager.play(src, vol),
    playClick: () => soundManager.play(SOUNDS.click),
    playMenuOpen: () => soundManager.play(SOUNDS.menuOpen),
    playMenuSelect: () => soundManager.play(SOUNDS.menuSelect),
    playTheme: (themeId: string) => soundManager.playTheme(themeId),
    playSuccess: () => soundManager.play(SOUNDS.success),
    playError: () => soundManager.play(SOUNDS.error),
  };
}
