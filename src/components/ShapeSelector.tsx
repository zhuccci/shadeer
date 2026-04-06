import { useRef, useState } from 'react';
import type { GlassShape } from '../types/editor';
import './ShapeSelector.css';

const shapeOptions: Array<{ value: GlassShape; label: string }> = [
  { value: 'lines', label: 'Lines' },
  { value: 'wave', label: 'Wave' },
  { value: 'zigzag', label: 'Zigzag' },
  { value: 'circles', label: 'Circles' },
];

function ShapeIcon({ value }: { value: GlassShape }) {
  if (value === 'wave') {
    return (
      <svg className="option-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.75 12C4.91667 9 7.08333 9 9.25 12C11.4167 15 13.5833 15 15.75 12C17.9167 9 20.0833 9 22.25 12" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (value === 'zigzag') {
    return (
      <svg className="option-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.75 15.25L7 8.75L11.25 15.25L15.5 8.75L19.75 15.25" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (value === 'circles') {
    return (
      <svg className="option-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8.25" stroke="black" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="3.25" stroke="black" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg className="option-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 5V19" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 5V19" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 5V19" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 5V19" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface ShapeSelectorProps {
  value: GlassShape;
  onChange: (value: GlassShape) => void;
}

export function ShapeSelector({ value, onChange }: ShapeSelectorProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const selected = shapeOptions.find((option) => option.value === value) ?? shapeOptions[0];

  return (
    <div
      ref={rootRef}
      className={`selector${isOpen ? ' open' : ''}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="selector-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <div className="selector-left">
          <ShapeIcon value={selected.value} />
          <span className="option-text">{selected.label}</span>
        </div>
        <svg className="chevron" viewBox="-7 -8 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.81403 0C0.289441 0 -0.552607 1.87637 0.408795 3.13143L3.59479 7.29054C4.31932 8.23649 5.68061 8.23649 6.40529 7.29054L9.59123 3.13143C10.5526 1.87637 9.71058 0 8.18591 0H1.81403Z" fill="#C7C7C7" />
        </svg>
      </button>
      <div className="dropdown" role="listbox" aria-label="Shape">
        {shapeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`dropdown-item${option.value === value ? ' active' : ''}`}
            role="option"
            aria-selected={option.value === value}
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
          >
            <ShapeIcon value={option.value} />
            <span className="dropdown-item-text">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
