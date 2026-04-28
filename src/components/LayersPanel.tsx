import './LayersPanel.css';
import { useRef, useState } from 'react';
import { filterOptions } from './filterOptions';
import type { ActiveFilter } from '../types/editor';

interface LayersPanelProps {
  layers: ActiveFilter[];
  activeFilter: ActiveFilter;
  onRemove: (filter: ActiveFilter) => void;
  onReorder: (layers: ActiveFilter[]) => void;
  onSelect: (filter: ActiveFilter) => void;
}

function DragHandleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="5.5" cy="5" r="1" fill="currentColor" />
      <circle cx="10.5" cy="5" r="1" fill="currentColor" />
      <circle cx="5.5" cy="8" r="1" fill="currentColor" />
      <circle cx="10.5" cy="8" r="1" fill="currentColor" />
      <circle cx="5.5" cy="11" r="1" fill="currentColor" />
      <circle cx="10.5" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function LayersPanel({ layers, activeFilter, onRemove, onReorder, onSelect }: LayersPanelProps) {
  const dragIndexRef = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  if (layers.length === 0) return null;

  const getLabel = (id: ActiveFilter) => filterOptions.find((f) => f.id === id)?.label ?? id;

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOver(index);
  };

  const handleDrop = (targetIndex: number) => {
    const from = dragIndexRef.current;
    if (from === null || from === targetIndex) {
      setDragOver(null);
      return;
    }
    const next = [...layers];
    const [item] = next.splice(from, 1);
    next.splice(targetIndex, 0, item);
    onReorder(next);
    dragIndexRef.current = null;
    setDragOver(null);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDragOver(null);
  };

  return (
    <div className="layers-panel">
      <div className="layers-title">Layers</div>
      <div className="layers-list">
        {layers.map((id, index) => (
          <div
            key={id}
            className={`layer-row${dragOver === index ? ' layer-row--over' : ''}${activeFilter === id ? ' layer-row--active' : ''}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            onClick={() => onSelect(id)}
          >
            <span className="layer-drag-handle" aria-hidden="true">
              <DragHandleIcon />
            </span>
            <span className="layer-name">{getLabel(id)}</span>
            <button
              type="button"
              className="layer-remove-btn"
              aria-label={`Remove ${getLabel(id)} layer`}
              onClick={() => onRemove(id)}
            >
              <RemoveIcon />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
