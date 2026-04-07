import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
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
import { useImageDrag } from './hooks/useImageDrag';
import { useShaderPreview } from './hooks/useShaderPreview';
import type { ActiveFilter, EditorState } from './types/editor';

const baseUrl = import.meta.env.BASE_URL;

export default function App() {
  const [editorState, setEditorState] = useState<EditorState>(defaultEditorState);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const shaderMountRef = useRef<ShaderMount | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement | null>(null);

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
  const imageDrag = useImageDrag({ editorState, previewRef, updateState });

  useEffect(() => {
    if (!downloadUrl) return;

    downloadLinkRef.current?.click();
    const timeoutId = window.setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [downloadUrl]);

  const handleFilterSelect = useCallback((filterId: ActiveFilter) => {
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
    setDownloadUrl(URL.createObjectURL(blob));
  }, [editorState]);

  const handleCopy = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'c') return;
    if (!shaderMountRef.current || !previewRef.current) return;

    event.preventDefault();
    const blobPromise = renderShaderToBlob(previewRef.current, shaderMountRef.current, editorState).then((blob) => blob ?? new Blob());
    void navigator.clipboard.write([new ClipboardItem({ 'image/png': blobPromise })]);
  }, [editorState]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="app" onKeyDownCapture={handleCopy}>
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
      <a
        ref={downloadLinkRef}
        href={downloadUrl ?? undefined}
        download="neuropic.png"
        style={{ display: 'none' }}
      >
        Download
      </a>

      <div className="sidebar">
        <div className="app-shadow-overlay" />
        <FilterStrip activeFilter={editorState.activeFilter} onSelect={handleFilterSelect} />
        <EditorPanels state={editorState} updateState={updateState} />
        <ActionBar visible={editorState.image.hasUserImage} onUpload={handleUploadClick} onSave={() => void handleSave()} />
        <NoiseLayer className="app-grain" />
      </div>

      <PreviewStage
        state={editorState}
        isDragging={imageDrag.isDragging}
        previewRef={previewRef}
        onUpload={handleUploadClick}
        onDropFile={(file) => void handleImageFile(file)}
        onFitModeChange={(fitMode) =>
          updateState((current) => ({
            ...current,
            fitMode,
            offsetX: 0,
            offsetY: 0,
          }))
        }
        onPointerDown={imageDrag.onPointerDown}
        onPointerMove={imageDrag.onPointerMove}
        onPointerUp={imageDrag.onPointerUp}
        onPointerCancel={imageDrag.onPointerCancel}
        onLostPointerCapture={imageDrag.onLostPointerCapture}
      />
    </div>
  );
}
