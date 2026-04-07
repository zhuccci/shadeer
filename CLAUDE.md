# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

Neuroshade is a React + TypeScript image editing tool with real-time WebGL2 shader effects (glass, dithering, liquid, glitchy). Built with Vite, deployed to GitHub Pages.

## Running the app

```bash
yarn dev        # dev server (hot reload)
yarn build      # type-check + production build → docs/
yarn preview    # preview the production build locally
```

Package manager: **Yarn 4.10.3**. Do not use npm.

## File structure

```
src/
  App.tsx                    # Root component — holds all state, wires everything
  main.tsx                   # React entry point
  types/
    editor.ts                # EditorState type + all sub-types + default values
  lib/
    editor.ts                # Image loading, uniform builders, PNG export
    shaders.ts               # ShaderMount class + all GLSL shader sources
  hooks/
    useShaderPreview.ts      # Shader mount lifecycle (create/update/destroy)
    useImageDrag.ts          # Fill-mode image panning with pointer events
    useHorizontalWheelScroll.ts  # Converts vertical wheel → horizontal scroll
  components/
    App.tsx                  # (re-exported, same as src/App.tsx)
    ActionBar.tsx            # Save / Upload buttons
    EditorPanels.tsx         # Renders the active filter panel
    FilterStrip.tsx          # Horizontal scrollable filter button strip
    PreviewStage.tsx         # Canvas preview area + fit/fill toggle
    NoiseLayer.tsx           # Grain overlay (canvas noise)
    SliderControl.tsx        # Draggable slider with numeric input
    KnobControl.tsx          # Circular angle knob with inertia + ticks
    ColorSelectorControl.tsx # Color swatch + hex input
    CheckboxControl.tsx      # Custom checkbox button
    ShapeSelector.tsx        # Dropdown for glass grid shapes
    DitherTypeSelector.tsx   # Icon button group for dither types
    filterOptions.tsx        # Filter metadata (labels, thumbnails, implemented flag)
    icons/
      AppIcons.tsx           # FilterIcon, UploadIcon, SaveIcon SVG components
    panels/
      GlassPanel.tsx         # Shape, Size, Grain, Angle controls
      DitheringPanel.tsx     # Colors, dither type, sliders, checkboxes
      LiquidPanel.tsx        # Colors, play/pause, animation sliders
      GlitchyPanel.tsx       # RGB shift, CRT, glow, scanlines, TV distortion
    *.css                    # One CSS file per component
  styles/
    app.css                  # Global layout, CSS variables, shell styles

public/
  icons/                     # Dithering type selector icons
  placeholders/              # Filter button thumbnails (base + hover variants)
  og-image.png               # Default fallback image
  placeholder.png

blueprints/                  # Reference HTML prototypes — not part of the app
docs/                        # Build output (GitHub Pages)
index.html                   # Vite entry HTML
vite.config.ts               # base: '/neuroshade/', outDir: 'docs'
figma.json                   # Figma Code Connect mapping (file key: vuz3bNrwb0IuzmzhgDuxk1)
```

## State management

All state lives in `App.tsx` as a single `EditorState` object (typed in `src/types/editor.ts`).

```typescript
interface EditorState {
  activeFilter: 'glass' | 'dithering' | 'liquid' | 'glitchy';
  fitMode: 'fill' | 'fit';
  offsetX: number;        // fill-mode pan (normalized)
  offsetY: number;
  glass: GlassSettings;
  dithering: DitheringSettings;
  liquid: LiquidSettings;
  glitchy: GlitchySettings;
  image: EditorImageState;
}
```

Updates use a callback pattern: `updateState((current) => ({ ...current, ... }))`. No context, no reducer — state stays in `App.tsx` and flows down as props + callbacks.

## Shader pipeline

**All GLSL lives in `src/lib/shaders.ts`** — vertex shader + four fragment shaders (glass, dithering, liquid, glitchy).

**`ShaderMount`** (also in `shaders.ts`) is the WebGL2 runtime:
- Compiles shaders, manages uniforms + textures
- Handles canvas resize via `ResizeObserver`
- `render(now)` for animation frames, `dispose()` for cleanup

**`src/lib/editor.ts`** provides:
- `buildGlassUniforms()`, `buildDitheringUniforms()`, `buildLiquidUniforms()`, `buildGlitchyUniforms()`
- `getShaderConfig(editorState, image)` — returns fragment shader + uniforms + speed for the active filter
- `renderShaderToBlob()` — off-screen canvas at full image resolution for PNG export
- `hexToVec4()`, `loadImage()`

**`useShaderPreview`** hook watches `editorState` and:
1. Re-creates `ShaderMount` when the active filter changes
2. Calls `setUniforms()` on every state change
3. Drives the RAF loop

## CSS approach

Vanilla CSS — no Tailwind, no CSS modules, no CSS-in-JS.

- **Design tokens** in `src/styles/app.css` as CSS custom properties:

| Variable | Value | Usage |
|---|---|---|
| `--accent` | `#fff679` | Selected state, primary button, active slider |
| `--bg` | `#0e0e0e` | Body background |
| `--panel-dark` | `#141414` | Input fields, dropdowns |
| `--panel-mid` | `#202020` | Controls panel, image area |
| `--panel-light` | `#373737` | Sidebar, filter buttons |
| `--preview-bg` | `#1a1a1a` | Preview area background |
| `--text` | `#d6d6d6` | Primary text |
| `--text-muted` | `#c7c7c7` | Secondary text, icon color |

- Each component has its own `.css` file imported in the `.tsx` file.
- No scoping mechanism — relies on specificity and BEM-like naming.
- Font: `'Geist'` → `'Inter'` → `system-ui`, loaded from Google Fonts in `index.html`.

## Filter button thumbnails

```tsx
<div className="btn-thumbnail">
  <img src="/neuroshade/placeholders/glass.png" className="thumb-base" />
  <img src="/neuroshade/placeholders/glass_hover.png" className="thumb-hover" />
</div>
```

`thumb-hover` is `opacity: 0` by default, transitions to `1` on hover/selected via CSS.

## Adding a new filter

1. Write the fragment shader GLSL in `src/lib/shaders.ts`
2. Add types + defaults in `src/types/editor.ts`
3. Add a `buildXyzUniforms()` function in `src/lib/editor.ts`
4. Add a case to `getShaderConfig()` in `src/lib/editor.ts`
5. Create `src/components/panels/XyzPanel.tsx` + `.css`
6. Add the panel to `EditorPanels.tsx`
7. Add the filter button metadata to `src/components/filterOptions.tsx`
8. Add a button to `FilterStrip.tsx`
9. Add thumbnails to `public/placeholders/`

## Build & deployment

- Output: `docs/` (GitHub Pages)
- Base path: `/neuroshade/` — all `public/` asset URLs must include this prefix (handled automatically by Vite in production; use `/neuroshade/path` in code if hardcoding)
- No server required — fully static

## Blueprints

`blueprints/` contains standalone HTML/CSS prototypes for individual components. These are design references only — not imported by the app.
