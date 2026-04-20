import { CheckboxControl } from '../CheckboxControl';
import { ColorSelectorControl } from '../ColorSelectorControl';
import { DitherTypeSelector } from '../DitherTypeSelector';
import { SliderControl } from '../SliderControl';
import type { DitherType, EditorState } from '../../types/editor';

interface DitheringPanelProps {
  state: EditorState;
  isActive: boolean;
  onBackgroundColorChange: (value: string) => void;
  onFrontColorChange: (value: string) => void;
  onHighlightColorChange: (value: string) => void;
  onOriginalColorsChange: (value: boolean) => void;
  onInvertChange: (value: boolean) => void;
  onTypeChange: (value: DitherType) => void;
  onSizeChange: (value: number) => void;
  onColorStepsChange: (value: number) => void;
}

export function DitheringPanel({
  state,
  isActive,
  onBackgroundColorChange,
  onFrontColorChange,
  onHighlightColorChange,
  onOriginalColorsChange,
  onInvertChange,
  onTypeChange,
  onSizeChange,
  onColorStepsChange,
}: DitheringPanelProps) {
  return (
    <div className={`controls-panel${isActive ? ' panel-active' : ''}`} id="ditheringPanel">
      <div className="controls-left">
        <DitherTypeSelector value={state.dithering.type} onChange={onTypeChange} />
        <div className="dither-slider-section">
          <SliderControl label="Size" value={state.dithering.size} onChange={onSizeChange} />
          <SliderControl label="Color Steps" min={1} max={7} value={state.dithering.colorSteps} onChange={onColorStepsChange} />
        </div>
      </div>
      <div className="panel-divider" />
      <div className="dither-right">
        <div className="widget-group" style={{ gap: '24px' }}>
          <ColorSelectorControl label="Background Color" value={state.dithering.backgroundColor} onChange={onBackgroundColorChange} />
          <ColorSelectorControl label="Front Color" value={state.dithering.frontColor} onChange={onFrontColorChange} />
          <ColorSelectorControl label="Highlight" value={state.dithering.highlightColor} onChange={onHighlightColorChange} />
        </div>
        <CheckboxControl label="Original Colors" checked={state.dithering.originalColors} onChange={onOriginalColorsChange} />
        <CheckboxControl label="Invert" checked={state.dithering.invert} onChange={onInvertChange} />
      </div>
    </div>
  );
}
