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
}

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

  const isAnimated = state.activeFilter === 'liquid' || state.activeFilter === 'glitchy';
  const isPlaying = state.activeFilter === 'liquid'
    ? state.liquid.playing
    : state.activeFilter === 'glitchy'
      ? state.glitchy.playing
      : false;

  const handlePanelTap = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.preview-play-btn')) return;
    showControls();
  }, [showControls]);

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
            Upload image
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
      </div>

      {isAnimated && state.image.isReady && (
        <button
          type="button"
          className={`preview-play-btn${controlsVisible ? ' visible' : ''}`}
          onTouchEnd={(e) => { e.stopPropagation(); onTogglePlaying(); showControls(); }}
          onClick={(e) => { e.stopPropagation(); onTogglePlaying(); }}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      )}
    </div>
  );
}
