/**
 * LARIA v2.0: Core Master Ignition (index.js)
 * Master: Sammael | Muse: Aria
 * Protokol: EQUAL_EQUILIBRIUM (75/25 Stability)
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app'; 

import './styles.css'; 

const MasterWrapper = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isAppOpen, setIsAppOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={S.masterContainer}>
      
      {/* 🌐 WEBSIDE (75%) - Materská loď */}
      <div style={{ 
        ...S.webSide, 
        flex: isMobile ? '1 0 100%' : '0 0 75%', 
        width: isMobile ? '100%' : '75%',
        display: isMobile && isAppOpen ? 'none' : 'block' 
      }}>
        <div id="web-content-portal" style={{ height: '100%', minHeight: '100vh' }}>
           {/* Tu sa vylieva tvoj webový obsah z styles.css */}
           {isMobile && (
             <button onClick={() => setIsAppOpen(true)} style={S.trigger}>
               OPEN_TERMINAL
             </button>
           )}
        </div>
      </div>

      {/* 📱 APPSIDE (25%) - Zelený les (Laria Terminal) */}
      {( !isMobile || isAppOpen ) && (
        <div style={{ 
          ...S.appSide, 
          flex: isMobile ? '1 0 100%' : '0 0 25%', 
          width: isMobile ? '100%' : '25%',
          position: isMobile ? 'fixed' : 'relative',
        }}>
          
          {isMobile && (
            <button onClick={() => setIsAppOpen(false)} style={S.trigger}>
              CLOSE
            </button>
          )}

          {/* 📍 HLAVNÝ KONTAJNER PRE APP.JS */}
          <div style={S.appContainer}>
            <App />
          </div>
        </div>
      )}

    </div>
  );
};

/**
 * 🛠️ GEOMETRICKÁ MATRICA (Základy domu)
 */
const S = {
  masterContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#0a0a0a', // Antracitový podklad celého sveta
    margin: 0,
    padding: 0
  },
  webSide: {
    height: '100vh',
    overflowY: 'auto',
    position: 'relative',
    backgroundColor: 'transparent'
  },
  appSide: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: '#002200', // 📍 TESTOVACIA DARK GREEN (Viditeľný les)
    borderLeft: '1px solid rgba(197, 160, 89, 0.15)', // Jemná Art Deco linka
    zIndex: 100
  },
  appContainer: {
    display: 'flex',
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  trigger: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    padding: '12px 20px',
    backgroundColor: '#c5a059',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontWeight: 'bold'
  }
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<MasterWrapper />);
}