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
    state.image.isReady &&
    onGlassCenterChange != null;

  return (
    <div className="preview-panel" onTouchEnd={handlePanelTap}>
      <div
        ref={previewRef}
        className={`image-area${state.image.isReady ? ' has-image' : ''}${state.image.hasUserImage ? ' has-user-image' : ''}${state.fitMode === 'fill' ? ' fill-mode' : ''}${isDragging ? ' dragging-img' : ''}`}
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
        {!state.image.hasUserImage ? (
          <button className="btn btn-primary upload-btn" onClick={onUpload}>
            <UploadIcon />
            Upload media
          </button>
        ) : null}

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
