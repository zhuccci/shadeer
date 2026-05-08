import { useEffect, useRef, useState } from 'react';
import { KnobControl } from '../KnobControl';
import { SliderControl } from '../SliderControl';
import type { BlurType, EditorState } from '../../types/editor';
import './BlurPanel.css';

const blurTypes: { id: BlurType; label: string }[] = [
  { id: 'gaussian', label: 'Gaussian' },
  { id: 'motion',   label: 'Motion' },
  { id: 'radial',   label: 'Radial' },
];

interface BlurPanelProps {
  state: EditorState;
  isActive: boolean;
  onTypeChange: (type: BlurType) => void;
  onStrengthChange: (strength: number) => void;
  onAngleChange: (angle: number) => void;
  onGrainChange: (grain: number) => void;
}

export function BlurPanel({ state, isActive, onTypeChange, onStrengthChange, onAngleChange, onGrainChange }: BlurPanelProps) {
  const b = state.blur;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const selected = blurTypes.find(t => t.id === b.type) ?? blurTypes[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className={`controls-panel${isActive ? ' panel-active' : ''}`} id="blurPanel">
      <div className="controls-left">
        <div ref={ref} className="selector-group">
          <span className="selector-group-label">Type</span>
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
              {blurTypes.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`dropdown-item${t.id === b.type ? ' active' : ''}`}
                  onClick={() => { onTypeChange(t.id); setOpen(false); }}
                >
                  <span className="dropdown-item-text">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <SliderControl label="Strength" min={0} max={100} value={b.strength} onChange={onStrengthChange} />
        <SliderControl label="Grain" min={0} max={100} value={b.grain} onChange={onGrainChange} />
      </div>
      {b.type === 'motion' && (
        <>
          <div className="panel-divider" />
          <KnobControl
            labels={{ top: '0°', left: '270°', right: '90°', bottom: '180°' }}
            value={b.angle}
            onChange={onAngleChange}
          />
        </>
      )}
    </div>
  );
}
