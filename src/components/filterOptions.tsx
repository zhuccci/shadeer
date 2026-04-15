import type { ActiveFilter } from '../types/editor';

const baseUrl = import.meta.env.BASE_URL;

export interface FilterOption {
  id: ActiveFilter;
  label: string;
  thumbnail: string;
  hoverThumbnail?: string;
  implemented: boolean;
}

export const filterOptions: FilterOption[] = [
  {
    id: 'glass',
    label: 'Glass',
    thumbnail: `${baseUrl}placeholders/glass.png`,
    hoverThumbnail: `${baseUrl}placeholders/glass_hover.png`,
    implemented: true,
  },
  {
    id: 'dithering',
    label: 'Dithering',
    thumbnail: `${baseUrl}placeholders/dither_hover.png`,
    hoverThumbnail: `${baseUrl}placeholders/dither.png`,
    implemented: true,
  },
  {
    id: 'liquid',
    label: 'Liquid',
    thumbnail: `${baseUrl}placeholders/liquid.png`,
    hoverThumbnail: `${baseUrl}placeholders/liquid_hover.png`,
    implemented: true,
  },
  {
    id: 'glitchy',
    label: 'Glitchy',
    thumbnail: `${baseUrl}placeholders/glitchy.png`,
    hoverThumbnail: `${baseUrl}placeholders/glitchy_hover.png`,
    implemented: true,
  },
  {
    id: 'halftone',
    label: 'Halftone',
    thumbnail: `${baseUrl}placeholders/halftone.png`,
    hoverThumbnail: `${baseUrl}placeholders/halftone_hover.png`,
    implemented: true,
  },
  {
    id: 'symbolEdges',
    label: 'Symbols',
    thumbnail: `${baseUrl}placeholders/symbolEdges.png`,
    hoverThumbnail: `${baseUrl}placeholders/symbolEdges_hover.png`,
    implemented: true,
  },
];

export function isActiveFilter(filterId: FilterOption['id']): filterId is ActiveFilter {
  return filterId === 'glass' || filterId === 'dithering' || filterId === 'liquid' || filterId === 'glitchy' || filterId === 'halftone' || filterId === 'symbolEdges';
}
