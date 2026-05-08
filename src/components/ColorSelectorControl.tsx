import { useEffect, useId, useRef, useState } from 'react';
import { ColorPicker } from './ColorPicker';
import './ColorSelectorControl.css';

interface ColorSelectorControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onMobileOpen?: (label: string, value: string, onChange: (v: string) => void, swatchRect: DOMRect) => void;
}

export function ColorSelectorControl({ label, value, onChange, onMobileOpen }: ColorSelectorControlProps) {
  const inputId   = useId();
  const swatchRef = useRef<HTMLButtonElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [localHex, setLocalHex] = useState(() => value.replace('#', '').toUpperCase());
  const isFocused = useRef(false);

  // Sync from parent (e.g. picker updated the color) only while not editing
  useEffect(() => {
    if (!isFocused.current) {
      setLocalHex(value.replace('#', '').toUpperCase());
    }
  }, [value]);

  function handleSwatchClick() {
    if (onMobileOpen) {
      const rect = swatchRef.current?.getBoundingClientRect() ?? new DOMRect();
      onMobileOpen(label, value, onChange, rect);
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

  function handleHexChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 6);
    setLocalHex(digits);
    if (digits.length === 6) onChange('#' + digits);
  }

  function handleHexPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 6);
    setLocalHex(digits);
    if (digits.length === 6) onChange('#' + digits);
  }

  function handleBlur() {
    isFocused.current = false;
    // Revert display to the last committed valid value if editing was incomplete
    setLocalHex(value.replace('#', '').toUpperCase());
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
          value={'#' + localHex}
          maxLength={7}
          onChange={handleHexChange}
          onPaste={handleHexPaste}
          onFocus={() => { isFocused.current = true; }}
          onBlur={handleBlur}
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
