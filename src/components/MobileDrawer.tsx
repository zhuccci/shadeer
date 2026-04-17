import React, { useRef, useState } from 'react';
import './MobileDrawer.css';
import { MobileColorPicker } from './MobileColorPicker';
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
import { SaveIcon, UploadIcon } from './icons/AppIcons';
import { filterOptions } from './filterOptions';
import { sanitizeHex } from '../lib/editor';
import type { ActiveFilter, EditorState } from '../types/editor';

type MobileTab = 'sliders' | 'colors';

function getFirstTabLabel(filter: ActiveFilter): string {
  if (filter === 'symbolEdges') return 'Symbol';
  return 'Sliders';
}

function getSecondTabLabel(filter: ActiveFilter): string {
  if (filter === 'glass') return 'Angle';
  if (filter === 'glitchy') return 'Distortion';
  if (filter === 'liquid') return 'Highlight';
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
    <svg width="18" height="18" viewBox="0 0 18.0039 18.0078" fill="none">
      <path d="M4.75391 10.0049C5.16804 10.005 5.50391 10.3407 5.50391 10.7549C5.50368 11.1688 5.1679 11.5048 4.75391 11.5049H3.45508V17.2578C3.45462 17.6716 3.11901 18.0078 2.70508 18.0078C2.29115 18.0078 1.95554 17.6716 1.95508 17.2578V11.5049H0.75C0.335929 11.5049 0.000230806 11.1689 0 10.7549C0 10.3407 0.335786 10.0049 0.75 10.0049H4.75391Z" fill="currentColor"/>
      <path d="M17.2539 12.0049C17.6681 12.0049 18.0039 12.3407 18.0039 12.7549C18.0039 13.1691 17.6681 13.5049 17.2539 13.5049H16.0527V17.2568C16.0525 17.6709 15.7168 18.0068 15.3027 18.0068C14.8886 18.0068 14.5529 17.6709 14.5527 17.2568V13.5049H13.2539C12.8397 13.5049 12.5039 13.1691 12.5039 12.7549C12.5039 12.3407 12.8397 12.0049 13.2539 12.0049H17.2539Z" fill="currentColor"/>
      <path d="M9.00391 9.00391C9.41812 9.00391 9.75391 9.33969 9.75391 9.75391V17.0068C9.75364 17.4208 9.41796 17.7568 9.00391 17.7568C8.58986 17.7568 8.25417 17.4208 8.25391 17.0068V9.75391C8.25391 9.33969 8.58969 9.00391 9.00391 9.00391Z" fill="currentColor"/>
      <path d="M15.3027 0C15.7169 0 16.0527 0.335786 16.0527 0.75V9.25391C16.0526 9.66804 15.7169 10.0039 15.3027 10.0039C14.8886 10.0039 14.5528 9.66804 14.5527 9.25391V0.75C14.5527 0.335786 14.8885 0 15.3027 0Z" fill="currentColor"/>
      <path d="M2.70508 0C3.11929 0 3.45508 0.335786 3.45508 0.75V7.25293C3.45508 7.66714 3.11929 8.00293 2.70508 8.00293C2.29086 8.00293 1.95508 7.66714 1.95508 7.25293V0.75C1.95508 0.335786 2.29086 0 2.70508 0Z" fill="currentColor"/>
      <path d="M9.00391 0.25C9.41812 0.25 9.75391 0.585786 9.75391 1V5.50195H11.0039C11.4181 5.50195 11.7539 5.83774 11.7539 6.25195C11.7539 6.66617 11.4181 7.00195 11.0039 7.00195H7.00391C6.58969 7.00195 6.25391 6.66617 6.25391 6.25195C6.25391 5.83774 6.58969 5.50195 7.00391 5.50195H8.25391V1C8.25391 0.585786 8.58969 0.25 9.00391 0.25Z" fill="currentColor"/>
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

type OpenColorFn = (label: string, value: string, onChange: (v: string) => void, swatchRect: DOMRect) => void;

interface PanelContentProps {
  state: EditorState;
  updateState: (updater: (state: EditorState) => EditorState) => void;
  tab: MobileTab;
  openColor: OpenColorFn;
}

function GlassPanelContent({ state, updateState, tab, openColor: _openColor }: PanelContentProps) {
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

function DitheringPanelContent({ state, updateState, tab, openColor }: PanelContentProps) {
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
        onMobileOpen={openColor}
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
        onMobileOpen={openColor}
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
        onMobileOpen={openColor}
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

function LiquidPanelContent({ state, updateState, tab, openColor }: PanelContentProps) {
  if (tab === 'sliders') {
    return (
      <div className="mobile-panel-section">
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
      </div>
    );
  }
  return (
    <div className="mobile-panel-section">
      <SliderControl
        label="Highlights amount"
        value={state.liquid.highlights}
        onChange={(v) => updateState((s) => ({ ...s, liquid: { ...s.liquid, highlights: v } }))}
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
        onMobileOpen={openColor}
      />
    </div>
  );
}

function GlitchyPanelContent({ state, updateState, tab, openColor: _openColor }: PanelContentProps) {
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
    </div>
  );
}

function HalftonePanelContent({ state, updateState, tab, openColor }: PanelContentProps) {
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
        <div className="mobile-angle-tab mobile-knob-top">
          <KnobControl
            labels={{ top: '0°', left: '270°', right: '90°', bottom: '180°' }}
            value={state.halftone.angle}
            onChange={(v) => updateState((s) => ({ ...s, halftone: { ...s.halftone, angle: v } }))}
          />
        </div>
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
        onMobileOpen={openColor}
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
            onMobileOpen={openColor}
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
                onMobileOpen={openColor}
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
                onMobileOpen={openColor}
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
                onMobileOpen={openColor}
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

function SymbolEdgesPanelContent({ state, updateState, tab, openColor }: PanelContentProps) {
  const se = state.symbolEdges;
  if (tab === 'sliders') {
    return (
      <div className="mobile-panel-section">
        <div className="mobile-symbols-row">
          <span className="widget-label">Symbols</span>
          <input
            className="mobile-symbols-input"
            type="text"
            value={se.symbols}
            onChange={(e) => updateState((s) => ({ ...s, symbolEdges: { ...s.symbolEdges, symbols: e.target.value } }))}
            maxLength={32}
            spellCheck={false}
          />
        </div>
        <SliderControl
          label="Size"
          min={0}
          max={100}
          value={se.cellSize}
          onChange={(v) => updateState((s) => ({ ...s, symbolEdges: { ...s.symbolEdges, cellSize: v } }))}
        />
        <SliderControl
          label="Threshold"
          min={0}
          max={100}
          value={se.threshold}
          onChange={(v) => updateState((s) => ({ ...s, symbolEdges: { ...s.symbolEdges, threshold: v } }))}
        />
        <SliderControl
          label="Glow"
          min={0}
          max={100}
          value={se.glow}
          onChange={(v) => updateState((s) => ({ ...s, symbolEdges: { ...s.symbolEdges, glow: v } }))}
        />
        <CheckboxControl
          label="Hide image"
          checked={se.hideImage}
          onChange={(v) => updateState((s) => ({ ...s, symbolEdges: { ...s.symbolEdges, hideImage: v } }))}
        />
      </div>
    );
  }
  return (
    <div className="mobile-panel-section">
      <ColorSelectorControl
        label="Symbol Color"
        value={se.symbolColor}
        onChange={(v) =>
          updateState((s) => ({
            ...s,
            symbolEdges: { ...s.symbolEdges, symbolColor: sanitizeHex(v, s.symbolEdges.symbolColor) },
          }))
        }
        onMobileOpen={openColor}
      />
      <CheckboxControl
        label="Matching color"
        checked={se.mode === 'color'}
        onChange={(v) => updateState((s) => ({ ...s, symbolEdges: { ...s.symbolEdges, mode: v ? 'color' : 'edges' } }))}
      />
      {se.mode === 'color' && (
        <ColorSelectorControl
          label="Color to Match"
          value={se.targetColor}
          onChange={(v) =>
            updateState((s) => ({
              ...s,
              symbolEdges: { ...s.symbolEdges, targetColor: sanitizeHex(v, s.symbolEdges.targetColor) },
            }))
          }
          onMobileOpen={openColor}
        />
      )}
      <CheckboxControl
        label="Invert"
        checked={se.invert}
        onChange={(v) => updateState((s) => ({ ...s, symbolEdges: { ...s.symbolEdges, invert: v } }))}
      />
    </div>
  );
}

type MobileColorPickerState = { label: string; value: string; onChange: (v: string) => void; originX: string; originY: string } | null;

export function MobileDrawer({ state, updateState, onUpload, onSave, onFilterSelect }: MobileDrawerProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<MobileTab>('sliders');
  const [slideDir, setSlideDir] = useState<'forward' | 'back'>('forward');
  const [mobileColorPicker, setMobileColorPicker] = useState<MobileColorPickerState>(null);
  const [colorPickerClosing, setColorPickerClosing] = useState(false);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  const closeColorPicker = () => {
    setColorPickerClosing(true);
  };

  const openColor: OpenColorFn = (label, value, onChange, swatchRect) => {
    // Compute transform-origin relative to the panel so the picker expands from the swatch
    let originX = '50%', originY = '50%';
    const panelEl = panelRef.current;
    if (panelEl) {
      const panelRect = panelEl.getBoundingClientRect();
      const ox = swatchRect.left + swatchRect.width  / 2 - panelRect.left;
      const oy = swatchRect.top  + swatchRect.height / 2 - panelRect.top;
      originX = `${ox}px`;
      originY = `${oy}px`;
    }
    setColorPickerClosing(false);
    setExpanded(true);
    setMobileColorPicker({ label, value, onChange, originX, originY });
  };

  const filterLabel = filterOptions.find((f) => f.id === state.activeFilter)?.label ?? '';
  const firstTabLabel = getFirstTabLabel(state.activeFilter);
  const secondTabLabel = getSecondTabLabel(state.activeFilter);

  function switchTab(tab: MobileTab) {
    const order: MobileTab[] = ['sliders', 'colors'];
    setSlideDir(order.indexOf(tab) > order.indexOf(activeTab) ? 'forward' : 'back');
    setActiveTab(tab);
  }

  return (
    <div className={`mobile-sheet${(expanded || !!mobileColorPicker) ? ' expanded' : ''}${mobileColorPicker ? ' cp-open' : ''}`}>
      <div className="sheet-card">

        {/* Header */}
        <div className="sheet-header">
          {mobileColorPicker ? (
            <>
              <span className="sheet-filter-name">{mobileColorPicker.label}</span>
              <button
                type="button"
                className="sheet-icon-btn"
                onClick={closeColorPicker}
                aria-label="Close color picker"
              >
                <span className="sheet-header-icon"><CloseIcon /></span>
              </button>
            </>
          ) : (
            <>
              <span className="sheet-filter-name">{filterLabel}</span>
              <button
                type="button"
                className="sheet-icon-btn"
                onClick={() => setExpanded((v) => !v)}
                aria-label={expanded ? 'Close settings' : 'Open settings'}
              >
                <span key={expanded ? 'close' : 'settings'} className="sheet-header-icon">
                  {expanded ? <CloseIcon /> : <SettingsIcon />}
                </span>
              </button>
            </>
          )}
        </div>

        {/* Filter strip — hidden when color picker is open, collapses when expanded */}
        {!mobileColorPicker && (
          <div className="sheet-filter-area">
            <div className="sheet-filter-area-inner">
              <div className="sheet-filter-strip">
                <FilterStrip activeFilter={state.activeFilter} onSelect={onFilterSelect} />
              </div>
            </div>
          </div>
        )}

        {/* Action bar — hidden when color picker is open */}
        {!mobileColorPicker && state.image.hasUserImage && (
          <div className="sheet-action-bar">
            <button className="btn btn-secondary sheet-action-btn" onClick={onUpload}>
              <UploadIcon />
              Upload New
            </button>
            <button className="btn btn-primary sheet-action-btn" onClick={onSave}>
              <SaveIcon />
              Save
            </button>
          </div>
        )}

        {/* Settings panel — expands when expanded */}
        <div className="sheet-settings-area">
          <div className="sheet-settings-area-inner">
            <div className="sheet-panel" ref={panelRef}>
              {mobileColorPicker ? (
                /* Color picker view — fills panel directly, no tabs or scroll wrapper */
                <MobileColorPicker
                  value={mobileColorPicker.value}
                  onChange={mobileColorPicker.onChange}
                  style={{ '--cp-origin-x': mobileColorPicker.originX, '--cp-origin-y': mobileColorPicker.originY } as React.CSSProperties}
                  closing={colorPickerClosing}
                  onCloseEnd={() => { setMobileColorPicker(null); setColorPickerClosing(false); }}
                />
              ) : (
                <>
                  {/* Segmented tabs */}
                  <div className="sheet-segmented-sticky">
                    <div className="sheet-segmented">
                      <span
                        className="sheet-seg-pill"
                        style={{ transform: activeTab === 'colors' ? 'translateX(100%)' : 'translateX(0)' }}
                      />
                      <button
                        type="button"
                        className={`sheet-seg-btn${activeTab === 'sliders' ? ' active' : ''}`}
                        onClick={() => switchTab('sliders')}
                      >
                        {firstTabLabel}
                      </button>
                      <button
                        type="button"
                        className={`sheet-seg-btn${activeTab === 'colors' ? ' active' : ''}`}
                        onClick={() => switchTab('colors')}
                      >
                        {secondTabLabel}
                      </button>
                    </div>
                  </div>

                  {/* Scrollable content */}
                  <div
                    className="sheet-scroll"
                    onTouchStart={(e) => {
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
                    <div
                      key={`${state.activeFilter}-${activeTab}`}
                      className={`sheet-tab-content${slideDir === 'back' ? ' slide-back' : ''}`}
                    >
                      {state.activeFilter === 'glass' && (
                        <GlassPanelContent state={state} updateState={updateState} tab={activeTab} openColor={openColor} />
                      )}
                      {state.activeFilter === 'dithering' && (
                        <DitheringPanelContent state={state} updateState={updateState} tab={activeTab} openColor={openColor} />
                      )}
                      {state.activeFilter === 'liquid' && (
                        <LiquidPanelContent state={state} updateState={updateState} tab={activeTab} openColor={openColor} />
                      )}
                      {state.activeFilter === 'glitchy' && (
                        <GlitchyPanelContent state={state} updateState={updateState} tab={activeTab} openColor={openColor} />
                      )}
                      {state.activeFilter === 'halftone' && (
                        <HalftonePanelContent state={state} updateState={updateState} tab={activeTab} openColor={openColor} />
                      )}
                      {state.activeFilter === 'symbolEdges' && (
                        <SymbolEdgesPanelContent state={state} updateState={updateState} tab={activeTab} openColor={openColor} />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
