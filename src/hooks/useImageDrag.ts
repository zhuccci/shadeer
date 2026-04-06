import { useEffect } from 'react';
import { getFillDragBounds } from '../lib/editor';
import type { EditorState } from '../types/editor';

interface UseImageDragOptions {
  editorState: EditorState;
  previewRef: React.RefObject<HTMLDivElement | null>;
  updateState: (updater: (state: EditorState) => EditorState) => void;
}

export function useImageDrag({ editorState, previewRef, updateState }: UseImageDragOptions) {
  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startOffsetX = 0;
    let startOffsetY = 0;

    const handlePointerDown = (event: PointerEvent) => {
      if (editorState.fitMode !== 'fill' || !editorState.image.isReady) return;
      if ((event.target as HTMLElement).closest('.fit-control') || (event.target as HTMLElement).closest('.upload-btn')) {
        return;
      }

      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      startOffsetX = editorState.offsetX;
      startOffsetY = editorState.offsetY;
      preview.classList.add('dragging-img');
      preview.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging || editorState.fitMode !== 'fill') return;
      const bounds = getFillDragBounds(preview, editorState.image.aspectRatio);
      const rect = preview.getBoundingClientRect();
      const nextOffsetX = startOffsetX - (event.clientX - startX) / rect.width;
      const nextOffsetY = startOffsetY + (event.clientY - startY) / rect.height;

      updateState((current) => ({
        ...current,
        offsetX: Math.max(-bounds.maxX, Math.min(bounds.maxX, nextOffsetX)),
        offsetY: Math.max(-bounds.maxY, Math.min(bounds.maxY, nextOffsetY)),
      }));
    };

    const handlePointerUp = () => {
      dragging = false;
      preview.classList.remove('dragging-img');
    };

    preview.addEventListener('pointerdown', handlePointerDown);
    preview.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      preview.removeEventListener('pointerdown', handlePointerDown);
      preview.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [
    editorState.fitMode,
    editorState.image.aspectRatio,
    editorState.image.isReady,
    editorState.offsetX,
    editorState.offsetY,
    previewRef,
    updateState,
  ]);
}
