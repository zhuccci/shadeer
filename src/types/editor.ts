export type ActiveFilter = 'glass' | 'dithering' | 'liquid' | 'glitchy' | 'halftone';

export type FitMode = 'fill' | 'fit';

export type GlassShape = 'lines' | 'wave' | 'zigzag' | 'circles';

export type GlitchMode = 'none' | 'invert' | 'corrupt' | 'smear' | 'channel' | 'bleach';
export type GlitchFormMode = 'bands' | 'wide' | 'mosaic' | 'compress';

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
  scale: number;
  blackAndWhite: boolean;
  backgroundColor: string;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  grainOverlay: number;
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

export const defaultHalftoneSettings: HalftoneSettings = {
  scale: 20,
  blackAndWhite: true,
  backgroundColor: '#FFFFFF',
  color1: '#FFE082',
  color2: '#FF7043',
  color3: '#7B1FA2',
  color4: '#1A1A2E',
  grainOverlay: 0,
};

