import React from 'react';
import ReactDOM from 'react-dom/client';
import posthog from 'posthog-js';
import App from './App';
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
    <App />
  </React.StrictMode>,
);
