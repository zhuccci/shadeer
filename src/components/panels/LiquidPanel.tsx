import { ColorSelectorControl } from '../ColorSelectorControl';
import { SliderControl } from '../SliderControl';
import type { EditorState } from '../../types/editor';

interface LiquidPanelProps {
  state: EditorState;
  isActive: boolean;
  onHighlightColorChange: (value: string) => void;
  onTogglePlaying: () => void;
  onHighlightsChange: (value: number) => void;
  onWavesChange: (value: number) => void;
  onDistortionChange: (value: number) => void;
  onSizeChange: (value: number) => void;
  onScaleChange: (value: number) => void;
}

export function LiquidPanel({
  state,
  isActive,
  onHighlightColorChange,
  onTogglePlaying: _onTogglePlaying,
  onHighlightsChange,
  onWavesChange,
  onDistortionChange,
  onSizeChange,
  onScaleChange,
}: LiquidPanelProps) {
  return (
    <div className={`controls-panel${isActive ? ' panel-active' : ''}`} id="liquidPanel">
      <div className="liquid-main">
        <div className="controls-left">
          <SliderControl label="Highlights amount" value={state.liquid.highlights} onChange={onHighlightsChange} />
          <SliderControl label="Waves" value={state.liquid.waves} onChange={onWavesChange} />
          <SliderControl label="Distortion" value={state.liquid.distortion} onChange={onDistortionChange} />
          <SliderControl label="Size" value={state.liquid.size} onChange={onSizeChange} />
          <SliderControl label="Scale" value={state.liquid.scale} onChange={onScaleChange} />
        </div>
        <div className="panel-divider" />
        <div className="dither-right">
          <ColorSelectorControl label="Highlight" value={state.liquid.highlightColor} onChange={onHighlightColorChange} />
        </div>
      </div>
    </div>
  );
}
