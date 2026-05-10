import '../components/Button.css';
import './LandingPage.css';
import { usePageTransition } from '../components/PageTransition';

function HamburgerIcon() {
  return (
    <svg width="19" height="13" viewBox="0 0 19 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="19" height="1.5" rx="0.75" fill="currentColor" />
      <rect y="5.75" width="19" height="1.5" rx="0.75" fill="currentColor" />
      <rect y="11.5" width="19" height="1.5" rx="0.75" fill="currentColor" />
    </svg>
  );
}

const deerVideo = Math.random() < 0.5 ? '/deer_main.webm' : '/deer2.webm';

export function LandingPage() {
  const { navigateTo } = usePageTransition();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-logo">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32.6475 9.00959C32.6475 8.35668 33.4194 8.04303 33.8379 8.54416C36.4362 11.6554 38 15.6574 38 20.0235C37.9999 29.6561 30.3899 37.5157 20.8379 37.9522C20.5533 37.9816 20.2653 38.0001 19.9746 38.0001C19.6705 38.0001 19.3697 37.9805 19.0723 37.9483C9.5624 37.4668 2.0001 29.6259 2 20.0235C2.00002 15.6574 3.56374 11.6553 6.1621 8.54416C6.58063 8.04303 7.35254 8.35668 7.35254 9.00959C7.35254 9.18496 7.28941 9.35416 7.17763 9.48929C5.98285 10.9336 5.02889 12.583 4.37679 14.3767C4.05352 15.2658 5.12808 15.8896 5.8847 15.3216C6.01669 15.2225 6.14975 15.1248 6.28387 15.0284C6.73814 14.7021 7.35352 15.0366 7.35352 15.5959C7.35352 15.8277 7.23966 16.0442 7.05169 16.1798C5.85814 17.0409 4.75375 18.0186 3.75377 19.0953C3.51924 19.3478 3.38672 19.6789 3.38672 20.0235C3.38677 24.1137 4.87356 27.8574 7.33752 30.747C8.41135 32.0063 10.3289 30.0986 9.96579 28.4839C9.90042 28.1932 9.84284 27.8984 9.79337 27.5999C9.72546 27.19 10.0492 26.8272 10.4647 26.8272C10.8151 26.8272 11.1089 27.0891 11.1668 27.4348C12.0184 32.5246 15.3988 36.1212 19.1777 36.5694C19.4502 36.5827 19.7243 36.5899 20 36.5899C20.2481 36.5899 20.4948 36.5831 20.7402 36.5723C24.5321 36.1408 27.9294 32.539 28.7834 27.4348C28.8413 27.0891 29.1351 26.8272 29.4855 26.8272C29.901 26.8272 30.2247 27.19 30.1568 27.5999C30.1066 27.9028 30.0481 28.2018 29.9816 28.4966C29.6145 30.1225 31.5406 32.054 32.6263 30.7892C35.1119 27.8939 36.6132 24.1336 36.6133 20.0235C36.6133 19.677 36.4791 19.3441 36.2432 19.0903C35.2443 18.0155 34.1411 17.0395 32.9493 16.1798C32.7613 16.0442 32.6475 15.8277 32.6475 15.5959C32.6475 15.0366 33.2628 14.7021 33.717 15.0285C33.8509 15.1247 33.9838 15.2223 34.1155 15.3213C34.8717 15.8892 35.9457 15.2658 35.6227 14.377C34.9708 12.5832 34.0172 10.9337 32.8224 9.48928C32.7106 9.35416 32.6475 9.18496 32.6475 9.00959Z" fill="#FFF679"/>
          </svg>
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
            <source src={deerVideo} type="video/webm" />
          </video>
        </div>

        <div className="landing-bottom">
          <div className="landing-title-row">
            <span className="landing-title">SHADEER</span>
            <p className="landing-tagline">
              Realtime image effects.<br />
              Right in your browser.
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
