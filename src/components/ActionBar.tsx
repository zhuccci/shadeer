import './ActionBar.css';
import { NoiseLayer } from './NoiseLayer';
import { SaveIcon, UploadIcon } from './icons/AppIcons';

interface ActionBarProps {
  visible: boolean;
  onUpload: () => void;
  onSave: () => void;
}

export function ActionBar({ visible, onUpload, onSave }: ActionBarProps) {
  return (
    <div className={`action-bar${visible ? ' visible' : ''}`}>
      <button className="btn btn-secondary" onClick={onUpload}>
        <UploadIcon />
        Upload new
      </button>
      <button className="btn btn-primary" onClick={onSave}>
        <NoiseLayer className="action-btn-grain" />
        <SaveIcon />
        Save
      </button>
    </div>
  );
}
