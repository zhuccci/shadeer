import './LayersPanel.css';
import { useEffect, useRef, useState } from 'react';
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

function CollapseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.5264 13.168C11.8209 12.9277 12.2557 12.9451 12.5303 13.2197L15.0303 15.7197C15.3231 16.0126 15.3231 16.4874 15.0303 16.7803C14.7374 17.0732 14.2626 17.0731 13.9697 16.7803L12.75 15.5605V20.25C12.75 20.6642 12.4142 21 12 21C11.5858 21 11.25 20.6642 11.25 20.25V15.5605L10.0303 16.7803C9.73739 17.0732 9.26262 17.0731 8.96973 16.7803C8.67683 16.4874 8.67683 16.0126 8.96973 15.7197L11.4697 13.2197L11.5264 13.168Z" fill="currentColor"/>
      <path d="M7.25 4C7.66421 4 8 4.33579 8 4.75C8 5.16421 7.66421 5.5 7.25 5.5H4.75C4.05964 5.5 3.5 6.05964 3.5 6.75V17.25C3.5 17.9404 4.05964 18.5 4.75 18.5H7.25C7.66421 18.5 8 18.8358 8 19.25C8 19.6642 7.66421 20 7.25 20H4.75C3.23122 20 2 18.7688 2 17.25V6.75C2 5.23122 3.23122 4 4.75 4H7.25Z" fill="currentColor"/>
      <path d="M19.25 4C20.7688 4 22 5.23122 22 6.75V17.25C22 18.7688 20.7688 20 19.25 20H16.75C16.3358 20 16 19.6642 16 19.25C16 18.8358 16.3358 18.5 16.75 18.5H19.25C19.9404 18.5 20.5 17.9404 20.5 17.25V6.75C20.5 6.05964 19.9404 5.5 19.25 5.5H16.75C16.3358 5.5 16 5.16421 16 4.75C16 4.33579 16.3358 4 16.75 4H19.25Z" fill="currentColor"/>
      <path d="M12 3C12.4142 3 12.75 3.33579 12.75 3.75V8.43945L13.9697 7.21973C14.2626 6.92686 14.7374 6.92684 15.0303 7.21973C15.3231 7.51261 15.3231 7.98739 15.0303 8.28027L12.5303 10.7803C12.2374 11.0732 11.7626 11.0731 11.4697 10.7803L8.96973 8.28027C8.67683 7.98738 8.67683 7.51262 8.96973 7.21973C9.26262 6.92686 9.73739 6.92684 10.0303 7.21973L11.25 8.43945V3.75C11.25 3.33579 11.5858 3 12 3Z" fill="currentColor"/>
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 13.9999C12.4142 13.9999 12.7499 14.3357 12.75 14.7499V19.4393L13.9697 18.2196C14.2626 17.9268 14.7374 17.9268 15.0303 18.2196C15.3231 18.5125 15.3231 18.9873 15.0303 19.2802L12.5303 21.7802C12.2374 22.0731 11.7626 22.0731 11.4697 21.7802L8.96973 19.2802C8.67686 18.9873 8.67684 18.5125 8.96973 18.2196C9.26262 17.9268 9.73741 17.9268 10.0303 18.2196L11.25 19.4393V14.7499C11.2501 14.3357 11.5858 13.9999 12 13.9999Z" fill="currentColor"/>
      <path d="M7.25 7.99989C7.66418 7.99989 7.99994 8.33572 8 8.74989C8 9.1641 7.66421 9.49989 7.25 9.49989H4.75C4.05968 9.49989 3.50006 10.0596 3.5 10.7499V13.2499C3.5 13.9403 4.05964 14.4999 4.75 14.4999H7.25C7.66418 14.4999 7.99994 14.8357 8 15.2499C8 15.6641 7.66421 15.9999 7.25 15.9999H4.75C3.23122 15.9999 2 14.7687 2 13.2499V10.7499C2.00006 9.23115 3.23125 7.99989 4.75 7.99989H7.25Z" fill="currentColor"/>
      <path d="M19.25 7.99989C20.7688 7.99989 21.9999 9.23116 22 10.7499V13.2499C22 14.7687 20.7688 15.9999 19.25 15.9999H16.75C16.3358 15.9999 16 15.6641 16 15.2499C16.0001 14.8357 16.3358 14.4999 16.75 14.4999H19.25C19.9404 14.4999 20.5 13.9403 20.5 13.2499V10.7499C20.4999 10.0596 19.9403 9.49989 19.25 9.49989H16.75C16.3358 9.49989 16 9.1641 16 8.74989C16.0001 8.33572 16.3358 7.99989 16.75 7.99989H19.25Z" fill="currentColor"/>
      <path d="M11.5264 2.16786C11.8209 1.92762 12.2557 1.94506 12.5303 2.21961L15.0303 4.71961C15.3231 5.01248 15.3231 5.48726 15.0303 5.78016C14.7374 6.07305 14.2626 6.07305 13.9697 5.78016L12.75 4.56043V9.24989C12.75 9.6641 12.4142 9.99989 12 9.99989C11.5858 9.99989 11.25 9.6641 11.25 9.24989V4.56043L10.0303 5.78016C9.73738 6.07305 9.26262 6.07305 8.96973 5.78016C8.67685 5.48727 8.67684 5.0125 8.96973 4.71961L11.4697 2.21961L11.5264 2.16786Z" fill="currentColor"/>
    </svg>
  );
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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (layers.length === 0) setCollapsed(false);
  }, [layers.length]);

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
      {layers.length > 0 && (
        <div className="layers-header">
          <span className="layers-title">Layers</span>
          <button
            type="button"
            className="layers-collapse-btn"
            data-tooltip={collapsed ? 'Show layers' : 'Hide layers'}
            aria-label={collapsed ? 'Expand layers' : 'Collapse layers'}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <ExpandIcon /> : <CollapseIcon />}
          </button>
        </div>
      )}
      <div className={`layers-list-outer${collapsed ? ' layers-list-outer--collapsed' : ''}`}>
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
    </div>
  );
}
