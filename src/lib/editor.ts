import type {
  DitheringSettings,
  EditorState,
  FitMode,
  GlassSettings,
  GlitchySettings,
  HalftoneSettings,
  LiquidSettings,
  SymbolEdgesSettings,
} from '../types/editor';
import {
  defaultDitheringSettings,
  defaultGlassSettings,
  defaultGlitchySettings,
  defaultHalftoneSettings,
  defaultLiquidSettings,
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
  imageDitheringFragmentShader,
  symbolEdgesFragmentShader,
  waterFragmentShader,
} from './shaders';

export const defaultEditorState: EditorState = {
  activeFilter: 'glass',
  fitMode: 'fill',
  offsetX: 0,
  offsetY: 0,
  glass: defaultGlassSettings,
  dithering: defaultDitheringSettings,
  liquid: defaultLiquidSettings,
  glitchy: defaultGlitchySettings,
  halftone: defaultHalftoneSettings,
  symbolEdges: defaultSymbolEdgesSettings,
  image: {
    image: null,
    src: null,
    aspectRatio: 1,
    hasUserImage: false,
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
  image: HTMLImageElement,
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
    u_shadows: 0.7,
    u_highlights: 0,
    u_distortion: 0.5,
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
    u_colorBack: hexToVec4(dithering.backgroundColor),
    u_colorFront: hexToVec4(dithering.frontColor),
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
    u_caustic: liquid.distortion / 10,
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
    u_dotScale: 65475 / (90 + 6.375 * halftone.scale),
    u_bw: halftone.blackAndWhite ? 1 : 0,
    u_originalColors: halftone.originalColors ? 1 : 0,
    u_inverted: halftone.invert ? 1 : 0,
    u_angle: (halftone.angle * Math.PI) / 180,
    u_blobThreshold: halftone.blobThreshold / 50,
    u_pattern: ({ dots: 0, print: 1, lines: 2, cross: 3, grunge: 4, blob: 5 } as const)[halftone.pattern],
    u_contrast: halftone.contrast / 50,
    u_brightness: (halftone.brightness - 50) / 100,
    u_colorBack: hexToVec4(halftone.backgroundColor),
    u_color1: hexToVec4(halftone.color1),
    u_color2: hexToVec4(halftone.color2),
    u_color3: hexToVec4(halftone.color3),
    u_color4: hexToVec4(halftone.color4),
    u_grainOverlay: halftone.grainOverlay / 100,
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
  const fontAtlas = createFontAtlas(symbols, cellPx);
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

export function getShaderConfig(state: EditorState, image: HTMLImageElement) {
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

export async function renderShaderToBlob(
  container: HTMLElement,
  shaderMount: ShaderMount,
  state: EditorState,
): Promise<Blob | null> {
  const sourceImage = shaderMount.providedUniforms.u_image;
  if (!(sourceImage instanceof HTMLImageElement)) {
    return null;
  }

  const outputWidth = sourceImage.naturalWidth;
  const outputHeight = sourceImage.naturalHeight;
  const tempDiv = document.createElement('div');
  tempDiv.style.cssText = `position:fixed;left:-99999px;top:0;width:${outputWidth}px;height:${outputHeight}px;overflow:hidden`;
  document.documentElement.appendChild(tempDiv);

  const config = getShaderConfig(
    {
      ...state,
      fitMode: 'fit',
      offsetX: 0,
      offsetY: 0,
    },
    sourceImage,
  );

  const exportUniforms = { ...config.uniforms } as UniformMap & { u_pxSize?: number };
  if (
    state.activeFilter === 'dithering' &&
    typeof exportUniforms.u_pxSize === 'number' &&
    shaderMount.parentWidth > 0
  ) {
    exportUniforms.u_pxSize = exportUniforms.u_pxSize * (outputWidth / shaderMount.parentWidth);
  }

  const tempMount = new ShaderMount(
    tempDiv,
    config.fragmentShader,
    exportUniforms,
    { preserveDrawingBuffer: true },
    0,
    shaderMount.currentFrame,
    1,
    outputWidth * outputHeight + 1,
  );

  tempMount.resizeObserver?.disconnect();
  const tempCanvas = tempDiv.querySelector('canvas');
  if (!(tempCanvas instanceof HTMLCanvasElement)) {
    tempMount.dispose();
    tempDiv.remove();
    return null;
  }

  tempCanvas.width = outputWidth;
  tempCanvas.height = outputHeight;
  tempMount.gl.viewport(0, 0, outputWidth, outputHeight);
  tempMount.resolutionChanged = true;
  tempMount.renderScale = 1;
  // Canvas resize may flush texture bindings on some GPUs — clear cache to force re-upload.
  tempMount.uniformCache = {};
  tempMount.setUniformValues(exportUniforms);
  tempMount.render(performance.now());

  const blob = await new Promise<Blob | null>((resolve) => {
    tempCanvas.toBlob((canvasBlob) => resolve(canvasBlob), 'image/png');
  });

  tempMount.dispose();
  tempDiv.remove();
  updateFitClip(shaderMount, state.fitMode, state.image.aspectRatio);

  return blob;
}
