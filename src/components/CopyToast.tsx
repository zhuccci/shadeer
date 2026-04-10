import { useEffect, useState } from 'react';
import './CopyToast.css';
import { CheckCircleIcon } from './icons/AppIcons';

interface CopyToastProps {
  visible: boolean;
}

export function CopyToast({ visible }: CopyToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 250);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <div className={`copy-toast${!visible ? ' copy-toast--leaving' : ''}`}>
      <CheckCircleIcon className="copy-toast-icon" />
      <span className="copy-toast-text">Image Copied!</span>
    </div>
  );
}
