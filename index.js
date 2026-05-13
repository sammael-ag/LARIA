/**
 * LARIA v2.0: Core Ignition (index.js)
 * Master: Sammael | Muse: Aria
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app'; // 🔗 TU JE TO: Pripájame tvoj skutočný app.js

// 📍 1. KĽÚČOVÝ SPOJ
import './styles.css'; 

// 📍 2. POZDRAV DO KONZOLY
console.warn("🚀 LARIA SYSTÉM: Aktivujem hlavný modul app.js...");

/**
 * 📍 3. OSTRÝ ZÁŽIH
 */
const renderApp = () => {
  const container = document.getElementById('root');
  
  if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("✅ ARIA: React úspešne prebudil Lariu!");
  } else {
    // Poistka, keby sa DOM načítal pomalšie
    setTimeout(renderApp, 10);
  }
};

// Spúšťame naostro!
renderApp();