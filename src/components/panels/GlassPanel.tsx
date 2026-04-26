import { ShapeSelector } from '../ShapeSelector';
import { SliderControl } from '../SliderControl';
import { KnobControl } from '../KnobControl';
import type { EditorState } from '../../types/editor';

interface GlassPanelProps {
  state: EditorState;
  isActive: boolean;
  onSizeChange: (size: number) => void;
  onGrainChange: (grain: number) => void;
  onAngleChange: (angle: number) => void;
  onShapeChange: (shape: EditorState['glass']['shape']) => void;
  onShadowChange: (shadow: number) => void;
  onDistortionChange: (distortion: number) => void;
}

export function GlassPanel({
  state,
  isActive,
  onSizeChange,
  onGrainChange,
  onAngleChange,
  onShapeChange,
  onShadowChange,
  onDistortionChange,
}: GlassPanelProps) {
  return (
    <div className={`controls-panel${isActive ? ' panel-active' : ''}`} id="glassPanel">
      <div className="controls-left">
        <ShapeSelector label="Shape" value={state.glass.shape} onChange={onShapeChange} />
        <SliderControl label="Size" value={state.glass.size} onChange={onSizeChange} />
        <SliderControl label="Distortion" value={state.glass.distortion} onChange={onDistortionChange} />
        <SliderControl label="Shadow" value={state.glass.shadow} onChange={onShadowChange} />
        <SliderControl label="Grain" value={state.glass.grain} onChange={onGrainChange} />
      </div>
      <div className="panel-divider" />
      <KnobControl
        labels={{ top: '0°', left: '270°', right: '90°', bottom: '180°' }}
        value={state.glass.angle}
        onChange={onAngleChange}
      />
    </div>
  );
}
