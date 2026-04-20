import { SliderControl } from '../SliderControl';
import type { EditorState, HeatmapPalette } from '../../types/editor';
import './HeatmapPanel.css';

interface HeatmapPanelProps {
  state: EditorState;
  isActive: boolean;
  onPaletteChange: (value: HeatmapPalette) => void;
  onIntensityChange: (value: number) => void;
  onBlendChange: (value: number) => void;
  onGrainChange: (value: number) => void;
}

const PALETTES: { id: HeatmapPalette; label: string; gradient: string }[] = [
  { id: 'thermal', label: 'Thermal', gradient: 'linear-gradient(to right, #000, #0000ff, #00ffff, #ffff00, #ff0000, #fff)' },
  { id: 'inferno', label: 'Inferno', gradient: 'linear-gradient(to right, #000, #5a00a6, #e55a00, #f9f233)' },
  { id: 'ice',     label: 'Ice',     gradient: 'linear-gradient(to right, #000026, #004de5, #00ccff, #ccffff)' },
  { id: 'acid',    label: 'Acid',    gradient: 'linear-gradient(to right, #0d001a, #00b31a, #b3ff00)' },
  { id: 'sunset',  label: 'Sunset',  gradient: 'linear-gradient(to right, #0d0020, #9c1b5a, #f0622a, #fce5a3)' },
];

export function HeatmapPanel({
  state,
  isActive,
  onPaletteChange,
  onIntensityChange,
  onBlendChange,
  onGrainChange,
}: HeatmapPanelProps) {
  return (
    <div className={`controls-panel${isActive ? ' panel-active' : ''}`} id="heatmapPanel">
      <div className="controls-left">
        <div className="selector-group">
          <span className="selector-group-label">Palette</span>
          <div className="heatmap-palette-grid">
            {PALETTES.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`heatmap-palette-btn${state.heatmap.palette === p.id ? ' selected' : ''}`}
                onClick={() => onPaletteChange(p.id)}
                title={p.label}
              >
                <span className="heatmap-palette-swatch" style={{ background: p.gradient }} />
                <span className="heatmap-palette-label">{p.label}</span>
              </button>
            ))}
          </div>
        </div>
        <SliderControl label="Intensity" value={state.heatmap.intensity} onChange={onIntensityChange} />
        <SliderControl label="Blend" value={state.heatmap.blend} onChange={onBlendChange} />
        <SliderControl label="Grain" value={state.heatmap.grain} onChange={onGrainChange} />
      </div>
    </div>
  );
}
