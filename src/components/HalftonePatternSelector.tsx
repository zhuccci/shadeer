import './ShapeSelector.css';
import { useEffect, useRef, useState } from 'react';
import type { HalftonePattern } from '../types/editor';

const patterns: { id: HalftonePattern; label: string }[] = [
  { id: 'dots',   label: 'Dots' },
  { id: 'print',  label: 'Print' },
  { id: 'lines',  label: 'Lines' },
  { id: 'cross',  label: 'Cross' },
  { id: 'dirty',  label: 'Dirty' },
  { id: 'grunge', label: 'Grunge' },
];

interface HalftonePatternSelectorProps {
  label?: string;
  value: HalftonePattern;
  onChange: (value: HalftonePattern) => void;
}

export function HalftonePatternSelector({ label, value, onChange }: HalftonePatternSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const selected = patterns.find((p) => p.id === value) ?? patterns[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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
          {patterns.map((pattern) => (
            <button
              key={pattern.id}
              type="button"
              className={`dropdown-item${pattern.id === value ? ' active' : ''}`}
              onClick={() => { onChange(pattern.id); setOpen(false); }}
            >
              <span className="dropdown-item-text">{pattern.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
