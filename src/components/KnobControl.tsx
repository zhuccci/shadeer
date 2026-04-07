import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react';
import { TextureLayer } from './TextureLayer';
import './KnobControl.css';

interface KnobControlProps {
  labels: {
    top: string;
    left: string;
    right: string;
    bottom: string;
  };
  value: number;
  onChange: (value: number) => void;
}

const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;

export function KnobControl({ labels, value, onChange }: KnobControlProps) {
  const knobRef = useRef<HTMLDivElement | null>(null);
  const displayRef = useRef<HTMLInputElement | null>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const inertiaFrameRef = useRef<number | null>(null);
  const dragStateRef = useRef({
    active: false,
    pointerId: -1,
    center: { x: 0, y: 0 },
    startPointerAngle: 0,
    startValue: value,
    velocity: 0,
    previousAngle: value,
    previousTime: 0,
  });
  const [displayValue, setDisplayValue] = useState(`${Math.round(value)}°`);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
    if (document.activeElement !== displayRef.current) {
      setDisplayValue(`${Math.round(normalizeAngle(value))}°`);
    }
  }, [onChange, value]);

  const ticks = useMemo(() => {
    const items: Array<{ left: number; top: number; isActive: boolean; size: number; key: number }> = [];
    const normalized = normalizeAngle(value);
    for (let degree = 0; degree < 360; degree += 15) {
      const radians = (degree - 90) * Math.PI / 180;
      const isCardinal = degree % 90 === 0;
      const size = isCardinal ? 2.5 : 2.434;
      items.push({
        key: degree,
        size,
        left: 50 + Math.cos(radians) * 45 - size / 2,
        top: 50 + Math.sin(radians) * 45 - size / 2,
        isActive: degree <= normalized,
      });
    }
    return items;
  }, [value]);

  const indicatorStyle = useMemo(() => {
    const radians = (value - 90) * Math.PI / 180;
    return {
      left: `${50 + Math.cos(radians) * 33.75 - 3.75}px`,
      top: `${50 + Math.sin(radians) * 33.75 - 3.75}px`,
    };
  }, [value]);

  useEffect(() => {
    return () => {
      if (inertiaFrameRef.current !== null) {
        cancelAnimationFrame(inertiaFrameRef.current);
        inertiaFrameRef.current = null;
      }
    };
  }, []);

  const angleFromPoint = (clientX: number, clientY: number) => {
    const { center } = dragStateRef.current;
    return Math.atan2(clientY - center.y, clientX - center.x) * 180 / Math.PI + 90;
  };

  const updateValue = (nextValue: number) => {
    const normalizedValue = normalizeAngle(nextValue);
    valueRef.current = normalizedValue;
    onChangeRef.current(normalizedValue);
  };

  const stopInertia = () => {
    if (inertiaFrameRef.current !== null) {
      cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }
  };

  const finishDrag = () => {
    const knob = knobRef.current;
    const dragState = dragStateRef.current;
    if (!dragState.active) return;

    const pointerId = dragState.pointerId;
    const releaseVelocity = dragState.velocity;
    dragState.active = false;
    dragState.pointerId = -1;
    setDragging(false);

    if (knob && knob.hasPointerCapture(pointerId)) {
      knob.releasePointerCapture(pointerId);
    }

    if (Math.abs(releaseVelocity) < 0.02) return;

    let lastTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - lastTime;
      lastTime = now;
      dragState.velocity *= Math.pow(0.85, elapsed / (1000 / 60));
      dragState.previousAngle = normalizeAngle(dragState.previousAngle + dragState.velocity * elapsed);
      updateValue(dragState.previousAngle);
      inertiaFrameRef.current = Math.abs(dragState.velocity) > 0.01 ? requestAnimationFrame(step) : null;
    };

    inertiaFrameRef.current = requestAnimationFrame(step);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    const knob = knobRef.current;
    if (!knob) return;

    event.preventDefault();
    stopInertia();

    const rect = knob.getBoundingClientRect();
    const currentValue = valueRef.current;
    dragStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      center: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      startPointerAngle: 0,
      startValue: currentValue,
      velocity: 0,
      previousAngle: currentValue,
      previousTime: performance.now(),
    };
    dragStateRef.current.startPointerAngle = angleFromPoint(event.clientX, event.clientY);
    knob.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState.active || event.pointerId !== dragState.pointerId) return;

    event.preventDefault();
    let delta = angleFromPoint(event.clientX, event.clientY) - dragState.startPointerAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    const nextValue = normalizeAngle(dragState.startValue + delta);
    const now = performance.now();
    const elapsed = now - dragState.previousTime;

    if (elapsed > 0) {
      let distance = nextValue - dragState.previousAngle;
      if (distance > 180) distance -= 360;
      if (distance < -180) distance += 360;
      dragState.velocity = distance / elapsed;
    }

    dragState.previousAngle = nextValue;
    dragState.previousTime = now;
    updateValue(nextValue);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== dragStateRef.current.pointerId) return;
    finishDrag();
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    updateValue(valueRef.current - event.deltaY * 0.3);
  };

  return (
    <div className="controls-right">
      <span className="knob-label">Angle</span>
      <div className="dial-wrap">
        <span className="deg-top">{labels.top}</span>
        <span className="deg-left">{labels.left}</span>
        <span className="deg-right">{labels.right}</span>
        <span className="deg-bottom">{labels.bottom}</span>
        <div className="knob-area">
          <div
            ref={knobRef}
            className={`knob${dragging ? ' dragging' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={finishDrag}
            onLostPointerCapture={finishDrag}
            onWheel={handleWheel}
          >
            <TextureLayer className="knob-grain" />
            <div className="knob-face">
              <TextureLayer className="knob-face-grain" />
            </div>
            {ticks.map((tick) => (
              <div
                key={tick.key}
                className="tick"
                style={{
                  width: `${tick.size}px`,
                  height: `${tick.size}px`,
                  left: `${tick.left}px`,
                  top: `${tick.top}px`,
                  background: tick.isActive ? '#fff679' : '#2b2b2b',
                }}
              />
            ))}
            <div className="indicator" style={indicatorStyle} />
          </div>
        </div>
      </div>
      <input
        ref={displayRef}
        className="knob-value-display"
        value={displayValue}
        onChange={(event) => setDisplayValue(event.target.value)}
        onFocus={(event) => {
          setDisplayValue(String(Math.round(value)));
          event.target.select();
        }}
        onBlur={() => {
          const parsedValue = parseFloat(displayValue);
          const nextValue = Number.isNaN(parsedValue) ? value : normalizeAngle(parsedValue);
          onChange(nextValue);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
          if (event.key === 'Escape') {
            setDisplayValue(`${Math.round(value)}°`);
            event.currentTarget.blur();
          }
        }}
      />
    </div>
  );
}
