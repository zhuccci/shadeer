import React, { useRef, useEffect, useState, useCallback } from 'react';
import './ColorPicker.css';
import './MobileColorPicker.css';

// ─── Color utilities ─────────────────────────────────────────────────────────

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

const PALETTE_THUMB = 32;
const SLIDER_THUMB  = 40;

interface MobileColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  style?: React.CSSProperties;
  closing?: boolean;
  onCloseEnd?: () => void;
}

export function MobileColorPicker({ value, onChange, style, closing, onCloseEnd }: MobileColorPickerProps) {
  const [color, setColor] = useState(() => {
    const rgb = hexToRgb(value);
    if (!rgb) return { h: 0, s: 0, v: 1 };
    const [h, s, v] = rgbToHsv(...rgb);
    return { h, s, v };
  });

  const [hexText, setHexText] = useState(() =>
    (value.startsWith('#') ? value.slice(1) : value).toUpperCase()
  );

  const colorRef      = useRef(color);
  colorRef.current    = color;
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const paletteRef    = useRef<HTMLDivElement>(null);
  const paletteActive = useRef(false);
  const hueActive     = useRef(false);
  const [paletteW, setPaletteW] = useState(0);

  // Measure palette width dynamically
  useEffect(() => {
    const el = paletteRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setPaletteW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Draw SV gradient canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || paletteW <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    const h = canvas.parentElement?.clientHeight ?? 200;
    canvas.width  = paletteW * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = `${paletteW}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    const [r, g, b] = hsvToRgb(color.h, 1, 1);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, paletteW, h);
    const wg = ctx.createLinearGradient(0, 0, paletteW, 0);
    wg.addColorStop(0, 'rgba(255,255,255,1)');
    wg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = wg;
    ctx.fillRect(0, 0, paletteW, h);
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, 'rgba(0,0,0,0)');
    bg.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, paletteW, h);
  }, [color.h, paletteW]);

  const emitColor = useCallback((h: number, s: number, v: number) => {
    const [r, g, b] = hsvToRgb(h, s, v);
    const hex = rgbToHex(r, g, b);
    setHexText(hex.slice(1));
    onChange(hex);
  }, [onChange]);

  const handlePaletteDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    paletteActive.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const s = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    setColor({ h: colorRef.current.h, s, v });
    emitColor(colorRef.current.h, s, v);
  }, [emitColor]);

  const handlePaletteMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!paletteActive.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const s = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    setColor({ h: colorRef.current.h, s, v });
    emitColor(colorRef.current.h, s, v);
  }, [emitColor]);

  const handlePaletteUp = useCallback(() => { paletteActive.current = false; }, []);

  const handleHueDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    hueActive.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const h = Math.max(0, Math.min(359.99, ((e.clientX - rect.left) / rect.width) * 360));
    const { s, v } = colorRef.current;
    setColor({ h, s, v });
    emitColor(h, s, v);
  }, [emitColor]);

  const handleHueMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!hueActive.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const h = Math.max(0, Math.min(359.99, ((e.clientX - rect.left) / rect.width) * 360));
    const { s, v } = colorRef.current;
    setColor({ h, s, v });
    emitColor(h, s, v);
  }, [emitColor]);

  const handleHueUp = useCallback(() => { hueActive.current = false; }, []);

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

  const [cr, cg, cb] = hsvToRgb(color.h, color.s, color.v);
  const currentHex    = rgbToHex(cr, cg, cb);
  const paletteSatPct = color.s;
  const paletteValPct = 1 - color.v;
  const hueRatio      = color.h / 360;

  return (
    <div
      className={`mobile-cp-body${closing ? ' closing' : ''}`}
      style={style}
      onTransitionEnd={(e) => { if (e.propertyName === 'transform') onCloseEnd?.(); }}
    >
      {/* SV palette — fills available height */}
      <div
        ref={paletteRef}
        className="mobile-cp-palette"
        onPointerDown={handlePaletteDown}
        onPointerMove={handlePaletteMove}
        onPointerUp={handlePaletteUp}
        onPointerCancel={handlePaletteUp}
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

      {/* HEX input */}
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
      </div>

      {/* Swatch + hue slider */}
      <div className="picker-bottom-row">
        <div className="picker-preview-swatch" style={{ background: currentHex }} />
        <div
          className="picker-slider-track hue-track"
          onPointerDown={handleHueDown}
          onPointerMove={handleHueMove}
          onPointerUp={handleHueUp}
          onPointerCancel={handleHueUp}
        >
          <div
            className="picker-slider-thumb"
            style={{ left: `calc(${hueRatio} * (100% - ${SLIDER_THUMB}px))` }}
          />
        </div>
      </div>
    </div>
  );
}
