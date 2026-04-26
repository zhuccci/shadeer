import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionBar } from './components/ActionBar';
import { CopyToast } from './components/CopyToast';
import { EditorPanels } from './components/EditorPanels';
import { FilterStrip } from './components/FilterStrip';
import { LayersPanel } from './components/LayersPanel';
import { MobileDrawer } from './components/MobileDrawer';
import { PreviewStage } from './components/PreviewStage';
import { PullToRefresh } from './components/PullToRefresh';
import {
  convertWebmToMp4,
  defaultEditorState,
  hasAnimatedEffect,
  loadImage,
  makeFallbackImage,
  renderImageAsVideoToBlob,
  renderShaderToBlob,
  renderVideoToBlob,
} from './lib/editor';
import { ShaderMount } from './lib/shaders';
import { useImageDrag } from './hooks/useImageDrag';
import { useShaderPreview } from './hooks/useShaderPreview';
import type { ActiveFilter, EditorState } from './types/editor';

const baseUrl = import.meta.env.BASE_URL;

export default function App() {
  const [editorState, setEditorState] = useState<EditorState>(defaultEditorState);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState('neuropic.png');
  const [videoExportProgress, setVideoExportProgress] = useState<number | null>(null);
  const [savingPhase, setSavingPhase] = useState<'recording' | 'converting' | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copyToastVisible, setCopyToastVisible] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const shaderMountRef = useRef<ShaderMount | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement | null>(null);
  const copyToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fakeProgressRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const handleAddLayer = useCallback((filterId: ActiveFilter) => {
    updateState((current) => {
      if (current.layers.includes(filterId)) return current;
      return { ...current, layers: [filterId, ...current.layers] };
    });
  }, [updateState]);

  const handleRemoveLayer = useCallback((filterId: ActiveFilter) => {
    updateState((current) => ({
      ...current,
      layers: current.layers.filter((l) => l !== filterId),
    }));
  }, [updateState]);

  const handleReorderLayers = useCallback((layers: ActiveFilter[]) => {
    updateState((current) => ({ ...current, layers }));
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

  const handleSave = useCallback(async (format: 'png' | 'mp4' | 'webm' = 'png') => {
    if (editorState.image.isVideo && editorState.image.video && shaderMountRef.current) {
      const isMp4 = format === 'mp4';
      setSavingPhase('recording');
      setVideoExportProgress(0);
      try {
        const blob = await renderVideoToBlob(
          editorState.image.video,
          editorState,
          shaderMountRef.current,
          (p) => setVideoExportProgress(p),
        );
        if (!blob) return;
        // VideoEncoder path already returns MP4 — skip conversion
        if (blob.type === 'video/mp4') {
          setDownloadFilename('neuropic.mp4');
          setDownloadUrl(URL.createObjectURL(blob));
        } else if (isMp4) {
          // MediaRecorder fallback returned WebM — convert to MP4
          setSavingPhase('converting');
          fakeProgressRef.current = setInterval(() => {
            setVideoExportProgress((p) => (p !== null && p < 0.96 ? p + 0.0015 : p));
          }, 300);
          const mp4Blob = await convertWebmToMp4(
            blob,
            (p) => setVideoExportProgress((prev) => Math.max(prev ?? 0, 0.65 + p * 0.35)),
          );
          setDownloadFilename('neuropic.mp4');
          setDownloadUrl(URL.createObjectURL(mp4Blob));
        } else {
          setDownloadFilename('neuropic.webm');
          setDownloadUrl(URL.createObjectURL(blob));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Video export failed:', err);
        setExportError(msg);
        setTimeout(() => setExportError(null), 6000);
      } finally {
        if (fakeProgressRef.current) { clearInterval(fakeProgressRef.current); fakeProgressRef.current = null; }
        setVideoExportProgress(null);
        setSavingPhase(null);
      }
      return;
    }

    if (!shaderMountRef.current || !previewRef.current) return;

    if (format === 'mp4') {
      setSavingPhase('recording');
      setVideoExportProgress(0);
      try {
        const blob = await renderImageAsVideoToBlob(
          previewRef.current,
          shaderMountRef.current,
          editorState,
          15,
          30,
          (p) => setVideoExportProgress(p),
        );
        if (!blob) return;
        setDownloadFilename('neuropic.mp4');
        setDownloadUrl(URL.createObjectURL(blob));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Image-to-video export failed:', err);
        setExportError(msg);
        setTimeout(() => setExportError(null), 6000);
      } finally {
        setVideoExportProgress(null);
        setSavingPhase(null);
      }
      return;
    }

    const blob = await renderShaderToBlob(previewRef.current, shaderMountRef.current, editorState);
    if (!blob) return;
    setDownloadFilename('neuropic.png');
    setDownloadUrl(URL.createObjectURL(blob));
  }, [editorState, shaderMountRef]);

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
        accept="image/jpeg,image/png,video/mp4,video/webm,video/quicktime"
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
        download={downloadFilename}
        style={{ display: 'none' }}
      >
        Download
      </a>

      <div className="sidebar">
        <FilterStrip
          activeFilter={editorState.activeFilter}
          layers={editorState.layers}
          onSelect={handleFilterSelect}
          onAddLayer={handleAddLayer}
        />
        <EditorPanels state={editorState} updateState={updateState} />
        <LayersPanel
          layers={editorState.layers}
          onRemove={handleRemoveLayer}
          onReorder={handleReorderLayers}
        />
        <ActionBar visible={editorState.image.hasUserImage} onUpload={handleUploadClick} onSave={(fmt) => void handleSave(fmt)} isVideo={editorState.image.isVideo} canExportVideo={hasAnimatedEffect(editorState)} savingProgress={videoExportProgress} savingPhase={savingPhase} exportError={exportError} />
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
        onSave={(fmt) => void handleSave(fmt)}
        onFilterSelect={handleFilterSelect}
        isVideo={editorState.image.isVideo}
        canExportVideo={hasAnimatedEffect(editorState)}
        savingProgress={videoExportProgress}
        savingPhase={savingPhase}
      />
      <PullToRefresh />
    </div>
  );
}
