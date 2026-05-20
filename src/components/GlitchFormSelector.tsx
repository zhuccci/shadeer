import React from 'react';
import type { GlitchFormMode } from '../types/editor';
function ShrinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="3"  y="3" width="1" height="18" />
      <rect x="5"  y="3" width="2" height="18" />
      <rect x="8"  y="3" width="1" height="18" />
      <rect x="10" y="3" width="1" height="18" />
      <rect x="12" y="3" width="2" height="18" />
      <rect x="15" y="3" width="3" height="18" />
      <rect x="19" y="3" width="2" height="18" />
    </svg>
  );
}

function InterlaceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <rect x="0" y="1"  width="11" height="2" />
      <rect x="7" y="5"  width="11" height="2" />
      <rect x="0" y="9"  width="11" height="2" />
      <rect x="7" y="13" width="11" height="2" />
    </svg>
  );
}

function WideIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="3" y="3"  width="18" height="3" />
      <rect x="3" y="8"  width="18" height="3" />
      <rect x="3" y="13" width="18" height="3" />
      <rect x="3" y="18" width="18" height="3" />
    </svg>
  );
}

function MosaicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="3"  y="3"  width="3" height="3" />
      <rect x="12" y="3"  width="3" height="3" />
      <rect x="18" y="3"  width="3" height="3" />
      <rect x="6"  y="9"  width="3" height="3" />
      <rect x="9"  y="6"  width="3" height="3" />
      <rect x="12" y="9"  width="3" height="3" />
      <rect x="18" y="9"  width="3" height="3" />
      <rect x="3"  y="12" width="3" height="3" />
      <rect x="15" y="12" width="3" height="3" />
      <rect x="12" y="15" width="3" height="3" />
      <rect x="15" y="18" width="3" height="3" />
      <rect x="9"  y="18" width="3" height="3" />
      <rect x="3"  y="18" width="3" height="3" />
      <rect x="18" y="15" width="3" height="3" />
    </svg>
  );
}


const forms: { id: GlitchFormMode; label: string; icon: React.ReactNode }[] = [
  { id: 'interlace', label: 'Interlace', icon: <InterlaceIcon /> },
  { id: 'mosaic',    label: 'Mosaic',    icon: <MosaicIcon /> },
  { id: 'wide',     label: 'Wide',    icon: <WideIcon /> },
  { id: 'compress', label: 'Shrink',  icon: <ShrinkIcon /> },
];

interface GlitchFormSelectorProps {
  value: GlitchFormMode;
  onChange: (value: GlitchFormMode) => void;
}

export function GlitchFormSelector({ value, onChange }: GlitchFormSelectorProps) {
  return (
    <div className="glitch-form-icons">
      {forms.map((form) => (
        <div key={form.id} className="dither-type-item">
          <button
            type="button"
            className={`dither-type-btn${value === form.id ? ' selected' : ''}`}
            onClick={() => onChange(form.id)}
          >
            {form.icon}
          </button>
          <span className={`dither-type-label${value === form.id ? ' selected' : ''}`}>
            {form.label}
          </span>
        </div>
      ))}
    </div>
  );
}
