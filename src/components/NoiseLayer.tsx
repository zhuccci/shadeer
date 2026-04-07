import { useEffect, useRef } from 'react';

interface NoiseLayerProps {
  className: string;
  opacity?: number;
  strong?: boolean;
}

export function NoiseLayer({ className, opacity, strong }: NoiseLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const draw = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.round(window.devicePixelRatio || 1);
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const context = canvas.getContext('2d');
      if (!context) return;
      const imageData = context.createImageData(width, height);
      for (let index = 0; index < imageData.data.length; index += 4) {
        const value = Math.floor(Math.random() * (strong ? 255 : 40));
        imageData.data[index] = value;
        imageData.data[index + 1] = value;
        imageData.data[index + 2] = value;
        imageData.data[index + 3] = strong ? 160 : 22;
      }
      context.putImageData(imageData, 0, 0);
    };

    draw();
    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(parent);
    return () => resizeObserver.disconnect();
  }, []);

  return <canvas ref={canvasRef} className={className} style={opacity ? { opacity } : undefined} aria-hidden="true" />;
}

