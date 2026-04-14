import { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './ColorPicker.css';

// ─── Color utilities ────────────────────────────────────────────────────────

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if      (h < 60)  { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else              { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const v = max, s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    if      (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
    else if (max === g) h = (b - r) / d + 2;
    else                h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, v];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PALETTE_W       = 300;
const PALETTE_H       = 231;
const PALETTE_THUMB   = 32;  // palette thumb diameter
const SLIDER_THUMB    = 40;  // hue slider thumb diameter

// ─── Component ───────────────────────────────────────────────────────────────

interface ColorPickerProps {
  value: string;       // 6-digit hex e.g. "#FF0000"
  anchorRect: DOMRect;
  onClose: () => void;
  onChange: (hex: string) => void;
}

export function ColorPicker({ value, anchorRect, onClose, onChange }: ColorPickerProps) {
  const [color, setColor] = useState(() => {
    const rgb = hexToRgb(value);
    if (!rgb) return { h: 0, s: 0, v: 1 };
    const [h, s, v] = rgbToHsv(...rgb);
    return { h, s, v };
  });

  const [hexText, setHexText] = useState(() =>
    (value.startsWith('#') ? value.slice(1) : value).toUpperCase()
  );

  // Ref so pointer-move callbacks always read latest color without rebinding
  const colorRef = useRef(color);
  colorRef.current = color;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const popupRef  = useRef<HTMLDivElement>(null);

  // ── Draw SV palette canvas ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = PALETTE_W * dpr;
    canvas.height = PALETTE_H * dpr;
    canvas.style.width  = `${PALETTE_W}px`;
    canvas.style.height = `${PALETTE_H}px`;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    const [r, g, b] = hsvToRgb(color.h, 1, 1);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, PALETTE_W, PALETTE_H);
    const wg = ctx.createLinearGradient(0, 0, PALETTE_W, 0);
    wg.addColorStop(0, 'rgba(255,255,255,1)');
    wg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = wg;
    ctx.fillRect(0, 0, PALETTE_W, PALETTE_H);
    const bg = ctx.createLinearGradient(0, 0, 0, PALETTE_H);
    bg.addColorStop(0, 'rgba(0,0,0,0)');
    bg.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, PALETTE_W, PALETTE_H);
  }, [color.h]);

  // ── Close on outside click or Escape ─────────────────────────────────────────
  useEffect(() => {
    let ready = false;
    const raf = requestAnimationFrame(() => { ready = true; });
    function onMouseDown(e: MouseEvent) {
      if (!ready) return;
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) onClose();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  // ── Emit hex ──────────────────────────────────────────────────────────────────
  const emitColor = useCallback((h: number, s: number, v: number) => {
    const [r, g, b] = hsvToRgb(h, s, v);
    const hex = rgbToHex(r, g, b);
    setHexText(hex.slice(1));
    onChange(hex);
  }, [onChange]);

  // ── Palette pointer ───────────────────────────────────────────────────────────
  const handlePaletteDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const s = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    const { h } = colorRef.current;
    setColor({ h, s, v });
    emitColor(h, s, v);
  }, [emitColor]);

  const handlePaletteMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!(e.buttons & 1)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const s = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    const { h } = colorRef.current;
    setColor({ h, s, v });
    emitColor(h, s, v);
  }, [emitColor]);

  // ── Hue slider pointer ────────────────────────────────────────────────────────
  const handleHueDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const h = Math.max(0, Math.min(359.99, ((e.clientX - rect.left) / rect.width) * 360));
    const { s, v } = colorRef.current;
    setColor({ h, s, v });
    emitColor(h, s, v);
  }, [emitColor]);

  const handleHueMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!(e.buttons & 1)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const h = Math.max(0, Math.min(359.99, ((e.clientX - rect.left) / rect.width) * 360));
    const { s, v } = colorRef.current;
    setColor({ h, s, v });
    emitColor(h, s, v);
  }, [emitColor]);

  // ── Hex input ─────────────────────────────────────────────────────────────────
  const handleHexInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 6);
    setHexText(raw);
    if (raw.length === 6) {
      const rgb = hexToRgb(`#${raw}`);
      if (rgb) {
        const [h, s, v] = rgbToHsv(...rgb);
        setColor({ h, s, v });
        onChange(`#${raw}`);
      }
    }
  }, [onChange]);

  // ── Eyedropper ────────────────────────────────────────────────────────────────
  const handleEyedropper = useCallback(async () => {
    if (!('EyeDropper' in window)) return;
    try {
      const eyeDropper = new (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper();
      const { sRGBHex } = await eyeDropper.open();
      const hex = sRGBHex.toUpperCase();
      const rgb = hexToRgb(hex);
      if (rgb) {
        const [h, s, v] = rgbToHsv(...rgb);
        setColor({ h, s, v });
        setHexText(hex.slice(1));
        onChange(hex);
      }
    } catch { /* user cancelled */ }
  }, [onChange]);

  // ── Derived values ────────────────────────────────────────────────────────────
  const [cr, cg, cb] = hsvToRgb(color.h, color.s, color.v);
  const currentHex = rgbToHex(cr, cg, cb);

  // Thumb positions via CSS calc so they never escape the visual track edges.
  // left: calc(ratio * (100% - thumbSize)) positions the thumb's left edge
  // such that at ratio=0 the left edge is 0, at ratio=1 the right edge is 100%.
  const paletteSatPct = color.s;
  const paletteValPct = 1 - color.v;
  const hueRatio      = color.h / 360;

  // Clamp popup to viewport width; flip above anchor if not enough space below
  const popupWidth  = 332;
  const popupHeight = 375; // approx: 16 + 231 + 16 + 40 + 16 + 40 + 16
  const popupLeft   = Math.max(8, Math.min(anchorRect.left, window.innerWidth - popupWidth - 8));
  const spaceBelow  = window.innerHeight - anchorRect.bottom - 8;
  const popupTop    = spaceBelow >= popupHeight
    ? anchorRect.bottom + 8
    : Math.max(8, anchorRect.top - popupHeight - 8);

  return createPortal(
    <div
      className="color-picker-popup"
      ref={popupRef}
      style={{ position: 'fixed', top: popupTop, left: popupLeft }}
    >
      {/* ── SV Palette ── */}
      <div
        className="picker-palette-wrapper"
        onPointerDown={handlePaletteDown}
        onPointerMove={handlePaletteMove}
      >
        <canvas ref={canvasRef} className="picker-canvas" />
        <div
          className="picker-thumb"
          style={{
            left: `calc(${paletteSatPct} * (100% - ${PALETTE_THUMB}px))`,
            top:  `calc(${paletteValPct} * (100% - ${PALETTE_THUMB}px))`,
          }}
        />
      </div>

      {/* ── HEX input + eyedropper ── */}
      <div className="picker-inputs-row">
        <span className="picker-hex-label">HEX</span>
        <div className="picker-hex-field">
          <span className="picker-hex-hash">#</span>
          <input
            className="picker-hex-input"
            value={hexText}
            onChange={handleHexInput}
            maxLength={6}
            spellCheck={false}
          />
        </div>
        <button
          className="picker-eyedropper-btn"
          onClick={handleEyedropper}
          aria-label="Pick color from screen"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M13.657 2.343a1.167 1.167 0 0 0-1.65 0L10.12 4.228 9.18 3.29 8.12 4.35l.94.94-5.1 5.1a1.167 1.167 0 0 0-.34.824V13h2.752c.31 0 .607-.123.825-.342l5.1-5.1.94.94 1.06-1.06-.94-.94 1.882-1.882a1.167 1.167 0 0 0 0-1.65l-.682-.623Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      {/* ── Color preview + Hue slider ── */}
      <div className="picker-bottom-row">
        <div className="picker-preview-swatch" style={{ background: currentHex }} />
        <div
          className="picker-slider-track hue-track"
          onPointerDown={handleHueDown}
          onPointerMove={handleHueMove}
        >
          <div
            className="picker-slider-thumb"
            style={{ left: `calc(${hueRatio} * (100% - ${SLIDER_THUMB}px))` }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
