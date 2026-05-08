import './EditorPanels.css';
import { sanitizeHex } from '../lib/editor';
import type { EditorState } from '../types/editor';
import { DitheringPanel } from './panels/DitheringPanel';
import { GlassPanel } from './panels/GlassPanel';
import { GlitchyPanel } from './panels/GlitchyPanel';
import { HalftonePanel } from './panels/HalftonePanel';
import { LiquidPanel } from './panels/LiquidPanel';
import { PaperPanel } from './panels/PaperPanel';
import { HeatmapPanel } from './panels/HeatmapPanel';
import { SymbolEdgesPanel } from './panels/SymbolEdgesPanel';
import { BlurPanel } from './panels/BlurPanel';

interface EditorPanelsProps {
  state: EditorState;
  updateState: (updater: (state: EditorState) => EditorState) => void;
}

export function EditorPanels({ state, updateState }: EditorPanelsProps) {
  return (
    <div id="panelWrapper">
      <GlassPanel
        state={state}
        isActive={state.activeFilter === 'glass'}
        onShapeChange={(shape) => updateState((current) => ({ ...current, glass: { ...current.glass, shape } }))}
        onSizeChange={(size) => updateState((current) => ({ ...current, glass: { ...current.glass, size } }))}
        onGrainChange={(grain) => updateState((current) => ({ ...current, glass: { ...current.glass, grain } }))}
        onAngleChange={(angle) => updateState((current) => ({ ...current, glass: { ...current.glass, angle } }))}
        onShadowChange={(shadow) => updateState((current) => ({ ...current, glass: { ...current.glass, shadow } }))}
        onDistortionChange={(distortion) => updateState((current) => ({ ...current, glass: { ...current.glass, distortion } }))}
      />

      <DitheringPanel
        state={state}
        isActive={state.activeFilter === 'dithering'}
        onShadowColorChange={(shadowColor) =>
          updateState((current) => ({
            ...current,
            dithering: {
              ...current.dithering,
              shadowColor: sanitizeHex(shadowColor, current.dithering.shadowColor),
            },
          }))
        }
        onFrontColorChange={(frontColor) =>
          updateState((current) => ({
            ...current,
            dithering: {
              ...current.dithering,
              frontColor: sanitizeHex(frontColor, current.dithering.frontColor),
            },
          }))
        }
        onLightColorChange={(lightColor) =>
          updateState((current) => ({
            ...current,
            dithering: {
              ...current.dithering,
              lightColor: sanitizeHex(lightColor, current.dithering.lightColor),
            },
          }))
        }
        onHighlightColorChange={(highlightColor) =>
          updateState((current) => ({
            ...current,
            dithering: {
              ...current.dithering,
              highlightColor: sanitizeHex(highlightColor, current.dithering.highlightColor),
            },
          }))
        }
        onOriginalColorsChange={(originalColors) =>
          updateState((current) => ({
            ...current,
            dithering: { ...current.dithering, originalColors },
          }))
        }
        onInvertChange={(invert) =>
          updateState((current) => ({
            ...current,
            dithering: { ...current.dithering, invert },
          }))
        }
        onTypeChange={(type) =>
          updateState((current) => ({
            ...current,
            dithering: { ...current.dithering, type },
          }))
        }
        onSizeChange={(size) =>
          updateState((current) => ({
            ...current,
            dithering: { ...current.dithering, size },
          }))
        }
        onColorStepsChange={(colorSteps) =>
          updateState((current) => ({
            ...current,
            dithering: { ...current.dithering, colorSteps },
          }))
        }
      />

      <LiquidPanel
        state={state}
        isActive={state.activeFilter === 'liquid'}
        onHighlightColorChange={(highlightColor) =>
          updateState((current) => ({
            ...current,
            liquid: {
              ...current.liquid,
              highlightColor: sanitizeHex(highlightColor, current.liquid.highlightColor),
            },
          }))
        }
        onTogglePlaying={() =>
          updateState((current) => ({
            ...current,
            liquid: { ...current.liquid, playing: !current.liquid.playing },
          }))
        }
        onHighlightsChange={(highlights) => updateState((current) => ({ ...current, liquid: { ...current.liquid, highlights } }))}
        onWavesChange={(waves) => updateState((current) => ({ ...current, liquid: { ...current.liquid, waves } }))}
        onDistortionChange={(distortion) =>
          updateState((current) => ({ ...current, liquid: { ...current.liquid, distortion } }))
        }
        onSizeChange={(size) => updateState((current) => ({ ...current, liquid: { ...current.liquid, size } }))}
        onScaleChange={(scale) => updateState((current) => ({ ...current, liquid: { ...current.liquid, scale } }))}
      />

      <GlitchyPanel
        state={state}
        isActive={state.activeFilter === 'glitchy'}
        onGlitchStrengthChange={(glitchStrength) => updateState((current) => ({ ...current, glitchy: { ...current.glitchy, glitchStrength } }))}
        onGlitchAmountChange={(glitchAmount) => updateState((current) => ({ ...current, glitchy: { ...current.glitchy, glitchAmount } }))}
        onGlitchModeChange={(glitchMode) => updateState((current) => ({ ...current, glitchy: { ...current.glitchy, glitchMode } }))}
        onGlitchFormChange={(glitchForm) => updateState((current) => ({ ...current, glitchy: { ...current.glitchy, glitchForm } }))}
        onCrtChange={(crt) => updateState((current) => ({ ...current, glitchy: { ...current.glitchy, crt } }))}
        onScanlinesChange={(scanlines) => updateState((current) => ({ ...current, glitchy: { ...current.glitchy, scanlines } }))}
        onVhsDistortionChange={(vhsDistortion) => updateState((current) => ({ ...current, glitchy: { ...current.glitchy, vhsDistortion } }))}
        onVhsWaveStrengthChange={(vhsWaveStrength) => updateState((current) => ({ ...current, glitchy: { ...current.glitchy, vhsWaveStrength } }))}
        onVhsBandOpacityChange={(vhsBandOpacity) => updateState((current) => ({ ...current, glitchy: { ...current.glitchy, vhsBandOpacity } }))}
        onVhsNoiseLevelChange={(vhsNoiseLevel) => updateState((current) => ({ ...current, glitchy: { ...current.glitchy, vhsNoiseLevel } }))}
        onVhsBandHeightChange={(vhsBandHeight) => updateState((current) => ({ ...current, glitchy: { ...current.glitchy, vhsBandHeight } }))}
        onTogglePlaying={() => updateState((current) => ({ ...current, glitchy: { ...current.glitchy, playing: !current.glitchy.playing } }))}
      />

      <HalftonePanel
        state={state}
        isActive={state.activeFilter === 'halftone'}
        onPatternChange={(pattern) => updateState((current) => ({ ...current, halftone: { ...current.halftone, pattern } }))}
        onAngleChange={(angle) => updateState((current) => ({ ...current, halftone: { ...current.halftone, angle } }))}
        onScaleChange={(scale) => updateState((current) => ({ ...current, halftone: { ...current.halftone, scale } }))}
        onRadiusChange={(radius) => updateState((current) => ({ ...current, halftone: { ...current.halftone, radius } }))}
        onContrastChange={(contrast) => updateState((current) => ({ ...current, halftone: { ...current.halftone, contrast } }))}
        onShadowRangeChange={(shadowRange) => updateState((current) => ({ ...current, halftone: { ...current.halftone, shadowRange } }))}
        onShadowInvertChange={(shadowInvert) => updateState((current) => ({ ...current, halftone: { ...current.halftone, shadowInvert } }))}
        onBlackAndWhiteChange={(blackAndWhite) => updateState((current) => ({ ...current, halftone: { ...current.halftone, blackAndWhite } }))}
        onOriginalColorsChange={(originalColors) => updateState((current) => ({ ...current, halftone: { ...current.halftone, originalColors } }))}
        onInvertChange={(invert) => updateState((current) => ({ ...current, halftone: { ...current.halftone, invert } }))}
        onBackgroundColorChange={(backgroundColor) => updateState((current) => ({ ...current, halftone: { ...current.halftone, backgroundColor: sanitizeHex(backgroundColor, current.halftone.backgroundColor) } }))}
        onColor1Change={(color1) => updateState((current) => ({ ...current, halftone: { ...current.halftone, color1: sanitizeHex(color1, current.halftone.color1) } }))}
        onColor2Change={(color2) => updateState((current) => ({ ...current, halftone: { ...current.halftone, color2: sanitizeHex(color2, current.halftone.color2) } }))}
        onColor3Change={(color3) => updateState((current) => ({ ...current, halftone: { ...current.halftone, color3: sanitizeHex(color3, current.halftone.color3) } }))}
        onColor4Change={(color4) => updateState((current) => ({ ...current, halftone: { ...current.halftone, color4: sanitizeHex(color4, current.halftone.color4) } }))}
      />

      <PaperPanel
        state={state}
        isActive={state.activeFilter === 'paper'}
        onNoiseChange={(noise) => updateState((current) => ({ ...current, paper: { ...current.paper, noise } }))}
        onDiffuseChange={(diffuse) => updateState((current) => ({ ...current, paper: { ...current.paper, diffuse } }))}
        onPaperNoiseChange={(paperNoise) => updateState((current) => ({ ...current, paper: { ...current.paper, paperNoise } }))}
        onInkBleedChange={(inkBleed) => updateState((current) => ({ ...current, paper: { ...current.paper, inkBleed } }))}
        onAngleChange={(angle) => updateState((current) => ({ ...current, paper: { ...current.paper, angle } }))}
        onXeroxChange={(xerox) => updateState((current) => ({ ...current, paper: { ...current.paper, xerox } }))}
        onXeroxAmountChange={(xeroxAmount) => updateState((current) => ({ ...current, paper: { ...current.paper, xeroxAmount } }))}
        onXeroxOpacityChange={(xeroxOpacity) => updateState((current) => ({ ...current, paper: { ...current.paper, xeroxOpacity } }))}
        onXeroxThresholdChange={(xeroxThreshold) => updateState((current) => ({ ...current, paper: { ...current.paper, xeroxThreshold } }))}
        onScanEnabledChange={(scanEnabled) => updateState((current) => ({ ...current, paper: { ...current.paper, scanEnabled } }))}
        onScanTextureChange={(scanTexture) => updateState((current) => ({ ...current, paper: { ...current.paper, scanTexture } }))}
        onScanOpacityChange={(scanOpacity) => updateState((current) => ({ ...current, paper: { ...current.paper, scanOpacity } }))}
        onScanScaleChange={(scanScale) => updateState((current) => ({ ...current, paper: { ...current.paper, scanScale } }))}
      />

      <HeatmapPanel
        state={state}
        isActive={state.activeFilter === 'heatmap'}
        onPaletteChange={(palette) => updateState((current) => ({ ...current, heatmap: { ...current.heatmap, palette } }))}
        onCustomGradientChange={(customGradient) => updateState((current) => ({ ...current, heatmap: { ...current.heatmap, customGradient } }))}
        onCustomStopsChange={(customStops) => updateState((current) => ({ ...current, heatmap: { ...current.heatmap, customStops } }))}
        onIntensityChange={(intensity) => updateState((current) => ({ ...current, heatmap: { ...current.heatmap, intensity } }))}
        onBlendChange={(blend) => updateState((current) => ({ ...current, heatmap: { ...current.heatmap, blend } }))}
        onGrainChange={(grain) => updateState((current) => ({ ...current, heatmap: { ...current.heatmap, grain } }))}
        onBlurChange={(blur) => updateState((current) => ({ ...current, heatmap: { ...current.heatmap, blur } }))}
      />

      <SymbolEdgesPanel
        state={state}
        isActive={state.activeFilter === 'symbolEdges'}
        onModeChange={(mode) => updateState((current) => ({ ...current, symbolEdges: { ...current.symbolEdges, mode } }))}
        onSymbolsChange={(symbols) => updateState((current) => ({ ...current, symbolEdges: { ...current.symbolEdges, symbols } }))}
        onSymbolColorChange={(symbolColor) => updateState((current) => ({ ...current, symbolEdges: { ...current.symbolEdges, symbolColor: sanitizeHex(symbolColor, current.symbolEdges.symbolColor) } }))}
        onThresholdChange={(threshold) => updateState((current) => ({ ...current, symbolEdges: { ...current.symbolEdges, threshold } }))}
        onGlowChange={(glow) => updateState((current) => ({ ...current, symbolEdges: { ...current.symbolEdges, glow } }))}
        onCellSizeChange={(cellSize) => updateState((current) => ({ ...current, symbolEdges: { ...current.symbolEdges, cellSize } }))}
        onTargetColorChange={(targetColor) => updateState((current) => ({ ...current, symbolEdges: { ...current.symbolEdges, targetColor: sanitizeHex(targetColor, current.symbolEdges.targetColor) } }))}
        onInvertChange={(invert) => updateState((current) => ({ ...current, symbolEdges: { ...current.symbolEdges, invert } }))}
        onHideImageChange={(hideImage) => updateState((current) => ({ ...current, symbolEdges: { ...current.symbolEdges, hideImage } }))}
      />

      <BlurPanel
        state={state}
        isActive={state.activeFilter === 'blur'}
        onTypeChange={(type) => updateState((current) => ({ ...current, blur: { ...current.blur, type, ...(type === 'radial' ? { centerX: 0.5, centerY: 0.5 } : {}) } }))}
        onStrengthChange={(strength) => updateState((current) => ({ ...current, blur: { ...current.blur, strength } }))}
        onAngleChange={(angle) => updateState((current) => ({ ...current, blur: { ...current.blur, angle } }))}
        onGrainChange={(grain) => updateState((current) => ({ ...current, blur: { ...current.blur, grain } }))}
      />
    </div>
  );
}
