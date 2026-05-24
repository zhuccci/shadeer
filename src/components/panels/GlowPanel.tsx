import { useEffect, useRef, useState } from 'react';
import { ColorSelectorControl } from '../ColorSelectorControl';
import { SliderControl } from '../SliderControl';
import type { GlowStyle, EditorState } from '../../types/editor';
import './GlowPanel.css';

const glowStyles: { id: GlowStyle; label: string }[] = [
  { id: 'bloom',   label: 'Bloom'   },
  { id: 'streaks', label: 'Streaks' },
];

interface GlowPanelProps {
  state: EditorState;
  isActive: boolean;
  onStyleChange: (style: GlowStyle) => void;
  onIntensityChange: (value: number) => void;
  onThresholdChange: (value: number) => void;
  onOpacityChange: (value: number) => void;
  onUseTintChange: (value: boolean) => void;
  onTintColorChange: (value: string) => void;
}

export function GlowPanel({
  state,
  isActive,
  onStyleChange,
  onIntensityChange,
  onThresholdChange,
  onOpacityChange,
  onUseTintChange,
  onTintColorChange,
}: GlowPanelProps) {
  const g = state.glow;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const selected = glowStyles.find(s => s.id === g.style) ?? glowStyles[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className={`controls-panel${isActive ? ' panel-active' : ''}`} id="glowPanel">
      <div ref={ref} className="selector-group">
        <span className="selector-group-label">Style</span>
        <div className={`selector${open ? ' open' : ''}`}>
          <button type="button" className="selector-trigger" onClick={() => setOpen(o => !o)}>
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
            {glowStyles.map(s => (
              <button
                key={s.id}
                type="button"
                className={`dropdown-item${s.id === g.style ? ' active' : ''}`}
                onClick={() => { onStyleChange(s.id); setOpen(false); }}
              >
                <span className="dropdown-item-text">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="controls-left">
        <SliderControl label="Intensity" min={0} max={100} value={g.intensity}  onChange={onIntensityChange} />
        <SliderControl label="Threshold" min={0} max={100} value={g.threshold} onChange={onThresholdChange} />
        <SliderControl label="Opacity"   min={0} max={100} value={g.opacity}   onChange={onOpacityChange} />
      </div>

      <div className="glow-color-section">
        <span className="glow-color-label">Color</span>
        <div className="glow-color-mode">
          <button
            type="button"
            className={`glow-mode-btn${!g.useTint ? ' active' : ''}`}
            onClick={() => onUseTintChange(false)}
          >Image</button>
          <button
            type="button"
            className={`glow-mode-btn${g.useTint ? ' active' : ''}`}
            onClick={() => onUseTintChange(true)}
          >Tint</button>
        </div>
        {g.useTint && (
          <ColorSelectorControl label="Tint" value={g.tintColor} onChange={onTintColorChange} panelActive={isActive} />
        )}
      </div>
    </div>
  );
}
