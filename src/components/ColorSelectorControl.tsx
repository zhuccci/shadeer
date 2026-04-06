import { useId, useRef } from 'react';
import './ColorSelectorControl.css';

interface ColorSelectorControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorSelectorControl({ label, value, onChange }: ColorSelectorControlProps) {
  const pickerRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();

  return (
    <div className="color-selector">
      <label className="color-label" htmlFor={inputId}>{label}</label>
      <div className="color-row">
        <button
          type="button"
          className="color-swatch"
          style={{ background: value }}
          aria-label={`Choose ${label}`}
          onClick={() => pickerRef.current?.click()}
        />
        <input
          id={inputId}
          className="color-hex"
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
        />
        <input
          ref={pickerRef}
          type="color"
          value={value}
          style={{ display: 'none' }}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
        />
      </div>
    </div>
  );
}
