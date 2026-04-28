import type {
  ActiveFilter,
  DitheringSettings,
  EditorState,
  FitMode,
  GlassSettings,
  GlitchySettings,
  HalftoneSettings,
  HeatmapSettings,
  LiquidSettings,
  PaperSettings,
  SymbolEdgesSettings,
} from '../types/editor';
import {
  defaultDitheringSettings,
  defaultGlassSettings,
  defaultGlitchySettings,
  defaultHalftoneSettings,
  defaultHeatmapSettings,
  defaultLiquidSettings,
  defaultPaperSettings,
  defaultSymbolEdgesSettings,
} from '../types/editor';
import {
  DitheringTypes,
  GlassGridShapes,
  ShaderMount,
  type UniformMap,
  flutedGlassFragmentShader,
  glitchyFragmentShader,
  halftoneFragmentShader,
  heatmapFragmentShader,
  imageDitheringFragmentShader,
  paperFragmentShader,
  symbolEdgesFragmentShader,
  waterFragmentShader,
} from './shaders';

export const defaultEditorState: EditorState = {
  activeFilter: 'glass',
  layers: [],
  fitMode: 'fill',
  offsetX: 0,
  offsetY: 0,
  glass: defaultGlassSettings,
  dithering: defaultDitheringSettings,
  liquid: defaultLiquidSettings,
  glitchy: defaultGlitchySettings,
  halftone: defaultHalftoneSettings,
  symbolEdges: defaultSymbolEdgesSettings,
  paper: defaultPaperSettings,
  heatmap: defaultHeatmapSettings,
  image: {
    image: null,
    video: null,
    src: null,
    aspectRatio: 1,
    hasUserImage: false,
    isVideo: false,
    videoPlaying: false,
    isReady: false,
  },
};

export function hexToVec4(hex: string): [number, number, number, number] {
  const sanitized = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#000000';
  const r = parseInt(sanitized.slice(1, 3), 16) / 255;
  const g = parseInt(sanitized.slice(3, 5), 16) / 255;
  const b = parseInt(sanitized.slice(5, 7), 16) / 255;
  return [r, g, b, 1];
}

export function sanitizeHex(value: string, fallback: string): string {
  const normalized = value.trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(normalized) ? normalized : fallback;
}

export function buildGlassUniforms(
  image: HTMLImageElement | HTMLVideoElement,
  glass: GlassSettings,
  fitMode: FitMode,
  offsetX: number,
  offsetY: number,
) {
  return {
    u_image: image,
    u_fit: fitMode === 'fill' ? 2 : 1,
    u_angle: ((glass.angle % 360) + 360) % 360,
    u_size: glass.size / 100,
    u_grainMixer: glass.grain / 100,
    u_grainOverlay: 0,
    u_shape:
      glass.shape === 'lines'
        ? GlassGridShapes.lines
        : glass.shape === 'zigzag'
          ? GlassGridShapes.zigzag
          : glass.shape === 'circles'
            ? GlassGridShapes.circles
            : GlassGridShapes.wave,
    u_shadows: glass.shadow / 100,
    u_highlights: 0,
    u_distortion: glass.distortion / 100,
    u_distortionShape: 4,
    u_colorBack: [0, 0, 0, 0],
    u_colorShadow: [0, 0, 0, 0.6],
    u_colorHighlight: [1, 1, 1, 0],
    u_stretch: 0,
    u_blur: 0,
    u_edges: 0,
    u_shift: 0,
    u_rotation: 0,
    u_originX: 0.5,
    u_originY: 0.5,
    u_worldWidth: 0,
    u_worldHeight: 0,
    u_scale: 1,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_marginLeft: 0,
    u_marginRight: 0,
    u_marginTop: 0,
    u_marginBottom: 0,
  };
}

export function buildDitheringUniforms(
  dithering: DitheringSettings,
  fitMode: FitMode,
  offsetX: number,
  offsetY: number,
) {
  return {
    u_colorShadow: hexToVec4(dithering.shadowColor),
    u_colorFront: hexToVec4(dithering.frontColor),
    u_colorLight: hexToVec4(dithering.lightColor),
    u_colorHighlight: hexToVec4(dithering.highlightColor),
    u_type: DitheringTypes[dithering.type],
    u_pxSize: Math.max(1, dithering.size / 10),
    u_originalColors: dithering.originalColors,
    u_inverted: dithering.invert,
    u_colorSteps: Math.max(1, Math.round(dithering.colorSteps)),
    u_fit: fitMode === 'fill' ? 2 : 1,
    u_scale: 1,
    u_rotation: 0,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_originX: 0.5,
    u_originY: 0.5,
    u_worldWidth: 0,
    u_worldHeight: 0,
  };
}

export function buildLiquidUniforms(
  liquid: LiquidSettings,
  fitMode: FitMode,
  offsetX: number,
  offsetY: number,
) {
  return {
    u_colorBack: hexToVec4(liquid.frontColor),
    u_colorHighlight: hexToVec4(liquid.highlightColor),
    u_highlights: liquid.highlights / 10,
    u_waves: liquid.waves / 100,
    u_caustic: Math.pow(liquid.distortion / 100, 2) * 3.5,
    u_size: liquid.size / 100,
    u_layering: liquid.scale / 100,
    u_edges: 1,
    u_fit: fitMode === 'fill' ? 2 : 1,
    u_scale: 1,
    u_rotation: 0,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_originX: 0.5,
    u_originY: 0.5,
    u_worldWidth: 0,
    u_worldHeight: 0,
  };
}

export function buildHalftoneUniforms(
  halftone: HalftoneSettings,
  fitMode: FitMode,
  offsetX: number,
  offsetY: number,
) {
  return {
    u_fit: fitMode === 'fill' ? 2 : 1,
    u_scale: 1,
    u_rotation: 0,
    u_originX: 0.5,
    u_originY: 0.5,
    u_worldWidth: 0,
    u_worldHeight: 0,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_dotScale: 87300 / (90 + 6.375 * halftone.scale),
    u_dotRadius: (halftone.radius / 100) * 0.53,
    u_inkThreshold: halftone.threshold / 100,
    u_bw: halftone.blackAndWhite ? 1 : 0,
    u_originalColors: halftone.originalColors ? 1 : 0,
    u_inverted: halftone.invert ? 1 : 0,
    u_angle: (halftone.angle * Math.PI) / 180,
    u_blobThreshold: halftone.blobThreshold / 50,
    u_pattern: ({ dots: 0, lines: 1, cross: 2, blob: 3 } as const)[halftone.pattern],
    u_contrast: 1.0 + halftone.contrast / 100,
    u_blur: halftone.blur / 100,
    u_colorBack: hexToVec4(halftone.backgroundColor),
    u_color1: hexToVec4(halftone.color1),
    u_color2: hexToVec4(halftone.color2),
    u_color3: hexToVec4(halftone.color3),
    u_color4: hexToVec4(halftone.color4),
  };
}

export function buildGlitchyUniforms(
  glitchy: GlitchySettings,
  fitMode: FitMode,
  offsetX: number,
  offsetY: number,
) {
  return {
    u_fit: fitMode === 'fill' ? 2 : 1,
    u_scale: 1,
    u_rotation: 0,
    u_originX: 0.5,
    u_originY: 0.5,
    u_worldWidth: 0,
    u_worldHeight: 0,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_glitchStrength: glitchy.glitchStrength / 100,
    u_glitchAmount: glitchy.glitchAmount / 100,
    u_glitchMode: ({ none: 0, invert: 1, corrupt: 2, smear: 3, channel: 4, bleach: 5 } as const)[glitchy.glitchMode],
    u_glitchForm: ({ bands: 0, wide: 1, mosaic: 2, compress: 3 } as const)[glitchy.glitchForm],
    u_crtScale: glitchy.crt ? 0.5 : 0,
    u_scanlineScale: glitchy.scanlines / 100,
    u_glow: glitchy.glow / 100,
    u_vhsDistortion: glitchy.vhsDistortion ? 1 : 0,
    u_vhsWaveStrength: glitchy.vhsWaveStrength / 100,
    u_vhsBandOpacity: glitchy.vhsBandOpacity / 100,
    u_vhsNoiseLevel: glitchy.vhsNoiseLevel / 100 * 0.25,
    u_vhsBandHeight: glitchy.vhsBandHeight / 100,
  };
}

const _scanCache = new Map<number, HTMLImageElement>();

function getScanImage(index: number): HTMLImageElement {
  if (_scanCache.has(index)) return _scanCache.get(index)!;
  const img = new Image();
  img.src = `${import.meta.env.BASE_URL}scans/${index}.webp`;
  _scanCache.set(index, img);
  return img;
}

let _scanDummy: HTMLCanvasElement | null = null;
function getScanDummy(): HTMLCanvasElement {
  if (!_scanDummy) {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 1, 1);
    _scanDummy = c;
  }
  return _scanDummy;
}

export function buildPaperUniforms(
  paper: PaperSettings,
  fitMode: FitMode,
  offsetX: number,
  offsetY: number,
) {
  const hasScan = paper.scanEnabled && paper.scanTexture > 0;
  return {
    u_fit: fitMode === 'fill' ? 2 : 1,
    u_scale: 1,
    u_rotation: 0,
    u_originX: 0.5,
    u_originY: 0.5,
    u_worldWidth: 0,
    u_worldHeight: 0,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_noiseStrength: paper.noise / 100,
    u_diffuse: paper.diffuse / 30,
    u_paperNoise: paper.paperNoise / 100,
    u_inkBleed: paper.inkBleed / 250,
    u_angle: (paper.angle / 360) * Math.PI * 2,
    u_xerox: paper.xerox,
    u_xeroxAmount: paper.xeroxAmount / 50,
    u_xeroxOpacity: paper.xeroxOpacity / 100,
    u_xeroxThreshold: paper.xeroxThreshold / 100,
    u_scanTexture: hasScan ? getScanImage(paper.scanTexture) : getScanDummy(),
    u_hasScan: hasScan ? 1 : 0,
    u_scanOpacity: paper.scanOpacity / 100,
    u_scanScale: (100 + paper.scanScale * 2) / 100,
  };
}

export function buildHeatmapUniforms(
  heatmap: HeatmapSettings,
  fitMode: FitMode,
  offsetX: number,
  offsetY: number,
) {
  const MAX_STOPS = 5;
  const sortedStops = [...heatmap.customStops]
    .sort((a, b) => a.position - b.position)
    .slice(0, MAX_STOPS);
  const padded = [
    ...sortedStops,
    ...Array.from({ length: MAX_STOPS - sortedStops.length }, () => ({ color: '#000000', position: 0 })),
  ];
  const customStopsData = padded.map((s) => {
    const [r, g, b] = hexToVec4(s.color);
    return [r, g, b, s.position] as [number, number, number, number];
  });

  return {
    u_fit: fitMode === 'fill' ? 2 : 1,
    u_scale: 1,
    u_rotation: 0,
    u_originX: 0.5,
    u_originY: 0.5,
    u_worldWidth: 0,
    u_worldHeight: 0,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_palette: ({ thermal: 0, inferno: 1, ice: 2, acid: 3, sunset: 4 } as const)[heatmap.palette],
    u_intensity: heatmap.intensity / 50,
    u_blend: heatmap.blend / 100,
    u_grain: heatmap.grain / 100,
    u_blur: heatmap.blur / 100,
    u_customGradient: heatmap.customGradient ? 1 : 0,
    u_customStopCount: sortedStops.length,
    u_customStops: customStopsData,
  };
}

// ── Font atlas for symbol edges ───────────────────────────────────────────────
const _fontAtlasCache = new Map<string, HTMLCanvasElement>();

export function createFontAtlas(symbols: string, cellPx: number): HTMLCanvasElement {
  const s = symbols.length > 0 ? symbols : ' ';
  const key = `${s}|${cellPx}`;
  const cached = _fontAtlasCache.get(key);
  if (cached) return cached;

  const n = s.length;
  const canvas = document.createElement('canvas');
  canvas.width = cellPx * n;
  canvas.height = cellPx;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.max(4, Math.floor(cellPx * 0.82))}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    ctx.fillText(s[i], i * cellPx + cellPx / 2, cellPx / 2);
  }
  _fontAtlasCache.set(key, canvas);
  return canvas;
}

function hexToVec3(hex: string): [number, number, number] {
  const v = hexToVec4(hex);
  return [v[0], v[1], v[2]];
}

export function buildSymbolEdgesUniforms(
  se: SymbolEdgesSettings,
  fitMode: FitMode,
  offsetX: number,
  offsetY: number,
) {
  const cellPx = Math.round(6 + (se.cellSize / 100) * 42);
  const symbols = se.symbols.length > 0 ? se.symbols : '0';
  const atlasPx = se.hideImage ? Math.max(128, cellPx) : cellPx;
  const fontAtlas = createFontAtlas(symbols, atlasPx);
  return {
    u_fit: fitMode === 'fill' ? 2 : 1,
    u_scale: 1,
    u_rotation: 0,
    u_originX: 0.5,
    u_originY: 0.5,
    u_worldWidth: 0,
    u_worldHeight: 0,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_fontAtlas: fontAtlas,
    u_cellSize: cellPx,
    u_numSymbols: symbols.length,
    u_threshold: se.threshold / 100,
    u_symbolColor: hexToVec4(se.symbolColor),
    u_bgColor: hexToVec4(se.backgroundColor),
    u_mode: se.mode === 'edges' ? 0 : 1,
    u_targetColor: hexToVec3(se.targetColor),
    u_invert: se.invert ? 1 : 0,
    u_hideImage: se.hideImage ? 1 : 0,
    u_seGlow: se.glow / 100,
  };
}

const ANIMATED_FILTERS = new Set<ActiveFilter>(['liquid', 'glitchy']);

export function hasAnimatedEffect(state: EditorState): boolean {
  return ANIMATED_FILTERS.has(state.activeFilter) || state.layers.some((f) => ANIMATED_FILTERS.has(f));
}

export function getRenderStack(state: EditorState): ActiveFilter[] {
  const { activeFilter, layers } = state;
  if (layers.length === 0) return [activeFilter];
  const bottomToTop = [...layers].reverse();
  return layers.includes(activeFilter) ? bottomToTop : [...bottomToTop, activeFilter];
}

export function getShaderConfig(state: EditorState, image: HTMLImageElement | HTMLVideoElement) {
  if (state.activeFilter === 'dithering') {
    return {
      fragmentShader: imageDitheringFragmentShader,
      uniforms: {
        u_image: image,
        ...buildDitheringUniforms(state.dithering, state.fitMode, state.offsetX, state.offsetY),
      },
      speed: 0,
    };
  }

  if (state.activeFilter === 'liquid') {
    return {
      fragmentShader: waterFragmentShader,
      uniforms: {
        u_image: image,
        ...buildLiquidUniforms(state.liquid, state.fitMode, state.offsetX, state.offsetY),
      },
      speed: state.liquid.playing ? 1 : 0,
    };
  }

  if (state.activeFilter === 'glitchy') {
    return {
      fragmentShader: glitchyFragmentShader,
      uniforms: {
        u_image: image,
        ...buildGlitchyUniforms(state.glitchy, state.fitMode, state.offsetX, state.offsetY),
      },
      speed: state.glitchy.playing ? 1 : 0,
    };
  }

  if (state.activeFilter === 'halftone') {
    return {
      fragmentShader: halftoneFragmentShader,
      uniforms: {
        u_image: image,
        ...buildHalftoneUniforms(state.halftone, state.fitMode, state.offsetX, state.offsetY),
      },
      speed: 0,
    };
  }

  if (state.activeFilter === 'paper') {
    return {
      fragmentShader: paperFragmentShader,
      uniforms: {
        u_image: image,
        ...buildPaperUniforms(state.paper, state.fitMode, state.offsetX, state.offsetY),
      },
      speed: 0,
    };
  }

  if (state.activeFilter === 'symbolEdges') {
    return {
      fragmentShader: symbolEdgesFragmentShader,
      uniforms: {
        u_image: image,
        ...buildSymbolEdgesUniforms(state.symbolEdges, state.fitMode, state.offsetX, state.offsetY),
      },
      speed: 0,
    };
  }

  if (state.activeFilter === 'heatmap') {
    return {
      fragmentShader: heatmapFragmentShader,
      uniforms: {
        u_image: image,
        ...buildHeatmapUniforms(state.heatmap, state.fitMode, state.offsetX, state.offsetY),
      },
      speed: 0,
    };
  }

  return {
    fragmentShader: flutedGlassFragmentShader,
    uniforms: buildGlassUniforms(image, state.glass, state.fitMode, state.offsetX, state.offsetY),
    speed: 0,
  };
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

export function makeFallbackImage(): HTMLImageElement {
  const canvas = document.createElement('canvas');
  canvas.width = 672;
  canvas.height = 378;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createLinearGradient(0, 0, 0, 378);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 672, 378);
  }

  const image = new Image();
  image.src = canvas.toDataURL();
  return image;
}

export function updateFitClip(
  shaderMount: ShaderMount | null,
  fitMode: FitMode,
  aspectRatio: number,
) {
  const canvas = shaderMount?.canvasElement;
  if (!canvas) return;

  if (fitMode !== 'fit') {
    canvas.style.clipPath = '';
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const canvasWidth = rect.width;
  const canvasHeight = rect.height;
  const aspect = aspectRatio || 1;
  let top = 0;
  let right = 0;
  let bottom = 0;
  let left = 0;

  if (canvasWidth / canvasHeight > aspect) {
    const imageWidth = canvasHeight * aspect;
    left = right = (canvasWidth - imageWidth) / 2;
  } else {
    const imageHeight = canvasWidth / aspect;
    top = bottom = (canvasHeight - imageHeight) / 2;
  }

  canvas.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
}

export function getFillDragBounds(container: HTMLElement, aspectRatio: number) {
  const rect = container.getBoundingClientRect();
  const canvasWidth = rect.width;
  const canvasHeight = rect.height;
  const imageBoxWidth = Math.max(canvasWidth / aspectRatio, canvasHeight) * aspectRatio;
  const imageBoxHeight = imageBoxWidth / aspectRatio;
  const scaleX = canvasWidth / imageBoxWidth;
  const scaleY = canvasHeight / imageBoxHeight;

  return {
    maxX: 0.5 * (1 - scaleX),
    maxY: 0.5 * (1 - scaleY),
  };
}


async function convertViaWebCodecs(
  webmBlob: Blob,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');

  const url = URL.createObjectURL(webmBlob);
  const videoEl = document.createElement('video');
  videoEl.muted = true;
  videoEl.playsInline = true;
  videoEl.style.cssText = 'position:fixed;opacity:0;pointer-events:none;width:1px;height:1px;top:0;left:0;';
  document.body.appendChild(videoEl);
  videoEl.src = url;

  try {
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('Timed out loading recorded video')), 15_000);
      videoEl.addEventListener('loadeddata', () => { clearTimeout(t); resolve(); }, { once: true });
      videoEl.addEventListener('error', () => { clearTimeout(t); reject(new Error(`Video load failed (code ${videoEl.error?.code ?? '?'})`)); }, { once: true });
      videoEl.load();
    });

    const { videoWidth: width, videoHeight: height } = videoEl;
    if (!width || !height) throw new Error('no dimensions');

    const profiles = ['avc1.42E01E', 'avc1.42001E', 'avc1.4D001E', 'avc1.640028'];
    let chosenCodec = '';
    for (const p of profiles) {
      try {
        const { supported } = await VideoEncoder.isConfigSupported({ codec: p, width, height, bitrate: 16_000_000, framerate: 30 });
        if (supported) { chosenCodec = p; break; }
      } catch { /* try next */ }
    }
    if (!chosenCodec) throw new Error('H.264 not available');

    const rawDuration = videoEl.duration;
    const knownDuration = isFinite(rawDuration) && rawDuration > 0 ? rawDuration : null;

    const target = new ArrayBufferTarget();
    const muxer = new Muxer({ target, video: { codec: 'avc', width, height }, fastStart: 'in-memory', firstTimestampBehavior: 'offset' });

    let encodeError: Error | null = null;
    const encoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => { encodeError = e; },
    });
    encoder.configure({ codec: chosenCodec, width, height, bitrate: 16_000_000, framerate: 30 });

    videoEl.currentTime = 0;
    await new Promise<void>((r) => videoEl.addEventListener('seeked', () => r(), { once: true }));

    type RVFC = (now: number, meta: { mediaTime: number }) => void;
    type WithRVFC = HTMLVideoElement & { requestVideoFrameCallback: (cb: RVFC) => number };

    let frameIndex = 0;
    let done = false;

    await new Promise<void>((resolve, reject) => {
      const finish = () => { if (!done) { done = true; resolve(); } };
      videoEl.addEventListener('ended', finish, { once: true });
      videoEl.addEventListener('error', () => reject(new Error('Playback error')), { once: true });

      const processFrame: RVFC = (_now, meta) => {
        if (done) return;
        if (encodeError) { reject(encodeError); return; }
        try {
          const frame = new VideoFrame(videoEl, { timestamp: Math.round(meta.mediaTime * 1_000_000) });
          encoder.encode(frame, { keyFrame: frameIndex % 120 === 0 });
          frame.close();
          frameIndex++;
          if (knownDuration) onProgress?.(Math.min(meta.mediaTime / knownDuration, 1));
          const pastEnd = knownDuration != null && meta.mediaTime >= knownDuration - 0.05;
          if (!pastEnd) {
            (videoEl as WithRVFC).requestVideoFrameCallback(processFrame);
          } else {
            finish();
          }
        } catch (err) { reject(err as Error); }
      };

      (videoEl as WithRVFC).requestVideoFrameCallback(processFrame);
      videoEl.play().catch(reject);
    });

    if (frameIndex === 0) throw new Error('no frames captured');
    await encoder.flush();
    if (encodeError) throw encodeError;
    muxer.finalize();
    const blob = new Blob([target.buffer], { type: 'video/mp4' });
    if (blob.size === 0) throw new Error('mp4-muxer produced empty output');
    return blob;
  } finally {
    URL.revokeObjectURL(url);
    document.body.removeChild(videoEl);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FFmpegV11 = any;
let ffmpegV11: FFmpegV11 | null = null;
let ffmpegV11LoadPromise: Promise<void> | null = null;
let ffmpegV11Progress: ((ratio: number) => void) | null = null;

async function convertViaFFmpeg(
  webmBlob: Blob,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  // Load @ffmpeg/ffmpeg@0.11 from CDN — no bundler/worker involved, no PnP issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  if (!win.FFmpeg?.createFFmpeg) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js';
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load FFmpeg from CDN'));
      document.head.appendChild(s);
    });
  }

  const { createFFmpeg, fetchFile } = win.FFmpeg;

  if (!ffmpegV11) {
    ffmpegV11 = createFFmpeg({
      corePath: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
      log: false,
      progress: ({ ratio }: { ratio: number }) => ffmpegV11Progress?.(Math.min(ratio, 1)),
    });
    ffmpegV11LoadPromise = ffmpegV11.load();
  }
  // Always await the load promise — concurrent calls wait for the same load
  await ffmpegV11LoadPromise;

  ffmpegV11Progress = onProgress ?? null;

  for (const name of ['input.webm', 'output.mp4']) {
    try { ffmpegV11.FS('unlink', name); } catch { /* not present */ }
  }

  ffmpegV11.FS('writeFile', 'input.webm', await fetchFile(webmBlob));
  await ffmpegV11.run('-y', '-i', 'input.webm', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', '-an', '-movflags', '+faststart', 'output.mp4');

  const data: Uint8Array = ffmpegV11.FS('readFile', 'output.mp4');
  try { ffmpegV11.FS('unlink', 'input.webm'); } catch { /* ignore */ }
  try { ffmpegV11.FS('unlink', 'output.mp4'); } catch { /* ignore */ }

  return new Blob([data.buffer as ArrayBuffer], { type: 'video/mp4' });
}

export async function convertWebmToMp4(
  webmBlob: Blob,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  // Try native WebCodecs H.264 first (instant, hardware-accelerated)
  if (typeof VideoEncoder !== 'undefined') {
    try {
      return await convertViaWebCodecs(webmBlob, onProgress);
    } catch {
      // H.264 encoding not available on this device — fall through to FFmpeg
    }
  }
  // Fall back to FFmpeg.wasm (software libx264, downloads ~30 MB once)
  return await convertViaFFmpeg(webmBlob, onProgress);
}

export async function renderVideoToBlob(
  video: HTMLVideoElement,
  editorState: EditorState,
  previewMount: ShaderMount,
  onProgress?: (progress: number) => void,
): Promise<Blob | null> {
  if (!isFinite(video.duration) || video.duration === 0) return null;
  const duration = video.duration;
  if (!video.videoWidth || !video.videoHeight) return null;

  // Cap export to 1920px on the longest side — 4K sources would OOM the GPU
  // and make VideoEncoder fail, falling back to slow FFmpeg conversion.
  const MAX_PX = 1920;
  const scale = Math.min(1, MAX_PX / Math.max(video.videoWidth, video.videoHeight));
  // H.264 requires even dimensions
  const width = Math.floor(video.videoWidth * scale / 2) * 2;
  const height = Math.floor(video.videoHeight * scale / 2) * 2;

  const wasLooping = video.loop;
  video.loop = false;
  video.pause();
  video.currentTime = 0;
  await new Promise<void>((resolve) => video.addEventListener('seeked', () => resolve(), { once: true }));

  // Build an off-screen chain of ShaderMounts mirroring the preview layer stack
  const renderStack = getRenderStack(editorState);
  const chainDivs: HTMLDivElement[] = [];
  const chainMounts: ShaderMount[] = [];
  let prevCanvas: HTMLCanvasElement | null = null;

  for (let i = 0; i < renderStack.length; i++) {
    const filter = renderStack[i];
    const stateForPass: EditorState = { ...editorState, activeFilter: filter, fitMode: 'fit', offsetX: 0, offsetY: 0 };
    const config = getShaderConfig(stateForPass, video);
    const passUniforms = { ...config.uniforms } as UniformMap & { u_pxSize?: number };

    if (filter === 'dithering' && typeof passUniforms.u_pxSize === 'number' && previewMount.parentWidth > 0) {
      passUniforms.u_pxSize = passUniforms.u_pxSize * (width / previewMount.parentWidth);
    }

    const div = document.createElement('div');
    div.style.cssText = `position:fixed;left:-99999px;top:0;width:${width}px;height:${height}px;overflow:hidden`;
    document.documentElement.appendChild(div);
    chainDivs.push(div);

    const mount = new ShaderMount(
      div,
      config.fragmentShader,
      passUniforms,
      { preserveDrawingBuffer: true },
      config.speed,
      previewMount.currentFrame,
      1,
    );
    mount.resizeObserver?.disconnect();
    chainMounts.push(mount);

    const canvas = div.querySelector('canvas') as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
    mount.gl.viewport(0, 0, width, height);
    mount.resolutionChanged = true;
    mount.renderScale = 1;
    mount.uniformCache = {};

    if (prevCanvas) mount.setTextureUniform('u_image', prevCanvas);

    if (mount.rafId !== null) { cancelAnimationFrame(mount.rafId); mount.rafId = null; }
    mount.lastRenderTime = 0;

    prevCanvas = canvas;
  }

  // offMount is the last mount in the chain — its canvas is captured for encoding
  const offMount = chainMounts[chainMounts.length - 1];
  const offCanvas = prevCanvas;

  const cleanup = async () => {
    chainMounts.forEach((m) => m.dispose());
    chainDivs.forEach((d) => d.remove());
    video.loop = wasLooping;
    video.playbackRate = 1;
    video.currentTime = 0;
    try { await video.play(); } catch {}
  };

  if (!offCanvas || !offMount) { await cleanup(); return null; }

  type RVFCFN = (now: number, meta: { mediaTime: number }) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videoAny = video as any;

  const renderOffScreen = (mediaTime: number) => {
    // Render each mount in chain order — each reads from the previous mount's canvas
    for (const mount of chainMounts) {
      mount.render(mediaTime * 1000);
      if (mount.rafId !== null) { cancelAnimationFrame(mount.rafId); mount.rafId = null; }
    }
  };

  // ── VideoEncoder path ───────────────────────────────────────────────────────
  if (typeof VideoEncoder !== 'undefined' && videoAny.requestVideoFrameCallback) {
    const bitrate = 12_000_000;
    const fps = 30;

    const profiles = ['avc1.42E01E', 'avc1.42001E', 'avc1.4D001E', 'avc1.640028'];
    let codec = '';
    for (const p of profiles) {
      try {
        const { supported } = await VideoEncoder.isConfigSupported({ codec: p, width, height, bitrate, framerate: fps });
        if (supported) { codec = p; break; }
      } catch { /* try next */ }
    }

    if (codec) {
      try {
        const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');
        const target = new ArrayBufferTarget();
        const muxer = new Muxer({ target, video: { codec: 'avc', width, height }, fastStart: 'in-memory', firstTimestampBehavior: 'offset' });
        let encodeErr: Error | null = null;
        const encoder = new VideoEncoder({
          output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
          error: (e) => { encodeErr = e; },
        });
        const baseCfg: VideoEncoderConfig = { codec, width, height, bitrate, framerate: fps, latencyMode: 'quality' };
        try { encoder.configure({ ...baseCfg, bitrateMode: 'constant' } as VideoEncoderConfig); }
        catch { encoder.configure(baseCfg); }

        // RVFC at 1× — browser delivers every frame in real-time, no drops.
        // Faster than seek-based (no per-frame seek latency) and accurate.
        let frameIndex = 0;
        let done = false;

        await new Promise<void>((resolve, reject) => {
          const finish = () => { if (!done) { done = true; resolve(); } };
          video.addEventListener('ended', finish, { once: true });
          video.addEventListener('error', () => reject(new Error('video error during export')), { once: true });

          const process: RVFCFN = (_now, meta) => {
            if (done) return;
            if (encodeErr) { reject(encodeErr); return; }
            try {
              renderOffScreen(meta.mediaTime);
              const vf = new VideoFrame(offCanvas, { timestamp: Math.round(meta.mediaTime * 1_000_000) });
              encoder.encode(vf, { keyFrame: frameIndex % 60 === 0 });
              vf.close();
              frameIndex++;
              onProgress?.(Math.min(meta.mediaTime / duration, 0.99));
              if (meta.mediaTime < duration - 0.05) {
                videoAny.requestVideoFrameCallback(process);
              } else {
                finish();
              }
            } catch (e) { reject(e as Error); }
          };

          video.playbackRate = 1;
          videoAny.requestVideoFrameCallback(process);
          void video.play().catch(reject);
        });

        if (frameIndex > 0) {
          await encoder.flush();
          if (encodeErr) throw encodeErr;
          muxer.finalize();
          const blob = new Blob([target.buffer], { type: 'video/mp4' });
          if (blob.size > 0) { onProgress?.(1); await cleanup(); return blob; }
        }
      } catch (e) {
        console.error('[export] VideoEncoder failed:', e);
      }
      video.pause();
      video.playbackRate = 1;
      video.currentTime = 0;
      await new Promise<void>((r) => video.addEventListener('seeked', () => r(), { once: true }));
      offMount.lastRenderTime = 0;
      if (offMount.rafId !== null) { cancelAnimationFrame(offMount.rafId); offMount.rafId = null; }
    }
  }

  // ── MediaRecorder fallback (Firefox / no WebCodecs) ────────────────────────
  const mimeType =
    ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((t) =>
      MediaRecorder.isTypeSupported(t),
    ) ?? 'video/webm';
  const stream = offCanvas.captureStream(60);
  const chunks: BlobPart[] = [];
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  const blobReady = new Promise<Blob>((r) => { recorder.onstop = () => r(new Blob(chunks, { type: mimeType.split(';')[0] })); });

  if (onProgress) video.ontimeupdate = () => onProgress(video.currentTime / duration);

  void video.play().catch(() => {});

  // Wait for first decoded frame, render it, then start recorder
  await new Promise<void>((resolve) => {
    if (videoAny.requestVideoFrameCallback) {
      videoAny.requestVideoFrameCallback((_now: number, meta: { mediaTime: number }) => {
        renderOffScreen(meta.mediaTime);
        requestAnimationFrame(() => resolve());
      });
    } else {
      video.addEventListener('timeupdate', () => requestAnimationFrame(() => resolve()), { once: true });
    }
  });

  recorder.start(100);

  await new Promise<void>((resolve) => {
    const t = setTimeout(resolve, (duration + 5) * 1000);
    video.addEventListener('ended', () => { clearTimeout(t); resolve(); }, { once: true });
    if (videoAny.requestVideoFrameCallback) {
      const loop = (_now: number, meta: { mediaTime: number }) => {
        renderOffScreen(meta.mediaTime);
        if (meta.mediaTime < duration - 0.04) videoAny.requestVideoFrameCallback(loop);
      };
      videoAny.requestVideoFrameCallback(loop);
    }
  });

  recorder.stop();
  if (onProgress) video.ontimeupdate = null;
  await cleanup();
  return blobReady;
}

export async function renderShaderToBlob(
  container: HTMLElement,
  shaderMount: ShaderMount,
  state: EditorState,
): Promise<Blob | null> {
  const sourceImage = shaderMount.providedUniforms.u_image;
  if (!(sourceImage instanceof HTMLImageElement) && !(sourceImage instanceof HTMLVideoElement)) {
    return null;
  }

  const baseWidth = sourceImage instanceof HTMLVideoElement ? sourceImage.videoWidth : sourceImage.naturalWidth;
  const baseHeight = sourceImage instanceof HTMLVideoElement ? sourceImage.videoHeight : sourceImage.naturalHeight;

  const renderStack = getRenderStack(state);
  const symbolHiding = renderStack.includes('symbolEdges') && state.symbolEdges.hideImage;
  const exportScale = symbolHiding ? 2 : 1;
  const outputWidth = baseWidth * exportScale;
  const outputHeight = baseHeight * exportScale;

  const allDivs: HTMLDivElement[] = [];
  const allMounts: ShaderMount[] = [];
  let prevCanvas: HTMLCanvasElement | null = null;

  for (let i = 0; i < renderStack.length; i++) {
    const filter = renderStack[i];
    const stateForPass: EditorState = { ...state, activeFilter: filter, fitMode: 'fit', offsetX: 0, offsetY: 0 };
    const config = getShaderConfig(stateForPass, sourceImage);
    const passUniforms = { ...config.uniforms } as UniformMap & { u_pxSize?: number; u_cellSize?: number; u_fontAtlas?: HTMLCanvasElement };

    if (
      filter === 'dithering' &&
      typeof passUniforms.u_pxSize === 'number' &&
      shaderMount.parentWidth > 0 &&
      sourceImage instanceof HTMLImageElement
    ) {
      passUniforms.u_pxSize = passUniforms.u_pxSize * (baseWidth / shaderMount.parentWidth);
    }

    if (filter === 'symbolEdges' && symbolHiding) {
      const scaledCell = Math.round(6 + (state.symbolEdges.cellSize / 100) * 42) * 2;
      const syms = state.symbolEdges.symbols.length > 0 ? state.symbolEdges.symbols : '0';
      passUniforms.u_cellSize = scaledCell;
      passUniforms.u_fontAtlas = createFontAtlas(syms, Math.max(256, scaledCell));
    }

    const div = document.createElement('div');
    div.style.cssText = `position:fixed;left:-99999px;top:0;width:${outputWidth}px;height:${outputHeight}px;overflow:hidden`;
    document.documentElement.appendChild(div);
    allDivs.push(div);

    const mount = new ShaderMount(
      div,
      config.fragmentShader,
      passUniforms,
      { preserveDrawingBuffer: true },
      0,
      shaderMount.currentFrame,
      1,
      outputWidth * outputHeight + 1,
    );
    mount.resizeObserver?.disconnect();
    allMounts.push(mount);

    const canvas = div.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) break;

    canvas.width = outputWidth;
    canvas.height = outputHeight;
    mount.gl.viewport(0, 0, outputWidth, outputHeight);
    mount.resolutionChanged = true;
    mount.renderScale = 1;
    mount.uniformCache = {};
    mount.setUniformValues(passUniforms);

    if (prevCanvas) mount.setTextureUniform('u_image', prevCanvas);

    mount.render(performance.now());
    if (mount.rafId !== null) { cancelAnimationFrame(mount.rafId); mount.rafId = null; }

    prevCanvas = canvas;
  }

  const finalCanvas = prevCanvas;
  const blob = finalCanvas
    ? await new Promise<Blob | null>((resolve) => finalCanvas.toBlob((b) => resolve(b), 'image/png'))
    : null;

  allMounts.forEach((m) => m.dispose());
  allDivs.forEach((d) => d.remove());
  updateFitClip(shaderMount, state.fitMode, state.image.aspectRatio);

  return blob;
}

export async function renderImageAsVideoToBlob(
  container: HTMLElement,
  shaderMount: ShaderMount,
  state: EditorState,
  durationSec = 15,
  fps = 30,
  onProgress?: (progress: number) => void,
): Promise<Blob | null> {
  const sourceImage = shaderMount.providedUniforms.u_image;
  if (!(sourceImage instanceof HTMLImageElement)) return null;

  // captureStream() on a WebGL canvas requires preserveDrawingBuffer: true —
  // without it the buffer is swapped before the stream can read it (0-byte output).
  // Build a small off-screen chain at 1280px max. No manual frame pumping —
  // each mount runs its own natural RAF loop, so memory stays flat.
  const MAX_PX = 1280;
  const scale = Math.min(1, MAX_PX / Math.max(sourceImage.naturalWidth, sourceImage.naturalHeight));
  const width = Math.floor(sourceImage.naturalWidth * scale / 2) * 2 || 2;
  const height = Math.floor(sourceImage.naturalHeight * scale / 2) * 2 || 2;

  const renderStack = getRenderStack(state);
  const allDivs: HTMLDivElement[] = [];
  const allMounts: ShaderMount[] = [];
  let prevCanvas: HTMLCanvasElement | null = null;

  for (let i = 0; i < renderStack.length; i++) {
    const filter = renderStack[i];
    const stateForPass: EditorState = { ...state, activeFilter: filter, fitMode: 'fit', offsetX: 0, offsetY: 0 };
    const config = getShaderConfig(stateForPass, sourceImage);
    const passUniforms = { ...config.uniforms } as UniformMap & { u_pxSize?: number };

    if (filter === 'dithering' && typeof passUniforms.u_pxSize === 'number' && shaderMount.parentWidth > 0) {
      passUniforms.u_pxSize = passUniforms.u_pxSize * (width / shaderMount.parentWidth);
    }

    const div = document.createElement('div');
    div.style.cssText = `position:fixed;left:-99999px;top:0;width:${width}px;height:${height}px;overflow:hidden`;
    document.documentElement.appendChild(div);
    allDivs.push(div);

    const mount = new ShaderMount(
      div, config.fragmentShader, passUniforms,
      { preserveDrawingBuffer: true }, config.speed, shaderMount.currentFrame, 1,
    );
    mount.resizeObserver?.disconnect();
    allMounts.push(mount);

    const canvas = div.querySelector('canvas') as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
    mount.gl.viewport(0, 0, width, height);
    mount.resolutionChanged = true;
    mount.renderScale = 1;
    mount.uniformCache = {};

    if (prevCanvas) mount.setTextureUniform('u_image', prevCanvas);
    prevCanvas = canvas;
  }

  const finalCanvas = prevCanvas;
  const cleanup = () => {
    allMounts.forEach((m) => m.dispose());
    allDivs.forEach((d) => d.remove());
  };

  if (!finalCanvas) { cleanup(); return null; }

  // Wait for two animation frames so the canvas has content before recording starts.
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

  type CapturableCanvas = HTMLCanvasElement & { captureStream(fps?: number): MediaStream };
  const stream = (finalCanvas as CapturableCanvas).captureStream(fps);

  const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((t) =>
    MediaRecorder.isTypeSupported(t),
  ) ?? 'video/webm';

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  const blobReady = new Promise<Blob>((r) => {
    recorder.onstop = () => r(new Blob(chunks, { type: mimeType.split(';')[0] }));
  });

  recorder.start(100);

  await new Promise<void>((resolve) => {
    const startTime = performance.now();
    const tick = () => {
      const elapsed = performance.now() - startTime;
      onProgress?.(Math.min(elapsed / (durationSec * 1000) * 0.92, 0.92));
      if (elapsed >= durationSec * 1000) { resolve(); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  recorder.stop();
  const webmBlob = await blobReady;
  cleanup();

  return convertWebmToMp4(webmBlob, (p) => onProgress?.(0.92 + p * 0.08));
}
