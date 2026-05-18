import { useState, useEffect, useRef } from 'react';
import type React from 'react';
import { CheckboxControl } from '../CheckboxControl';
import { ColorSelectorControl } from '../ColorSelectorControl';
import { DitherTypeSelector } from '../DitherTypeSelector';
import { SliderControl } from '../SliderControl';
import type { DitherType, EditorState } from '../../types/editor';
import './DitheringPanel.css';

export interface DitheringPreset {
  label: string;
  shadow: string;
  front: string;
  light: string;
  highlight: string;
}

export type DitherPreset = DitheringPreset;

export const DITHER_PRESETS: DitheringPreset[] = [
  { label: 'Mono',    shadow: '#1A1A1A', front: '#555555', light: '#AAAAAA', highlight: '#F0F0F0' },
  { label: 'Flame',   shadow: '#0D0000', front: '#8B0000', light: '#FF4500', highlight: '#FFD700' },
  { label: 'Ocean',   shadow: '#000D1A', front: '#003B7A', light: '#0090CC', highlight: '#7ADCFF' },
  { label: 'Neon',    shadow: '#0A0014', front: '#7700FF', light: '#FF00AA', highlight: '#FFEE00' },
  { label: 'Gameboy', shadow: '#0F380F', front: '#306230', light: '#8BAC0F', highlight: '#E0F8CF' },
  { label: 'Dusk',    shadow: '#0D0020', front: '#6B1A8A', light: '#E0509A', highlight: '#FFD6E0' },
];

export function ditherSwatchStyle(_p: DitheringPreset): React.CSSProperties { return {}; }

export function DitherSwatch({ p }: { p: DitheringPreset }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      if (!W || !H) return;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const colors = [p.shadow, p.front, p.light, p.highlight];

      for (let i = 0; i < 4; i++) {
        const x0 = Math.round(i * W / 4);
        const w = Math.round((i + 1) * W / 4) - x0;
        ctx.fillStyle = colors[i];
        ctx.fillRect(x0, 0, w, H);
      }
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [p.shadow, p.front, p.light, p.highlight]);

  return <canvas ref={canvasRef} className="dither-preset-swatch" />;
}

function isPresetActive(p: DitheringPreset, d: EditorState['dithering']) {
  return p.shadow === d.shadowColor && p.front === d.frontColor &&
         p.light === d.lightColor && p.highlight === d.highlightColor;
}

interface DitheringPanelProps {
  state: EditorState;
  isActive: boolean;
  onShadowColorChange: (value: string) => void;
  onFrontColorChange: (value: string) => void;
  onLightColorChange: (value: string) => void;
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
  onShadowColorChange,
  onFrontColorChange,
  onLightColorChange,
  onHighlightColorChange,
  onOriginalColorsChange,
  onInvertChange,
  onTypeChange,
  onSizeChange,
  onColorStepsChange,
}: DitheringPanelProps) {
  const [colorTab, setColorTab] = useState<'custom' | 'presets'>('custom');
  const d = state.dithering;

  function applyPreset(p: DitheringPreset) {
    onShadowColorChange(p.shadow);
    onFrontColorChange(p.front);
    onLightColorChange(p.light);
    onHighlightColorChange(p.highlight);
  }

  return (
    <div className={`controls-panel${isActive ? ' panel-active' : ''}`} id="ditheringPanel">
      <div className="controls-left">
        <DitherTypeSelector value={d.type} onChange={onTypeChange} />
        <div className="dither-slider-section">
          <SliderControl label="Size" value={d.size} onChange={onSizeChange} />
          <SliderControl label="Color Steps" min={1} max={7} value={d.colorSteps} onChange={onColorStepsChange} />
        </div>
      </div>
      <div className="panel-divider" />
      <div className="dither-right">
        <CheckboxControl label="Original Colors" checked={d.originalColors} onChange={onOriginalColorsChange} />
        {!d.originalColors && (
          <>
            <div className="dither-color-tabs">
              <button type="button" className="dither-color-tab" onClick={() => setColorTab('custom')}>Custom</button>
              <button type="button" className="dither-color-tab" onClick={() => setColorTab('presets')}>Presets</button>
              <div
                className="dither-color-tabs-overlay"
                style={{ clipPath: colorTab === 'custom' ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)' }}
                aria-hidden="true"
              >
                <button type="button" className="dither-color-tab" tabIndex={-1}>Custom</button>
                <button type="button" className="dither-color-tab" tabIndex={-1}>Presets</button>
              </div>
            </div>
            {colorTab === 'custom' && (
              <div className="widget-group" style={{ gap: '24px' }}>
                <ColorSelectorControl label="Shadow" value={d.shadowColor} onChange={onShadowColorChange} />
                <ColorSelectorControl label="Front" value={d.frontColor} onChange={onFrontColorChange} />
                <ColorSelectorControl label="Light" value={d.lightColor} onChange={onLightColorChange} />
                <ColorSelectorControl label="Highlight" value={d.highlightColor} onChange={onHighlightColorChange} />
              </div>
            )}
            {colorTab === 'presets' && (
              <div className="dither-preset-list">
                {DITHER_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    className={`dither-preset-item${isPresetActive(p, d) ? ' selected' : ''}`}
                    onClick={() => applyPreset(p)}
                  >
                    <span className="dither-preset-label">{p.label}</span>
                    <DitherSwatch p={p} />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        <CheckboxControl label="Invert" checked={d.invert} onChange={onInvertChange} />
      </div>
    </div>
  );
}
