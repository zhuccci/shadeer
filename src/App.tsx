import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionBar } from './components/ActionBar';
import { EditorPanels } from './components/EditorPanels';
import { FilterStrip } from './components/FilterStrip';
import { PreviewStage } from './components/PreviewStage';
import { NoiseLayer } from './components/NoiseLayer';
import {
  defaultEditorState,
  loadImage,
  makeFallbackImage,
  renderShaderToBlob,
} from './lib/editor';
import { ShaderMount } from './lib/shaders';
import { useHorizontalWheelScroll } from './hooks/useHorizontalWheelScroll';
import { useImageDrag } from './hooks/useImageDrag';
import { useShaderPreview } from './hooks/useShaderPreview';
import type { ActiveFilter, EditorState } from './types/editor';

const baseUrl = import.meta.env.BASE_URL;

export default function App() {
  const [editorState, setEditorState] = useState<EditorState>(defaultEditorState);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const shaderMountRef = useRef<ShaderMount | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateState = useCallback((updater: (state: EditorState) => EditorState) => {
    setEditorState((current) => updater(current));
  }, []);

  useEffect(() => {
    const loadInitialImage = async () => {
      try {
        const image = await loadImage(`${baseUrl}og-image.png`);
        updateState((current) => ({
          ...current,
          image: {
            image,
            src: image.src,
            aspectRatio: image.naturalWidth / image.naturalHeight,
            hasUserImage: false,
            isReady: true,
          },
        }));
      } catch {
        const fallbackImage = makeFallbackImage();
        fallbackImage.onload = () => {
          updateState((current) => ({
            ...current,
            image: {
              image: fallbackImage,
              src: fallbackImage.src,
              aspectRatio: fallbackImage.naturalWidth / fallbackImage.naturalHeight || 1,
              hasUserImage: false,
              isReady: true,
            },
          }));
        };
      }
    };

    void loadInitialImage();
  }, [updateState]);

  useShaderPreview({ editorState, previewRef, shaderMountRef });
  useHorizontalWheelScroll(scrollRef);
  useImageDrag({ editorState, previewRef, updateState });

  useEffect(() => {
    const handleCopy = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key !== 'c') return;
      if (!shaderMountRef.current || !previewRef.current) return;
      event.preventDefault();
      const blobPromise = renderShaderToBlob(previewRef.current, shaderMountRef.current, editorState).then((blob) => blob ?? new Blob());
      void navigator.clipboard.write([new ClipboardItem({ 'image/png': blobPromise })]);
    };

    document.addEventListener('keydown', handleCopy);
    return () => document.removeEventListener('keydown', handleCopy);
  }, [editorState]);

  const handleFilterSelect = useCallback((filterId: ActiveFilter) => {
    const scrollElement = scrollRef.current;
    const button = scrollElement?.querySelector<HTMLElement>(`.filter-btn[data-filter="${filterId}"]`);
    if (scrollElement && button) {
      const fadeLeft = 24;
      const fadeRight = 16;
      const scrollRect = scrollElement.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      if (buttonRect.right > scrollRect.right - fadeRight) {
        scrollElement.scrollBy({ left: buttonRect.right - scrollRect.right + fadeRight + 8, behavior: 'smooth' });
      } else if (buttonRect.left < scrollRect.left + fadeLeft) {
        scrollElement.scrollBy({ left: buttonRect.left - scrollRect.left - fadeLeft - 8, behavior: 'smooth' });
      }
    }

    updateState((current) => ({
      ...current,
      activeFilter: filterId,
      offsetX: 0,
      offsetY: 0,
    }));
  }, [updateState]);

  const handleImageFile = useCallback(async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const image = await loadImage(objectUrl);
    updateState((current) => ({
      ...current,
      fitMode: 'fill',
      offsetX: 0,
      offsetY: 0,
      image: {
        image,
        src: objectUrl,
        aspectRatio: image.naturalWidth / image.naturalHeight,
        hasUserImage: true,
        isReady: true,
      },
    }));
  }, [updateState]);

  const handleSave = useCallback(async () => {
    if (!shaderMountRef.current || !previewRef.current) return;
    const blob = await renderShaderToBlob(previewRef.current, shaderMountRef.current, editorState);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'neuropic.png';
    anchor.click();
    URL.revokeObjectURL(url);
  }, [editorState]);

  return (
    <div className="app">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        style={{ display: 'none' }}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleImageFile(file);
          event.currentTarget.value = '';
        }}
      />

      <div className="sidebar">
        <FilterStrip activeFilter={editorState.activeFilter} scrollRef={scrollRef} onSelect={handleFilterSelect} />
        <EditorPanels state={editorState} updateState={updateState} />
        <ActionBar visible={editorState.image.hasUserImage} onUpload={() => fileInputRef.current?.click()} onSave={() => void handleSave()} />
        <NoiseLayer className="app-grain" />
      </div>

      <PreviewStage
        state={editorState}
        previewRef={previewRef}
        onUpload={() => fileInputRef.current?.click()}
        onDropFile={(file) => void handleImageFile(file)}
        onFitModeChange={(fitMode) =>
          updateState((current) => ({
            ...current,
            fitMode,
            offsetX: 0,
            offsetY: 0,
          }))
        }
      />
    </div>
  );
}
