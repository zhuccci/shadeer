# Shadeer — Case Study
### Browser-based real-time shader effects for creators

---

## Overview

Shadeer is a free, browser-based image and video editing tool that applies real-time GPU shader effects — glass, dithering, liquid animation, glitch/VHS, halftone, heatmap, paper texture, and more. It runs entirely on-device (WebGL2), requires no login or install, and exports full-resolution PNG, MP4, or WebM.

**Live:** https://zhuccci.github.io/shadeer/  
**Role:** Design + engineering (solo project)  
**Stack:** React, TypeScript, WebGL2 (GLSL shaders), Vite

---

## The Problem

Most creative image effects tools are either locked behind subscriptions, require a desktop install, or produce output that looks immediately recognizable as AI-generated or filter-saturated. There's a gap between "one-tap Instagram filter" and "open After Effects." Shadeer sits in that gap — shader-quality visuals, directly in the browser, with enough control knobs that the result looks like *yours*.

> "Make your images and videos look like nothing else in the feed."

---

## Design Goals

1. **Feel fast** — interactions should respond at 60fps, every control should give immediate feedback on the canvas
2. **Stay out of the way** — dark, quiet UI that doesn't compete with the image being edited
3. **Be approachable** — controls that feel designed, not technical; no jargon where a slider or knob will do
4. **Work on mobile** — full feature parity on phones, not a stripped-down version

---

## Visual Design

### Color System

The UI is built around a minimal dark palette with a single warm accent:

| Token | Value | Role |
|---|---|---|
| `--accent` | `#fff679` | Selected state, primary buttons, active sliders |
| `--bg` | `#0e0e0e` | Page background |
| `--panel-dark` | `#141414` | Input fields, dropdowns |
| `--panel-mid` | `#202020` | Controls panel, image canvas area |
| `--panel-light` | `#373737` | Sidebar, filter strip |
| `--text` | `#d6d6d6` | Primary labels |

The yellow accent is deliberately unusual — it reads as "selected" at a glance against the dark grays without being a primary color, keeping attention on the image rather than the chrome.

### Typography

Geist as primary typeface (falls back to Inter, then system-ui). Chosen for its neutral technical character — it reads clearly at small label sizes without adding personality that might compete with the visual output.

### Landing Page

`[ ADD SCREENSHOT — landing page hero with deer video + "Made to be noticed" headline ]`

The hero features a looping `.webm` video of a deer rendered through the app's own shaders — a live demonstration of what the tool produces. Three different deer clips are randomly selected on each load, so returning visitors see variation. The CTA sits at the bottom of the viewport, giving the visual full breathing room.

---

## The Editor

`[ ADD SCREENSHOT — full editor desktop layout with an image loaded and Glass filter active ]`

### Layout

The editor is a single-screen layout: the image canvas occupies the center, a horizontal scrollable filter strip runs below it, and the active filter's control panel sits to the right. There's no modal, no sidebar nav, no separate settings page — everything visible at once.

### Filter Strip

`[ ADD SCREENSHOT — filter strip close-up, showing thumbnail cards with hover states ]`

Each filter has a thumbnail card with two states: a default image and a hover/active image that reveals the filter effect applied to a sample. The active filter's card glows with the yellow accent. Scroll is horizontal, with momentum. On desktop, vertical wheel events are mapped to horizontal scroll so users don't need to grab a scrollbar.

---

## The Filters

Nine shader effects, each with its own control panel:

### Glass
`[ ADD SCREENSHOT — Glass filter: square or hexagon grid creating tiled frosted effect ]`

Tiles the image through a configurable grid of glass shapes (circle, square, hexagon, diamond, triangle). Controls: shape picker, size, distortion, shadow depth, grain, and a **rotation knob** for grid angle.

### Dithering
`[ ADD SCREENSHOT — Dithering filter: high-contrast posterized image with dither pattern ]`

Floyd–Steinberg and ordered dithering variants. A 4-channel color system (shadow, front, light, highlight) lets users map luminance zones to custom colors — or pick from six built-in palettes (Mono, Flame, Ocean, Neon, Gameboy, Dusk). Palette swatches are rendered as four solid color segments in a live canvas element.

### Liquid
`[ ADD SCREENSHOT — Liquid filter: fluid distortion ripples over a portrait ]`

Animated fluid distortion driven by a time uniform in the GLSL shader. Controls: wave frequency, distortion amount, size, scale, highlights intensity, and highlight tint color. Plays in real-time in the preview; the output is rendered to a video file at export.

### Glitchy
`[ ADD SCREENSHOT — Glitchy filter: RGB chroma split + VHS color band artifacts ]`

The most layered filter. Combines:
- **Glitch form** — Smear, Bands, Compress, Offset, Slice (selectable via icon strip)
- **Glitch mode** — controls the animation pattern
- **Chroma shift** — RGB channel separation
- **Glow** — per-sample luminance threshold + screen blend
- **CRT** toggle with scanline density slider (collapses when off)
- **VHS Distortion** toggle with wave strength, band opacity, and band height (collapses when off)

The collapsible sections animate open/close via CSS `max-height` transitions — no layout shift.

### Halftone
`[ ADD SCREENSHOT — Halftone filter: large-dot halftone pattern in a custom 4-color scheme ]`

Dot/pattern halftone with controls for scale, radius, contrast, and angle (knob). Supports original colors or a 1–4 color palette. An optional "Area" toggle lets users mask the effect to shadows or highlights only.

### Symbols
`[ ADD SCREENSHOT — Symbols filter: edge detection with ASCII/symbol overlay ]`

Runs edge detection on the image and replaces edges with characters from a user-editable symbol string. Supports a "matching color" mode that targets a specific hue rather than edges. Includes an optional glow.

### Paper
`[ ADD SCREENSHOT — Paper filter: photo with grain, diffuse, and scan-line texture ]`

Layered print/photocopy aesthetic. Grain, diffuse, dust, ink bleed — and an optional Xerox mode that binarizes the image to simulate photocopier artifacts. A secondary scan texture (selectable pattern) overlays at a configurable angle and opacity.

### Heatmap
`[ ADD SCREENSHOT — Heatmap filter: thermal or inferno palette over a landscape ]`

Maps image luminance to a color gradient. Five built-in scientific palettes (Thermal, Inferno, Ice, Acid, Sunset), plus a full custom gradient editor: draggable color stops on a gradient bar, add stops by clicking, drag off-bar to delete.

### Blur
`[ ADD SCREENSHOT — Blur filter: motion blur on a car photo ]`

Three blur types: Gaussian, Motion (directional, with angle knob), and Radial/Zoom (center-weighted). Film grain is additive so blurred areas don't read as clean composite.

---

## Custom Controls

Every control was designed and built from scratch — no library components.

### Slider
`[ ADD SCREENSHOT — slider control close-up ]`

Drag on the track or type directly in the numeric field. Active state uses the yellow accent fill. Supports arbitrary min/max ranges.

### Knob
`[ ADD SCREENSHOT — angle knob close-up, showing tick marks ]`

Circular drag control for angles. Includes inertia (velocity carries past pointer release), tick marks at cardinal points, and degree labels. Used for glass grid angle, halftone angle, motion blur direction, and paper scan angle.

### Color Picker
`[ ADD SCREENSHOT — color swatch + hex input, and mobile color picker full-screen ]`

A swatch button + hex input on desktop. On mobile, tapping the swatch triggers a full-panel color picker that expands with a CSS scale animation originating from the swatch's exact screen position — the transform-origin is computed at runtime from the DOM rect.

### Checkbox (toggle)
`[ ADD SCREENSHOT — checkbox control, checked and unchecked states ]`

Custom pill-style checkbox that doubles as a section toggle (e.g., enabling CRT reveals the Scanlines slider beneath it).

---

## Layers

`[ ADD SCREENSHOT — layers panel with 2-3 effects stacked, one hidden ]`

Filters can be stacked. The Layers panel (desktop: sidebar panel; mobile: bottom sheet overlay) shows the current stack with:
- Eye icon to toggle visibility without removing the layer
- Drag-and-drop reorder
- Trash to remove

This lets users combine, say, a Dithering pass under a Glitchy pass, or a Heatmap under a Paper texture.

---

## Mobile Experience

`[ ADD SCREENSHOT — mobile view: bottom sheet collapsed, filter strip visible ]`

`[ ADD SCREENSHOT — mobile view: bottom sheet expanded with Glass sliders ]`

The mobile UI replaces the desktop sidebar with a **bottom sheet drawer**. The sheet has three states: resting (filter strip + action bar visible), expanded (settings panel open), and color picker (full-panel native-feeling color picker).

Key interaction details:
- **Swipe left/right** on the settings panel switches between the two tabs (e.g., Sliders ↔ Colors) — interpreted as a swipe only if horizontal delta exceeds vertical by 3:1
- **Mobile color picker** animates open from the swatch that triggered it, using a computed `transform-origin`
- **Pinch-to-zoom** on the canvas with simultaneous two-finger drag; double-tap zooms to that area
- **RAF guard** on mobile: uniform updates throttled to one per animation frame to stay at 60fps on lower-end devices
- **Layers** accessible via an icon in the sheet header; panel slides in over the settings without a route change

---

## Export

Users can save:
- **PNG** — off-screen canvas render at full original image resolution
- **MP4 (H.264)** — 15-second render of the animated effect via `MediaRecorder` + `mp4box.js` transcode
- **WebM** — direct `MediaRecorder` output (faster, no transcode)

A progress indicator in the Save button shows recording percentage. On mobile, the button shows "0%→100%" numerically with the ghost text sized to prevent layout shift during the count.

---

## Technical Highlights

- All GLSL fragment shaders live in a single `shaders.ts` — one file to audit, diff, and extend
- `ShaderMount` class owns the full WebGL2 lifecycle: shader compile, uniform upload, canvas resize via `ResizeObserver`, RAF loop, and `dispose()`
- State is a single `EditorState` object in `App.tsx`, no context or reducer — simple, traceable data flow
- Vanilla CSS with no framework; design tokens as CSS custom properties
- Fully static build (GitHub Pages), no server required
- Figma Code Connect mapping for component library sync

---

## What I'd Do Next

- **Presets / gallery** — let users save and share named preset configurations
- **Undo / history** — a lightweight stack of `EditorState` snapshots
- **Video input scrubbing** — frame-accurate scrub bar for video imports
- **More filter combinations** — e.g., Glass + Heatmap composite in a single shader pass

---

*Built by Denys Zhuk — [Instagram](https://www.instagram.com/zhucccci)*
