import { CheckboxControl } from '../CheckboxControl';
import { ColorSelectorControl } from '../ColorSelectorControl';
import { SliderControl } from '../SliderControl';
import { TextureLayer } from '../TextureLayer';
import type { EditorState } from '../../types/editor';
import './HalftonePanel.css';

interface HalftonePanelProps {
  state: EditorState;
  isActive: boolean;
  onScaleChange: (value: number) => void;
  onBlackAndWhiteChange: (value: boolean) => void;
  onBackgroundColorChange: (value: string) => void;
  onColor1Change: (value: string) => void;
  onColor2Change: (value: string) => void;
  onColor3Change: (value: string) => void;
  onColor4Change: (value: string) => void;
  onGrainOverlayChange: (value: number) => void;
}

export function HalftonePanel({
  state,
  isActive,
  onScaleChange,
  onBlackAndWhiteChange,
  onBackgroundColorChange,
  onColor1Change,
  onColor2Change,
  onColor3Change,
  onColor4Change,
  onGrainOverlayChange,
}: HalftonePanelProps) {
  const bw = state.halftone.blackAndWhite;

  return (
    <div className={`controls-panel${isActive ? ' panel-active' : ''}`} id="halftonePanel">
      <TextureLayer className="panel-grain" />
      <div className="controls-left">
        <ColorSelectorControl label="Background" value={state.halftone.backgroundColor} onChange={onBackgroundColorChange} />
        <div className={`halftone-colors${bw ? ' halftone-colors--disabled' : ''}`}>
          <ColorSelectorControl label="Light" value={state.halftone.color1} onChange={onColor1Change} />
          <ColorSelectorControl label="Mid-Light" value={state.halftone.color2} onChange={onColor2Change} />
          <ColorSelectorControl label="Mid-Dark" value={state.halftone.color3} onChange={onColor3Change} />
          <ColorSelectorControl label="Dark" value={state.halftone.color4} onChange={onColor4Change} />
        </div>
      </div>
      <div className="panel-divider" />
      <div className="halftone-right">
        <CheckboxControl label="Black & White" checked={bw} onChange={onBlackAndWhiteChange} />
        <SliderControl label="Scale" min={0} max={100} value={state.halftone.scale} onChange={onScaleChange} />
        <SliderControl label="Grain" value={state.halftone.grainOverlay} onChange={onGrainOverlayChange} />
      </div>
    </div>
  );
}
