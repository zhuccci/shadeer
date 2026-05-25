import { memo } from 'react';
import './CheckboxControl.css';

interface CheckboxControlProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const CheckboxControl = memo(function CheckboxControl({ label, checked, onChange }: CheckboxControlProps) {
  return (
    <button
      type="button"
      className="checkbox-row"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <div className={`checkbox${checked ? ' checked' : ''}`} />
      <span className="checkbox-label">{label}</span>
    </button>
  );
});
