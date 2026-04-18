import { CheckboxControl } from '../CheckboxControl';
import { ScanSelector } from '../ScanSelector';
import { SliderControl } from '../SliderControl';
import { TextureLayer } from '../TextureLayer';
import type { EditorState } from '../../types/editor';

interface PaperPanelProps {
  state: EditorState;
  isActive: boolean;
  onNoiseChange: (value: number) => void;
  onInkBleedChange: (value: number) => void;
  onXeroxChange: (value: boolean) => void;
  onXeroxOpacityChange: (value: number) => void;
  onScanTextureChange: (value: number) => void;
  onScanOpacityChange: (value: number) => void;
}

export function PaperPanel({
  state,
  isActive,
  onNoiseChange,
  onInkBleedChange,
  onXeroxChange,
  onXeroxOpacityChange,
  onScanTextureChange,
  onScanOpacityChange,
}: PaperPanelProps) {
  return (
    <div className={`controls-panel${isActive ? ' panel-active' : ''}`} id="paperPanel">
      <TextureLayer className="panel-grain" />
      <div className="controls-left">
        <SliderControl label="Noise" value={state.paper.noise} onChange={onNoiseChange} />
        <SliderControl label="Ink Bleed" value={state.paper.inkBleed} onChange={onInkBleedChange} />
        <CheckboxControl label="Xerox Effect" checked={state.paper.xerox} onChange={onXeroxChange} />
        <SliderControl label="Xerox Opacity" value={state.paper.xeroxOpacity} onChange={onXeroxOpacityChange} />
        <ScanSelector label="Scan" value={state.paper.scanTexture} onChange={onScanTextureChange} />
        <SliderControl label="Scan Opacity" value={state.paper.scanOpacity} onChange={onScanOpacityChange} />
      </div>
    </div>
  );
}
