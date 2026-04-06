import './FilterStrip.css';
import { NoiseLayer } from './NoiseLayer';
import { filterOptions, isActiveFilter } from './filterOptions';
import { FilterIcon } from './icons/AppIcons';
import type { ActiveFilter } from '../types/editor';

interface FilterStripProps {
  activeFilter: ActiveFilter;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (filter: ActiveFilter) => void;
}

export function FilterStrip({ activeFilter, scrollRef, onSelect }: FilterStripProps) {
  return (
    <div className="filter-buttons-wrap">
      <div ref={scrollRef} className="filter-buttons-scroll">
        <div className="filter-buttons">
          {filterOptions.map((filter) => {
            const selected = activeFilter === filter.id;
            const enabled = isActiveFilter(filter.id);

            return (
              <button
                key={filter.id}
                type="button"
                className={`filter-btn${selected ? ' selected' : ''}${!filter.implemented ? ' is-disabled' : ''}`}
                data-filter={filter.id}
                aria-pressed={selected}
                disabled={!enabled}
                onClick={() => {
                  if (isActiveFilter(filter.id)) onSelect(filter.id);
                }}
              >
                <NoiseLayer className="btn-grain" />
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
            );
          })}
          <div className="filter-strip-end" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
