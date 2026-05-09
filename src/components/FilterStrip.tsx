import './FilterStrip.css';
import { useEffect, useRef } from 'react';
import { filterOptions, isActiveFilter } from './filterOptions';
import { useHorizontalWheelScroll } from '../hooks/useHorizontalWheelScroll';
import { FilterIcon } from './icons/AppIcons';
import type { ActiveFilter } from '../types/editor';

interface FilterStripProps {
  activeFilter: ActiveFilter;
  onSelect: (filter: ActiveFilter) => void;
}

export function FilterStrip({ activeFilter, onSelect }: FilterStripProps) {
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
              </div>
            );
          })}
          <div className="filter-strip-end" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
