import './ShapeSelector.css';
import { useEffect, useRef, useState } from 'react';
import type { GlassShape } from '../types/editor';

const shapes: { id: GlassShape; label: string }[] = [
  { id: 'circles', label: 'Circles' },
  { id: 'lines',   label: 'Lines' },
  { id: 'wave',    label: 'Wave' },
  { id: 'zigzag',  label: 'Zigzag' },
];

interface ShapeSelectorProps {
  label?: string;
  value: GlassShape;
  onChange: (value: GlassShape) => void;
}

export function ShapeSelector({ label, value, onChange }: ShapeSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const selected = shapes.find((s) => s.id === value) ?? shapes[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="selector-group">
      {label && <span className="selector-group-label">{label}</span>}
      <div className={`selector${open ? ' open' : ''}`}>
        <button type="button" className="selector-trigger" onClick={() => setOpen((o) => !o)}>
          <span className="selector-left">
            <span className="option-text">{selected.label}</span>
          </span>
          <img
            src={`${import.meta.env.BASE_URL}icons/chevron-down.svg`}
            className="chevron"
            alt=""
            style={{ filter: 'brightness(0) invert(78%)' }}
          />
        </button>
        <div className="dropdown">
          {shapes.map((shape) => (
            <button
              key={shape.id}
              type="button"
              className={`dropdown-item${shape.id === value ? ' active' : ''}`}
              onClick={() => { onChange(shape.id); setOpen(false); }}
            >
              <span className="dropdown-item-text">{shape.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
