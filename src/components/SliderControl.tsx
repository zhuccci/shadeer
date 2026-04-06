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
  const [displayValue, setDisplayValue] = useState(String(Math.round(value)));
  const dragStateRef = useRef<{
    mode: 'thumb' | 'track' | 'scrub' | null;
    pointerId: number;
    startX: number;
    startValue: number;
  }>({ mode: null, pointerId: -1, startX: 0, startValue: 0 });

  useEffect(() => {
    if (document.activeElement !== displayRef.current) {
      setDisplayValue(String(Math.round(value)));
    }
  }, [value]);

  const clamp = (nextValue: number) => Math.max(min, Math.min(max, nextValue));

  const rangeWidth = () => {
    const track = trackRef.current;
    if (!track) return 1;
    return Math.max(1, track.getBoundingClientRect().width - 6);
  };

  const rangeSpan = max - min;

  const updateFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const nextValue = clamp(min + ((clientX - rect.left - 3) / rangeWidth()) * rangeSpan);
    onChange(nextValue);
  };

  const resetDrag = () => {
    dragStateRef.current.mode = null;
    dragStateRef.current.pointerId = -1;
    setIsPointerDown(false);
    document.body.style.cursor = '';
  };

  useEffect(() => resetDrag, []);

  const handleTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    event.preventDefault();
    const mode = (event.target as HTMLElement).closest('.slider-thumb') ? 'thumb' : 'track';
    dragStateRef.current = {
      mode,
      pointerId: event.pointerId,
      startX: event.clientX,
      startValue: value,
    };
    setIsPointerDown(true);
    event.currentTarget.setPointerCapture(event.pointerId);

    if (mode === 'track') {
      updateFromClientX(event.clientX);
    }
  };

  const handleTrackPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (dragState.pointerId !== event.pointerId) return;

    if (dragState.mode === 'track') {
      updateFromClientX(event.clientX);
      return;
    }

    if (dragState.mode !== 'thumb') return;

    const delta = event.clientX - dragState.startX;
    onChange(clamp(dragState.startValue + (delta / rangeWidth()) * rangeSpan));
  };

  const handleTrackPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resetDrag();
  };

  const handleDisplayPointerDown = (event: ReactPointerEvent<HTMLInputElement>) => {
    if (event.button !== 0 || event.pointerType !== 'mouse' || event.currentTarget === document.activeElement) return;

    dragStateRef.current = {
      mode: 'scrub',
      pointerId: event.pointerId,
      startX: event.clientX,
      startValue: value,
    };
    setIsPointerDown(true);
    document.body.style.cursor = 'ew-resize';
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDisplayPointerMove = (event: ReactPointerEvent<HTMLInputElement>) => {
    const dragState = dragStateRef.current;
    if (dragState.mode !== 'scrub' || dragState.pointerId !== event.pointerId) return;

    const delta = event.clientX - dragState.startX;
    onChange(clamp(dragState.startValue + delta));
  };

  const handleDisplayPointerUp = (event: ReactPointerEvent<HTMLInputElement>) => {
    if (dragStateRef.current.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resetDrag();
  };

  const inactive = min === 0 && value === 0;
  const normalized = max === min ? 0 : (value - min) / rangeSpan;
  const fillWidth = inactive ? 2 : normalized * rangeWidth();
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
          onPointerMove={handleTrackPointerMove}
          onPointerUp={handleTrackPointerUp}
          onPointerCancel={resetDrag}
          onLostPointerCapture={resetDrag}
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
        onPointerMove={handleDisplayPointerMove}
        onPointerUp={handleDisplayPointerUp}
        onPointerCancel={resetDrag}
        onLostPointerCapture={resetDrag}
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
