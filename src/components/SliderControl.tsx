import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import './SliderControl.css';

interface SliderControlProps {
  label: string;
  min?: number;
  max?: number;
  value: number;
  onChange: (value: number) => void;
}

export function SliderControl({
  label,
  min = 0,
  max = 100,
  value,
  onChange,
}: SliderControlProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const displayRef = useRef<HTMLInputElement | null>(null);
  const [isHoveringThumb, setIsHoveringThumb] = useState(false);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const [displayValue, setDisplayValue] = useState(String(Math.round(value)));
  const dragStateRef = useRef<{
    mode: 'thumb' | 'track' | 'scrub' | null;
    pointerId: number;
    startX: number;
    startValue: number;
    trackWidth: number;
    rangeSpan: number;
    min: number;
    max: number;
  }>({ mode: null, pointerId: -1, startX: 0, startValue: 0, trackWidth: 1, rangeSpan: 100, min: 0, max: 100 });
  const onChangeRef = useRef(onChange);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (document.activeElement !== displayRef.current) {
      setDisplayValue(String(Math.round(value)));
    }
  }, [value]);

  const clamp = (nextValue: number) => Math.max(min, Math.min(max, nextValue));

  const rangeSpan = max - min;
  const usableTrackWidth = Math.max(1, trackWidth - 6);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateTrackWidth = () => {
      setTrackWidth(track.getBoundingClientRect().width);
    };

    updateTrackWidth();
    const resizeObserver = new ResizeObserver(updateTrackWidth);
    resizeObserver.observe(track);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const updateFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ds = dragStateRef.current;
    const nextValue = Math.max(ds.min, Math.min(ds.max,
      ds.min + ((clientX - rect.left - 3) / Math.max(1, rect.width - 6)) * ds.rangeSpan
    ));
    onChangeRef.current(nextValue);
  };

  const resetDrag = () => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    dragStateRef.current.mode = null;
    dragStateRef.current.pointerId = -1;
    setIsPointerDown(false);
    document.body.style.cursor = '';
  };

  const attachDocumentListeners = (pointerId: number, isDisplay: boolean) => {
    const onMove = (e: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (dragState.pointerId !== e.pointerId) return;

      if (dragState.mode === 'scrub') {
        const delta = e.clientX - dragState.startX;
        const next = Math.max(dragState.min, Math.min(dragState.max, dragState.startValue + delta));
        onChangeRef.current(next);
        return;
      }

      if (dragState.mode === 'track') {
        updateFromClientX(e.clientX);
        return;
      }

      if (dragState.mode === 'thumb') {
        const delta = e.clientX - dragState.startX;
        const usable = Math.max(1, dragState.trackWidth - 6);
        const next = Math.max(dragState.min, Math.min(dragState.max,
          dragState.startValue + (delta / usable) * dragState.rangeSpan
        ));
        onChangeRef.current(next);
      }
    };

    const onUp = (e: PointerEvent) => {
      if (dragStateRef.current.pointerId !== e.pointerId) return;
      if (isDisplay) {
        displayRef.current?.releasePointerCapture(e.pointerId);
      } else {
        trackRef.current?.releasePointerCapture(e.pointerId);
      }
      resetDrag();
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);

    cleanupRef.current = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };
  };

  const handleTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    event.preventDefault();
    const mode = (event.target as HTMLElement).closest('.slider-thumb') ? 'thumb' : 'track';
    dragStateRef.current = {
      mode,
      pointerId: event.pointerId,
      startX: event.clientX,
      startValue: value,
      trackWidth: usableTrackWidth + 6,
      rangeSpan,
      min,
      max,
    };
    setIsPointerDown(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    attachDocumentListeners(event.pointerId, false);

    if (mode === 'track') {
      updateFromClientX(event.clientX);
    }
  };

  const handleDisplayPointerDown = (event: ReactPointerEvent<HTMLInputElement>) => {
    if (event.button !== 0 || event.pointerType !== 'mouse' || event.currentTarget === document.activeElement) return;

    event.preventDefault();
    dragStateRef.current = {
      mode: 'scrub',
      pointerId: event.pointerId,
      startX: event.clientX,
      startValue: value,
      trackWidth: usableTrackWidth + 6,
      rangeSpan,
      min,
      max,
    };
    setIsPointerDown(true);
    document.body.style.cursor = 'ew-resize';
    event.currentTarget.setPointerCapture(event.pointerId);
    attachDocumentListeners(event.pointerId, true);
  };

  const inactive = min === 0 && value === 0;
  const normalized = max === min ? 0 : (value - min) / rangeSpan;
  const fillWidth = inactive ? 2 : normalized * usableTrackWidth;
  const thumbColor =
    inactive ? '#a6a6a6' : isPointerDown ? '#9D9635' : isHoveringThumb ? '#C7BE44' : '#fff679';

  return (
    <div className="slider-row">
      <div className="slider-container">
        <div className="slider-label">{label}</div>
        <div
          ref={trackRef}
          className="slider-track"
          onPointerDown={handleTrackPointerDown}
          onWheel={(event) => {
            event.preventDefault();
            onChange(clamp(value - event.deltaY * 0.2));
          }}
        >
          <div
            className="track-fill"
            style={{
              width: `${fillWidth}px`,
              background: inactive ? '#6a6a6a' : '#fff679',
            }}
          />
          <div
            className="slider-thumb"
            style={{ background: thumbColor }}
            onPointerEnter={() => setIsHoveringThumb(true)}
            onPointerLeave={() => setIsHoveringThumb(false)}
          />
          <div className="track-empty" />
        </div>
      </div>
      <input
        ref={displayRef}
        className="value-display"
        value={displayValue}
        onChange={(event) => setDisplayValue(event.target.value)}
        onFocus={(event) => {
          setDisplayValue(String(Math.round(value)));
          event.target.select();
        }}
        onPointerDown={handleDisplayPointerDown}
        onBlur={() => {
          const parsedValue = parseFloat(displayValue);
          onChange(Number.isNaN(parsedValue) ? value : clamp(parsedValue));
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
          }
          if (event.key === 'Escape') {
            setDisplayValue(String(Math.round(value)));
            event.currentTarget.blur();
          }
        }}
      />
    </div>
  );
}
