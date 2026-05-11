import { CheckboxControl } from '../CheckboxControl';
import { ColorSelectorControl } from '../ColorSelectorControl';
import { HalftonePatternSelector } from '../HalftonePatternSelector';
import { KnobControl } from '../KnobControl';
import { SliderControl } from '../SliderControl';
import type { EditorState, HalftonePattern } from '../../types/editor';
import './HalftonePanel.css';

interface HalftonePanelProps {
  state: EditorState;
  isActive: boolean;
  onPatternChange: (value: HalftonePattern) => void;
  onAngleChange: (value: number) => void;
  onScaleChange: (value: number) => void;
  onRadiusChange: (value: number) => void;
  onContrastChange: (value: number) => void;
  onShadowRangeChange: (value: number) => void;
  onShadowInvertChange: (value: boolean) => void;
  onBlackAndWhiteChange: (value: boolean) => void;
  onOriginalColorsChange: (value: boolean) => void;
  onInvertChange: (value: boolean) => void;
  onBackgroundColorChange: (value: string) => void;
  onColor1Change: (value: string) => void;
  onColor2Change: (value: string) => void;
  onColor3Change: (value: string) => void;
  onColor4Change: (value: string) => void;
}

export function HalftonePanel({
  state,
  isActive,
  onPatternChange,
  onAngleChange,
  onScaleChange,
  onRadiusChange,
  onContrastChange,
  onShadowRangeChange,
  onShadowInvertChange,
  onBlackAndWhiteChange,
  onOriginalColorsChange,
  onInvertChange,
  onBackgroundColorChange,
  onColor1Change,
  onColor2Change,
  onColor3Change,
  onColor4Change,
}: HalftonePanelProps) {
  const bw = state.halftone.blackAndWhite;

  return (
    <div className={`controls-panel${isActive ? ' panel-active' : ''}`} id="halftonePanel">
      <div className="halftone-scroll">
      <div className="controls-left">
        <HalftonePatternSelector label="Pattern" value={state.halftone.pattern} onChange={onPatternChange} />
        <SliderControl label="Scale" min={0} max={100} value={state.halftone.scale} onChange={onScaleChange} />
        <SliderControl label="Radius" min={0} max={100} value={state.halftone.radius} onChange={onRadiusChange} />
        <SliderControl label="Contrast" min={0} max={100} value={state.halftone.contrast} onChange={onContrastChange} />
        <SliderControl label="Shadows" min={0} max={100} value={state.halftone.shadowRange} onChange={onShadowRangeChange} />
        <CheckboxControl label="Invert Shadows" checked={state.halftone.shadowInvert} onChange={onShadowInvertChange} />
      </div>
      <div className="panel-divider" />
      <div className="halftone-right">
        <KnobControl
          labels={{ top: '0°', left: '270°', right: '90°', bottom: '180°' }}
          value={state.halftone.angle}
          onChange={onAngleChange}
        />
        <div className="paper-divider-h" />
        <ColorSelectorControl label="Background" value={state.halftone.backgroundColor} onChange={onBackgroundColorChange} />
        <CheckboxControl label="Original Colors" checked={state.halftone.originalColors} onChange={onOriginalColorsChange} />

        <div className={`ht-section${state.halftone.originalColors ? ' ht-hidden' : ''}`}>
          <div className="ht-section-inner">
            <div className="dither-color-tabs">
              <button type="button" className="dither-color-tab" onClick={() => onBlackAndWhiteChange(true)}>Single Color</button>
              <button type="button" className="dither-color-tab" onClick={() => onBlackAndWhiteChange(false)}>4 Colors</button>
              <div
                className="dither-color-tabs-overlay"
                style={{ clipPath: bw ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)' }}
                aria-hidden="true"
              >
                <button type="button" className="dither-color-tab" tabIndex={-1}>Single Color</button>
                <button type="button" className="dither-color-tab" tabIndex={-1}>4 Colors</button>
              </div>
            </div>
            <ColorSelectorControl label={bw ? 'Color' : 'Light'} value={state.halftone.color1} onChange={onColor1Change} />
            <div className={`ht-extra${bw ? ' ht-hidden' : ''}`}>
              <div className="ht-extra-inner">
                <ColorSelectorControl label="Mid-Light" value={state.halftone.color2} onChange={onColor2Change} />
                <ColorSelectorControl label="Mid-Dark" value={state.halftone.color3} onChange={onColor3Change} />
                <ColorSelectorControl label="Dark" value={state.halftone.color4} onChange={onColor4Change} />
              </div>
            </div>
          </div>
        </div>

        <CheckboxControl label="Invert" checked={state.halftone.invert} onChange={onInvertChange} />
      </div>
      </div>
    </div>
  );
}
