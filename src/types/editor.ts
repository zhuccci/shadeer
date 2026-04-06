export type ActiveFilter = 'glass' | 'dithering' | 'liquid' | 'glitchy';

export type FitMode = 'fill' | 'fit';

export type GlassShape = 'lines' | 'wave' | 'zigzag' | 'circles';

export type DitherType = '2x2' | '4x4' | '8x8';

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
  rgbShift: number;
  crt: number;
  glow: number;
  scanlines: number;
  invertGlitch: number;
  tvDistortion: boolean;
  angle: number;
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
  highlights: 50,
  waves: 50,
  distortion: 50,
  size: 50,
  scale: 50,
  playing: true,
};

export const defaultGlitchySettings: GlitchySettings = {
  rgbShift: 50,
  crt: 30,
  glow: 30,
  scanlines: 50,
  invertGlitch: 0,
  tvDistortion: false,
  angle: 0,
};

