import './LayersPanel.css';
import { useRef, useState } from 'react';
import { filterOptions } from './filterOptions';
import { EyeOpenIcon, EyeSlashIcon, TrashIcon } from './icons/AppIcons';
import type { ActiveFilter, LayerEntry } from '../types/editor';

interface LayersPanelProps {
  layers: LayerEntry[];
  activeFilter: ActiveFilter;
  onRemove: (filter: ActiveFilter) => void;
  onReorder: (layers: LayerEntry[]) => void;
  onSelect: (filter: ActiveFilter) => void;
  onToggleVisibility: (filter: ActiveFilter) => void;
}

function DragDotsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="7" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="7" r="1.5" fill="currentColor"/>
      <circle cx="9" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="9" cy="17" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="17" r="1.5" fill="currentColor"/>
    </svg>
  );
}


export function LayersPanel({ layers, activeFilter, onRemove, onReorder, onSelect, onToggleVisibility }: LayersPanelProps) {
  const dragIndexRef = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const getLabel = (id: ActiveFilter) => filterOptions.find((f) => f.id === id)?.label ?? id;

  const handleDragStart = (index: number) => { dragIndexRef.current = index; };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOver(index);
  };

  const handleDrop = (targetIndex: number) => {
    const from = dragIndexRef.current;
    if (from === null || from === targetIndex) { setDragOver(null); return; }
    const next = [...layers];
    const [item] = next.splice(from, 1);
    next.splice(targetIndex, 0, item);
    onReorder(next);
    dragIndexRef.current = null;
    setDragOver(null);
  };

  const handleDragEnd = () => { dragIndexRef.current = null; setDragOver(null); };

  return (
    <div className={`layers-panel${layers.length > 0 ? ' layers-panel--visible' : ''}`}>
      {layers.length > 0 && <div className="layers-title">Layers</div>}
      <div className="layers-list">
        {layers.map((layer, index) => {
          const isActive = activeFilter === layer.id;
          const isHidden = layer.hidden;
          return (
            <div
              key={layer.id}
              className={`layer-row${dragOver === index ? ' layer-row--over' : ''}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
            >
              {/* Left: eye + name+opacity */}
              <div className="layer-left">
                <button
                  type="button"
                  className={`layer-eye-btn${isHidden ? ' layer-eye-btn--hidden' : ''}`}
                  aria-label={isHidden ? 'Show layer' : 'Hide layer'}
                  onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
                >
                  {isHidden ? <EyeSlashIcon /> : <EyeOpenIcon />}
                </button>
                <button
                  type="button"
                  className={`layer-name-btn${isActive ? ' layer-name-btn--active' : ''}${isHidden ? ' layer-name-btn--hidden' : ''}`}
                  onClick={() => onSelect(layer.id)}
                >
                  <DragDotsIcon />
                  {getLabel(layer.id)}
                </button>
              </div>

              {/* Right: trash */}
              <div className="layer-right">
                <button
                  type="button"
                  className="layer-trash-btn"
                  aria-label={`Remove ${getLabel(layer.id)} layer`}
                  onClick={(e) => { e.stopPropagation(); onRemove(layer.id); }}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
