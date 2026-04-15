import { usePullToRefresh, PULL_THRESHOLD } from '../hooks/usePullToRefresh';
import './PullToRefresh.css';

export function PullToRefresh() {
  const { pullY, triggered } = usePullToRefresh();

  // Keep mounted while animating back (pullY transitions to 0)
  if (pullY === 0 && !triggered) return null;

  const ready = pullY >= PULL_THRESHOLD;
  // Hidden = -60px above viewport; slides in as pullY grows
  const translateY = triggered ? 16 : pullY - 60;

  return (
    <div
      className="ptr-indicator"
      style={{ transform: `translateX(-50%) translateY(${translateY}px)` }}
    >
      {triggered ? (
        <div className="ptr-spinner" />
      ) : (
        <svg
          className={`ptr-arrow${ready ? ' ptr-arrow-ready' : ''}`}
          width="18" height="18" viewBox="0 0 18 18" fill="none"
        >
          <path
            d="M9 2v11M9 13l-3.5-3.5M9 13l3.5-3.5"
            stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
