/**
 * LARIA v2.0: Core Master Ignition (index.js)
 * Master: Sammael | Muse: Aria
 * Protokol: CRYSTAL_CORE_MASTER_ULTIMATE
 * Rez: Nadpis LARIA vycentrovaný, zbytočný padding vyčistený.
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import './styles.css';

const READ_URL = "https://script.google.com/macros/s/AKfycbzZVeNuvqSdNU0RwD-rRlvcRaOjEHrcQI5TY7fm7eJYVo5_Dl-zISKP089bH6gR50SX/exec";

const MasterWrapper = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isAppOpen, setIsAppOpen] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('vsetko');
  const [loading, setLoading] = useState(true);

  const [webRefreshKey, setWebRefreshKey] = useState(0);
  const [soloActiveId, setSoloActiveId] = useState(null);

  // --- 1. DETEKCIA DISPLEJA ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 2. NAČÍTANIE DÁT Z MATRIXU ---
  const fetchData = async (targetId = null) => {
    setLoading(true);
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

      const currentId = targetId || new URLSearchParams(window.location.search).get('id');
      
      if (currentId) {
        const soloItem = cleanedData.find(i => i.fing === currentId || i.krypt === currentId);
        if (soloItem) {
          setFilteredData([soloItem]);
          setSoloActiveId(currentId);
        }
      } else {
        setFilteredData(cleanedData);
        setSoloActiveId(null);
      }
      setLoading(false);
    } catch (e) {
      console.error("Chyba synchronizácie:", e);
      setLoading(false);
    }
  };

  // 🔒 Spustí sa iba raz pri štarte
  useEffect(() => {
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
    if (!soloActiveId) {
      setFilteredData(result);
    }
  }, [searchQuery, category, allData, soloActiveId]);

  // --- 4. FUNKCIE MOSTU A IZOLOVANÉHO REFRESHU ---
  const triggerWebRefresh = (targetId = null) => {
    if (targetId === 'RESET') {
      window.history.pushState({}, '', window.location.pathname);
      setWebRefreshKey(prev => prev + 1);
      setSoloActiveId(null);
      fetchData('RESET');
      return;
    }
    if (targetId) {
      window.history.pushState({}, '', `?id=${targetId}`);
      setSoloActiveId(targetId);
      fetchData(targetId);
    } else {
      setWebRefreshKey(prev => prev + 1);
      fetchData(soloActiveId);
    }
  };

  const smartAdd = (item) => {
    if (!item) return;
    const payload = {
      fing: item.fing, meno: item.meno, krypt: item.krypt, kat: item.kat,
      sha: item.sha, lok: item.lok, popis: item.popis, gal: item.gal, v: "2.0.0"
    };
    window.postMessage(JSON.stringify({ type: 'ADD_CONTACT', payload }), "*");
  };

  const copyShareLink = (id) => {
    const url = `${window.location.origin}${window.location.pathname}?id=${id}`;
    navigator.clipboard.writeText(url).then(() => alert("LINK ULOŽENÝ"));
  };

  const aktivujOdkazy = (text) => {
    if (!text) return "Bez popisu.";
    const urlPattern = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.split(urlPattern).map((part, i) =>
      urlPattern.test(part) ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{color: '#c5a059'}}>{part}</a> : part
    );
  };

  return (
    <div className="master-container bg-dashboard" style={{ overflow: 'hidden' }}>
      
      {/* 📐 MAIN ARIA PANEL TOGGLE: Drží fixnú pozíciu v ľavom hornom rohu obrazovky */}
      {!isMobile && (
        <button 
          className="btn-panel-toggle" 
          onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
        >
          {isLeftPanelOpen ? '‹' : '›'}
        </button>
      )}

      {/* 1. ĽAVÉ MENU (20% šírky na desktope) */}
      {!isMobile && (
        <div 
          className={`left-side ${isLeftPanelOpen ? 'open' : 'closed'}`} 
          style={{ 
            flex: isLeftPanelOpen ? '0 0 20%' : '0 0 0%', 
            width: isLeftPanelOpen ? '20%' : '0%',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div className="left-menu-wrapper">
            <button className="btn-menu" onClick={() => console.log('donate')}>Domov</button>
            <button className="btn-menu" onClick={() => console.log('co-je-laria')}>ČO JE LARIA</button>
            <button className="btn-menu" onClick={() => console.log('fakturant')}>Fakturant</button>
            <button className="btn-menu" onClick={() => console.log('free-vs-full')}>FREE alebo FULL</button>
            <button className="btn-menu" onClick={() => console.log('donate')}>Dotovať</button>
          </div>
        </div>
      )}

      {/* 2. WEB (Stredový panel - 55% alebo 75% podľa panelu) */}
      <div 
        key={webRefreshKey}
        className="web-side" 
        style={{
          flex: isMobile ? '1 0 100%' : (isLeftPanelOpen ? '0 0 55%' : '0 0 75%'),
          width: isMobile ? '100%' : (isLeftPanelOpen ? '55%' : '75%'),
          display: isMobile && isAppOpen ? 'none' : 'block',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}
      >
        {/* 📐 ČISTÝ HEADER BEZ OTRAVNÉHO INLINE PADDINGU */}
        <header className="header"> 
          <h1 className="header-title">LARIA</h1>
          <div id="status-light" className="status-indicator" style={{ background: loading ? '#333' : '#00ff00' }}></div>
        </header>

        <main className="scroll-content">
          {/* KONTAJNER PRE FILTRE A OVÁDACIE PRVKY */}
          <div className="filter-container" style={{ padding: '0 15px', width: '100%', boxSizing: 'border-box' }}>
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

            {/* POD-VYHĽADÁVACIE MENU */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px', paddingLeft: '5px' }}>
              {soloActiveId ? (
                <button className="btn-panel-refresh" onClick={() => triggerWebRefresh('RESET')}>
                  ‹
                </button>
              ) : (
                <button className="btn-panel-refresh" onClick={() => triggerWebRefresh()}>
                  ↻
                </button>
              )}
            </div>
          </div>

          <div id="cards-container" className="laria-grid" style={{ marginTop: '15px' }}>
            {loading ? (
              <p className="text-cyber" style={{ color: '#b19cd9', textAlign: 'center', width: '100%' }}> SYNCHRONIZUJEM MATRIX... </p>
            ) : filteredData.length > 0 ? (
              filteredData.map(item => (
                <div 
                  key={item.fing} 
                  className="card symmetric-card" 
                  onClick={(e) => {
                    if (filteredData.length > 1 && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
                      triggerWebRefresh(item.fing);
                    }
                  }} 
                  style={{ cursor: filteredData.length > 1 ? 'pointer' : 'default' }}
                >
                  <div className="card-main-layout">
                    <div className="card-left-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span className="tag">{item.kat}</span>
                        <h2 className="card-title" style={{ margin: 0, fontSize: '1.4em' }}>{item.meno}</h2>
                      </div>
                      <p className="card-loc" style={{ marginTop: '8px', marginBottom: 0 }}>📍 {item.lok}</p>
                    </div>
                    <div className="card-right-actions">
                      <button onClick={(e) => { e.stopPropagation(); smartAdd(item); }} className="btn-core-app">DO APPKY</button>
                      <button onClick={(e) => { e.stopPropagation(); copyShareLink(item.fing); }} className="btn-core-share">LINK</button>
                      {item.gal && (
                        <button onClick={(e) => { e.stopPropagation(); window.open(item.gal, '_blank', 'noopener,noreferrer'); }} className="btn-core-gallery">GALÉRIA</button>
                      )}
                    </div>
                  </div>
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

      {/* 3. APPKY (25% šírky) */}
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
            <App triggerWebRefresh={triggerWebRefresh} />
          </div>
        </div>
      )}
    </div>
  );
};

const container = document.getElementById('root');
if (container) createRoot(container).render((
  <React.StrictMode>
    <MasterWrapper />
  </React.StrictMode>
));