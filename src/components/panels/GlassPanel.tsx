import { ShapeSelector } from '../ShapeSelector';
import { SliderControl } from '../SliderControl';
import { KnobControl } from '../KnobControl';
import { TextureLayer } from '../TextureLayer';
import type { EditorState } from '../../types/editor';

interface GlassPanelProps {
  state: EditorState;
  isActive: boolean;
  onSizeChange: (size: number) => void;
  onGrainChange: (grain: number) => void;
  onAngleChange: (angle: number) => void;
  onShapeChange: (shape: EditorState['glass']['shape']) => void;
}

export function GlassPanel({
  state,
  isActive,
  onSizeChange,
  onGrainChange,
  onAngleChange,
  onShapeChange,
}: GlassPanelProps) {
  return (
    <div className={`controls-panel${isActive ? ' panel-active' : ''}`} id="glassPanel">
      <TextureLayer className="panel-grain" />
      <div className="controls-left">
        <div className="widget-group">
          <div className="input-row">
            <span className="widget-label">Shape</span>
            <ShapeSelector value={state.glass.shape} onChange={onShapeChange} />
          </div>
        </div>
        <div className="widget-group">
          <SliderControl label="Size" value={state.glass.size} onChange={onSizeChange} />
        </div>
        <div className="widget-group">
          <SliderControl label="Grain" value={state.glass.grain} onChange={onGrainChange} />
        </div>
      </div>
      <div className="panel-divider" />
      <KnobControl
        labels={{ top: '0°', left: '135°', right: '45°', bottom: '90°' }}
        value={state.glass.angle}
        onChange={onAngleChange}
      />
    </div>
  );
}
