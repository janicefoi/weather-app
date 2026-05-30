import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { PreferencesProvider } from './PreferencesContext';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PreferencesProvider>
      <App />
    </PreferencesProvider>
  </React.StrictMode>
);

reportWebVitals();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceWorker.js');
}
