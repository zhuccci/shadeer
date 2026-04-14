import { useEffect, useRef, useState } from 'react';
import './MobileDrawer.css';
import { CheckboxControl } from './CheckboxControl';
import { ColorSelectorControl } from './ColorSelectorControl';
import { DitherTypeSelector } from './DitherTypeSelector';
import { FilterStrip } from './FilterStrip';
import { GlitchFormSelector } from './GlitchFormSelector';
import { GlitchModeSelector } from './GlitchModeSelector';
import { HalftonePatternSelector } from './HalftonePatternSelector';
import { KnobControl } from './KnobControl';
import { ShapeSelector } from './ShapeSelector';
import { SliderControl } from './SliderControl';
import { PauseIcon, PlayIcon, SaveIcon, UploadIcon } from './icons/AppIcons';
import { filterOptions } from './filterOptions';
import { sanitizeHex } from '../lib/editor';
import type { ActiveFilter, EditorState } from '../types/editor';

type MobileTab = 'sliders' | 'colors';

// Second tab label changes per filter
function getSecondTabLabel(filter: ActiveFilter): string {
  if (filter === 'glass') return 'Angle';
  if (filter === 'glitchy') return 'Distortion';
  return 'Colors';
}

interface MobileDrawerProps {
  state: EditorState;
  updateState: (updater: (state: EditorState) => EditorState) => void;
  onUpload: () => void;
  onSave: () => void;
  onFilterSelect: (filter: ActiveFilter) => void;
}

function SettingsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      {/* Left fader: track split at y=13, handle centered there */}
      <line x1="6" y1="3" x2="6" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="13" x2="9" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="15" x2="6" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Middle fader: track split at y=9 */}
      <line x1="12" y1="3" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="11" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Right fader: track split at y=16 */}
      <line x1="18" y1="3" x2="18" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="16" x2="21" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="18" x2="18" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface PanelContentProps {
  state: EditorState;
  updateState: (updater: (state: EditorState) => EditorState) => void;
  tab: MobileTab;
}

function GlassPanelContent({ state, updateState, tab }: PanelContentProps) {
  // Sliders: Shape, Size, Grain — Angle tab: Knob only
  if (tab === 'colors') {
    return (
      <div className="mobile-panel-section mobile-angle-tab">
        <KnobControl
          labels={{ top: '0°', left: '270°', right: '90°', bottom: '180°' }}
          value={state.glass.angle}
          onChange={(angle) => updateState((s) => ({ ...s, glass: { ...s.glass, angle } }))}
        />
      </div>
    );
  }
  return (
    <div className="mobile-panel-section">
      <ShapeSelector
        label="Shape"
        value={state.glass.shape}
        onChange={(shape) => updateState((s) => ({ ...s, glass: { ...s.glass, shape } }))}
      />
      <SliderControl
        label="Size"
        value={state.glass.size}
        onChange={(size) => updateState((s) => ({ ...s, glass: { ...s.glass, size } }))}
      />
      <SliderControl
        label="Grain"
        value={state.glass.grain}
        onChange={(grain) => updateState((s) => ({ ...s, glass: { ...s.glass, grain } }))}
      />
    </div>
  );
}

function DitheringPanelContent({ state, updateState, tab }: PanelContentProps) {
  if (tab === 'sliders') {
    return (
      <div className="mobile-panel-section">
        <DitherTypeSelector
          value={state.dithering.type}
          onChange={(type) => updateState((s) => ({ ...s, dithering: { ...s.dithering, type } }))}
        />
        <SliderControl
          label="Size"
          value={state.dithering.size}
          onChange={(size) => updateState((s) => ({ ...s, dithering: { ...s.dithering, size } }))}
        />
        <SliderControl
          label="Color Steps"
          min={1}
          max={7}
          value={state.dithering.colorSteps}
          onChange={(colorSteps) => updateState((s) => ({ ...s, dithering: { ...s.dithering, colorSteps } }))}
        />
      </div>
    );
  }
  return (
    <div className="mobile-panel-section">
      <ColorSelectorControl
        label="Background Color"
        value={state.dithering.backgroundColor}
        onChange={(v) =>
          updateState((s) => ({
            ...s,
            dithering: { ...s.dithering, backgroundColor: sanitizeHex(v, s.dithering.backgroundColor) },
          }))
        }
      />
      <ColorSelectorControl
        label="Front Color"
        value={state.dithering.frontColor}
        onChange={(v) =>
          updateState((s) => ({
            ...s,
            dithering: { ...s.dithering, frontColor: sanitizeHex(v, s.dithering.frontColor) },
          }))
        }
      />
      <ColorSelectorControl
        label="Highlight"
        value={state.dithering.highlightColor}
        onChange={(v) =>
          updateState((s) => ({
            ...s,
            dithering: { ...s.dithering, highlightColor: sanitizeHex(v, s.dithering.highlightColor) },
          }))
        }
      />
      <CheckboxControl
        label="Original Colors"
        checked={state.dithering.originalColors}
        onChange={(v) => updateState((s) => ({ ...s, dithering: { ...s.dithering, originalColors: v } }))}
      />
      <CheckboxControl
        label="Invert"
        checked={state.dithering.invert}
        onChange={(v) => updateState((s) => ({ ...s, dithering: { ...s.dithering, invert: v } }))}
      />
    </div>
  );
}

function LiquidPanelContent({ state, updateState, tab }: PanelContentProps) {
  if (tab === 'sliders') {
    return (
      <div className="mobile-panel-section">
        <SliderControl
          label="Highlights amount"
          value={state.liquid.highlights}
          onChange={(v) => updateState((s) => ({ ...s, liquid: { ...s.liquid, highlights: v } }))}
        />
        <SliderControl
          label="Waves"
          value={state.liquid.waves}
          onChange={(v) => updateState((s) => ({ ...s, liquid: { ...s.liquid, waves: v } }))}
        />
        <SliderControl
          label="Distortion"
          value={state.liquid.distortion}
          onChange={(v) => updateState((s) => ({ ...s, liquid: { ...s.liquid, distortion: v } }))}
        />
        <SliderControl
          label="Size"
          value={state.liquid.size}
          onChange={(v) => updateState((s) => ({ ...s, liquid: { ...s.liquid, size: v } }))}
        />
        <SliderControl
          label="Scale"
          value={state.liquid.scale}
          onChange={(v) => updateState((s) => ({ ...s, liquid: { ...s.liquid, scale: v } }))}
        />
        <button
          type="button"
          className="btn btn-tertiary mobile-play-btn"
          onClick={() => updateState((s) => ({ ...s, liquid: { ...s.liquid, playing: !s.liquid.playing } }))}
        >
          {state.liquid.playing ? <PauseIcon /> : <PlayIcon />}
          {state.liquid.playing ? 'Pause Effect' : 'Play Effect'}
        </button>
      </div>
    );
  }
  return (
    <div className="mobile-panel-section">
      <ColorSelectorControl
        label="Front Color"
        value={state.liquid.frontColor}
        onChange={(v) =>
          updateState((s) => ({
            ...s,
            liquid: { ...s.liquid, frontColor: sanitizeHex(v, s.liquid.frontColor) },
          }))
        }
      />
      <ColorSelectorControl
        label="Highlight"
        value={state.liquid.highlightColor}
        onChange={(v) =>
          updateState((s) => ({
            ...s,
            liquid: { ...s.liquid, highlightColor: sanitizeHex(v, s.liquid.highlightColor) },
          }))
        }
      />
    </div>
  );
}

function GlitchyPanelContent({ state, updateState, tab }: PanelContentProps) {
  // Sliders: Glitch form/mode/strength/amount + play
  // Distortion tab: CRT + VHS
  if (tab === 'colors') {
    return (
      <div className="mobile-panel-section">
        <CheckboxControl
          label="CRT"
          checked={state.glitchy.crt}
          onChange={(v) => updateState((s) => ({ ...s, glitchy: { ...s.glitchy, crt: v } }))}
        />
        {state.glitchy.crt && (
          <SliderControl
            label="Scanlines"
            value={state.glitchy.scanlines}
            onChange={(v) => updateState((s) => ({ ...s, glitchy: { ...s.glitchy, scanlines: v } }))}
          />
        )}
        <CheckboxControl
          label="VHS Distortion"
          checked={state.glitchy.vhsDistortion}
          onChange={(v) => updateState((s) => ({ ...s, glitchy: { ...s.glitchy, vhsDistortion: v } }))}
        />
        {state.glitchy.vhsDistortion && (
          <>
            <SliderControl
              label="Wave Strength"
              value={state.glitchy.vhsWaveStrength}
              onChange={(v) => updateState((s) => ({ ...s, glitchy: { ...s.glitchy, vhsWaveStrength: v } }))}
            />
            <SliderControl
              label="Band Opacity"
              value={state.glitchy.vhsBandOpacity}
              onChange={(v) => updateState((s) => ({ ...s, glitchy: { ...s.glitchy, vhsBandOpacity: v } }))}
            />
            <SliderControl
              label="Band Height"
              value={state.glitchy.vhsBandHeight}
              onChange={(v) => updateState((s) => ({ ...s, glitchy: { ...s.glitchy, vhsBandHeight: v } }))}
            />
            <SliderControl
              label="Noise Amount"
              value={state.glitchy.vhsNoiseLevel}
              onChange={(v) => updateState((s) => ({ ...s, glitchy: { ...s.glitchy, vhsNoiseLevel: v } }))}
            />
          </>
        )}
      </div>
    );
  }
  return (
    <div className="mobile-panel-section">
      <GlitchFormSelector
        value={state.glitchy.glitchForm}
        onChange={(v) => updateState((s) => ({ ...s, glitchy: { ...s.glitchy, glitchForm: v } }))}
      />
      <GlitchModeSelector
        label="Glitch Form"
        value={state.glitchy.glitchMode}
        onChange={(v) => updateState((s) => ({ ...s, glitchy: { ...s.glitchy, glitchMode: v } }))}
      />
      <SliderControl
        label="Glitch Strength"
        value={state.glitchy.glitchStrength}
        onChange={(v) => updateState((s) => ({ ...s, glitchy: { ...s.glitchy, glitchStrength: v } }))}
      />
      <SliderControl
        label="Glitch Amount"
        value={state.glitchy.glitchAmount}
        onChange={(v) => updateState((s) => ({ ...s, glitchy: { ...s.glitchy, glitchAmount: v } }))}
      />
      <button
        type="button"
        className="btn btn-tertiary mobile-play-btn"
        onClick={() => updateState((s) => ({ ...s, glitchy: { ...s.glitchy, playing: !s.glitchy.playing } }))}
      >
        {state.glitchy.playing ? <PauseIcon /> : <PlayIcon />}
        {state.glitchy.playing ? 'Pause Effect' : 'Play Effect'}
      </button>
    </div>
  );
}

function HalftonePanelContent({ state, updateState, tab }: PanelContentProps) {
  const segRef = useRef<HTMLDivElement>(null);
  const segDragging = useRef(false);
  const bw = state.halftone.blackAndWhite;

  function pickFromX(clientX: number) {
    if (!segRef.current) return;
    const { left, width } = segRef.current.getBoundingClientRect();
    const blackAndWhite = clientX - left < width / 2;
    updateState((s) => ({ ...s, halftone: { ...s.halftone, blackAndWhite } }));
  }

  if (tab === 'sliders') {
    return (
      <div className="mobile-panel-section">
        <HalftonePatternSelector
          label="Pattern"
          value={state.halftone.pattern}
          onChange={(v) => updateState((s) => ({ ...s, halftone: { ...s.halftone, pattern: v } }))}
        />
        {state.halftone.pattern === 'blob' && (
          <SliderControl
            label="Threshold"
            min={0}
            max={100}
            value={state.halftone.blobThreshold}
            onChange={(v) => updateState((s) => ({ ...s, halftone: { ...s.halftone, blobThreshold: v } }))}
          />
        )}
        <SliderControl
          label="Scale"
          min={0}
          max={100}
          value={state.halftone.scale}
          onChange={(v) => updateState((s) => ({ ...s, halftone: { ...s.halftone, scale: v } }))}
        />
        <SliderControl
          label="Contrast"
          min={0}
          max={100}
          value={state.halftone.contrast}
          onChange={(v) => updateState((s) => ({ ...s, halftone: { ...s.halftone, contrast: v } }))}
        />
        <SliderControl
          label="Brightness"
          min={0}
          max={100}
          value={state.halftone.brightness}
          onChange={(v) => updateState((s) => ({ ...s, halftone: { ...s.halftone, brightness: v } }))}
        />
        <SliderControl
          label="Grain"
          value={state.halftone.grainOverlay}
          onChange={(v) => updateState((s) => ({ ...s, halftone: { ...s.halftone, grainOverlay: v } }))}
        />
        <KnobControl
          labels={{ top: '0°', left: '270°', right: '90°', bottom: '180°' }}
          value={state.halftone.angle}
          onChange={(v) => updateState((s) => ({ ...s, halftone: { ...s.halftone, angle: v } }))}
        />
      </div>
    );
  }

  return (
    <div className="mobile-panel-section">
      <ColorSelectorControl
        label="Background"
        value={state.halftone.backgroundColor}
        onChange={(v) =>
          updateState((s) => ({
            ...s,
            halftone: { ...s.halftone, backgroundColor: sanitizeHex(v, s.halftone.backgroundColor) },
          }))
        }
      />
      <CheckboxControl
        label="Original Colors"
        checked={state.halftone.originalColors}
        onChange={(v) => updateState((s) => ({ ...s, halftone: { ...s.halftone, originalColors: v } }))}
      />
      {!state.halftone.originalColors && (
        <>
          <div
            ref={segRef}
            className="halftone-segment"
            style={{ cursor: 'ew-resize' }}
            onPointerDown={(e) => {
              segRef.current?.setPointerCapture(e.pointerId);
              segDragging.current = true;
              pickFromX(e.clientX);
            }}
            onPointerMove={(e) => {
              if (segDragging.current) pickFromX(e.clientX);
            }}
            onPointerUp={() => {
              segDragging.current = false;
            }}
          >
            <button type="button" className={`halftone-seg-btn${bw ? ' selected' : ''}`}>
              2 Colors
            </button>
            <button type="button" className={`halftone-seg-btn${!bw ? ' selected' : ''}`}>
              4 Colors
            </button>
          </div>
          <ColorSelectorControl
            label={bw ? 'Color' : 'Light'}
            value={state.halftone.color1}
            onChange={(v) =>
              updateState((s) => ({
                ...s,
                halftone: { ...s.halftone, color1: sanitizeHex(v, s.halftone.color1) },
              }))
            }
          />
          {!bw && (
            <>
              <ColorSelectorControl
                label="Mid-Light"
                value={state.halftone.color2}
                onChange={(v) =>
                  updateState((s) => ({
                    ...s,
                    halftone: { ...s.halftone, color2: sanitizeHex(v, s.halftone.color2) },
                  }))
                }
              />
              <ColorSelectorControl
                label="Mid-Dark"
                value={state.halftone.color3}
                onChange={(v) =>
                  updateState((s) => ({
                    ...s,
                    halftone: { ...s.halftone, color3: sanitizeHex(v, s.halftone.color3) },
                  }))
                }
              />
              <ColorSelectorControl
                label="Dark"
                value={state.halftone.color4}
                onChange={(v) =>
                  updateState((s) => ({
                    ...s,
                    halftone: { ...s.halftone, color4: sanitizeHex(v, s.halftone.color4) },
                  }))
                }
              />
            </>
          )}
        </>
      )}
      <CheckboxControl
        label="Invert"
        checked={state.halftone.invert}
        onChange={(v) => updateState((s) => ({ ...s, halftone: { ...s.halftone, invert: v } }))}
      />
    </div>
  );
}

export function MobileDrawer({ state, updateState, onUpload, onSave, onFilterSelect }: MobileDrawerProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MobileTab>('sliders');
  const [slideDir, setSlideDir] = useState<'forward' | 'back'>('forward');
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const filterLabel = filterOptions.find((f) => f.id === state.activeFilter)?.label ?? '';
  const secondTabLabel = getSecondTabLabel(state.activeFilter);

  function switchTab(tab: MobileTab) {
    const order: MobileTab[] = ['sliders', 'colors'];
    setSlideDir(order.indexOf(tab) > order.indexOf(activeTab) ? 'forward' : 'back');
    setActiveTab(tab);
  }

  // Close settings when tapping outside the drawer
  useEffect(() => {
    if (!settingsOpen) return;
    function handleOutside(e: Event) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    }
    // Small delay so the toggle click that opened settings doesn't immediately close it
    const id = setTimeout(() => {
      document.addEventListener('pointerdown', handleOutside);
    }, 50);
    return () => {
      clearTimeout(id);
      document.removeEventListener('pointerdown', handleOutside);
    };
  }, [settingsOpen]);

  return (
    <div ref={drawerRef} className={`mobile-drawer${settingsOpen ? ' settings-open' : ''}`}>
      <div className="mobile-drawer-inner">

        {/* Filter header bar */}
        <div className="mobile-filter-header">
          <span className="mobile-filter-name">{filterLabel}</span>
          <button
            type="button"
            className="mobile-filter-header-btn"
            onClick={() => setSettingsOpen((v) => !v)}
            aria-label={settingsOpen ? 'Close settings' : 'Open settings'}
          >
            {/* key forces re-mount so CSS @starting-style fires on icon swap */}
            <span key={settingsOpen ? 'close' : 'settings'} className="mobile-header-icon">
              {settingsOpen ? <CloseIcon /> : <SettingsIcon />}
            </span>
          </button>
        </div>

        {/* Single body wrapper so only one 8px gap from the header to content */}
        <div className="mobile-drawer-body">

        {/* Filter strip + action bar — always mounted, collapses via CSS when settings open */}
        <div className="mobile-filter-area">
          <div className="mobile-filter-area-inner">
            <div className="mobile-filter-strip">
              <FilterStrip activeFilter={state.activeFilter} onSelect={onFilterSelect} />
            </div>
            {state.image.hasUserImage && (
              <div className="mobile-action-bar">
                <button className="btn btn-secondary mobile-action-btn" onClick={onUpload}>
                  <UploadIcon />
                  Upload New
                </button>
                <button className="btn btn-primary mobile-action-btn" onClick={onSave}>
                  <SaveIcon />
                  Save
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Settings panel — always mounted, expands via CSS when settings open */}
        <div className="mobile-settings-area">
          <div className="mobile-settings-area-inner">
            <div className="mobile-settings-panel">
              <div className="mobile-segmented-sticky">
                <div className="mobile-segmented-control">
                  {/* Sliding pill indicator */}
                  <span
                    className="mobile-seg-pill"
                    style={{ transform: activeTab === 'colors' ? 'translateX(100%)' : 'translateX(0)' }}
                  />
                  <button
                    type="button"
                    className={`mobile-seg-btn${activeTab === 'sliders' ? ' active' : ''}`}
                    onClick={() => switchTab('sliders')}
                  >
                    Sliders
                  </button>
                  <button
                    type="button"
                    className={`mobile-seg-btn${activeTab === 'colors' ? ' active' : ''}`}
                    onClick={() => switchTab('colors')}
                  >
                    {secondTabLabel}
                  </button>
                </div>
              </div>
              <div
                className="mobile-settings-scroll"
                onTouchStart={(e) => {
                  // If the touch starts on an interactive control, never start swipe tracking
                  const t = e.target as HTMLElement;
                  if (t.closest('.slider-track') || t.closest('.knob-area') || t.closest('.halftone-segment')) return;
                  swipeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                }}
                onTouchEnd={(e) => {
                  if (!swipeStart.current) return;
                  const dx = e.changedTouches[0].clientX - swipeStart.current.x;
                  const dy = e.changedTouches[0].clientY - swipeStart.current.y;
                  swipeStart.current = null;
                  if (Math.abs(dx) < 80 || Math.abs(dx) < Math.abs(dy) * 3) return;
                  if (dx < 0 && activeTab === 'sliders') switchTab('colors');
                  if (dx > 0 && activeTab === 'colors') switchTab('sliders');
                }}
              >
                {/* key forces remount → @starting-style fires on every tab switch */}
                <div
                  key={`${state.activeFilter}-${activeTab}`}
                  className={`mobile-tab-content${slideDir === 'back' ? ' slide-back' : ''}`}
                >
                  {state.activeFilter === 'glass' && (
                    <GlassPanelContent state={state} updateState={updateState} tab={activeTab} />
                  )}
                  {state.activeFilter === 'dithering' && (
                    <DitheringPanelContent state={state} updateState={updateState} tab={activeTab} />
                  )}
                  {state.activeFilter === 'liquid' && (
                    <LiquidPanelContent state={state} updateState={updateState} tab={activeTab} />
                  )}
                  {state.activeFilter === 'glitchy' && (
                    <GlitchyPanelContent state={state} updateState={updateState} tab={activeTab} />
                  )}
                  {state.activeFilter === 'halftone' && (
                    <HalftonePanelContent state={state} updateState={updateState} tab={activeTab} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        </div>{/* end mobile-drawer-body */}

      </div>
    </div>
  );
}
