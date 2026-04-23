import { useEffect, useRef, useState } from 'react';
import './ActionBar.css';
import { SaveIcon, UploadIcon } from './icons/AppIcons';

interface ActionBarProps {
  visible: boolean;
  onUpload: () => void;
  onSave: (videoFormat?: 'webm' | 'mp4') => void;
  isVideo?: boolean;
  savingProgress?: number | null;
  savingPhase?: 'recording' | 'converting' | null;
  exportError?: string | null;
}

export function ActionBar({ visible, onUpload, onSave, isVideo, savingProgress, savingPhase, exportError }: ActionBarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const isSaving = savingProgress != null;

  useEffect(() => {
    if (!showMenu) return;
    const close = (e: MouseEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return;
      setShowMenu(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showMenu]);

  const handleSaveClick = () => {
    if (isSaving) return;
    if (isVideo) { setShowMenu((v) => !v); return; }
    onSave();
  };

  const handleFormat = (format: 'webm' | 'mp4') => {
    setShowMenu(false);
    onSave(format);
  };

  const saveLabel = isSaving ? `${Math.round((savingProgress ?? 0) * 100)}%` : 'Save';

  return (
    <div className={`action-bar${visible ? ' visible' : ''}`}>
      {exportError && <span className="export-error">{exportError}</span>}
      <button className="btn btn-secondary" onClick={onUpload} disabled={isSaving}>
        <UploadIcon />
        Upload new
      </button>
      <div className="save-btn-wrap" ref={wrapRef}>
        {showMenu && (
          <div className="format-menu">
            <button onClick={() => handleFormat('webm')}>
              <span>WebM</span>
              <span className="format-hint">fast</span>
            </button>
            <button onClick={() => handleFormat('mp4')}>
              <span>MP4</span>
              <span className="format-hint">H.264</span>
            </button>
          </div>
        )}
        <button className={`btn btn-primary${isSaving ? ' btn-saving' : ''}`} onClick={handleSaveClick} disabled={isSaving}>
          <SaveIcon />
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
