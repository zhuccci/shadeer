import './GlitchyPanel.css';
import { CheckboxControl } from '../CheckboxControl';
import { GlitchFormSelector } from '../GlitchFormSelector';
import { GlitchModeSelector } from '../GlitchModeSelector';
import { TextureLayer } from '../TextureLayer';
import { SliderControl } from '../SliderControl';
import { PauseIcon, PlayIcon } from '../icons/AppIcons';
import type { GlitchMode, GlitchFormMode, EditorState } from '../../types/editor';

interface GlitchyPanelProps {
  state: EditorState;
  isActive: boolean;
  onGlitchStrengthChange: (value: number) => void;
  onGlitchAmountChange: (value: number) => void;
  onGlitchModeChange: (value: GlitchMode) => void;
  onGlitchFormChange: (value: GlitchFormMode) => void;
  onCrtChange: (value: boolean) => void;
  onScanlinesChange: (value: number) => void;
  onVhsDistortionChange: (value: boolean) => void;
  onVhsWaveStrengthChange: (value: number) => void;
  onVhsBandOpacityChange: (value: number) => void;
  onVhsNoiseLevelChange: (value: number) => void;
  onVhsBandHeightChange: (value: number) => void;
  onTogglePlaying: () => void;
}

export function GlitchyPanel({
  state,
  isActive,
  onGlitchStrengthChange,
  onGlitchAmountChange,
  onGlitchModeChange,
  onGlitchFormChange,
  onCrtChange,
  onScanlinesChange,
  onVhsDistortionChange,
  onVhsWaveStrengthChange,
  onVhsBandOpacityChange,
  onVhsNoiseLevelChange,
  onVhsBandHeightChange,
  onTogglePlaying,
}: GlitchyPanelProps) {
  return (
    <div className={`controls-panel${isActive ? ' panel-active' : ''}`} id="glitchyPanel">
      <TextureLayer className="panel-grain" />

      <div className="glitchy-top">
        <div className="glitchy-left">
          <span className="glitchy-section-label">Glitch Mode</span>
          <GlitchFormSelector value={state.glitchy.glitchForm} onChange={onGlitchFormChange} />
        </div>
        <div className="glitchy-col-divider" />
        <div className="glitchy-right">
          <GlitchModeSelector label="Glitch Form" value={state.glitchy.glitchMode} onChange={onGlitchModeChange} />
          <SliderControl label="Glitch Strength" value={state.glitchy.glitchStrength} onChange={onGlitchStrengthChange} />
          <SliderControl label="Glitch Amount" value={state.glitchy.glitchAmount} onChange={onGlitchAmountChange} />
        </div>
      </div>

      <div className="glitchy-row-divider" />

      <div className="glitchy-scroll-area">
        <div className="glitchy-section">
          <CheckboxControl label="CRT" checked={state.glitchy.crt} onChange={onCrtChange} />
          <div className={`glitchy-collapsible${state.glitchy.crt ? ' expanded' : ''}`}>
            <div className="glitchy-collapsible-inner">
              <SliderControl label="Scanlines" value={state.glitchy.scanlines} onChange={onScanlinesChange} />
            </div>
          </div>
        </div>

        <div className="glitchy-row-divider" />

        <div className="glitchy-section">
          <CheckboxControl label="VHS Distortion" checked={state.glitchy.vhsDistortion} onChange={onVhsDistortionChange} />
          <div className={`glitchy-collapsible${state.glitchy.vhsDistortion ? ' expanded' : ''}`}>
            <div className="glitchy-collapsible-inner">
              <SliderControl label="Wave Strength" value={state.glitchy.vhsWaveStrength} onChange={onVhsWaveStrengthChange} />
              <SliderControl label="Band Opacity" value={state.glitchy.vhsBandOpacity} onChange={onVhsBandOpacityChange} />
              <SliderControl label="Band Height" value={state.glitchy.vhsBandHeight} onChange={onVhsBandHeightChange} />
              <SliderControl label="Noise Amount" value={state.glitchy.vhsNoiseLevel} onChange={onVhsNoiseLevelChange} />
            </div>
          </div>
        </div>
      </div>

      <button type="button" className="btn btn-tertiary glitchy-play-btn" onClick={onTogglePlaying}>
        {state.glitchy.playing ? <PauseIcon /> : <PlayIcon />}
        {state.glitchy.playing ? 'Pause Effect' : 'Play Effect'}
      </button>
    </div>
  );
}
