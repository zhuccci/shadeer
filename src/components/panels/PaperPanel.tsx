import { CheckboxControl } from '../CheckboxControl';
import { KnobControl } from '../KnobControl';
import { ScanSelector } from '../ScanSelector';
import { SliderControl } from '../SliderControl';
import type { EditorState } from '../../types/editor';

interface PaperPanelProps {
  state: EditorState;
  isActive: boolean;
  onNoiseChange: (value: number) => void;
  onDiffuseChange: (value: number) => void;
  onPaperNoiseChange: (value: number) => void;
  onInkBleedChange: (value: number) => void;
  onAngleChange: (value: number) => void;
  onXeroxChange: (value: boolean) => void;
  onXeroxAmountChange: (value: number) => void;
  onXeroxOpacityChange: (value: number) => void;
  onXeroxThresholdChange: (value: number) => void;
  onScanEnabledChange: (value: boolean) => void;
  onScanTextureChange: (value: number) => void;
  onScanOpacityChange: (value: number) => void;
  onScanScaleChange: (value: number) => void;
}

export function PaperPanel({
  state,
  isActive,
  onNoiseChange,
  onDiffuseChange,
  onPaperNoiseChange,
  onInkBleedChange,
  onAngleChange,
  onXeroxChange,
  onXeroxAmountChange,
  onXeroxOpacityChange,
  onXeroxThresholdChange,
  onScanEnabledChange,
  onScanTextureChange,
  onScanOpacityChange,
  onScanScaleChange,
}: PaperPanelProps) {
  return (
    <div className={`controls-panel${isActive ? ' panel-active' : ''}`} id="paperPanel">
      <div className="controls-left">
        <SliderControl label="Grain" value={state.paper.noise} onChange={onNoiseChange} />
        <SliderControl label="Diffuse" value={state.paper.diffuse} max={30} onChange={onDiffuseChange} />
        <SliderControl label="Dust" value={state.paper.paperNoise} onChange={onPaperNoiseChange} />
        <SliderControl label="Ink Bleed" value={state.paper.inkBleed} onChange={onInkBleedChange} />
      </div>
      <div className="panel-divider" />
      <div className="paper-right">
        <KnobControl
          labels={{ top: '0°', left: '270°', right: '90°', bottom: '180°' }}
          value={state.paper.angle}
          onChange={onAngleChange}
        />
        <div className="paper-divider-h" />
        <CheckboxControl label="Xerox" checked={state.paper.xerox} onChange={onXeroxChange} />
        {state.paper.xerox && (
          <>
            <SliderControl label="Amount" value={state.paper.xeroxAmount} onChange={onXeroxAmountChange} />
            <SliderControl label="Xerox Opacity" value={state.paper.xeroxOpacity} onChange={onXeroxOpacityChange} />
            <SliderControl label="Threshold" value={state.paper.xeroxThreshold} onChange={onXeroxThresholdChange} />
          </>
        )}
        <div className="paper-divider-h" />
        <CheckboxControl label="Scan Texture" checked={state.paper.scanEnabled} onChange={onScanEnabledChange} />
        {state.paper.scanEnabled && (
          <>
            <ScanSelector value={state.paper.scanTexture} onChange={onScanTextureChange} />
            <SliderControl label="Scan Opacity" value={state.paper.scanOpacity} onChange={onScanOpacityChange} />
            <SliderControl label="Size" value={state.paper.scanScale} onChange={onScanScaleChange} />
          </>
        )}
      </div>
    </div>
  );
}
