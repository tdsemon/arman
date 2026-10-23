import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Sparkles, SlidersHorizontal, MousePointerClick, Volume2, VolumeX, Lock } from 'lucide-react';
import { PetConfig, ThemeConfig, PETS, THEMES, ThemeId } from '../types/theme';
import { useSound } from '../lib/sound';
import { useAuth } from '../lib/auth';

interface ContextMenuProps {
  currentPet: PetConfig;
  currentTheme: ThemeId;
  onSelectPet: (pet: PetConfig) => void;
  onSelectTheme: (themeId: ThemeId, clickCoords: { x: number; y: number }) => void;
  onOpenAdmin: () => void;
}

interface MenuPos {
  x: number;
  y: number;
  originX: number;
  originY: number;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  currentPet,
  currentTheme,
  onSelectPet,
  onSelectTheme,
  onOpenAdmin,
}) => {
  const { isMuted, toggleMute, playMenuOpen, playMenuSelect } = useSound();
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPos>({ x: 0, y: 0, originX: 0, originY: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Approximate dimensions of the menu for viewport edge clamping
  const MENU_WIDTH = 350;
  const MENU_HEIGHT = 480;

  const openMenuAt = useCallback((clientX: number, clientY: number) => {
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    let posX = clientX;
    let posY = clientY;
    let originX = 0;
    let originY = 0;

    // Flip horizontally if close to right edge
    if (clientX + MENU_WIDTH > winW - 16) {
      posX = Math.max(16, clientX - MENU_WIDTH);
      originX = 100;
    } else {
      posX = Math.max(16, clientX);
      originX = 0;
    }

    // Flip vertically if close to bottom edge
    if (clientY + MENU_HEIGHT > winH - 16) {
      posY = Math.max(16, clientY - MENU_HEIGHT);
      originY = 100;
    } else {
      posY = Math.max(16, clientY);
      originY = 0;
    }

    setMenuPos({ x: posX, y: posY, originX, originY });
    setIsOpen(true);
    playMenuOpen();
  }, [playMenuOpen]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Global right-click and dismiss handlers
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Don't intercept if clicking inside standard form inputs (unless requested)
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea') && !target.closest('.interactive-target')) {
        return;
      }
      e.preventDefault();
      openMenuAt(e.clientX, e.clientY);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    };

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const handleDismissOnScrollOrResize = () => {
      if (isOpen) {
        closeMenu();
      }
    };

    // Mobile long press handler (600ms on empty space)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, textarea, select')) {
        return; // Don't trigger on interactive buttons
      }

      longPressTimerRef.current = window.setTimeout(() => {
        try {
          if (navigator.vibrate) navigator.vibrate(40);
        } catch {
          // Ignore vibrate error
        }
        openMenuAt(touch.clientX, touch.clientY);
      }, 600);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!longPressTimerRef.current) return;
      const touch = e.touches[0];
      const moveDist = Math.hypot(
        touch.clientX - touchStartPosRef.current.x,
        touch.clientY - touchStartPosRef.current.y
      );
      if (moveDist > 10) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };

    const handleTouchEnd = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('touchstart', handleClickOutside, { passive: true });
    window.addEventListener('scroll', handleDismissOnScrollOrResize, { passive: true });
    window.addEventListener('resize', handleDismissOnScrollOrResize, { passive: true });

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleDismissOnScrollOrResize);
      window.removeEventListener('resize', handleDismissOnScrollOrResize);

      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isOpen, openMenuAt, closeMenu]);

  // Handle keyboard arrow navigation inside the menu
  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeMenu();
      return;
    }
    const buttons = menuRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
    if (!buttons || buttons.length === 0) return;

    const currentIdx = Array.from(buttons).indexOf(document.activeElement as HTMLButtonElement);

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIdx = (currentIdx + 1) % buttons.length;
      buttons[nextIdx].focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIdx = (currentIdx - 1 + buttons.length) % buttons.length;
      buttons[prevIdx].focus();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[99999] pointer-events-none"
          aria-hidden={!isOpen}
        >
          <motion.div
            ref={menuRef}
            role="menu"
            aria-label="Pet and theme configuration menu"
            tabIndex={-1}
            onKeyDown={handleMenuKeyDown}
            initial={{
              opacity: 0,
              scale: 0.88,
              y: menuPos.originY === 100 ? 10 : -10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              transition: { duration: 0.12 },
            }}
            transition={{
              type: 'spring',
              stiffness: 450,
              damping: 30,
            }}
            style={{
              position: 'fixed',
              left: `${menuPos.x}px`,
              top: `${menuPos.y}px`,
              transformOrigin: `${menuPos.originX}% ${menuPos.originY}%`,
            }}
            className="pointer-events-auto w-[350px] max-h-[85vh] overflow-y-auto rounded-2xl bg-[var(--surface-elevated)]/95 backdrop-blur-2xl border border-[var(--border)] text-[var(--text)] shadow-2xl p-3.5 select-none no-scrollbar"
          >
            {/* Header with timecode HUD */}
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-[var(--border-subtle)] mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                <span className="font-mono text-xs font-bold text-[var(--text-primary)] tracking-widest uppercase">
                  Studio Settings
                </span>
              </div>
              <span className="font-mono text-xs text-[var(--text-muted)]">
                00:00:24
              </span>
            </div>

            {/* SECTION 1: PET SELECTOR */}
            <div className="mb-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" strokeWidth={1.5} />
                  <span className="font-mono text-xs font-semibold text-[var(--text)]">
                    00:01 — Companion Pet
                  </span>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {PETS.length} sprites
                </span>
              </div>

              {/* Grid of 4 columns with cropped idle frames */}
              <div className="grid grid-cols-4 gap-1.5 max-h-[180px] overflow-y-auto pr-1 no-scrollbar p-1.5 rounded-xl bg-[var(--bg)]/60 border border-[var(--border-subtle)]">
                {PETS.map((pet) => {
                  const isActive = currentPet.id === pet.id;
                  return (
                    <button
                      key={pet.id}
                      role="menuitemradio"
                      aria-checked={isActive}
                      title={`Select ${pet.name}`}
                      onClick={(e) => {
                        (e as any).__soundHandled = true;
                        playMenuSelect();
                        onSelectPet(pet);
                      }}
                      className={`group relative flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] cursor-pointer ${
                        isActive
                          ? 'bg-[var(--accent)]/20 border border-[var(--accent)]'
                          : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border)]'
                      }`}
                    >
                      {/* 32px cropped sprite frame */}
                      <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center shrink-0">
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            backgroundImage: `url(${pet.file})`,
                            backgroundPosition: `${pet.idlePos[0] * 32}px ${pet.idlePos[1] * 32}px`,
                            imageRendering: 'pixelated',
                          }}
                        />
                      </div>
                      <span
                        className={`text-xs font-mono mt-1 truncate max-w-[64px] ${
                          isActive ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {pet.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: THEME SELECTOR */}
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent)]" strokeWidth={1.5} />
                  <span className="font-mono text-xs font-semibold text-[var(--text)]">
                    00:02 — Color Palette
                  </span>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {THEMES.length} palettes
                </span>
              </div>

              {/* Theme items list */}
              <div className="space-y-1.5 p-1 rounded-xl bg-[var(--bg)]/60 border border-[var(--border-subtle)]">
                {THEMES.map((th) => {
                  const isActive = currentTheme === th.id;
                  return (
                    <button
                      key={th.id}
                      role="menuitemradio"
                      aria-checked={isActive}
                      onClick={(e) => {
                        (e as any).__soundHandled = true;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickCoords = {
                          x: rect.left + rect.width / 2,
                          y: rect.top + rect.height / 2,
                        };
                        onSelectTheme(th.id, clickCoords);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] cursor-pointer ${
                        isActive
                          ? 'bg-[var(--accent)]/15 border border-[var(--border-accent)]'
                          : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border-subtle)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {/* 3-color preview pill */}
                        <div className="flex items-center h-4 rounded-full overflow-hidden border border-[var(--border)] shrink-0">
                          <span
                            className="w-2.5 h-full"
                            style={{ backgroundColor: th.previewColors[0] }}
                          />
                          <span
                            className="w-2.5 h-full"
                            style={{ backgroundColor: th.previewColors[1] }}
                          />
                          <span
                            className="w-2.5 h-full"
                            style={{ backgroundColor: th.previewColors[2] }}
                          />
                        </div>

                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-semibold ${
                                isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text)]'
                              }`}
                            >
                              {th.name}
                            </span>
                            <span className="text-xs font-mono text-[var(--text-muted)]">
                              {th.timecode}
                            </span>
                          </div>
                          <div className="text-xs text-[var(--text-muted)] font-mono">
                            {th.subtitle}
                          </div>
                        </div>
                      </div>

                      {/* Active indicator check */}
                      {isActive ? (
                        <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-[var(--on-accent)] flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" strokeWidth={1.5} />
                        </div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[var(--text-muted)]/30 group-hover:bg-[var(--text-muted)]/60" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: SOUND SETTING */}
            <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-[var(--text-muted)]" strokeWidth={1.5} />
                ) : (
                  <Volume2 className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.5} />
                )}
                <span className="text-xs font-mono font-medium text-[var(--text)]">
                  Sound: <span className={isMuted ? 'text-[var(--text-muted)]' : 'text-[var(--accent)] font-semibold'}>{isMuted ? 'Off' : 'On'}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  (e as any).__soundHandled = true;
                  toggleMute();
                }}
                className="px-2.5 py-1 rounded-md text-xs font-mono bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                {isMuted ? 'Turn On' : 'Mute'}
              </button>
            </div>

            {/* SECTION 4: ADMIN ACCESS */}
            <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Lock className={`w-3.5 h-3.5 ${isAdmin ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} strokeWidth={1.5} />
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {isAdmin ? (
                    <>
                      Admin: <span className="text-[var(--accent)] font-semibold">Active</span>
                    </>
                  ) : (
                    'Admin'
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  (e as any).__soundHandled = true;
                  closeMenu();
                  onOpenAdmin();
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors cursor-pointer ${
                  isAdmin
                    ? 'bg-[var(--accent)] text-[var(--on-accent)] border-[var(--accent)] hover:opacity-90'
                    : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {isAdmin ? 'Editor' : 'Sign In'}
              </button>
            </div>

            {/* Footer tip */}
            <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between px-2 text-xs font-mono text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <MousePointerClick className="w-3.5 h-3.5 text-[var(--accent)]" strokeWidth={1.5} />
                Right-click anywhere to reopen
              </span>
              <span>ESC to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
