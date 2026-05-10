import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PageTransition.css';

interface TransitionContextValue {
  navigateTo: (path: string) => void;
}

const TransitionContext = createContext<TransitionContextValue>({ navigateTo: () => {} });

export function usePageTransition() {
  return useContext(TransitionContext);
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const navigate = useNavigate();

  const navigateTo = (path: string) => {
    setActive(true);
    setTimeout(() => {
      navigate(path);
      setTimeout(() => setActive(false), 100);
    }, 350);
  };

  return (
    <TransitionContext.Provider value={{ navigateTo }}>
      {children}
      <div className={`page-transition-overlay${active ? ' active' : ''}`} />
    </TransitionContext.Provider>
  );
}
