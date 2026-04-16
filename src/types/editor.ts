export type ActiveFilter = 'glass' | 'dithering' | 'liquid' | 'glitchy' | 'halftone' | 'symbolEdges';

export type SymbolEdgesMode = 'edges' | 'color';

export type FitMode = 'fill' | 'fit';

export type GlassShape = 'lines' | 'wave' | 'zigzag' | 'circles';

export type GlitchMode = 'none' | 'invert' | 'corrupt' | 'smear' | 'channel' | 'bleach';
export type GlitchFormMode = 'bands' | 'wide' | 'mosaic' | 'compress';

export type DitherType = '2x2' | '4x4' | '8x8';

export type HalftonePattern = 'dots' | 'print' | 'lines' | 'cross' | 'grunge' | 'blob';

export interface GlassSettings {
  size: number;
  grain: number;
  angle: number;
  shape: GlassShape;
}

export interface DitheringSettings {
  backgroundColor: string;
  frontColor: string;
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
  contrast: number;
  brightness: number;
  blackAndWhite: boolean;
  originalColors: boolean;
  invert: boolean;
  backgroundColor: string;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  grainOverlay: number;
  blobThreshold: number;
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

export interface EditorImageState {
  image: HTMLImageElement | null;
  src: string | null;
  aspectRatio: number;
  hasUserImage: boolean;
  isReady: boolean;
}

export interface EditorState {
  activeFilter: ActiveFilter;
  fitMode: FitMode;
  offsetX: number;
  offsetY: number;
  glass: GlassSettings;
  dithering: DitheringSettings;
  liquid: LiquidSettings;
  glitchy: GlitchySettings;
  halftone: HalftoneSettings;
  symbolEdges: SymbolEdgesSettings;
  image: EditorImageState;
}

export const defaultGlassSettings: GlassSettings = {
  size: 10,
  grain: 0,
  angle: 0,
  shape: 'lines',
};

export const defaultDitheringSettings: DitheringSettings = {
  backgroundColor: '#FFF679',
  frontColor: '#798FFF',
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
  distortion: 1,
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

export const defaultHalftoneSettings: HalftoneSettings = {
  pattern: 'dots',
  angle: 0,
  scale: 20,
  contrast: 50,
  brightness: 50,
  blackAndWhite: true,
  originalColors: false,
  invert: false,
  backgroundColor: '#FFFFFF',
  color1: '#000000',
  color2: '#FF7043',
  color3: '#7B1FA2',
  color4: '#1A1A2E',
  grainOverlay: 0,
  blobThreshold: 50,
};

