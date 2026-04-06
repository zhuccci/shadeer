# Neuroshade Migration Summary

## Overview

Neuroshade was migrated from a single large `index.html` file into a React + TypeScript application built with Vite.

The goal of the migration was:

- preserve the existing visual design and interaction behavior
- keep the custom WebGL shader pipeline rather than replacing it
- make the project readable, maintainable, and extensible
- support static hosting on GitHub Pages as a single-entry frontend app

## Current Stack

- `React`
- `TypeScript`
- `Vite`
- static assets served from `public/`
- custom WebGL2 runtime for shaders, extracted from the original HTML app

## Main Structure

- [src/App.tsx](/Users/boda/Documents/web_works/neuroshade/src/App.tsx)
  - main app shell
  - sidebar, filter strip, control panels, preview, upload/save actions
- [src/types/editor.ts](/Users/boda/Documents/web_works/neuroshade/src/types/editor.ts)
  - typed editor models and defaults
- [src/lib/editor.ts](/Users/boda/Documents/web_works/neuroshade/src/lib/editor.ts)
  - image loading
  - uniform builders
  - fit/fill helpers
  - export-to-blob logic
- [src/lib/shaders.ts](/Users/boda/Documents/web_works/neuroshade/src/lib/shaders.ts)
  - extracted shader source strings
  - `ShaderMount` WebGL runtime
- [src/components](/Users/boda/Documents/web_works/neuroshade/src/components)
  - reusable controls and app sections
  - smaller panel components, preview/action shell, filter strip, and icons
- [src/hooks](/Users/boda/Documents/web_works/neuroshade/src/hooks)
  - shader mount lifecycle
  - filter strip wheel scrolling
  - fill-mode image dragging
- [src/styles/app.css](/Users/boda/Documents/web_works/neuroshade/src/styles/app.css)
  - app-level shell/layout styling only
- component-local CSS files in [src/components](/Users/boda/Documents/web_works/neuroshade/src/components)
  - panel, preview, filter strip, knob, slider, checkbox, color selector, and button styling

## Preserved Features

- implemented filters:
  - `glass`
  - `dithering`
  - `liquid`
  - `glitchy`
- image upload
- drag-and-drop image replacement
- fit/fill toggle
- fill-mode panning
- shader preview updates
- PNG export
- clipboard copy shortcut
- GitHub Pages-compatible static build

## Visual Fidelity Work Already Done

The migration initially preserved functionality but lost some styling fidelity. That was followed by a visual restoration pass.

The following were specifically corrected:

- filter button proportions, shadows, gradients, hover states, and selected states
- original top filter icons, based on [blueprints/filter_icons.html](/Users/boda/Documents/web_works/neuroshade/blueprints/filter_icons.html)
- missing icons for `Upload image`, `Upload new`, and `Save`
- control panel styling and spacing
- `#panelWrapper` restored to original flex behavior:
  - `flex: 1`
  - `min-height: 0`
- angle knob visual styling aligned more closely with [blueprints/angle-knob.html](/Users/boda/Documents/web_works/neuroshade/blueprints/angle-knob.html)
- angle knob interaction restored after a regression

## Important Implementation Notes

### Shader Runtime

The app does not rely on `@paper-design/shaders-react` for the main rendering path.

Instead, it uses the extracted custom runtime in [src/lib/shaders.ts](/Users/boda/Documents/web_works/neuroshade/src/lib/shaders.ts), which is the direct continuation of the original working implementation.

If future work touches preview rendering, exports, or uniform updates, start there first.

### Assets

Assets used by the app are served from `public/`.

Current important folders/files:

- [public/icons](/Users/boda/Documents/web_works/neuroshade/public/icons)
- [public/placeholders](/Users/boda/Documents/web_works/neuroshade/public/placeholders)
- [public/placeholder.png](/Users/boda/Documents/web_works/neuroshade/public/placeholder.png)
- [public/og-image.png](/Users/boda/Documents/web_works/neuroshade/public/og-image.png)

### GitHub Pages

The Vite base path is configured in [vite.config.ts](/Users/boda/Documents/web_works/neuroshade/vite.config.ts) for project-path hosting:

- `base: '/neuroshade/'`

If the repo name changes, this may need to change too.

## Known Caveats

- visual fidelity is much closer now, but any future UI changes should always be checked against the original screenshots/prototype files before assuming they are correct
- the grain overlays are approximated with local canvas noise layers rather than the original `media-shader` custom elements
- `index.html` is now the Vite entry file, not the old full app document

## Prototype / Reference Files Still Useful

These files are still useful references when refining visuals. They now live under `blueprints/`:

- [blueprints/angle-knob.html](/Users/boda/Documents/web_works/neuroshade/blueprints/angle-knob.html)
- [blueprints/filter-button.html](/Users/boda/Documents/web_works/neuroshade/blueprints/filter-button.html)
- [blueprints/glass-filter.html](/Users/boda/Documents/web_works/neuroshade/blueprints/glass-filter.html)
- [blueprints/shape-selector.html](/Users/boda/Documents/web_works/neuroshade/blueprints/shape-selector.html)
- [blueprints/slider.html](/Users/boda/Documents/web_works/neuroshade/blueprints/slider.html)
- [blueprints/filter_icons.html](/Users/boda/Documents/web_works/neuroshade/blueprints/filter_icons.html)

## Build / Run

- `npm install`
- `npm run dev`
- `npm run build`

## Suggested Next-Agent Focus

If another agent picks this up, the safest next steps are:

1. verify every panel against original screenshots in a real browser
2. check hover/active/focus states component by component
3. test all filters with uploaded images, not just the default image
4. validate export output for each filter after any shader/UI changes
5. avoid replacing the shader runtime unless there is a strong reason
