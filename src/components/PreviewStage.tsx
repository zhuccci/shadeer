import './PreviewStage.css';
import { UploadIcon } from './icons/AppIcons';
import type { EditorState } from '../types/editor';

interface PreviewStageProps {
  state: EditorState;
  previewRef: React.RefObject<HTMLDivElement | null>;
  onUpload: () => void;
  onDropFile: (file: File) => void;
  onFitModeChange: (mode: EditorState['fitMode']) => void;
}

export function PreviewStage({ state, previewRef, onUpload, onDropFile, onFitModeChange }: PreviewStageProps) {
  return (
    <div className="preview-panel">
      <div
        ref={previewRef}
        className={`image-area${state.image.isReady ? ' has-image' : ''}${state.fitMode === 'fill' ? ' fill-mode' : ''}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file) onDropFile(file);
        }}
      >
        {!state.image.hasUserImage ? (
          <button className="btn btn-primary upload-btn" onClick={onUpload}>
            <UploadIcon />
            Upload image
          </button>
        ) : null}

        <div className="fit-control" id="fitControl">
          <button
            type="button"
            className={`fit-btn${state.fitMode === 'fill' ? ' selected' : ''}`}
            onClick={() => onFitModeChange('fill')}
          >
            Fill
          </button>
          <button
            type="button"
            className={`fit-btn${state.fitMode === 'fit' ? ' selected' : ''}`}
            onClick={() => onFitModeChange('fit')}
          >
            Fit
          </button>
        </div>
      </div>
    </div>
  );
}
