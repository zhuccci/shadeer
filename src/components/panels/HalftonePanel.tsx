import { CheckboxControl } from '../CheckboxControl';
import { ColorSelectorControl } from '../ColorSelectorControl';
import { HalftonePatternSelector } from '../HalftonePatternSelector';
import { KnobControl } from '../KnobControl';
import { SliderControl } from '../SliderControl';
import { TextureLayer } from '../TextureLayer';
import type { EditorState, HalftonePattern } from '../../types/editor';
import './HalftonePanel.css';

interface HalftonePanelProps {
  state: EditorState;
  isActive: boolean;
  onPatternChange: (value: HalftonePattern) => void;
  onAngleChange: (value: number) => void;
  onScaleChange: (value: number) => void;
  onContrastChange: (value: number) => void;
  onBrightnessChange: (value: number) => void;
  onBlackAndWhiteChange: (value: boolean) => void;
  onOriginalColorsChange: (value: boolean) => void;
  onInvertChange: (value: boolean) => void;
  onBackgroundColorChange: (value: string) => void;
  onColor1Change: (value: string) => void;
  onColor2Change: (value: string) => void;
  onColor3Change: (value: string) => void;
  onColor4Change: (value: string) => void;
  onGrainOverlayChange: (value: number) => void;
  onBlobThresholdChange: (value: number) => void;
}

export function HalftonePanel({
  state,
  isActive,
  onPatternChange,
  onAngleChange,
  onScaleChange,
  onContrastChange,
  onBrightnessChange,
  onBlackAndWhiteChange,
  onOriginalColorsChange,
  onInvertChange,
  onBackgroundColorChange,
  onColor1Change,
  onColor2Change,
  onColor3Change,
  onColor4Change,
  onGrainOverlayChange,
  onBlobThresholdChange,
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
        <CheckboxControl label="Black & White" checked={bw} onChange={onBlackAndWhiteChange} />
        <CheckboxControl label="Original Colors" checked={state.halftone.originalColors} onChange={onOriginalColorsChange} />
        <CheckboxControl label="Invert" checked={state.halftone.invert} onChange={onInvertChange} />
      </div>
      <div className="panel-divider" />
      <div className="halftone-right">
        {state.halftone.pattern === 'blob' && (
          <SliderControl label="Threshold" min={0} max={100} value={state.halftone.blobThreshold} onChange={onBlobThresholdChange} />
        )}
        <KnobControl
          labels={{ top: '0°', left: '270°', right: '90°', bottom: '180°' }}
          value={state.halftone.angle}
          onChange={onAngleChange}
        />
        <HalftonePatternSelector label="Pattern" value={state.halftone.pattern} onChange={onPatternChange} />
        <SliderControl label="Scale" min={0} max={100} value={state.halftone.scale} onChange={onScaleChange} />
        <SliderControl label="Contrast" min={0} max={100} value={state.halftone.contrast} onChange={onContrastChange} />
        <SliderControl label="Brightness" min={0} max={100} value={state.halftone.brightness} onChange={onBrightnessChange} />
        <SliderControl label="Grain" value={state.halftone.grainOverlay} onChange={onGrainOverlayChange} />
      </div>
    </div>
  );
}
