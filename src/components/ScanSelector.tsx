import './ShapeSelector.css';
import { useEffect, useRef, useState } from 'react';

const SCAN_OPTIONS = [
  { value: 3, label: 'Scan 1' },
  { value: 2, label: 'Scan 2' },
  { value: 1, label: 'Scan 3' },
  { value: 4, label: 'Scan 4' },
  { value: 6, label: 'Scan 6' },
];

interface ScanSelectorProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
}

export function ScanSelector({ label, value, onChange }: ScanSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const selected = SCAN_OPTIONS.find((o) => o.value === value) ?? SCAN_OPTIONS[0];


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
          <span className="option-text">{selected.label}</span>
          <img
            src={`${import.meta.env.BASE_URL}icons/chevron-down.svg`}
            className="chevron"
            alt=""
            style={{ filter: 'brightness(0) invert(78%)' }}
          />
        </button>
        <div className="dropdown">
          {SCAN_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`dropdown-item${opt.value === value ? ' active' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              <span className="dropdown-item-text">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
