import { useCallback, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { getFillDragBounds } from '../lib/editor';
import type { EditorState } from '../types/editor';

interface UseImageDragOptions {
  editorState: EditorState;
  previewRef: React.RefObject<HTMLDivElement | null>;
  updateState: (updater: (state: EditorState) => EditorState) => void;
}

export function useImageDrag({ editorState, previewRef, updateState }: UseImageDragOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  });

  const endDrag = useCallback(() => {
    dragStateRef.current.active = false;
    dragStateRef.current.pointerId = -1;
    setIsDragging(false);
  }, []);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || editorState.fitMode !== 'fill' || !editorState.image.isReady) return;
    if ((event.target as HTMLElement).closest('.fit-control') || (event.target as HTMLElement).closest('.upload-btn')) {
      return;
    }

    dragStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: editorState.offsetX,
      startOffsetY: editorState.offsetY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  }, [
    editorState.fitMode,
    editorState.image.isReady,
    editorState.offsetX,
    editorState.offsetY,
  ]);

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active || dragStateRef.current.pointerId !== event.pointerId || editorState.fitMode !== 'fill') {
      return;
    }

    const preview = previewRef.current ?? event.currentTarget;
    const bounds = getFillDragBounds(preview, editorState.image.aspectRatio);
    const rect = preview.getBoundingClientRect();
    const nextOffsetX = dragStateRef.current.startOffsetX - (event.clientX - dragStateRef.current.startX) / rect.width;
    const nextOffsetY = dragStateRef.current.startOffsetY + (event.clientY - dragStateRef.current.startY) / rect.height;

    updateState((current) => ({
      ...current,
      offsetX: Math.max(-bounds.maxX, Math.min(bounds.maxX, nextOffsetX)),
      offsetY: Math.max(-bounds.maxY, Math.min(bounds.maxY, nextOffsetY)),
    }));
  }, [
    editorState.fitMode,
    editorState.image.aspectRatio,
    previewRef,
    updateState,
  ]);

  const onPointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    endDrag();
  }, [endDrag]);

  return {
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: endDrag,
    onLostPointerCapture: endDrag,
  };
}
