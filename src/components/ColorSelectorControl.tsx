import { useId, useRef, useState } from 'react';
import { ColorPicker } from './ColorPicker';
import './ColorSelectorControl.css';

interface ColorSelectorControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onMobileOpen?: (label: string, value: string, onChange: (v: string) => void) => void;
}

export function ColorSelectorControl({ label, value, onChange, onMobileOpen }: ColorSelectorControlProps) {
  const inputId   = useId();
  const swatchRef = useRef<HTMLButtonElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  function handleSwatchClick() {
    if (onMobileOpen) {
      onMobileOpen(label, value, onChange);
      return;
    }
    if (pickerOpen) {
      setPickerOpen(false);
    } else {
      const rect = swatchRef.current?.getBoundingClientRect();
      if (rect) {
        setAnchorRect(rect);
        setPickerOpen(true);
      }
    }
  }

  return (
    <div className="color-selector">
      <label className="color-label" htmlFor={inputId}>{label}</label>
      <div className="color-row">
        <button
          ref={swatchRef}
          type="button"
          className="color-swatch"
          style={{ background: value }}
          aria-label={`Choose ${label}`}
          onClick={handleSwatchClick}
        />
        <input
          id={inputId}
          className="color-hex"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
        />
      </div>
      {pickerOpen && anchorRect && (
        <ColorPicker
          value={value}
          anchorRect={anchorRect}
          onClose={() => setPickerOpen(false)}
          onChange={onChange}
        />
      )}
    </div>
  );
}
