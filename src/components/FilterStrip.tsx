import './FilterStrip.css';
import { useEffect, useRef } from 'react';
import { filterOptions, isActiveFilter } from './filterOptions';
import { useHorizontalWheelScroll } from '../hooks/useHorizontalWheelScroll';
import { FilterIcon } from './icons/AppIcons';
import type { ActiveFilter } from '../types/editor';

interface FilterStripProps {
  activeFilter: ActiveFilter;
  layers: ActiveFilter[];
  onSelect: (filter: ActiveFilter) => void;
  onAddLayer: (filter: ActiveFilter) => void;
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 1.5V10.5M1.5 6H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function FilterStrip({ activeFilter, layers, onSelect, onAddLayer }: FilterStripProps) {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const { scrollRef, onWheel, scrollItemIntoView } = useHorizontalWheelScroll();

  useEffect(() => {
    const activeButton = buttonRefs.current[activeFilter];
    if (activeButton) {
      scrollItemIntoView(activeButton);
    }
  }, [activeFilter, scrollItemIntoView]);

  return (
    <div className="filter-buttons-wrap">
      <div ref={scrollRef} className="filter-buttons-scroll" onWheel={onWheel}>
        <div className="filter-buttons">
          {filterOptions.map((filter) => {
            const selected = activeFilter === filter.id;
            const enabled = isActiveFilter(filter.id);
            const alreadyLayer = layers.includes(filter.id);

            return (
              <div key={filter.id} className="filter-btn-wrap">
                <button
                  ref={(node) => {
                    if (enabled) buttonRefs.current[filter.id] = node;
                  }}
                  type="button"
                  className={`filter-btn${selected ? ' selected' : ''}${!filter.implemented ? ' is-disabled' : ''}`}
                  data-filter={filter.id}
                  aria-pressed={selected}
                  disabled={!enabled}
                  onClick={(event) => {
                    if (isActiveFilter(filter.id)) {
                      scrollItemIntoView(event.currentTarget);
                      onSelect(filter.id);
                    }
                  }}
                >
                  <div className="btn-thumbnail">
                    <img src={filter.thumbnail} className="thumb-default" alt="" />
                    {filter.hoverThumbnail ? <img src={filter.hoverThumbnail} className="thumb-hover" alt="" /> : null}
                  </div>
                  <div className="btn-bottom">
                    <div className="filter-icon">
                      <FilterIcon id={filter.id} />
                    </div>
                    <span className="filter-label">{filter.label}</span>
                  </div>
                </button>
                {selected && enabled && (
                  <button
                    type="button"
                    className={`filter-add-btn${alreadyLayer ? ' filter-add-btn--added' : ''}`}
                    data-tooltip={alreadyLayer ? 'Already a layer' : 'Add as layer'}
                    aria-label={alreadyLayer ? 'Already added as layer' : 'Add as layer'}
                    disabled={alreadyLayer}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!alreadyLayer) onAddLayer(filter.id);
                    }}
                  >
                    <PlusIcon />
                  </button>
                )}
              </div>
            );
          })}
          <div className="filter-strip-end" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
