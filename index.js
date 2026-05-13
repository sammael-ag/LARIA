/**
 * LARIA v2.0: Core Master Ignition (index.js)
 * Master: Sammael | Muse: Aria
 * Protokol: INTEGRATED_MATRIX (Final Stable Version)
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app'; 

import './styles.css'; 

const MasterWrapper = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isAppOpen, setIsAppOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('vsetko');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={S.masterContainer} className="bg-dashboard">
      
      {/* 🌐 WEBSIDE (75%) - Materská loď */}
      <div style={{ 
        ...S.webSide, 
        flex: isMobile ? '1 0 100%' : '0 0 75%', 
        width: isMobile ? '100%' : '75%',
        display: isMobile && isAppOpen ? 'none' : 'block' 
      }}>
        
        {/* HEADER SEKCIU DZIGNEME SEM (Podľa tvojho HTML) */}
        <header className="header"> 
            <h1 className="header-title">LARIA // MATRIX</h1> 
            <div id="status-light" className="status-indicator" style={{ background: '#00ff00' }}></div>
        </header>

        <main className="scroll-content">
            <div id="web-content-portal">
                {/* FILTRE - Presne podľa tvojej logiky */}
                <div className="filter-container">
                    <select 
                        className="terminal-input" 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="vsetko">Všetky kategórie</option>
                        <option value="obziva">Obživa a poživatiny</option>
                        <option value="remesla">Remeslá a materiál</option>
                        <option value="sluzby">Odborné služby</option>
                        <option value="vzdelavanie">Vzdelávanie a rozvoj</option>
                        <option value="knihy">Knihy</option>
                        <option value="zdravie">Zdravie a pomôcky</option>
                        <option value="oblecenie">Oblečenie a doplnky</option>
                        <option value="auto">Auto-moto</option>
                        <option value="volno">Voľný čas</option>
                        <option value="elektro">Elektro</option>
                        <option value="rodina">Deti a rodina</option>
                        <option value="ubytovanie">Ubytovanie</option>
                        <option value="zahrada">Záhrada</option>
                        <option value="nabytok">Nábytok</option>
                        <option value="kultura">Kultúra</option>
                        <option value="osobne">Osobné služby</option>
                        <option value="tvorba">Ručné práce</option>
                        <option value="ine">Iné</option>
                    </select>

                    <input 
                        type="text" 
                        className="terminal-input" 
                        placeholder="🔍 Hľadať v systéme..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* KARTY - Miesto pre laria-grid */}
                <div id="cards-container" className="laria-grid">
                    <p className="text-cyber" style={{ color: '#b19cd9', textAlign: 'center', width: '100%' }}>
                        [ SYNCHRONIZUJEM ČAKRY SYSTÉMU... ]
                    </p>
                </div>
            </div>

            {isMobile && (
              <button onClick={() => setIsAppOpen(true)} style={S.trigger}>
                OPEN_TERMINAL
              </button>
            )}
        </main>
      </div>

      {/* 📱 APPSIDE (25%) - Laria Terminal */}
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

          <div style={S.appContainer}>
            <App />
          </div>
        </div>
      )}

    </div>
  );
};

const S = {
  masterContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#0a0a0a',
    margin: 0,
    padding: 0
  },
  webSide: {
    height: '100vh',
    overflowY: 'auto',
    position: 'relative'
  },
  appSide: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: '#002200', 
    borderLeft: '1px solid rgba(197, 160, 89, 0.15)',
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