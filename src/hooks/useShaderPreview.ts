import { useEffect } from 'react';
import { getShaderConfig, updateFitClip } from '../lib/editor';
import { ShaderMount } from '../lib/shaders';
import type { EditorState } from '../types/editor';

interface UseShaderPreviewOptions {
  editorState: EditorState;
  previewRef: React.RefObject<HTMLDivElement | null>;
  shaderMountRef: React.RefObject<ShaderMount | null>;
}

export function useShaderPreview({ editorState, previewRef, shaderMountRef }: UseShaderPreviewOptions) {
  const media = editorState.image.video ?? editorState.image.image;

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || !media) return;

    shaderMountRef.current?.dispose();
    const config = getShaderConfig(editorState, media);
    shaderMountRef.current = new ShaderMount(preview, config.fragmentShader, config.uniforms, undefined, config.speed);
    requestAnimationFrame(() => updateFitClip(shaderMountRef.current, editorState.fitMode, editorState.image.aspectRatio));

    return () => {
      shaderMountRef.current?.dispose();
      shaderMountRef.current = null;
    };
  }, [editorState.activeFilter, editorState.fitMode, editorState.image.aspectRatio, editorState.image.image, editorState.image.video, previewRef, shaderMountRef]);

  useEffect(() => {
    const mount = shaderMountRef.current;
    if (!mount || !media) return;
    const config = getShaderConfig(editorState, media);
    mount.setUniforms(config.uniforms);
    mount.setSpeed(config.speed);
    updateFitClip(mount, editorState.fitMode, editorState.image.aspectRatio);
  }, [
    editorState,
    previewRef,
    shaderMountRef,
  ]);

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
