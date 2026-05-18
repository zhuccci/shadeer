import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import posthog from 'posthog-js';
import App from './App';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { PageTransitionProvider } from './components/PageTransition';
import './components/Button.css';
import './styles/app.css';

posthog.init('phc_q4JRmDtuCymoWJzWfsHDy4pPX9kdUJuNtPQfcaZVi5ym', {
  api_host: 'https://eu.i.posthog.com',
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: false,
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <PageTransitionProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/editor" element={<App />} />
        </Routes>
      </PageTransitionProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
