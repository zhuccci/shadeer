import { useEffect, useMemo, useRef, useState } from 'react';
import { getShaderConfig, getBlurHPassConfig, getGlowHPassConfig, updateFitClip } from '../lib/editor';
import { ShaderMount } from '../lib/shaders';
import type { ActiveFilter, EditorState } from '../types/editor';
import type { UniformMap } from '../lib/shaders';

interface UseShaderPreviewOptions {
  editorState: EditorState;
  previewRef: React.RefObject<HTMLDivElement | null>;
  shaderMountRef: React.RefObject<ShaderMount | null>;
}

// Returns [bottomLayer, ..., topLayer] render order.
// 'blur' and 'glow' expand to two-pass separable pipeline.
function getRenderStack(state: EditorState): string[] {
  const expand = (f: ActiveFilter): string[] => {
    if (f === 'blur') return ['blur_h', 'blur'];
    if (f === 'glow') return ['glow_h', 'glow'];
    return [f];
  };
  const { activeFilter, layers } = state;
  if (layers.length === 0) return expand(activeFilter);
  const visibleLayers = layers.filter((l) => !l.hidden);
  const bottomToTop = [...visibleLayers].reverse().map((l) => l.id);
  const base = layers.some((l) => l.id === activeFilter) ? bottomToTop : [...bottomToTop, activeFilter];
  return base.flatMap(expand);
}


export function useShaderPreview({ editorState, previewRef, shaderMountRef }: UseShaderPreviewOptions) {
  const media = editorState.image.video ?? editorState.image.image;
  const chainMountsRef = useRef<ShaderMount[]>([]);
  const chainDivsRef = useRef<HTMLDivElement[]>([]);
  const isMobilePreview = useMemo(() => window.matchMedia('(pointer: coarse)').matches, []);
  const pendingUniformsRafRef = useRef<number | null>(null);
  const [glowSrc, setGlowSrc] = useState('');
  const glowRafRef = useRef<number | null>(null);

  const renderStack = useMemo(
    () => getRenderStack(editorState),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editorState.activeFilter, editorState.layers],
  );
  const renderStackKey = renderStack.join(',');

  // ── Recreate chain when stack structure or media changes ──────────────────
  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || !media) return;

    chainMountsRef.current.forEach((m) => m.dispose());
    chainDivsRef.current.forEach((d) => d.remove());
    chainMountsRef.current = [];
    chainDivsRef.current = [];
    shaderMountRef.current?.dispose();
    shaderMountRef.current = null;

    const previewMinPR = isMobilePreview ? 1 : 2;
    const previewMaxPX = isMobilePreview ? 1280 * 720 : 1920 * 1080 * 4;

    const stack = renderStack;
    const intermediateMounts: ShaderMount[] = [];
    const intermediateDivs: HTMLDivElement[] = [];

    const ar =
      media instanceof HTMLVideoElement
        ? (media.videoWidth || 1) / (media.videoHeight || 1)
        : (media.naturalWidth || 1) / (media.naturalHeight || 1);
    const rawW = media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth;
    const intermediateMaxW = isMobilePreview ? 960 : 1920;
    const W = Math.min(intermediateMaxW, rawW || intermediateMaxW);
    const H = Math.max(1, Math.round(W / ar));

    let prevCanvas: HTMLCanvasElement | null = null;
    let preGlowHCanvas: HTMLCanvasElement | null = null;

    for (let i = 0; i < stack.length; i++) {
      const isLast = i === stack.length - 1;
      const filter = stack[i];
      if (filter === 'glow_h') preGlowHCanvas = prevCanvas;
      const fitMode = isLast ? editorState.fitMode : 'fit';
      const offsetX = isLast ? editorState.offsetX : 0;
      const offsetY = isLast ? editorState.offsetY : 0;
      const config =
        filter === 'blur_h'
          ? getBlurHPassConfig({ ...editorState, fitMode: 'fit', offsetX: 0, offsetY: 0 }, media)
          : filter === 'glow_h'
          ? getGlowHPassConfig({ ...editorState, fitMode: 'fit', offsetX: 0, offsetY: 0 }, media)
          : getShaderConfig({ ...editorState, activeFilter: filter as ActiveFilter, fitMode, offsetX, offsetY }, media, 1.0);

      if (isLast) {
        const mount = new ShaderMount(preview, config.fragmentShader, config.uniforms, undefined, config.speed, 0, previewMinPR, previewMaxPX);
        if (prevCanvas) mount.setTextureUniform(filter === 'glow' ? 'u_glow' : 'u_image', prevCanvas);
        if (filter === 'glow' && preGlowHCanvas) mount.setTextureUniform('u_image', preGlowHCanvas);
        shaderMountRef.current = mount;
      } else {
        const div = document.createElement('div');
        div.style.cssText = `position:fixed;left:-99999px;top:0;width:${W}px;height:${H}px;overflow:hidden`;
        document.documentElement.appendChild(div);
        intermediateDivs.push(div);

        const mount = new ShaderMount(div, config.fragmentShader, config.uniforms, { preserveDrawingBuffer: true }, config.speed);
        mount.resizeObserver?.disconnect();
        mount.canvasElement.width = W;
        mount.canvasElement.height = H;
        mount.gl.viewport(0, 0, W, H);
        mount.resolutionChanged = true;
        mount.renderScale = 1;
        mount.uniformCache = {};

        if (prevCanvas) mount.setTextureUniform(filter === 'glow' ? 'u_glow' : 'u_image', prevCanvas);
        if (filter === 'glow' && preGlowHCanvas) mount.setTextureUniform('u_image', preGlowHCanvas);

        intermediateMounts.push(mount);
        prevCanvas = mount.canvasElement;
      }
    }

    chainMountsRef.current = intermediateMounts;
    chainDivsRef.current = intermediateDivs;

    requestAnimationFrame(() => {
      updateFitClip(shaderMountRef.current, editorState.fitMode, editorState.image.aspectRatio);
    });

    // Capture last intermediate canvas for preview glow after layers render.
    // Skip h-pass intermediates (blur_h / glow_h) — they're half-processed and
    // would make the glow look wrong. Only capture when the second-to-last stack
    // entry is a real filter output.
    if (glowRafRef.current !== null) cancelAnimationFrame(glowRafRef.current);
    const lastIntermediateFilter = stack[stack.length - 2];
    const shouldCaptureGlow =
      chainMountsRef.current.length > 0 &&
      lastIntermediateFilter !== 'blur_h' &&
      lastIntermediateFilter !== 'glow_h';
    glowRafRef.current = requestAnimationFrame(() => {
      glowRafRef.current = requestAnimationFrame(() => {
        glowRafRef.current = null;
        if (shouldCaptureGlow) {
          const last = chainMountsRef.current[chainMountsRef.current.length - 1];
          if (last) {
            try { setGlowSrc(last.canvasElement.toDataURL('image/jpeg', 0.3)); } catch { /* ignore */ }
          }
        } else {
          setGlowSrc('');
        }
      });
    });

    return () => {
      if (glowRafRef.current !== null) { cancelAnimationFrame(glowRafRef.current); glowRafRef.current = null; }
      chainMountsRef.current.forEach((m) => m.dispose());
      chainDivsRef.current.forEach((d) => d.remove());
      chainMountsRef.current = [];
      chainDivsRef.current = [];
      shaderMountRef.current?.dispose();
      shaderMountRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderStackKey, editorState.fitMode, editorState.image.aspectRatio, editorState.image.image, editorState.image.video, previewRef, shaderMountRef]);

  // ── Update uniforms on settings change ───────────────────────────────────
  useEffect(() => {
    if (!media) return;

    const flush = () => {
      pendingUniformsRafRef.current = null;

      const allMounts = [...chainMountsRef.current];
      if (shaderMountRef.current) allMounts.push(shaderMountRef.current);

      allMounts.forEach((mount, i) => {
        const filter = renderStack[i];
        if (!filter) return;
        const isLast = i === allMounts.length - 1;
        const fitMode = isLast ? editorState.fitMode : 'fit';
        const offsetX = isLast ? editorState.offsetX : 0;
        const offsetY = isLast ? editorState.offsetY : 0;
        const config =
          filter === 'blur_h'
            ? getBlurHPassConfig({ ...editorState, fitMode: 'fit', offsetX: 0, offsetY: 0 }, media)
            : filter === 'glow_h'
            ? getGlowHPassConfig({ ...editorState, fitMode: 'fit', offsetX: 0, offsetY: 0 }, media)
            : getShaderConfig({ ...editorState, activeFilter: filter as ActiveFilter, fitMode, offsetX, offsetY }, media, 1.0);

        if (i > 0) {
          if (filter === 'glow') {
            // u_glow is the glow_h canvas; when glow is chained (layers precede it),
            // u_image is also a canvas and must be preserved alongside u_glow
            const glowIsChained = renderStack.indexOf('glow') > 1;
            const { u_glow: _g, u_image, ...rest } = config.uniforms as Record<string, unknown>;
            mount.setUniforms(glowIsChained ? (rest as UniformMap) : ({ ...rest, u_image } as UniformMap));
          } else {
            // Don't overwrite the canvas texture for other chained mounts
            const { u_image: _img, ...otherUniforms } = config.uniforms as Record<string, unknown>;
            mount.setUniforms(otherUniforms as UniformMap);
          }
        } else {
          mount.setUniforms(config.uniforms);
        }
        mount.setSpeed(config.speed);
      });

      if (shaderMountRef.current) {
        updateFitClip(shaderMountRef.current, editorState.fitMode, editorState.image.aspectRatio);
      }
    };

    if (isMobilePreview) {
      if (pendingUniformsRafRef.current !== null) cancelAnimationFrame(pendingUniformsRafRef.current);
      pendingUniformsRafRef.current = requestAnimationFrame(flush);
      return () => {
        if (pendingUniformsRafRef.current !== null) {
          cancelAnimationFrame(pendingUniformsRafRef.current);
          pendingUniformsRafRef.current = null;
        }
      };
    }

    flush();
  }, [editorState, media, previewRef, shaderMountRef, renderStack, isMobilePreview]);

  // ── Handle preview resize ─────────────────────────────────────────────────
  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    const resizeObserver = new ResizeObserver(() => {
      updateFitClip(shaderMountRef.current, editorState.fitMode, editorState.image.aspectRatio);
    });
    resizeObserver.observe(preview);
    return () => resizeObserver.disconnect();
  }, [editorState.fitMode, editorState.image.aspectRatio, previewRef, shaderMountRef]);

  return { glowSrc };
}
