import './ShapeSelector.css';
import { useEffect, useRef, useState } from 'react';
import type { GlitchMode } from '../types/editor';

const modes: { id: GlitchMode; label: string }[] = [
  { id: 'none',    label: 'None' },
  { id: 'invert',  label: 'Invert' },
  { id: 'corrupt', label: 'Data Corrupt' },
  { id: 'smear',   label: 'Smear' },
  { id: 'channel', label: 'Channel Swap' },
  { id: 'bleach',  label: 'Bleach' },
];

interface GlitchModeSelectorProps {
  label?: string;
  value: GlitchMode;
  onChange: (value: GlitchMode) => void;
}

export function GlitchModeSelector({ label, value, onChange }: GlitchModeSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const selected = modes.find((m) => m.id === value) ?? modes[0];

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
          {modes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`dropdown-item${mode.id === value ? ' active' : ''}`}
              onClick={() => { onChange(mode.id); setOpen(false); }}
            >
              <span className="dropdown-item-text">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
