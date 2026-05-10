import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function HamburgerIcon() {
  return (
    <svg width="19" height="13" viewBox="0 0 19 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="19" height="1.5" rx="0.75" fill="currentColor" />
      <rect y="5.75" width="19" height="1.5" rx="0.75" fill="currentColor" />
      <rect y="11.5" width="19" height="1.5" rx="0.75" fill="currentColor" />
    </svg>
  );
}

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-logo">
          <img src="/logo.png" alt="Shadeer" />
        </div>
        <button className="landing-menu-btn" disabled aria-label="Menu">
          <HamburgerIcon />
        </button>
      </header>

      <main className="landing-hero">
        <div className="landing-deer-wrap">
          <video
            className="landing-deer-video"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/deer_main.webm" type="video/webm" />
          </video>
        </div>

        <div className="landing-bottom">
          <div className="landing-title-row">
            <span className="landing-title">_SHADEER</span>
            <p className="landing-tagline">
              Realtime image effects.<br />
              Right in your browser.
            </p>
          </div>
          <button
            className="landing-cta-btn"
            onClick={() => navigate('/create')}
          >
            START EDITING
          </button>
        </div>
      </main>
    </div>
  );
}
