import { useCallback, useEffect, useRef, useState } from 'react';
import { ShaderMount } from '../../src/lib/shaders';
import { getShaderConfig, defaultEditorState } from '../../src/lib/editor';
import type { ActiveFilter, EditorState } from '../../src/types/editor';

type ImageInfo = { img: HTMLImageElement; width: number; height: number };

type PluginMsg =
  | { type: 'image-data'; bytes: number[]; width: number; height: number }
  | { type: 'no-selection' }
  | { type: 'selection-changed'; hasSelection: boolean; nodeName: string | null };

const FILTERS: { id: ActiveFilter; label: string }[] = [
  { id: 'glass', label: 'Glass' },
  { id: 'dithering', label: 'Dither' },
  { id: 'liquid', label: 'Liquid' },
  { id: 'glitchy', label: 'Glitch' },
  { id: 'halftone', label: 'Halftone' },
  { id: 'paper', label: 'Paper' },
  { id: 'heatmap', label: 'Heatmap' },
  { id: 'blur', label: 'Blur' },
];

const BASE_STATE: EditorState = {
  ...defaultEditorState,
  fitMode: 'fit',
  offsetX: 0,
  offsetY: 0,
};

async function bytesToImage(bytes: number[]): Promise<HTMLImageElement> {
  const blob = new Blob([new Uint8Array(bytes)], { type: 'image/png' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.src = url;
  await img.decode().catch(() => {});
  URL.revokeObjectURL(url);
  return img;
}

export default function App() {
  const previewRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<ShaderMount | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [nodeName, setNodeName] = useState<string | null>(null);
  const [state, setState] = useState<EditorState>(BASE_STATE);
  const [applying, setApplying] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const setFilter = (id: ActiveFilter) => setState(s => ({ ...s, activeFilter: id }));

  // Listen for messages from code.ts
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data?.pluginMessage as PluginMsg | undefined;
      if (!msg) return;

      if (msg.type === 'image-data') {
        setStatus('loading');
        bytesToImage(msg.bytes).then(img => {
          setImageInfo({ img, width: msg.width, height: msg.height });
          setStatus('ready');
        }).catch(() => setStatus('error'));
      }

      if (msg.type === 'no-selection') {
        setImageInfo(null);
        setNodeName(null);
        setStatus('idle');
      }

      if (msg.type === 'selection-changed') {
        setNodeName(msg.nodeName);
        if (msg.hasSelection) {
          setStatus('loading');
          parent.postMessage({ pluginMessage: { type: 'get-selection' } }, '*');
        } else {
          setImageInfo(null);
          setStatus('idle');
        }
      }
    };

    window.addEventListener('message', handler);
    // Ask for initial selection
    parent.postMessage({ pluginMessage: { type: 'get-selection' } }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  // Build/rebuild ShaderMount when image or active filter changes
  useEffect(() => {
    const preview = previewRef.current;
    mountRef.current?.dispose();
    mountRef.current = null;

    if (!preview || !imageInfo) return;

    try {
      const config = getShaderConfig(state, imageInfo.img);
      mountRef.current = new ShaderMount(preview, config.fragmentShader, config.uniforms, undefined, config.speed);
    } catch {
      // WebGL2 not available
    }

    return () => {
      mountRef.current?.dispose();
      mountRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageInfo, state.activeFilter]);

  // Update uniforms when settings change (without rebuilding)
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !imageInfo) return;
    const config = getShaderConfig(state, imageInfo.img);
    mount.setUniforms(config.uniforms);
  }, [state, imageInfo]);

  const handleApply = useCallback(async () => {
    if (!imageInfo || applying) return;
    setApplying(true);

    try {
      const { img, width, height } = imageInfo;
      const offscreen = document.createElement('div');
      offscreen.style.cssText = `position:fixed;left:-9999px;top:0;width:${width}px;height:${height}px;overflow:hidden;`;
      document.body.appendChild(offscreen);

      const config = getShaderConfig(state, img);
      const mount = new ShaderMount(offscreen, config.fragmentShader, config.uniforms, { preserveDrawingBuffer: true }, config.speed, 0, 1);

      await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));

      const canvas = offscreen.querySelector('canvas') as HTMLCanvasElement;
      const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/png'));
      mount.dispose();
      document.body.removeChild(offscreen);

      if (!blob) return;
      const bytes = Array.from(new Uint8Array(await blob.arrayBuffer()));
      parent.postMessage({ pluginMessage: { type: 'apply-effect', bytes, width, height } }, '*');
    } finally {
      setApplying(false);
    }
  }, [imageInfo, state, applying]);

  const activeLabel = FILTERS.find(f => f.id === state.activeFilter)?.label ?? '';

  return (
    <div className="plugin-root">
      <header className="plugin-header">
        <span className="plugin-logo">N</span>
        <span className="plugin-title">Neuroshade</span>
      </header>

      {/* Selection status */}
      <div className="plugin-selection">
        {nodeName ? (
          <span className="selection-name">{nodeName}</span>
        ) : (
          <span className="selection-empty">Select a frame or image in Figma</span>
        )}
      </div>

      {/* Preview */}
      <div className="plugin-preview-wrap">
        <div className="plugin-preview" ref={previewRef}>
          {status === 'loading' && <div className="preview-hint">Loading…</div>}
          {status === 'idle' && <div className="preview-hint">No selection</div>}
          {status === 'error' && <div className="preview-hint">Failed to load image</div>}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="plugin-filters">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`filter-tab${state.activeFilter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Per-filter controls */}
      <div className="plugin-controls">
        <FilterControls state={state} onChange={setState} />
      </div>

      {/* Footer actions */}
      <div className="plugin-footer">
        <button
          className="btn-apply"
          disabled={!imageInfo || applying}
          onClick={handleApply}
        >
          {applying ? 'Applying…' : `Apply ${activeLabel}`}
        </button>
      </div>
    </div>
  );
}

// ── Per-filter controls ───────────────────────────────────────────────────────

function FilterControls({ state, onChange }: { state: EditorState; onChange: (s: EditorState) => void }) {
  const set = <K extends keyof EditorState>(key: K, val: EditorState[K]) =>
    onChange({ ...state, [key]: val });

  switch (state.activeFilter) {
    case 'glass':
      return (
        <>
          <SliderRow label="Size" value={state.glass.size} min={0} max={100}
            onChange={v => set('glass', { ...state.glass, size: v })} />
          <SliderRow label="Grain" value={state.glass.grain} min={0} max={100}
            onChange={v => set('glass', { ...state.glass, grain: v })} />
          <SliderRow label="Distortion" value={state.glass.distortion} min={0} max={100}
            onChange={v => set('glass', { ...state.glass, distortion: v })} />
          <SliderRow label="Shadow" value={state.glass.shadow} min={0} max={100}
            onChange={v => set('glass', { ...state.glass, shadow: v })} />
        </>
      );
    case 'dithering':
      return (
        <>
          <SliderRow label="Size" value={state.dithering.size} min={1} max={100}
            onChange={v => set('dithering', { ...state.dithering, size: v })} />
          <SliderRow label="Colors" value={state.dithering.colorSteps} min={2} max={16}
            onChange={v => set('dithering', { ...state.dithering, colorSteps: v })} />
        </>
      );
    case 'liquid':
      return (
        <>
          <SliderRow label="Waves" value={state.liquid.waves} min={0} max={100}
            onChange={v => set('liquid', { ...state.liquid, waves: v })} />
          <SliderRow label="Distortion" value={state.liquid.distortion} min={0} max={100}
            onChange={v => set('liquid', { ...state.liquid, distortion: v })} />
        </>
      );
    case 'glitchy':
      return (
        <>
          <SliderRow label="Strength" value={state.glitchy.glitchStrength} min={0} max={100}
            onChange={v => set('glitchy', { ...state.glitchy, glitchStrength: v })} />
          <SliderRow label="Scanlines" value={state.glitchy.scanlines} min={0} max={100}
            onChange={v => set('glitchy', { ...state.glitchy, scanlines: v })} />
        </>
      );
    case 'halftone':
      return (
        <>
          <SliderRow label="Radius" value={state.halftone.radius} min={1} max={100}
            onChange={v => set('halftone', { ...state.halftone, radius: v })} />
          <SliderRow label="Contrast" value={state.halftone.contrast} min={0} max={100}
            onChange={v => set('halftone', { ...state.halftone, contrast: v })} />
        </>
      );
    case 'paper':
      return (
        <>
          <SliderRow label="Noise" value={state.paper.noise} min={0} max={100}
            onChange={v => set('paper', { ...state.paper, noise: v })} />
          <SliderRow label="Ink Bleed" value={state.paper.inkBleed} min={0} max={100}
            onChange={v => set('paper', { ...state.paper, inkBleed: v })} />
        </>
      );
    case 'heatmap':
      return (
        <>
          <SliderRow label="Intensity" value={state.heatmap.intensity} min={0} max={100}
            onChange={v => set('heatmap', { ...state.heatmap, intensity: v })} />
          <SliderRow label="Blur" value={state.heatmap.blur} min={0} max={100}
            onChange={v => set('heatmap', { ...state.heatmap, blur: v })} />
        </>
      );
    case 'blur':
      return (
        <>
          <SliderRow label="Strength" value={state.blur.strength} min={0} max={100}
            onChange={v => set('blur', { ...state.blur, strength: v })} />
          <SliderRow label="Grain" value={state.blur.grain} min={0} max={100}
            onChange={v => set('blur', { ...state.blur, grain: v })} />
        </>
      );
    default:
      return null;
  }
}

function SliderRow({ label, value, min, max, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="slider-row">
      <span className="slider-label">{label}</span>
      <input
        type="range"
        className="slider-input"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      <span className="slider-value">{Math.round(value)}</span>
    </div>
  );
}
