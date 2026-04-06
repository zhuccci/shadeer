import type { DitherType } from '../types/editor';

const baseUrl = import.meta.env.BASE_URL;
const ditherTypes: DitherType[] = ['2x2', '4x4', '8x8'];

interface DitherTypeSelectorProps {
  value: DitherType;
  onChange: (value: DitherType) => void;
}

export function DitherTypeSelector({ value, onChange }: DitherTypeSelectorProps) {
  return (
    <div className="dither-type-section">
      <span className="widget-label type-label">Type</span>
      <div className="dither-type-row">
        {ditherTypes.map((type) => (
          <div key={type} className="dither-type-item">
            <button
              type="button"
              className={`dither-type-btn${value === type ? ' selected' : ''}`}
              onClick={() => onChange(type)}
            >
              <img src={`${baseUrl}icons/dither-${type}.svg`} alt="" />
            </button>
            <span className={`dither-type-label${value === type ? ' selected' : ''}`}>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
