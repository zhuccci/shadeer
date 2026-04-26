import { useState, useRef } from 'react';
import { SliderControl } from '../SliderControl';
import { CheckboxControl } from '../CheckboxControl';
import { ColorSelectorControl } from '../ColorSelectorControl';
import { ColorPicker } from '../ColorPicker';
import type { EditorState, GradientStop, HeatmapPalette } from '../../types/editor';
import './HeatmapPanel.css';

interface HeatmapPanelProps {
  state: EditorState;
  isActive: boolean;
  onPaletteChange: (value: HeatmapPalette) => void;
  onCustomGradientChange: (value: boolean) => void;
  onCustomStopsChange: (stops: GradientStop[]) => void;
  onIntensityChange: (value: number) => void;
  onBlendChange: (value: number) => void;
  onGrainChange: (value: number) => void;
  onBlurChange: (value: number) => void;
}

const PALETTES: { id: HeatmapPalette; label: string; gradient: string }[] = [
  { id: 'thermal', label: 'Thermal', gradient: 'linear-gradient(to right, #000, #0000ff 20%, #00ffff 40%, #ffff00 60%, #ff0000 80%, #fff)' },
  { id: 'inferno', label: 'Inferno', gradient: 'linear-gradient(to right, #000, #5a00a6 33%, #e55a00 66%, #f9f233)' },
  { id: 'ice',     label: 'Ice',     gradient: 'linear-gradient(to right, #000026, #004de5 50%, #00ccff 75%, #ccffff)' },
  { id: 'acid',    label: 'Acid',    gradient: 'linear-gradient(to right, #0d001a, #00b31a 50%, #b3ff00)' },
  { id: 'sunset',  label: 'Sunset',  gradient: 'linear-gradient(to right, #0d0020, #9c1b5a 33%, #f0622a 66%, #fce5a3)' },
];

const MAX_STOPS = 6;
const DELETE_THRESHOLD = 40;

const PALETTE_STOPS: Record<string, { color: string; position: number }[]> = {
  thermal: [
    { color: '#000000', position: 0.0 },
    { color: '#0000ff', position: 0.2 },
    { color: '#00ffff', position: 0.4 },
    { color: '#ffff00', position: 0.6 },
    { color: '#ff0000', position: 0.8 },
    { color: '#ffffff', position: 1.0 },
  ],
  inferno: [
    { color: '#000000', position: 0.0 },
    { color: '#5900a6', position: 0.33 },
    { color: '#e65900', position: 0.66 },
    { color: '#faf233', position: 1.0 },
  ],
  ice: [
    { color: '#000026', position: 0.0 },
    { color: '#004de6', position: 0.5 },
    { color: '#00ccff', position: 0.75 },
    { color: '#ccffff', position: 1.0 },
  ],
  acid: [
    { color: '#0d001a', position: 0.0 },
    { color: '#00b31a', position: 0.5 },
    { color: '#b3ff00', position: 1.0 },
  ],
  sunset: [
    { color: '#0d0020', position: 0.0 },
    { color: '#9c1b5a', position: 0.33 },
    { color: '#f0622a', position: 0.66 },
    { color: '#fce5a3', position: 1.0 },
  ],
};

function lerpHex(a: string, b: string, t: number): string {
  const parse = (h: string) => {
    const s = h.replace('#', '').padEnd(6, '0');
    return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  };
  const ca = parse(a), cb = parse(b);
  return '#' + ca.map((v, i) => Math.round(v + (cb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

function interpolateColor(stops: GradientStop[], pos: number): string {
  if (!stops.length) return '#808080';
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  if (pos <= sorted[0].position) return sorted[0].color;
  if (pos >= sorted[sorted.length - 1].position) return sorted[sorted.length - 1].color;
  for (let i = 0; i < sorted.length - 1; i++) {
    const s0 = sorted[i], s1 = sorted[i + 1];
    if (pos >= s0.position && pos <= s1.position) {
      const span = s1.position - s0.position;
      return lerpHex(s0.color, s1.color, span < 0.0001 ? 0 : (pos - s0.position) / span);
    }
  }
  return '#808080';
}

export function HeatmapPanel({
  state,
  isActive,
  onPaletteChange,
  onCustomGradientChange,
  onCustomStopsChange,
  onIntensityChange,
  onBlendChange,
  onGrainChange,
  onBlurChange,
}: HeatmapPanelProps) {
  const [selectedStop, setSelectedStop] = useState(0);
  const [deletePendingIdx, setDeletePendingIdx] = useState<number | null>(null);
  const [pickerStopIdx, setPickerStopIdx] = useState<number | null>(null);
  const [pickerAnchorRect, setPickerAnchorRect] = useState<DOMRect | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const { customGradient, customStops: stops } = state.heatmap;
  const safeIdx = Math.max(0, Math.min(selectedStop, stops.length - 1));

  const cssGradient = (() => {
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    return `linear-gradient(to right, ${sorted.map(s => `${s.color} ${Math.round(s.position * 100)}%`).join(', ')})`;
  })();

  function removeStop(index: number) {
    if (stops.length <= 2) return;
    const newStops = stops.filter((_, i) => i !== index);
    onCustomStopsChange(newStops);
    setSelectedStop(Math.min(safeIdx, newStops.length - 1));
  }

  function handleBarClick(e: React.MouseEvent) {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const nearIdx = stops.findIndex(s => Math.abs(s.position - pos) < 0.05);
    if (nearIdx !== -1) { setSelectedStop(nearIdx); return; }
    if (stops.length >= MAX_STOPS) return;
    const color = interpolateColor(stops, pos);
    const newStops = [...stops, { color, position: pos }];
    onCustomStopsChange(newStops);
    setSelectedStop(newStops.length - 1);
  }

  function handleMarkerPointerDown(e: React.PointerEvent, index: number) {
    e.preventDefault();
    e.stopPropagation();
    setSelectedStop(index);
    const bar = barRef.current;
    if (!bar) return;

    const startX = e.clientX;
    const startY = e.clientY;
    let hasMoved = false;

    function onMove(ev: PointerEvent) {
      if (!hasMoved) {
        if (Math.abs(ev.clientX - startX) > 4 || Math.abs(ev.clientY - startY) > 4) {
          hasMoved = true;
        } else {
          return;
        }
      }
      const rect = bar!.getBoundingClientRect();
      const outside =
        ev.clientY < rect.top - DELETE_THRESHOLD ||
        ev.clientY > rect.bottom + DELETE_THRESHOLD;

      if (outside && stops.length > 2) {
        setDeletePendingIdx(index);
      } else {
        setDeletePendingIdx(null);
        const pos = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
        onCustomStopsChange(stops.map((s, i) => i === index ? { ...s, position: pos } : s));
      }
    }

    function onUp(ev: PointerEvent) {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      const rect = bar!.getBoundingClientRect();
      const outside =
        ev.clientY < rect.top - DELETE_THRESHOLD ||
        ev.clientY > rect.bottom + DELETE_THRESHOLD;
      if (outside && stops.length > 2) {
        removeStop(index);
      } else if (!hasMoved) {
        const markerRect = markerRefs.current[index]?.getBoundingClientRect();
        if (markerRect) {
          setPickerStopIdx(index);
          setPickerAnchorRect(markerRect);
        }
      }
      setDeletePendingIdx(null);
    }

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  return (
    <div className={`controls-panel${isActive ? ' panel-active' : ''}`} id="heatmapPanel">
      <div className="controls-left">
        <CheckboxControl
          label="Custom Gradient"
          checked={customGradient}
          onChange={(val) => {
            if (val && !customGradient) {
              const seed = PALETTE_STOPS[state.heatmap.palette];
              if (seed) onCustomStopsChange(seed);
            }
            onCustomGradientChange(val);
          }}
        />
        <div className="paper-divider-h" />
        {!customGradient && (
          <div className="heatmap-palette-list">
            {PALETTES.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`heatmap-palette-item${state.heatmap.palette === p.id ? ' selected' : ''}`}
                onClick={() => onPaletteChange(p.id)}
              >
                <span className="heatmap-palette-label">{p.label}</span>
                <span className="heatmap-palette-swatch" style={{ background: p.gradient }} />
              </button>
            ))}
          </div>
        )}
        {customGradient && (
          <div className="heatmap-gradient-editor">
            <div className="heatmap-gradient-wrap" ref={barRef} onClick={handleBarClick}>
              <div className="heatmap-gradient-bar" style={{ background: cssGradient }} />
              <div className="heatmap-gradient-track">
                {stops.map((stop, i) => (
                  <button
                    key={i}
                    ref={(el) => { markerRefs.current[i] = el; }}
                    type="button"
                    className={`heatmap-stop-marker${safeIdx === i ? ' selected' : ''}${deletePendingIdx === i ? ' delete-pending' : ''}`}
                    style={{ left: `${stop.position * 100}%`, background: stop.color }}
                    onPointerDown={(e) => handleMarkerPointerDown(e, i)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ))}
              </div>
            </div>
            <ColorSelectorControl
              label="Selected Color"
              value={stops[safeIdx]?.color ?? '#000000'}
              onChange={(color) => onCustomStopsChange(stops.map((s, i) => i === safeIdx ? { ...s, color } : s))}
            />
          </div>
        )}
      </div>
      <div className="panel-divider" />
      <div className="heatmap-right">
        <SliderControl label="Intensity" value={state.heatmap.intensity} onChange={onIntensityChange} />
        <SliderControl label="Blend" value={state.heatmap.blend} onChange={onBlendChange} />
        <SliderControl label="Blur" value={state.heatmap.blur} onChange={onBlurChange} />
        <SliderControl label="Grain" value={state.heatmap.grain} onChange={onGrainChange} />
      </div>

      {pickerStopIdx !== null && pickerAnchorRect && (
        <ColorPicker
          value={stops[pickerStopIdx]?.color ?? '#000000'}
          anchorRect={pickerAnchorRect}
          onClose={() => setPickerStopIdx(null)}
          onChange={(color) => onCustomStopsChange(stops.map((s, i) => i === pickerStopIdx ? { ...s, color } : s))}
        />
      )}
    </div>
  );
}
