import { useEffect, useRef, useState } from 'react';

export const PULL_THRESHOLD = 56;
const MAX_PULL = 96;

export function usePullToRefresh() {
  const [pullY, setPullY]       = useState(0);
  const [triggered, setTriggered] = useState(false);

  const startY   = useRef<number | null>(null);
  const startX   = useRef<number | null>(null);
  const isActive = useRef(false);

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      const touch = e.touches[0];
      // Don't hijack touches on the canvas (image drag) or drawer area
      if ((e.target as HTMLElement).tagName === 'CANVAS') return;
      if (touch.clientY > window.innerHeight * 0.65) return;

      startY.current   = touch.clientY;
      startX.current   = touch.clientX;
      isActive.current = false;
    }

    function onTouchMove(e: TouchEvent) {
      if (startY.current === null) return;
      const touch = e.touches[0];
      const dy = touch.clientY - startY.current;
      const dx = Math.abs(touch.clientX - (startX.current ?? 0));

      if (!isActive.current) {
        if (dy < 8) return;
        // Abort if the swipe is mostly horizontal (filter strip scroll)
        if (dx > dy * 0.7) { startY.current = null; return; }
        isActive.current = true;
      }

      if (dy > 0) {
        // Rubber-band: diminishing resistance the further you pull
        setPullY(Math.min(MAX_PULL, Math.pow(dy, 0.75)));
      }
    }

    function onTouchEnd() {
      if (!isActive.current) { startY.current = null; return; }

      // Read current pullY via functional update to avoid stale closure
      setPullY((current) => {
        if (current >= PULL_THRESHOLD) {
          setTriggered(true);
          setTimeout(() => window.location.reload(), 500);
        }
        return 0;
      });

      startY.current   = null;
      startX.current   = null;
      isActive.current = false;
    }

    document.addEventListener('touchstart',  onTouchStart,  { passive: true });
    document.addEventListener('touchmove',   onTouchMove,   { passive: true });
    document.addEventListener('touchend',    onTouchEnd,    { passive: true });
    document.addEventListener('touchcancel', onTouchEnd,    { passive: true });

    return () => {
      document.removeEventListener('touchstart',  onTouchStart);
      document.removeEventListener('touchmove',   onTouchMove);
      document.removeEventListener('touchend',    onTouchEnd);
      document.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  return { pullY, triggered };
}
