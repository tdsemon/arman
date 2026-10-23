import React, { useEffect, useRef } from 'react';
import { PetConfig, PETS } from '../types/theme';

export { PETS };

interface OnekoPetProps {
  currentPet: PetConfig;
}

export const OnekoPet: React.FC<OnekoPetProps> = ({ currentPet }) => {
  const nekoElRef = useRef<HTMLDivElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lapIntervalRef = useRef<number | null>(null);

  // Position and state refs to avoid closure stale state
  const stateRef = useRef({
    nekoPosX: 64,
    nekoPosY: 64,
    mousePosX: 64,
    mousePosY: 64,
    frameCount: 0,
    idleTime: 0,
    idleAnimation: null as string | null,
    idleAnimationFrame: 0,
    isRunningLap: false,
  });

  const spriteSets: Record<string, number[][]> = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [
      [-5, 0],
      [-6, 0],
      [-7, 0],
    ],
    scratchWallN: [
      [0, 0],
      [0, -1],
    ],
    scratchWallS: [
      [-7, -1],
      [-6, -2],
    ],
    scratchWallE: [
      [-2, -2],
      [-2, -3],
    ],
    scratchWallW: [
      [-4, 0],
      [-4, -1],
    ],
    tired: [[-3, -2]],
    sleeping: [
      [-2, 0],
      [-2, -1],
    ],
    N: [
      [-1, -2],
      [-1, -3],
    ],
    NE: [
      [0, -2],
      [0, -3],
    ],
    E: [
      [-3, 0],
      [-3, -1],
    ],
    SE: [
      [-5, -1],
      [-5, -2],
    ],
    S: [
      [-6, -3],
      [-7, -2],
    ],
    SW: [
      [-5, -3],
      [-6, -1],
    ],
    W: [
      [-4, -2],
      [-4, -3],
    ],
    NW: [
      [-1, 0],
      [-1, -1],
    ],
  };

  // Switch pet sprite image whenever currentPet changes without resetting position
  useEffect(() => {
    if (nekoElRef.current) {
      nekoElRef.current.style.backgroundImage = `url(${currentPet.file})`;
    }
  }, [currentPet.file]);

  // Main lifecycle: setup, follow cursor, cleanup
  useEffect(() => {
    // Disable on reduced motion or coarse pointer (touch devices)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchOnly = window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches;

    if (prefersReducedMotion || isTouchOnly) {
      return;
    }

    // Clean up any existing neko element from earlier mounts/HMR
    const existing = document.getElementById('oneko');
    if (existing) {
      existing.remove();
    }

    // Restore saved coordinates if available
    try {
      const stored = localStorage.getItem('oneko_position');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          stateRef.current.nekoPosX = parsed.x;
          stateRef.current.nekoPosY = parsed.y;
          stateRef.current.mousePosX = parsed.x;
          stateRef.current.mousePosY = parsed.y;
        }
      }
    } catch {
      // Ignore localStorage read errors
    }

    // Create DOM element
    const nekoEl = document.createElement('div');
    nekoEl.id = 'oneko';
    nekoEl.setAttribute('aria-hidden', 'true');
    nekoEl.style.width = '32px';
    nekoEl.style.height = '32px';
    nekoEl.style.position = 'fixed';
    nekoEl.style.pointerEvents = 'none';
    nekoEl.style.imageRendering = 'pixelated';
    nekoEl.style.left = `${stateRef.current.nekoPosX - 16}px`;
    nekoEl.style.top = `${stateRef.current.nekoPosY - 16}px`;
    nekoEl.style.zIndex = '9998'; // High, but below context menu (99999)
    nekoEl.style.backgroundImage = `url(${currentPet.file})`;

    document.body.appendChild(nekoEl);
    nekoElRef.current = nekoEl;

    const setSprite = (name: string, frame: number) => {
      const set = spriteSets[name] || spriteSets.idle;
      const sprite = set[frame % set.length];
      if (nekoEl) {
        nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
      }
    };

    const resetIdleAnimation = () => {
      stateRef.current.idleAnimation = null;
      stateRef.current.idleAnimationFrame = 0;
    };

    const idle = () => {
      stateRef.current.idleTime += 1;

      // Every ~15-20 seconds of inactivity trigger playful behavior
      if (
        stateRef.current.idleTime > 10 &&
        Math.floor(Math.random() * 180) === 0 &&
        stateRef.current.idleAnimation === null
      ) {
        const available = ['sleeping', 'scratchSelf'];
        if (stateRef.current.nekoPosX < 40) available.push('scratchWallW');
        if (stateRef.current.nekoPosY < 40) available.push('scratchWallN');
        if (stateRef.current.nekoPosX > window.innerWidth - 40) available.push('scratchWallE');
        if (stateRef.current.nekoPosY > window.innerHeight - 40) available.push('scratchWallS');

        stateRef.current.idleAnimation = available[Math.floor(Math.random() * available.length)];
      }

      switch (stateRef.current.idleAnimation) {
        case 'sleeping':
          if (stateRef.current.idleAnimationFrame < 8) {
            setSprite('tired', 0);
            break;
          }
          setSprite('sleeping', Math.floor(stateRef.current.idleAnimationFrame / 4));
          if (stateRef.current.idleAnimationFrame > 192) {
            resetIdleAnimation();
          }
          break;
        case 'scratchWallN':
        case 'scratchWallS':
        case 'scratchWallE':
        case 'scratchWallW':
        case 'scratchSelf':
          setSprite(stateRef.current.idleAnimation, stateRef.current.idleAnimationFrame);
          if (stateRef.current.idleAnimationFrame > 9) {
            resetIdleAnimation();
          }
          break;
        default:
          setSprite('idle', 0);
          return;
      }
      stateRef.current.idleAnimationFrame += 1;
    };

    const nekoSpeed = 10;

    const frame = () => {
      if (stateRef.current.isRunningLap) {
        return; // Don't interrupt victory lap
      }

      stateRef.current.frameCount += 1;
      const diffX = stateRef.current.nekoPosX - stateRef.current.mousePosX;
      const diffY = stateRef.current.nekoPosY - stateRef.current.mousePosY;
      const distance = Math.sqrt(diffX * diffX + diffY * diffY);

      if (distance < nekoSpeed || distance < 48) {
        idle();
        return;
      }

      stateRef.current.idleAnimation = null;
      stateRef.current.idleAnimationFrame = 0;

      if (stateRef.current.idleTime > 1) {
        setSprite('alert', 0);
        stateRef.current.idleTime = Math.min(stateRef.current.idleTime, 7) - 1;
        return;
      }

      let direction = '';
      if (diffY / distance > 0.5) direction = 'N';
      else if (diffY / distance < -0.5) direction = 'S';
      if (diffX / distance > 0.5) direction += 'W';
      else if (diffX / distance < -0.5) direction += 'E';

      setSprite(direction || 'E', stateRef.current.frameCount);

      if (distance > nekoSpeed) {
        stateRef.current.nekoPosX -= (diffX / distance) * nekoSpeed;
        stateRef.current.nekoPosY -= (diffY / distance) * nekoSpeed;
      } else {
        stateRef.current.nekoPosX = stateRef.current.mousePosX;
        stateRef.current.nekoPosY = stateRef.current.mousePosY;
      }

      stateRef.current.nekoPosX = Math.min(Math.max(16, stateRef.current.nekoPosX), window.innerWidth - 16);
      stateRef.current.nekoPosY = Math.min(Math.max(16, stateRef.current.nekoPosY), window.innerHeight - 16);

      nekoEl.style.left = `${stateRef.current.nekoPosX - 16}px`;
      nekoEl.style.top = `${stateRef.current.nekoPosY - 16}px`;
    };

    let lastFrameTime = 0;
    const animate = (timestamp: number) => {
      if (!nekoEl.isConnected) return;
      if (timestamp - lastFrameTime > 90) {
        lastFrameTime = timestamp;
        frame();
      }
      animFrameIdRef.current = window.requestAnimationFrame(animate);
    };

    const onMouseMove = (e: MouseEvent) => {
      stateRef.current.mousePosX = e.clientX;
      stateRef.current.mousePosY = e.clientY;
    };

    // Theme change celebratory reaction: Alert + 360-degree victory lap!
    const onThemeReact = () => {
      if (stateRef.current.isRunningLap) return;
      stateRef.current.isRunningLap = true;
      setSprite('alert', 0);

      const centerX = stateRef.current.nekoPosX;
      const centerY = stateRef.current.nekoPosY;
      const radius = 32;
      let angle = 0;
      let step = 0;

      lapIntervalRef.current = window.setInterval(() => {
        angle += 0.35;
        step += 1;

        const curX = centerX + Math.cos(angle) * radius;
        const curY = centerY + Math.sin(angle) * radius;

        stateRef.current.nekoPosX = Math.min(Math.max(16, curX), window.innerWidth - 16);
        stateRef.current.nekoPosY = Math.min(Math.max(16, curY), window.innerHeight - 16);

        nekoEl.style.left = `${stateRef.current.nekoPosX - 16}px`;
        nekoEl.style.top = `${stateRef.current.nekoPosY - 16}px`;

        // Pick direction sprite based on angle quadrant
        let dir = 'E';
        if (angle < Math.PI * 0.5) dir = 'SE';
        else if (angle < Math.PI) dir = 'SW';
        else if (angle < Math.PI * 1.5) dir = 'NW';
        else dir = 'NE';
        setSprite(dir, step);

        if (angle >= Math.PI * 2) {
          if (lapIntervalRef.current) clearInterval(lapIntervalRef.current);
          stateRef.current.isRunningLap = false;
          setSprite('idle', 0);
        }
      }, 35);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('oneko-wake', onThemeReact);
    animFrameIdRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('oneko-wake', onThemeReact);
      if (animFrameIdRef.current) window.cancelAnimationFrame(animFrameIdRef.current);
      if (lapIntervalRef.current) clearInterval(lapIntervalRef.current);

      try {
        localStorage.setItem(
          'oneko_position',
          JSON.stringify({
            x: Math.round(stateRef.current.nekoPosX),
            y: Math.round(stateRef.current.nekoPosY),
          })
        );
      } catch {
        // Ignore storage errors
      }

      if (nekoEl && nekoEl.parentNode) {
        nekoEl.remove();
      }
    };
  }, [currentPet.file]);

  return null;
};
