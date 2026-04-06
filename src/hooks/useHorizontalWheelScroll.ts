import { useEffect } from 'react';

export function useHorizontalWheelScroll(scrollRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    let target = scrollElement.scrollLeft;
    let animationFrame: number | null = null;

    const animate = () => {
      const diff = target - scrollElement.scrollLeft;
      if (Math.abs(diff) < 0.5) {
        scrollElement.scrollLeft = target;
        animationFrame = null;
        return;
      }

      scrollElement.scrollLeft += diff * 0.12;
      animationFrame = requestAnimationFrame(animate);
    };

    const handleWheel = (event: WheelEvent) => {
      const delta = event.deltaY !== 0 ? event.deltaY : event.deltaX;
      if (delta === 0) return;

      event.preventDefault();
      target = Math.max(0, Math.min(scrollElement.scrollWidth - scrollElement.clientWidth, target + delta));
      if (!animationFrame) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    scrollElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      scrollElement.removeEventListener('wheel', handleWheel);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [scrollRef]);
}
