const grainUrl = `${import.meta.env.BASE_URL}grain.png`;

interface TextureLayerProps {
  className: string;
}

export function TextureLayer({ className }: TextureLayerProps) {
  return (
    <div
      className={className}
      style={{ backgroundImage: `url(${grainUrl})` }}
      aria-hidden="true"
    />
  );
}
