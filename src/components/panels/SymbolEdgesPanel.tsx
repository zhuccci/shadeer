import { CheckboxControl } from '../CheckboxControl';
import { ColorSelectorControl } from '../ColorSelectorControl';
import { SliderControl } from '../SliderControl';
import type { EditorState, SymbolEdgesMode } from '../../types/editor';
import './SymbolEdgesPanel.css';

interface SymbolEdgesPanelProps {
  state: EditorState;
  isActive: boolean;
  onModeChange: (value: SymbolEdgesMode) => void;
  onSymbolsChange: (value: string) => void;
  onSymbolColorChange: (value: string) => void;
  onThresholdChange: (value: number) => void;
  onGlowChange: (value: number) => void;
  onCellSizeChange: (value: number) => void;
  onTargetColorChange: (value: string) => void;
  onInvertChange: (value: boolean) => void;
  onHideImageChange: (value: boolean) => void;
}

export function SymbolEdgesPanel({
  state,
  isActive,
  onModeChange,
  onSymbolsChange,
  onSymbolColorChange,
  onThresholdChange,
  onGlowChange,
  onCellSizeChange,
  onTargetColorChange,
  onInvertChange,
  onHideImageChange,
}: SymbolEdgesPanelProps) {
  const se = state.symbolEdges;
  const isColorMode = se.mode === 'color';

  return (
    <div className={`controls-panel${isActive ? ' panel-active' : ''}`} id="symbolEdgesPanel">
      <div className="controls-left">
        <div className="se-symbols-row">
          <span className="widget-label">Symbols</span>
          <input
            className="se-symbols-input"
            type="text"
            value={se.symbols}
            onChange={(e) => onSymbolsChange(e.target.value)}
            maxLength={32}
            spellCheck={false}
          />
        </div>
        <SliderControl label="Size" min={0} max={100} value={se.cellSize} onChange={onCellSizeChange} />
        <SliderControl label="Threshold" min={0} max={100} value={se.threshold} onChange={onThresholdChange} />
        <SliderControl label="Glow" min={0} max={100} value={se.glow} onChange={onGlowChange} />
        <CheckboxControl label="Hide image" checked={se.hideImage} onChange={onHideImageChange} />
      </div>

      <div className="panel-divider" />

      <div className="se-right">
        <ColorSelectorControl label="Symbol Color" value={se.symbolColor} onChange={onSymbolColorChange} />
        <CheckboxControl
          label="Matching color"
          checked={isColorMode}
          onChange={(v) => onModeChange(v ? 'color' : 'edges')}
        />
        <div className={`ht-section${isColorMode ? '' : ' ht-hidden'}`}>
          <div className="ht-section-inner">
            <ColorSelectorControl label="Color to Match" value={se.targetColor} onChange={onTargetColorChange} />
          </div>
        </div>
        <CheckboxControl label="Invert" checked={se.invert} onChange={onInvertChange} />
      </div>
    </div>
  );
}
