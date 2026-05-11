import { useState, useRef, useEffect, useCallback, type PointerEventHandler } from 'react';
import './PreviewStage.css';
import { PauseIcon, PlayIcon, UploadIcon } from './icons/AppIcons';
import type { EditorState } from '../types/editor';

interface PreviewStageProps {
  state: EditorState;
  isDragging: boolean;
  previewRef: React.RefObject<HTMLDivElement | null>;
  onUpload: () => void;
  onDropFile: (file: File) => void;
  onFitModeChange: (mode: EditorState['fitMode']) => void;
  onTogglePlaying: () => void;
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  onPointerCancel: PointerEventHandler<HTMLDivElement>;
  onLostPointerCapture: PointerEventHandler<HTMLDivElement>;
  onBlurCenterChange?: (x: number, y: number) => void;
  onGlassCenterChange?: (x: number, y: number) => void;
}

// ── Coordinate helpers ────────────────────────────────────────────────────────

function getImageBox(cw: number, ch: number, ar: number, fitMode: 'fit' | 'fill') {
  if (fitMode === 'fit') {
    return cw / ch > ar
      ? { w: ch * ar, h: ch }
      : { w: cw, h: cw / ar };
  }
  return cw / ch > ar
    ? { w: cw, h: cw / ar }
    : { w: ch * ar, h: ch };
}

function uvToCanvasPx(uvX: number, uvY: number, cw: number, ch: number, ar: number, fitMode: 'fit' | 'fill', offsetX: number, offsetY: number) {
  const { w, h } = getImageBox(cw, ch, ar, fitMode);
  return {
    x: (uvX + offsetX) * w - 0.5 * (w - cw),
    y: (uvY + offsetY) * h - 0.5 * (h - ch),
  };
}

function canvasPxToUV(px: number, py: number, cw: number, ch: number, ar: number, fitMode: 'fit' | 'fill', offsetX: number, offsetY: number) {
  const { w, h } = getImageBox(cw, ch, ar, fitMode);
  return {
    x: Math.max(0, Math.min(1, (px + 0.5 * (w - cw)) / w - offsetX)),
    y: Math.max(0, Math.min(1, (py + 0.5 * (h - ch)) / h - offsetY)),
  };
}

// ── Radial center handle ──────────────────────────────────────────────────────

interface RadialHandleProps {
  uvX: number;
  uvY: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  ar: number;
  fitMode: 'fit' | 'fill';
  offsetX: number;
  offsetY: number;
  onChange: (x: number, y: number) => void;
}

function RadialCenterHandle({ uvX, uvY, containerRef, ar, fitMode, offsetX, offsetY, onChange }: RadialHandleProps) {
  const [dragging, setDragging] = useState(false);

  const getPos = useCallback(() => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const { width, height } = el.getBoundingClientRect();
    return uvToCanvasPx(uvX, uvY, width, height, ar, fitMode, offsetX, offsetY);
  }, [uvX, uvY, containerRef, ar, fitMode, offsetX, offsetY]);

  const pos = getPos();

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const uv = canvasPxToUV(
      e.clientX - rect.left,
      e.clientY - rect.top,
      rect.width, rect.height,
      ar, fitMode, offsetX, offsetY,
    );
    onChange(uv.x, uv.y);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  return (
    <div
      className={`radial-center-handle${dragging ? ' dragging' : ''}`}
      style={{ left: pos.x, top: pos.y }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onLostPointerCapture={() => setDragging(false)}
    >
      <svg viewBox="0 0 24 24" width="24" height="24">
        <circle cx="12" cy="12" r="9" fill="none" stroke="#fff679" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// ── PreviewStage ──────────────────────────────────────────────────────────────

export function PreviewStage({
  state,
  isDragging,
  previewRef,
  onUpload,
  onDropFile,
  onFitModeChange,
  onTogglePlaying,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onBlurCenterChange,
  onGlassCenterChange,
}: PreviewStageProps) {
  const [controlsVisible, setControlsVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [zoomScale, setZoomScale] = useState(1.0);
  const zoomScaleRef = useRef(1.0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const panXRef = useRef(0);
  const panYRef = useRef(0);

  useEffect(() => { zoomScaleRef.current = zoomScale; }, [zoomScale]);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;

    const ptrs = new Map<number, { x: number; y: number }>();
    let pinchStartDist: number | null = null;
    let pinchStartScale = 1.0;
    let wasPinching = false;
    let lastTapTime = 0;
    let isPanning = false;
    let panStartX = 0, panStartY = 0;
    let panStartValueX = 0, panStartValueY = 0;
    let pointerDownX = 0, pointerDownY = 0;
    let pointerMoved = false;

    const dist2 = () => {
      const [a, b] = [...ptrs.values()];
      return Math.hypot(b.x - a.x, b.y - a.y);
    };

    const clampPan = (px: number, py: number, scale: number) => {
      const maxX = (scale - 1) * el.offsetWidth / 2;
      const maxY = (scale - 1) * el.offsetHeight / 2;
      return { x: Math.min(maxX, Math.max(-maxX, px)), y: Math.min(maxY, Math.max(-maxY, py)) };
    };

    const applyPan = (px: number, py: number) => {
      panXRef.current = px; panYRef.current = py;
      setPanX(px); setPanY(py);
    };

    const startPanFrom = (clientX: number, clientY: number) => {
      isPanning = true;
      panStartX = clientX; panStartY = clientY;
      panStartValueX = panXRef.current; panStartValueY = panYRef.current;
    };

    const onDown = (e: PointerEvent) => {
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 1) {
        pointerDownX = e.clientX; pointerDownY = e.clientY; pointerMoved = false;
        if (zoomScaleRef.current > 1) {
          startPanFrom(e.clientX, e.clientY);
          e.stopPropagation();
        }
      } else if (ptrs.size === 2) {
        isPanning = false;
        wasPinching = true;
        el.classList.add('pinching');
        pinchStartDist = dist2();
        pinchStartScale = zoomScaleRef.current;
        e.stopPropagation();
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 1 && !pointerMoved) {
        if (Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY) > 5) pointerMoved = true;
      }
      if (ptrs.size === 2 && pinchStartDist !== null) {
        const sPrev = zoomScaleRef.current;
        const sNew = Math.min(3.0, Math.max(1.0, pinchStartScale * (dist2() / pinchStartDist)));
        // Pan so the pinch midpoint stays fixed in content space
        const [pa, pb] = [...ptrs.values()];
        const pr = el.parentElement!.getBoundingClientRect();
        const dx = (pa.x + pb.x) / 2 - (pr.left + pr.width / 2);
        const dy = (pa.y + pb.y) / 2 - (pr.top + pr.height / 2);
        const ratio = sNew / sPrev;
        const newPanX = dx * (1 - ratio) + panXRef.current * ratio;
        const newPanY = dy * (1 - ratio) + panYRef.current * ratio;
        zoomScaleRef.current = sNew;
        setZoomScale(sNew);
        const c = clampPan(newPanX, newPanY, sNew);
        applyPan(c.x, c.y);
        e.stopPropagation();
      } else if (ptrs.size === 1 && isPanning) {
        const { x, y } = clampPan(panStartValueX + e.clientX - panStartX, panStartValueY + e.clientY - panStartY, zoomScaleRef.current);
        applyPan(x, y);
        e.stopPropagation();
      }
    };

    const onUp = (e: PointerEvent) => {
      const wasTwo = ptrs.size >= 2;
      ptrs.delete(e.pointerId);
      if (wasTwo) {
        el.classList.remove('pinching');
        pinchStartDist = null;
        // Seamlessly transition to single-finger pan if one finger remains
        if (ptrs.size === 1 && zoomScaleRef.current > 1) {
          const [rem] = ptrs.values();
          startPanFrom(rem.x, rem.y);
          pointerMoved = false;
        }
        e.stopPropagation();
        return;
      }
      if (ptrs.size > 0) return;
      isPanning = false;
      if (wasPinching) { wasPinching = false; return; }
      if (pointerMoved) { pointerMoved = false; lastTapTime = 0; return; }
      pointerMoved = false;
      const now = Date.now();
      if (now - lastTapTime < 300) {
        const next = zoomScaleRef.current > 1.0 ? 1.0 : 3.0;
        zoomScaleRef.current = next;
        setZoomScale(next);
        if (next === 1.0) applyPan(0, 0);
        lastTapTime = 0;
      } else {
        lastTapTime = now;
      }
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, []); // previewRef is stable — ref identity never changes

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 2500);
  }, []);

  useEffect(() => () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  useEffect(() => {
    setControlsVisible(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, [state.activeFilter]);

  const isAnimated = state.image.isVideo || state.activeFilter === 'liquid' || state.activeFilter === 'glitchy';
  const isPlaying = state.image.isVideo
    ? state.image.videoPlaying
    : state.activeFilter === 'liquid'
      ? state.liquid.playing
      : state.activeFilter === 'glitchy'
        ? state.glitchy.playing
        : false;

  const handlePanelTap = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.preview-play-btn')) return;
    showControls();
  }, [showControls]);

  const showRadialHandle =
    state.activeFilter === 'blur' &&
    state.blur.type === 'radial' &&
    state.image.isReady &&
    onBlurCenterChange != null;

  const showGlassHandle =
    state.activeFilter === 'glass' &&
    state.glass.shape === 'circles' &&
    state.image.isReady &&
    onGlassCenterChange != null;

  return (
    <div className="preview-panel" onTouchEnd={handlePanelTap}>
      <div
        ref={previewRef}
        className={`image-area${state.image.isReady ? ' has-image' : ''}${state.image.hasUserImage ? ' has-user-image' : ''}${state.fitMode === 'fill' ? ' fill-mode' : ''}${isDragging ? ' dragging-img' : ''}`}
        style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoomScale})`, '--inv-zoom': `${1 / zoomScale}` } as React.CSSProperties}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file) onDropFile(file);
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onLostPointerCapture={onLostPointerCapture}
      >
        {!state.image.hasUserImage && (
          <button className="btn btn-primary upload-btn" onClick={onUpload}>
            <UploadIcon />
            Upload media
          </button>
        )}

        {showRadialHandle && (
          <RadialCenterHandle
            uvX={state.blur.centerX}
            uvY={state.blur.centerY}
            containerRef={previewRef}
            ar={state.image.aspectRatio}
            fitMode={state.fitMode}
            offsetX={state.offsetX}
            offsetY={state.offsetY}
            onChange={onBlurCenterChange!}
          />
        )}
        {showGlassHandle && (
          <RadialCenterHandle
            uvX={state.glass.centerX}
            uvY={state.glass.centerY}
            containerRef={previewRef}
            ar={state.image.aspectRatio}
            fitMode={state.fitMode}
            offsetX={state.offsetX}
            offsetY={state.offsetY}
            onChange={onGlassCenterChange!}
          />
        )}
      </div>

      <div className="fit-control" id="fitControl" data-mode={state.fitMode}>
        <span className="fit-pill" />
        <button
          type="button"
          className={`fit-btn${state.fitMode === 'fill' ? ' selected' : ''}`}
          onClick={() => onFitModeChange('fill')}
        >
          Fill
        </button>
        <button
          type="button"
          className={`fit-btn${state.fitMode === 'fit' ? ' selected' : ''}`}
          onClick={() => onFitModeChange('fit')}
        >
          Fit
        </button>
      </div>

      {isAnimated && state.image.isReady && (
        <button
          type="button"
          className={`preview-play-btn${controlsVisible ? ' visible' : ''}`}
          onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); onTogglePlaying(); showControls(); }}
          onClick={(e) => { e.stopPropagation(); onTogglePlaying(); }}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      )}
    </div>
  );
}
