import { CheckboxControl } from '../CheckboxControl';
import { GlitchModeSelector } from '../GlitchModeSelector';
import { KnobControl } from '../KnobControl';
import { TextureLayer } from '../TextureLayer';
import { SliderControl } from '../SliderControl';
import { PauseIcon, PlayIcon } from '../icons/AppIcons';
import type { GlitchMode, EditorState } from '../../types/editor';

interface GlitchyPanelProps {
  state: EditorState;
  isActive: boolean;
  onRgbShiftChange: (value: number) => void;
  onGlitchStrengthChange: (value: number) => void;
  onGlitchAmountChange: (value: number) => void;
  onGlitchModeChange: (value: GlitchMode) => void;
  onCrtChange: (value: boolean) => void;
  onScanlinesChange: (value: number) => void;
  onGlowChange: (value: number) => void;
  onVhsDistortionChange: (value: boolean) => void;
  onTogglePlaying: () => void;
  onAngleChange: (value: number) => void;
}

export function GlitchyPanel({
  state,
  isActive,
  onRgbShiftChange,
  onGlitchStrengthChange,
  onGlitchAmountChange,
  onGlitchModeChange,
  onCrtChange,
  onScanlinesChange,
  onGlowChange,
  onVhsDistortionChange,
  onTogglePlaying,
  onAngleChange,
}: GlitchyPanelProps) {
  return (
    <div className={`controls-panel${isActive ? ' panel-active' : ''}`} id="glitchyPanel">
      <TextureLayer className="panel-grain" />
      <div className="controls-left">
        <div className="widget-group">
          <SliderControl label="RGB Shift" value={state.glitchy.rgbShift} onChange={onRgbShiftChange} />
        </div>
        <div className="widget-group">
          <SliderControl label="Strength" value={state.glitchy.glitchStrength} onChange={onGlitchStrengthChange} />
        </div>
        <div className="widget-group">
          <SliderControl label="Amount" value={state.glitchy.glitchAmount} onChange={onGlitchAmountChange} />
        </div>
        <div className="widget-group">
          <span className="widget-label">Glitch Mode</span>
          <GlitchModeSelector value={state.glitchy.glitchMode} onChange={onGlitchModeChange} />
        </div>
        <div className="widget-group">
          <CheckboxControl label="CRT" checked={state.glitchy.crt} onChange={onCrtChange} />
        </div>
        <div className="widget-group">
          <SliderControl label="Scanlines" value={state.glitchy.scanlines} onChange={onScanlinesChange} />
        </div>
        <div className="widget-group">
          <SliderControl label="Glow" value={state.glitchy.glow} onChange={onGlowChange} />
        </div>
        <div className="widget-group">
          <CheckboxControl label="VHS Distortion" checked={state.glitchy.vhsDistortion} onChange={onVhsDistortionChange} />
        </div>
        <button type="button" className="btn btn-tertiary liq-play-pause-btn" onClick={onTogglePlaying}>
          {state.glitchy.playing ? <PauseIcon /> : <PlayIcon />}
          {state.glitchy.playing ? 'Pause Effect' : 'Play Effect'}
        </button>
      </div>
      <div className="panel-divider" />
      <KnobControl
        labels={{ top: '0°', left: '270°', right: '90°', bottom: '180°' }}
        value={state.glitchy.angle}
        onChange={onAngleChange}
      />
    </div>
  );
}
