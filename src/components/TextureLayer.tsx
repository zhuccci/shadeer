interface TextureLayerProps {
  className: string;
}

export function TextureLayer({ className }: TextureLayerProps) {
  return <div className={className} aria-hidden="true" />;
}
