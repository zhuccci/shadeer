import { useCallback, useEffect, useRef } from 'react';
import type { WheelEvent as ReactWheelEvent } from 'react';

export function useHorizontalWheelScroll() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const targetRef = useRef(0);

  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  useEffect(() => stopAnimation, [stopAnimation]);

  const animate = useCallback(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) {
      animationFrameRef.current = null;
      return;
    }

    const diff = targetRef.current - scrollElement.scrollLeft;
    if (Math.abs(diff) < 0.5) {
      scrollElement.scrollLeft = targetRef.current;
      animationFrameRef.current = null;
      return;
    }

    scrollElement.scrollLeft += diff * 0.12;
    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const onWheel = useCallback((event: ReactWheelEvent<HTMLDivElement>) => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const delta = event.deltaY !== 0 ? event.deltaY : event.deltaX;
    if (delta === 0) return;

    event.preventDefault();
    targetRef.current = Math.max(
      0,
      Math.min(scrollElement.scrollWidth - scrollElement.clientWidth, targetRef.current + delta),
    );

    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  const scrollItemIntoView = useCallback((item: HTMLElement) => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    targetRef.current = scrollElement.scrollLeft;
    const fadeLeft = 24;
    const fadeRight = 16;
    const scrollRect = scrollElement.getBoundingClientRect();
    const buttonRect = item.getBoundingClientRect();

    if (buttonRect.right > scrollRect.right - fadeRight) {
      targetRef.current += buttonRect.right - scrollRect.right + fadeRight + 8;
    } else if (buttonRect.left < scrollRect.left + fadeLeft) {
      targetRef.current += buttonRect.left - scrollRect.left - fadeLeft - 8;
    }

    targetRef.current = Math.max(
      0,
      Math.min(scrollElement.scrollWidth - scrollElement.clientWidth, targetRef.current),
    );

    stopAnimation();
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [animate, stopAnimation]);

  return {
    scrollRef,
    onWheel,
    scrollItemIntoView,
  };
}
