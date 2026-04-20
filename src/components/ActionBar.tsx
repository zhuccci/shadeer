import './ActionBar.css';
import { SaveIcon, UploadIcon } from './icons/AppIcons';

interface ActionBarProps {
  visible: boolean;
  onUpload: () => void;
  onSave: () => void;
  savingProgress?: number | null;
}

export function ActionBar({ visible, onUpload, onSave, savingProgress }: ActionBarProps) {
  const isSaving = savingProgress != null;
  return (
    <div className={`action-bar${visible ? ' visible' : ''}`}>
      <button className="btn btn-secondary" onClick={onUpload} disabled={isSaving}>
        <UploadIcon />
        Upload new
      </button>
      <button className="btn btn-primary" onClick={onSave} disabled={isSaving}>
        <SaveIcon />
        {isSaving ? `${Math.round(savingProgress * 100)}%` : 'Save'}
      </button>
    </div>
  );
}
