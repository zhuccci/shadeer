export type ActiveFilter = 'glass' | 'dithering' | 'liquid' | 'glitchy' | 'halftone' | 'symbolEdges' | 'paper' | 'heatmap';

export type SymbolEdgesMode = 'edges' | 'color';

export type FitMode = 'fill' | 'fit';

export type GlassShape = 'lines' | 'wave' | 'zigzag' | 'circles';

export type GlitchMode = 'none' | 'invert' | 'corrupt' | 'smear' | 'channel' | 'bleach';
export type GlitchFormMode = 'bands' | 'wide' | 'mosaic' | 'compress';

export type DitherType = '2x2' | '4x4' | '8x8';

export type HalftonePattern = 'dots' | 'lines' | 'cross' | 'gooey';

export type HeatmapPalette = 'thermal' | 'inferno' | 'ice' | 'acid' | 'sunset';

export interface GradientStop {
  color: string;
  position: number; // 0–1
}

export interface GlassSettings {
  size: number;
  grain: number;
  angle: number;
  shape: GlassShape;
  shadow: number;
  distortion: number;
}

export interface DitheringSettings {
  shadowColor: string;
  frontColor: string;
  lightColor: string;
  highlightColor: string;
  originalColors: boolean;
  invert: boolean;
  type: DitherType;
  size: number;
  colorSteps: number;
}

export interface LiquidSettings {
  frontColor: string;
  highlightColor: string;
  highlights: number;
  waves: number;
  distortion: number;
  size: number;
  scale: number;
  playing: boolean;
}

export interface GlitchySettings {
  glitchStrength: number;
  glitchAmount: number;
  glitchMode: GlitchMode;
  glitchForm: GlitchFormMode;
  crt: boolean;
  scanlines: number;
  glow: number;
  vhsDistortion: boolean;
  vhsWaveStrength: number;
  vhsBandOpacity: number;
  vhsNoiseLevel: number;
  vhsBandHeight: number;
  playing: boolean;
}

export interface HalftoneSettings {
  pattern: HalftonePattern;
  angle: number;
  scale: number;
  radius: number;
  contrast: number;
  blackAndWhite: boolean;
  originalColors: boolean;
  invert: boolean;
  backgroundColor: string;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
}

export interface PaperSettings {
  noise: number;
  diffuse: number;
  paperNoise: number;
  inkBleed: number;
  angle: number;
  xerox: boolean;
  xeroxAmount: number;
  xeroxOpacity: number;
  xeroxThreshold: number;
  scanEnabled: boolean;
  scanTexture: number;
  scanOpacity: number;
  scanScale: number;
}

export interface SymbolEdgesSettings {
  mode: SymbolEdgesMode;
  symbols: string;
  symbolColor: string;
  backgroundColor: string;
  threshold: number;
  glow: number;
  cellSize: number;
  targetColor: string;
  invert: boolean;
  hideImage: boolean;
}

export interface HeatmapSettings {
  palette: HeatmapPalette;
  customGradient: boolean;
  customStops: GradientStop[];
  intensity: number;
  blend: number;
  grain: number;
  blur: number;
}

export interface EditorImageState {
  image: HTMLImageElement | null;
  video: HTMLVideoElement | null;
  src: string | null;
  aspectRatio: number;
  hasUserImage: boolean;
  isVideo: boolean;
  videoPlaying: boolean;
  isReady: boolean;
}

export interface EditorState {
  activeFilter: ActiveFilter;
  layers: ActiveFilter[];
  fitMode: FitMode;
  offsetX: number;
  offsetY: number;
  glass: GlassSettings;
  dithering: DitheringSettings;
  liquid: LiquidSettings;
  glitchy: GlitchySettings;
  halftone: HalftoneSettings;
  symbolEdges: SymbolEdgesSettings;
  paper: PaperSettings;
  heatmap: HeatmapSettings;
  image: EditorImageState;
}

export const defaultGlassSettings: GlassSettings = {
  size: 10,
  grain: 0,
  angle: 0,
  shape: 'lines',
  shadow: 70,
  distortion: 50,
};

export const defaultDitheringSettings: DitheringSettings = {
  shadowColor: '#3D3D7A',
  frontColor: '#798FFF',
  lightColor: '#FFB380',
  highlightColor: '#FA4F29',
  originalColors: false,
  invert: false,
  type: '2x2',
  size: 50,
  colorSteps: 4,
};

export const defaultLiquidSettings: LiquidSettings = {
  frontColor: '#FFF679',
  highlightColor: '#FFFFFF',
  highlights: 1,
  waves: 32,
  distortion: 30,
  size: 50,
  scale: 50,
  playing: true,
};

export const defaultGlitchySettings: GlitchySettings = {
  glitchStrength: 50,
  glitchAmount: 40,
  glitchMode: 'invert',
  glitchForm: 'bands',
  crt: false,
  scanlines: 50,
  glow: 20,
  vhsDistortion: false,
  vhsWaveStrength: 50,
  vhsBandOpacity: 40,
  vhsNoiseLevel: 30,
  vhsBandHeight: 30,
  playing: true,
};

export const defaultSymbolEdgesSettings: SymbolEdgesSettings = {
  mode: 'edges',
  symbols: '01',
  symbolColor: '#FFFFFF',
  backgroundColor: '#000000',
  threshold: 60,
  glow: 0,
  cellSize: 30,
  targetColor: '#808080',
  invert: false,
  hideImage: false,
};

export const defaultPaperSettings: PaperSettings = {
  noise: 40,
  diffuse: 0,
  paperNoise: 0,
  inkBleed: 20,
  angle: 0,
  xerox: false,
  xeroxAmount: 50,
  xeroxOpacity: 80,
  xeroxThreshold: 50,
  scanEnabled: false,
  scanTexture: 3,
  scanOpacity: 50,
  scanScale: 25,
};

export const defaultHeatmapSettings: HeatmapSettings = {
  palette: 'thermal',
  customGradient: false,
  customStops: [
    { color: '#000000', position: 0 },
    { color: '#808080', position: 0.5 },
    { color: '#ffffff', position: 1 },
  ],
  intensity: 50,
  blend: 100,
  grain: 0,
  blur: 0,
};

export const defaultHalftoneSettings: HalftoneSettings = {
  pattern: 'dots',
  angle: 0,
  scale: 20,
  radius: 56,
  contrast: 0,
  blackAndWhite: true,
  originalColors: false,
  invert: false,
  backgroundColor: '#FFFFFF',
  color1: '#000000',
  color2: '#FF7043',
  color3: '#7B1FA2',
  color4: '#1A1A2E',
};

