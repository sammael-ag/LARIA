/**
 * LARIA v2.0: Core Master Ignition (index.js)
 * Master: Sammael | Muse: Aria
 * Protokol: CRYSTAL_CORE_IGNITION (Kompletne prepojené na styles.css)
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import './styles.css';

const READ_URL = "https://script.google.com/macros/s/AKfycbzZVeNuvqSdNU0RwD-rRlvcRaOjEHrcQI5TY7fm7eJYVo5_Dl-zISKP089bH6gR50SX/exec";

const MasterWrapper = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isAppOpen, setIsAppOpen] = useState(false);
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('vsetko');
  const [loading, setLoading] = useState(true);

  // --- 1. DETEKCIA DISPLEJA ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 2. NAČÍTANIE DÁT Z MATRIXU ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(READ_URL);
        const rawData = await response.json();
        const cleanedData = rawData.reduce((acc, item) => {
          if (!item.poznamka || item.poznamka.trim() === "") return acc;
          acc.push({
            sha: item.sha,
            meno: item.meno || "Pútnik",
            kat: item.kat || "Majster",
            lok: item.lok || "V sieti",
            popis: item.popis || "",
            gal: item.gal || "",
            irc: item.irc || "",
            fing: item.poznamka.trim(),
            krypt: item.krypt || ""
          });
          return acc;
        }, []);

        setAllData(cleanedData);
        const urlParams = new URLSearchParams(window.location.search);
        const targetId = urlParams.get('id');
        
        if (targetId) {
          const soloItem = cleanedData.find(i => i.fing === targetId || i.krypt === targetId);
          if (soloItem) {
            setFilteredData([soloItem]);
            if (!window.ReactNativeWebView) {
              setTimeout(() => smartAdd(soloItem), 3000);
            }
          }
        } else {
          setFilteredData(cleanedData);
        }
        setLoading(false);
      } catch (e) {
        console.error("Chyba synchronizácie:", e);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 3. FILTROVANIE ---
  useEffect(() => {
    const term = searchQuery.toLowerCase();
    const result = allData.filter(item => {
      const matchCat = (category === 'vsetko' || item.kat.toLowerCase() === category.toLowerCase());
      const searchContent = `${item.meno} ${item.lok} ${item.popis} ${item.fing}`.toLowerCase();
      return matchCat && searchContent.includes(term);
    });
    setFilteredData(result);
  }, [searchQuery, category, allData]);

  // --- 4. FUNKCIE MOSTU (Bridge) ---
  const smartAdd = (item) => {
    if (!item) return;
    const payload = {
      fing: item.fing,
      meno: item.meno,
      krypt: item.krypt,
      kat: item.kat,
      sha: item.sha,
      lok: item.lok,
      popis: item.popis,
      gal: item.gal,
      v: "2.0.0"
    };

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ADD_CONTACT', payload }));
    } else {
      const modal = document.getElementById('lariaBridge');
      if (modal) {
        if (modal.style.display === 'flex') return;

        const fingerprintLabel = document.getElementById('modal-fingerprint');
        const openAppBtn = document.getElementById('btn-open-app');

        if (fingerprintLabel) fingerprintLabel.innerText = item.fing;
        if (openAppBtn) {
          openAppBtn.onclick = () => {
            window.location.href = `laria://id/${item.fing}`;
            modal.style.display = 'none';
          };
        }
        modal.style.display = 'flex';
      }
    }
  };

  const copyShareLink = (id) => {
    const url = `${window.location.origin}${window.location.pathname}?id=${id}`;
    navigator.clipboard.writeText(url).then(() => alert("[ LINK ULOŽENÝ ]"));
  };

  const aktivujOdkazy = (text) => {
    if (!text) return "Bez popisu.";
    const urlPattern = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.split(urlPattern).map((part, i) =>
      urlPattern.test(part) ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{color: '#c5a059'}}>{part}</a> : part
    );
  };

  return (
    <div className="master-container bg-dashboard">
      {/* ĽAVÉ MENU (20% neviditeľná zóna na desktope) */}
      {!isMobile && <div className="left-side" style={{ flex: '0 0 20%', width: '20%' }}></div>}

      {/* WEB (Stredový stĺpec - 55% šírky alebo 100% na mobile) */}
      <div 
        className="web-side" 
        style={{
          flex: isMobile ? '1 0 100%' : '0 0 55%',
          width: isMobile ? '100%' : '55%',
          display: isMobile && isAppOpen ? 'none' : 'block'
        }}
      >
        <header className="header">
          <h1 className="header-title">LARIA</h1>
          <div id="status-light" className="status-indicator" style={{ background: loading ? '#333' : '#00ff00' }}></div>
        </header>

        <main className="scroll-content">
          {filteredData.length === 1 && allData.length > 1 && (
            <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto 25px auto' }}>
              <button
                onClick={() => window.location.href = window.location.pathname}
                className="btn-share"
                style={{ width: '100%', borderColor: '#c5a059', color: '#c5a059', background: 'transparent', cursor: 'pointer', padding: '10px' }}
              >
                SPÄŤ DO SIETE
              </button>
            </div>
          )}

          <div className="filter-container">
            <select className="terminal-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="vsetko">Všetky kategórie</option>
              <option value="obziva">Obživa a poživatiny</option>
              <option value="remesla">Remeslá a materiál</option>
              <option value="sluzby">Odborné služby</option>
              <option value="vzdelavanie">Vzdelávanie</option>
              <option value="knihy">Knihy</option>
              <option value="zdravie">Zdravie</option>
              <option value="oblecenie">Oblečenie</option>
              <option value="auto">Auto-moto</option>
              <option value="volno">Voľný čas</option>
              <option value="elektro">Elektro</option>
              <option value="rodina">Deti a rodina</option>
              <option value="ubytovanie">Ubytovanie</option>
              <option value="zahrada">Záhrada</option>
              <option value="nabytok">Nábytok</option>
              <option value="kultura">Kultúra</option>
              <option value="osobne">Osobné služby</option>
              <option value="tvorba">Tvorba</option>
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

          <div id="cards-container" className="laria-grid">
            {loading ? (
              <p className="text-cyber" style={{ color: '#b19cd9', textAlign: 'center', width: '100%' }}>[ SYNCHRONIZUJEM MATRIX... ]</p>
            ) : filteredData.length > 0 ? (
              filteredData.map(item => (
                <div 
                  key={item.fing} 
                  className="card symmetric-card" 
                  onClick={(e) => {
                    if (filteredData.length > 1 && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
                      window.location.href = `?id=${item.fing}`;
                    }
                  }} 
                  style={{ cursor: filteredData.length > 1 ? 'pointer' : 'default' }}
                >
                  
                  <div className="card-main-layout">
                    {/* ĽAVÁ STRANA: Kategória a Meno */}
                    <div className="card-left-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span className="tag">{item.kat}</span>
                        <h2 className="card-title" style={{ margin: 0, fontSize: '1.4em' }}>{item.meno}</h2>
                      </div>
                      <p className="card-loc" style={{ marginTop: '8px', marginBottom: 0 }}>📍 {item.lok}</p>
                    </div>

                    {/* PRAVÁ STRANA: Stĺpec pre tlačidlá */}
                    <div className="card-right-actions">
                      <button onClick={(e) => { e.stopPropagation(); smartAdd(item); }} className="btn-core-app">
                        DO APPKY
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); copyShareLink(item.fing); }} className="btn-core-share">
                        LINK
                      </button>
                      {item.gal && (
                        <button onClick={(e) => { e.stopPropagation(); window.open(item.gal, '_blank', 'noopener,noreferrer'); }} className="btn-core-gallery">
                          GALÉRIA
                        </button>
                      )}
                    </div>
                  </div>

                  {/* POPIS POD TLAČIDLAMI */}
                  <div className="card-description-block">
                    <p className="card-desc" style={{ margin: 0 }}>{aktivujOdkazy(item.popis)}</p>
                  </div>

                </div>
              ))
            ) : (
              <p style={{ color: '#666', textAlign: 'center', width: '100%' }}>Nenašli sa žiadni majstri.</p>
            )}
          </div>

          {isMobile && <button onClick={() => setIsAppOpen(true)} className="trigger">TERMINAL</button>}
        </main>
      </div>

      {/* APPKY (Pravá zóna - 25% šírky) */}
      {(!isMobile || isAppOpen) && (
        <div 
          className="app-side"
          style={{
            flex: isMobile ? '1 0 100%' : '0 0 25%',
            width: isMobile ? '100%' : '25%',
            position: isMobile ? 'fixed' : 'relative',
          }}
        >
          {isMobile && <button onClick={() => setIsAppOpen(false)} className="trigger">WEB</button>}
          <div className="app-container">
            <App />
          </div>
        </div>
      )}
    </div>
  );
};

const container = document.getElementById('root');
if (container) createRoot(container).render(<MasterWrapper />);