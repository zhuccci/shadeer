import '../components/Button.css';
import './LandingPage.css';
import { SiteHeader } from '../components/SiteHeader';
import { usePageTransition } from '../components/PageTransition';

const deerVideos = ['/deer_main.webm', '/deer2.webm', '/deer3.webm'];
const deerVideo = deerVideos[Math.floor(Math.random() * deerVideos.length)];

export function LandingPage() {
  const { navigateTo } = usePageTransition();

  return (
    <div className="landing-page">
      <SiteHeader />

      <main className="landing-hero">
        <div className="landing-deer-wrap">
          <video
            className="landing-deer-video"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={deerVideo} type="video/webm" />
          </video>
        </div>

        <div className="landing-bottom">
          <div className="landing-title-row">
            <span className="landing-title">Made to be noticed</span>
            <p className="landing-tagline">
              Make your images and videos look like nothing else in the feed. For designers, artists, and creators, right in your browser, no installs, no friction.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigateTo('/create')}
          >
            START EDITING
          </button>
        </div>
      </main>
    </div>
  );
}
