import { useEffect, useMemo, useRef } from 'react';
import { getShaderConfig, updateFitClip } from '../lib/editor';
import { ShaderMount } from '../lib/shaders';
import type { ActiveFilter, EditorState } from '../types/editor';
import type { UniformMap } from '../lib/shaders';

interface UseShaderPreviewOptions {
  editorState: EditorState;
  previewRef: React.RefObject<HTMLDivElement | null>;
  shaderMountRef: React.RefObject<ShaderMount | null>;
}

// Returns [bottomLayer, ..., topLayer] render order.
// layers[0] in UI = top visually = applied last, so we reverse.
// activeFilter is always rendered on top if not already in layers.
function getRenderStack(state: EditorState): ActiveFilter[] {
  const { activeFilter, layers } = state;
  if (layers.length === 0) return [activeFilter];
  const bottomToTop = [...layers].reverse();
  return layers.includes(activeFilter) ? bottomToTop : [...bottomToTop, activeFilter];
}

export function useShaderPreview({ editorState, previewRef, shaderMountRef }: UseShaderPreviewOptions) {
  const media = editorState.image.video ?? editorState.image.image;
  const chainMountsRef = useRef<ShaderMount[]>([]);
  const chainDivsRef = useRef<HTMLDivElement[]>([]);

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

    const stack = renderStack;
    const intermediateMounts: ShaderMount[] = [];
    const intermediateDivs: HTMLDivElement[] = [];

    const ar =
      media instanceof HTMLVideoElement
        ? (media.videoWidth || 1) / (media.videoHeight || 1)
        : (media.naturalWidth || 1) / (media.naturalHeight || 1);
    const rawW = media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth;
    const W = Math.min(1920, rawW || 1920);
    const H = Math.max(1, Math.round(W / ar));

    let prevCanvas: HTMLCanvasElement | null = null;

    for (let i = 0; i < stack.length; i++) {
      const isLast = i === stack.length - 1;
      const filter = stack[i];
      const stateForPass: EditorState = {
        ...editorState,
        activeFilter: filter,
        fitMode: isLast ? editorState.fitMode : 'fit',
        offsetX: isLast ? editorState.offsetX : 0,
        offsetY: isLast ? editorState.offsetY : 0,
      };
      const config = getShaderConfig(stateForPass, media);

      if (isLast) {
        const mount = new ShaderMount(preview, config.fragmentShader, config.uniforms, undefined, config.speed);
        if (prevCanvas) mount.setTextureUniform('u_image', prevCanvas);
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

        if (prevCanvas) mount.setTextureUniform('u_image', prevCanvas);

        intermediateMounts.push(mount);
        prevCanvas = mount.canvasElement;
      }
    }

    chainMountsRef.current = intermediateMounts;
    chainDivsRef.current = intermediateDivs;

    requestAnimationFrame(() => {
      updateFitClip(shaderMountRef.current, editorState.fitMode, editorState.image.aspectRatio);
    });

    return () => {
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

    const allMounts = [...chainMountsRef.current];
    if (shaderMountRef.current) allMounts.push(shaderMountRef.current);

    allMounts.forEach((mount, i) => {
      const filter = renderStack[i];
      if (!filter) return;
      const isLast = i === allMounts.length - 1;
      const stateForPass: EditorState = {
        ...editorState,
        activeFilter: filter,
        fitMode: isLast ? editorState.fitMode : 'fit',
        offsetX: isLast ? editorState.offsetX : 0,
        offsetY: isLast ? editorState.offsetY : 0,
      };
      const config = getShaderConfig(stateForPass, media);

      if (i > 0) {
        // Don't overwrite the canvas texture for chained mounts
        const { u_image: _img, ...otherUniforms } = config.uniforms as Record<string, unknown>;
        mount.setUniforms(otherUniforms as UniformMap);
      } else {
        mount.setUniforms(config.uniforms);
      }
      mount.setSpeed(config.speed);
    });

    if (shaderMountRef.current) {
      updateFitClip(shaderMountRef.current, editorState.fitMode, editorState.image.aspectRatio);
    }
  }, [editorState, media, previewRef, shaderMountRef, renderStack]);

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
}
