import './EditorPanels.css';
import { sanitizeHex } from '../lib/editor';
import type { EditorState } from '../types/editor';
import { DitheringPanel } from './panels/DitheringPanel';
import { GlassPanel } from './panels/GlassPanel';
import { GlitchyPanel } from './panels/GlitchyPanel';
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
        onRgbShiftChange={(rgbShift) => updateState((current) => ({ ...current, glitchy: { ...current.glitchy, rgbShift } }))}
        onCrtChange={(crt) => updateState((current) => ({ ...current, glitchy: { ...current.glitchy, crt } }))}
        onGlowChange={(glow) => updateState((current) => ({ ...current, glitchy: { ...current.glitchy, glow } }))}
        onScanlinesChange={(scanlines) => updateState((current) => ({ ...current, glitchy: { ...current.glitchy, scanlines } }))}
        onInvertGlitchChange={(invertGlitch) =>
          updateState((current) => ({ ...current, glitchy: { ...current.glitchy, invertGlitch } }))
        }
        onTvDistortionChange={(tvDistortion) =>
          updateState((current) => ({ ...current, glitchy: { ...current.glitchy, tvDistortion } }))
        }
        onAngleChange={(angle) => updateState((current) => ({ ...current, glitchy: { ...current.glitchy, angle } }))}
      />
    </div>
  );
}
