import { SiteHeader } from '../components/SiteHeader';
import './AboutPage.css';

const baseUrl = import.meta.env.BASE_URL;

function ShadeerIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M29.8541 23.9987C25.4366 31.6501 15.6527 34.2716 8.00134 29.8541C0.349931 25.4366 -2.27163 15.6527 2.14591 8.00134C6.56345 0.349931 16.3473 -2.27163 23.9987 2.14591C31.6501 6.56345 34.2716 16.3473 29.8541 23.9987ZM2.19257 14.522C1.65106 19.5736 3.92286 24.702 8.39589 27.623C8.52708 27.7087 8.70309 27.6601 8.77435 27.5206L16.4917 12.4076C16.5915 12.2123 16.4266 11.9866 16.2102 12.0222L2.4132 14.2902C2.29598 14.3095 2.20523 14.4039 2.19257 14.522ZM12.3898 2.60705C12.5022 2.57682 12.6206 2.62468 12.6822 2.72345L16.5445 8.92058C16.6386 9.07154 16.5618 9.27058 16.3907 9.31921L2.79963 13.1823C2.60734 13.2369 2.42586 13.0691 2.47107 12.8743C2.77376 11.5707 3.27164 10.2891 3.97553 9.06994C5.88935 5.7551 8.96415 3.52844 12.3898 2.60705ZM9.66257 28.3593C9.52374 28.288 9.47851 28.112 9.5634 27.981L18.7952 13.7375C18.9145 13.5535 19.1924 13.5834 19.2698 13.7886L24.2317 26.9423C24.2738 27.0538 24.237 27.18 24.1404 27.2499C20.0193 30.2328 14.4282 30.8076 9.66257 28.3593ZM25.4226 26.1988C25.2763 26.3342 25.0412 26.2607 24.9925 26.0674L21.5204 12.2809C21.477 12.1084 21.6109 11.9423 21.7887 11.9483L29.1464 12.1967C29.2624 12.2006 29.3629 12.2789 29.3932 12.391C30.3215 15.8287 29.9348 19.621 28.0138 22.9484C27.2982 24.1878 26.4204 25.275 25.4226 26.1988ZM28.3732 9.73008C28.4684 9.91815 28.3122 10.1315 28.1032 10.1038L21.8087 9.27167C21.6257 9.24748 21.5217 9.04949 21.6056 8.88506L23.6818 4.81653C23.755 4.67311 23.9376 4.62632 24.0687 4.71983C25.9374 6.05298 27.3888 7.78498 28.3732 9.73008ZM21.6588 3.33795C21.8063 3.4041 21.8578 3.58636 21.7699 3.72198L19.2889 7.54749C19.1884 7.70238 18.965 7.71129 18.8525 7.56488L15.0173 2.57232C14.8891 2.40541 14.9952 2.16376 15.2053 2.1516C17.3678 2.0264 19.5797 2.40558 21.6588 3.33795Z" fill="white"/>
    </svg>
  );
}

export function AboutPage() {
  return (
    <div className="about-page">
      <SiteHeader activePage="about" />

      <main className="about-main">
        <div className="about-hero">
          <div className="about-deer-wrap">
            <video
              className="about-deer-video"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src={`${baseUrl}deer_about.webm`} type="video/webm" />
            </video>
          </div>
          <h1 className="about-title">ABOUT</h1>
        </div>

        <div className="about-sections">
          <div className="about-gradient-top" />

          <div className="about-section">
            <p className="about-section-label">ABOUT</p>
            <p className="about-section-text">
              Shadeer is a free browser-based tool for applying real-time shader effects to images and video.
              Everything runs on your device. Built by{' '}
              <a href="https://www.instagram.com/zhucccci" target="_blank" rel="noopener noreferrer" className="about-link">
                Denys Zhuk
              </a>
              {' '}experimenting with AI, for creators and designers who want their visuals to feel a little more like themselves.
            </p>
          </div>

          <div className="about-section">
            <p className="about-section-label">CONTACT</p>
            <p className="about-section-text">
              If you create something fun, weird, or beautiful, please{' '}
              <a href="https://www.instagram.com/zhucccci" target="_blank" rel="noopener noreferrer" className="about-link">
                share it with me
              </a>
              {' '}or tag me — I'd be so glad to see it!
            </p>
          </div>
        </div>

        <div className="about-footer">
          <ShadeerIcon />
        </div>
      </main>
    </div>
  );
}
