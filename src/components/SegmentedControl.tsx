import { useRef } from 'react';
import './SegmentedControl.css';

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const activeIndex = Math.max(0, options.findIndex((o) => o.value === value));

  function pickFromX(clientX: number) {
    if (!trackRef.current) return;
    const { left, width } = trackRef.current.getBoundingClientRect();
    const idx = Math.min(options.length - 1, Math.floor(Math.max(0, (clientX - left) / width) * options.length));
    onChange(options[idx].value);
  }

  return (
    <div
      ref={trackRef}
      className="seg-track"
        style={{ cursor: 'ew-resize' }}
        onPointerDown={(e) => { trackRef.current?.setPointerCapture(e.pointerId); dragging.current = true; pickFromX(e.clientX); }}
        onPointerMove={(e) => { if (dragging.current) pickFromX(e.clientX); }}
        onPointerUp={() => { dragging.current = false; }}
      >
        <span
          className="seg-pill"
          style={{
            width: `calc((100% - 8px) / ${options.length})`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`seg-btn${opt.value === value ? ' selected' : ''}`}
          >
            {opt.label}
          </button>
        ))}
    </div>
  );
}
