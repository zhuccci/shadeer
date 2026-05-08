import { KnobControl } from '../KnobControl';
import { SliderControl } from '../SliderControl';
import type { BlurType, EditorState } from '../../types/editor';
import './BlurPanel.css';

interface BlurPanelProps {
  state: EditorState;
  isActive: boolean;
  onTypeChange: (type: BlurType) => void;
  onStrengthChange: (strength: number) => void;
  onAngleChange: (angle: number) => void;
}

export function BlurPanel({ state, isActive, onTypeChange, onStrengthChange, onAngleChange }: BlurPanelProps) {
  const b = state.blur;
  const typeIndex = b.type === 'gaussian' ? 0 : b.type === 'motion' ? 1 : 2;
  const clipLeft = `${(typeIndex / 3) * 100}%`;
  const clipRight = `${((2 - typeIndex) / 3) * 100}%`;

  return (
    <div className={`controls-panel${isActive ? ' panel-active' : ''}`} id="blurPanel">
      <div className="controls-left">
        <div className="blur-type-group">
          <span className="widget-label">Type</span>
          <div className="dither-color-tabs">
            <button type="button" className="dither-color-tab" onClick={() => onTypeChange('gaussian')}>Gaussian</button>
            <button type="button" className="dither-color-tab" onClick={() => onTypeChange('motion')}>Motion</button>
            <button type="button" className="dither-color-tab" onClick={() => onTypeChange('radial')}>Radial</button>
            <div
              className="dither-color-tabs-overlay"
              style={{ clipPath: `inset(0 ${clipRight} 0 ${clipLeft})` }}
              aria-hidden="true"
            >
              <button type="button" className="dither-color-tab" tabIndex={-1}>Gaussian</button>
              <button type="button" className="dither-color-tab" tabIndex={-1}>Motion</button>
              <button type="button" className="dither-color-tab" tabIndex={-1}>Radial</button>
            </div>
          </div>
        </div>
        <SliderControl label="Strength" min={0} max={100} value={b.strength} onChange={onStrengthChange} />
      </div>

      {b.type === 'motion' && (
        <>
          <div className="panel-divider" />
          <div className="blur-right">
            <KnobControl labels={{ top: '0°', left: '270°', right: '90°', bottom: '180°' }} value={b.angle} onChange={onAngleChange} />
          </div>
        </>
      )}
    </div>
  );
}
