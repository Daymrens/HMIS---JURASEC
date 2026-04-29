import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import './styles/uiux-enhancements.css';

// Apply saved theme on startup
const savedTheme = localStorage.getItem('theme_config');
if (savedTheme) {
  try {
    const theme = JSON.parse(savedTheme);
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-text', theme.text);
    document.body.style.backgroundColor = theme.background;
    document.body.style.color = theme.text;
  } catch (e) {
    console.error('Failed to apply saved theme:', e);
  }
}

// Apply touch mode if enabled
const touchMode = localStorage.getItem('touch_mode');
if (touchMode === 'true') {
  document.body.classList.add('touch-mode');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
