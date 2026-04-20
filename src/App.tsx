import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionBar } from './components/ActionBar';
import { CopyToast } from './components/CopyToast';
import { EditorPanels } from './components/EditorPanels';
import { FilterStrip } from './components/FilterStrip';
import { MobileDrawer } from './components/MobileDrawer';
import { PreviewStage } from './components/PreviewStage';
import { PullToRefresh } from './components/PullToRefresh';
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
  const [copyToastVisible, setCopyToastVisible] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const shaderMountRef = useRef<ShaderMount | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement | null>(null);
  const copyToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
            video: null,
            src: image.src,
            aspectRatio: image.naturalWidth / image.naturalHeight,
            hasUserImage: false,
            isVideo: false,
            videoPlaying: false,
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
              video: null,
              src: fallbackImage.src,
              aspectRatio: fallbackImage.naturalWidth / fallbackImage.naturalHeight || 1,
              hasUserImage: false,
              isVideo: false,
              videoPlaying: false,
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
        video: null,
        src: objectUrl,
        aspectRatio: image.naturalWidth / image.naturalHeight,
        hasUserImage: true,
        isVideo: false,
        videoPlaying: false,
        isReady: true,
      },
    }));
  }, [updateState]);

  const handleVideoFile = useCallback(async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = objectUrl;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    await new Promise<void>((resolve) => {
      video.addEventListener('canplay', () => resolve(), { once: true });
      video.load();
    });
    let playing = true;
    try {
      await video.play();
    } catch {
      playing = false;
    }
    updateState((current) => ({
      ...current,
      fitMode: 'fill',
      offsetX: 0,
      offsetY: 0,
      image: {
        image: null,
        video,
        src: objectUrl,
        aspectRatio: (video.videoWidth || 1) / (video.videoHeight || 1),
        hasUserImage: true,
        isVideo: true,
        videoPlaying: playing,
        isReady: true,
      },
    }));
  }, [updateState]);

  const handleVideoTogglePlay = useCallback(() => {
    const video = editorState.image.video;
    if (!video) return;
    if (video.paused) {
      void video.play();
      updateState((s) => ({ ...s, image: { ...s.image, videoPlaying: true } }));
    } else {
      video.pause();
      updateState((s) => ({ ...s, image: { ...s.image, videoPlaying: false } }));
    }
  }, [editorState.image.video, updateState]);

  const handleSave = useCallback(async () => {
    if (!shaderMountRef.current || !previewRef.current) return;
    const blob = await renderShaderToBlob(previewRef.current, shaderMountRef.current, editorState);
    if (!blob) return;
    setDownloadUrl(URL.createObjectURL(blob));
  }, [editorState]);

  useEffect(() => {
    const handleCopy = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.code !== 'KeyC') return;
      if (!shaderMountRef.current || !previewRef.current) return;

      event.preventDefault();
      const blobPromise = renderShaderToBlob(previewRef.current, shaderMountRef.current, editorState).then((blob) => blob ?? new Blob());
      void navigator.clipboard.write([new ClipboardItem({ 'image/png': blobPromise })]);

      setCopyToastVisible(true);
      if (copyToastTimerRef.current) clearTimeout(copyToastTimerRef.current);
      copyToastTimerRef.current = setTimeout(() => setCopyToastVisible(false), 2000);

      setFlashKey((k) => k + 1);
    };

    const handlePaste = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.code !== 'KeyV') return;
      event.preventDefault();
      void (async () => {
        let items: ClipboardItems;
        try {
          items = await navigator.clipboard.read();
        } catch {
          return;
        }
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (!imageType) continue;
          const blob = await item.getType(imageType);
          void handleImageFile(new File([blob], 'pasted', { type: imageType }));
          break;
        }
      })();
    };

    window.addEventListener('keydown', handleCopy);
    window.addEventListener('keydown', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleCopy);
      window.removeEventListener('keydown', handlePaste);
    };
  }, [editorState, handleImageFile]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="app">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,video/mp4,video/webm"
        style={{ display: 'none' }}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            if (file.type.startsWith('video/')) void handleVideoFile(file);
            else void handleImageFile(file);
          }
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
<FilterStrip activeFilter={editorState.activeFilter} onSelect={handleFilterSelect} />
        <EditorPanels state={editorState} updateState={updateState} />
        <ActionBar visible={editorState.image.hasUserImage} onUpload={handleUploadClick} onSave={() => void handleSave()} />
      </div>

      <div className="preview-wrap">
        <div
          className="preview-glow"
          style={{ backgroundImage: editorState.image.src && !editorState.image.isVideo ? `url(${editorState.image.src})` : 'none' }}
        />
        <PreviewStage
          state={editorState}
          isDragging={imageDrag.isDragging}
          previewRef={previewRef}
          onUpload={handleUploadClick}
          onDropFile={(file) => {
            if (file.type.startsWith('video/')) void handleVideoFile(file);
            else void handleImageFile(file);
          }}
          onFitModeChange={(fitMode) =>
            updateState((current) => ({
              ...current,
              fitMode,
              offsetX: 0,
              offsetY: 0,
            }))
          }
          onTogglePlaying={() => {
            if (editorState.image.isVideo) {
              handleVideoTogglePlay();
              return;
            }
            updateState((current) => {
              if (current.activeFilter === 'liquid') {
                return { ...current, liquid: { ...current.liquid, playing: !current.liquid.playing } };
              }
              if (current.activeFilter === 'glitchy') {
                return { ...current, glitchy: { ...current.glitchy, playing: !current.glitchy.playing } };
              }
              return current;
            });
          }}
          onPointerDown={imageDrag.onPointerDown}
          onPointerMove={imageDrag.onPointerMove}
          onPointerUp={imageDrag.onPointerUp}
          onPointerCancel={imageDrag.onPointerCancel}
          onLostPointerCapture={imageDrag.onLostPointerCapture}
        />
        {flashKey > 0 && <div key={flashKey} className="screen-flash active" />}
        <CopyToast visible={copyToastVisible} />
      </div>

      <MobileDrawer
        state={editorState}
        updateState={updateState}
        onUpload={handleUploadClick}
        onSave={() => void handleSave()}
        onFilterSelect={handleFilterSelect}
      />
      <PullToRefresh />
    </div>
  );
}
