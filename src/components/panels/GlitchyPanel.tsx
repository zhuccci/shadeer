import { CheckboxControl } from '../CheckboxControl';
import { KnobControl } from '../KnobControl';
import { TextureLayer } from '../TextureLayer';
import { SliderControl } from '../SliderControl';
import type { EditorState } from '../../types/editor';

interface GlitchyPanelProps {
  state: EditorState;
  isActive: boolean;
  onRgbShiftChange: (value: number) => void;
  onCrtChange: (value: number) => void;
  onGlowChange: (value: number) => void;
  onScanlinesChange: (value: number) => void;
  onInvertGlitchChange: (value: number) => void;
  onTvDistortionChange: (value: boolean) => void;
  onAngleChange: (value: number) => void;
}

export function GlitchyPanel({
  state,
  isActive,
  onRgbShiftChange,
  onCrtChange,
  onGlowChange,
  onScanlinesChange,
  onInvertGlitchChange,
  onTvDistortionChange,
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
          <SliderControl label="CRT" value={state.glitchy.crt} onChange={onCrtChange} />
        </div>
        <div className="widget-group">
          <SliderControl label="Glow" value={state.glitchy.glow} onChange={onGlowChange} />
        </div>
        <div className="widget-group">
          <SliderControl label="Scanlines" value={state.glitchy.scanlines} onChange={onScanlinesChange} />
        </div>
        <div className="widget-group">
          <SliderControl label="Invert Glitch" value={state.glitchy.invertGlitch} onChange={onInvertGlitchChange} />
        </div>
        <div className="widget-group">
          <CheckboxControl label="TV Distortion" checked={state.glitchy.tvDistortion} onChange={onTvDistortionChange} />
        </div>
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
