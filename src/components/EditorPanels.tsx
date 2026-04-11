import './EditorPanels.css';
import { sanitizeHex } from '../lib/editor';
import type { EditorState } from '../types/editor';
import { DitheringPanel } from './panels/DitheringPanel';
import { GlassPanel } from './panels/GlassPanel';
import { GlitchyPanel } from './panels/GlitchyPanel';
import { HalftonePanel } from './panels/HalftonePanel';
import { LiquidPanel } from './panels/LiquidPanel';

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
      />

      <DitheringPanel
        state={state}
        isActive={state.activeFilter === 'dithering'}
        onBackgroundColorChange={(backgroundColor) =>
          updateState((current) => ({
            ...current,
            dithering: {
              ...current.dithering,
              backgroundColor: sanitizeHex(backgroundColor, current.dithering.backgroundColor),
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
        onFrontColorChange={(frontColor) =>
          updateState((current) => ({
            ...current,
            liquid: {
              ...current.liquid,
              frontColor: sanitizeHex(frontColor, current.liquid.frontColor),
            },
          }))
        }
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
        onContrastChange={(contrast) => updateState((current) => ({ ...current, halftone: { ...current.halftone, contrast } }))}
        onBrightnessChange={(brightness) => updateState((current) => ({ ...current, halftone: { ...current.halftone, brightness } }))}
        onBlackAndWhiteChange={(blackAndWhite) => updateState((current) => ({ ...current, halftone: { ...current.halftone, blackAndWhite } }))}
        onOriginalColorsChange={(originalColors) => updateState((current) => ({ ...current, halftone: { ...current.halftone, originalColors } }))}
        onInvertChange={(invert) => updateState((current) => ({ ...current, halftone: { ...current.halftone, invert } }))}
        onBackgroundColorChange={(backgroundColor) => updateState((current) => ({ ...current, halftone: { ...current.halftone, backgroundColor: sanitizeHex(backgroundColor, current.halftone.backgroundColor) } }))}
        onColor1Change={(color1) => updateState((current) => ({ ...current, halftone: { ...current.halftone, color1: sanitizeHex(color1, current.halftone.color1) } }))}
        onColor2Change={(color2) => updateState((current) => ({ ...current, halftone: { ...current.halftone, color2: sanitizeHex(color2, current.halftone.color2) } }))}
        onColor3Change={(color3) => updateState((current) => ({ ...current, halftone: { ...current.halftone, color3: sanitizeHex(color3, current.halftone.color3) } }))}
        onColor4Change={(color4) => updateState((current) => ({ ...current, halftone: { ...current.halftone, color4: sanitizeHex(color4, current.halftone.color4) } }))}
        onGrainOverlayChange={(grainOverlay) => updateState((current) => ({ ...current, halftone: { ...current.halftone, grainOverlay } }))}
        onBlobThresholdChange={(blobThreshold) => updateState((current) => ({ ...current, halftone: { ...current.halftone, blobThreshold } }))}
      />
    </div>
  );
}
