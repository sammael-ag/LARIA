/**
 * LARIA v2.0: Core Master Ignition (index.js)
 * Master: Sammael | Muse: Aria
 * Protokol: CRYSTAL_CORE_MASTER_ULTIMATE
 * Rez: Nadpis LARIA vycentrovaný, zbytočný padding vyčistený.
 * Úprava: Pridané scrollovanie pre menu a opravené lícovanie tlačidiel na kartách.
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import './styles.css';
import FreeVsFull from './src/components/FreeVsFull';
import Donate from './src/components/Donate';

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
  // Základný stav bude 'domov' (zobrazí vizitky pod vyhľadávaním)
  const [currentView, setCurrentView] = useState('domov');

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
      
      {/* 📐 MAIN ARIA PANEL TOGGLE: Oslobodená! Svieti na pevnom mieste na desktope aj na mobile */}
      <button 
        className="btn-panel-toggle" 
        onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
      >
        {isLeftPanelOpen ? '‹' : '›'}
      </button>

      {/* 1. ĽAVÉ MENU - Pridaná stabilná geometria a scrollovanie v prípade potreby */}
      {(!isMobile || isLeftPanelOpen) && (
        <div 
          className={`left-side ${isLeftPanelOpen ? 'open' : 'closed'}`} 
          style={{ 
            flex: isMobile ? '1 0 100%' : (isLeftPanelOpen ? '0 0 20%' : '0 0 0%'), 
            width: isMobile ? '100%' : (isLeftPanelOpen ? '20%' : '0%'),
            position: isMobile ? 'fixed' : 'relative',
            top: 0,
            left: 0,
            height: '100vh',
            zIndex: isMobile ? 9998 : 1, /* Drží sa tesne pod šípkou, ktorá má z-index 9999 */
            transition: 'all 0.3s ease',
            overflowX: 'hidden',
            overflowY: 'auto' /* 🛠️ SÚDRŽNÝ SCROLL PRE TLAČIDLÁ MENU */
          }}
        >
          <div className="left-menu-wrapper">
            <button className="btn-menu" onClick={() => { setCurrentView('domov'); if(isMobile) setIsLeftPanelOpen(false); }}>
              Domov
            </button>
  
            <button className="btn-menu" onClick={() => { setCurrentView('co-je-laria'); if(isMobile) setIsLeftPanelOpen(false); }}>
              ČO JE LARIA
            </button>
  
            <button className="btn-menu" onClick={() => { setCurrentView('fakturant'); if(isMobile) setIsLeftPanelOpen(false); }}>
              Fakturant
            </button>
  
            <button className="btn-menu" onClick={() => { setCurrentView('free-vs-full'); if(isMobile) setIsLeftPanelOpen(false); }}>
              FREE alebo FULL
            </button>
  
            <button className="btn-menu" onClick={() => { setCurrentView('donate'); if(isMobile) setIsLeftPanelOpen(false); }}>
              Dotovať
            </button>
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

          {/* ==========================================================================
              1. POHĽAD: DOMOV (Filtre, Vyhľadávanie a Vizitky)
             ========================================================================== */}
          {currentView === 'domov' && (
            <>
              {/* KONTAJNER PRE FILTRE A OVÁDACIE PRVKY */}
              <div className="filter-container" style={{ padding: '0 15px', width: '100%', boxSizing: 'border-box' }}>
                <select className="terminal-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="vsetko">Všetky kategórie</option>
                  <option value="obziva">Obživa a poživatiny</option>
                  <option value="remesla">Remeslá a materiál</option>
                  <option value="sluzby">Odborné cookies</option>
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

              {/* GRID S VIZITKAMI */}
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
                      <div className="card-main-layout" style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
  
  {/* 🏛️ 1. POSCHODIE: KATEGÓRIA A CENTROVANÉ MENO */}
  <div style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative', minHeight: '30px' }}>
    {/* Kategória ukotvená na ľavom okraji */}
    <span className="tag" style={{ position: 'absolute', left: 0, zIndex: 2 }}>
      {item.kat}
    </span>
    
    {/* Meno vycentrované na stred celej karty */}
    <h2 className="card-title" style={{ 
      margin: '0 auto', 
      fontSize: '1.4em', 
      textAlign: 'center', 
      width: '100%',
      padding: '0 80px' /* Ochrana, aby dlhé meno nenarazilo do tagu */
    }}>
      {item.meno}
    </h2>
  </div>

  {/* 🏛️ 2. POSCHODIE: LOKALITA VĽAVO A ROZTIAHNUTÉ TLAČIDLÁ VPRAVO (50% / 50%) */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '5px' }}>
    
    {/* Lokalita dostane 50% šírky, aby neprekážala gombíkom */}
    <div style={{ width: '50%', display: 'flex', justifyContent: 'flex-start' }}>
      <p className="card-loc" style={{ margin: 0 }}>
        📍 {item.lok}
      </p>
    </div>

    {/* 📐 Tlačidlá dostanú kráľovských 50% šírky s voľným rozložením */}
    <div 
      className="card-right-actions" 
      style={{ 
        margin: 0, 
        width: '50%', 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '12px' /* Trošku sme zväčšili medzeru medzi nimi pre lepší detail */
      }}
    >
      <button 
        onClick={(e) => { e.stopPropagation(); smartAdd(item); }} 
        className="btn-core-app"
        style={{ flex: '1 1 auto', whiteSpace: 'nowrap' }} /* 🔥 Prikáže gombíku rásť, ale nedeformovať text */
      >
        DO APPKY
      </button>
      
      {item.gal && (
        <button 
          onClick={(e) => { e.stopPropagation(); window.open(item.gal, '_blank', 'noopener,noreferrer'); }} 
          className="btn-core-gallery"
          style={{ flex: '1 1 auto', whiteSpace: 'nowrap' }}
        >
          GALÉRIA
        </button>
      )}
      
      <button 
        onClick={(e) => { e.stopPropagation(); copyShareLink(item.fing); }} 
        className="btn-core-share"
        style={{ flex: '1 1 auto', whiteSpace: 'nowrap' }}
      >
        LINK
      </button>
    </div>

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
            </>
          )}

          {/* ==========================================================================
              2. POHĽAD: ČO JE LARIA (Statický E-book z zložky public/)
             ========================================================================== */}
          {currentView === 'co-je-laria' && (
            <iframe 
              src="/co-je-laria.html" 
              style={{ width: '100%', height: 'calc(100vh - 120px)', border: 'none', background: 'transparent' }} 
              title="Čo je Laria"
            />
          )}

          {/* ==========================================================================
              3. POHĽAD: FAKTURANT (Formulár z zložky public/)
             ========================================================================== */}
          {currentView === 'fakturant' && (
            <iframe 
              src="/fakturant.html" 
              style={{ width: '100%', height: 'calc(100vh - 120px)', border: 'none', background: 'transparent' }} 
              title="Fakturant"
            />
          )}

          {/* ==========================================================================
              4. POHĽAD: FREE VS FULL (Dynamický React komponent zo src/components/)
             ========================================================================== */}
          {currentView === 'free-vs-full' && (
            <div style={{ padding: '0 15px' }}>
              <FreeVsFull />
            </div>
          )}

          {/* ==========================================================================
              5. POHĽAD: DOTOVAŤ (Krypto a Smart Contracts zo src/components/)
             ========================================================================== */}
          {currentView === 'donate' && (
            <div style={{ padding: '0 15px' }}>
              <Donate />
            </div>
          )}

          {/* MOBILNÝ SPODNÝ TRIGGER (Zostáva zachovaný pre prepínanie terminálu) */}
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