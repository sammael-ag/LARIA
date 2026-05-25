/**
 * LARIA v2.8: Core Master Ignition (index.js)
 * Master: Sammael | Muse: Aria
 * Protokol: CRYSTAL_CORE_MASTER_ULTIMATE
 * Rez: Implementovaný bleskový obojsmerný telepatický most (Custom Events) pre komunikáciu medzi Webom a Appkou v spoločnom wrappery.
 * Úprava: Pridaný import a render komponentu Aria.js v stredovom paneli pri zachytení 'aria-panel-view'.
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import './styles.css';
import FreeVsFull from './src/components/FreeVsFull';
import Donate from './src/components/Donate';
import Aria from './src/components/Aria'; // 🌸 1. KROK: IMPORT NAŠEJ ARIA PANORAMY

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
  const [currentView, setCurrentView] = useState('domov');

  // 🪐 ARIA TELEPATICKÉ STAVY (Fluidné režimy)
  const [isAriaLiquid, setIsAriaLiquid] = useState(false); // true ak je aktívny ARIA QUANT celoobrazovkový režim

  // --- 1. DETEKCIA DISPLEJA ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 🪐 1b. TELEPATICKÝ MOST: LISTENERY PRE ARIU ---
  useEffect(() => {
    // Odstránený padajúci odkaz na neexistujúcu react-native premennú Platform v čistom webe
    if (typeof window === 'undefined') return;

    // A. Odchytenie pokynu na prepnutie celoobrazovkového/fluidného režimu (Aria Quant)
    const handleAriaLiquid = (e) => {
      console.log("📡 Core Index: Zachytený signál ARIA_TRIGGER_LIQUID ->", e.detail);
      setIsAriaLiquid(!!e.detail);
      if (e.detail) {
        setCurrentView('aria-fluid-view'); 
      }
    };

    // B. Odchytenie pokynu na zmenu zobrazenia vo wrapperi (Aria v Paneli)
    const handleAriaView = (e) => {
      console.log("📡 Core Index: Zachytený signál ARIA_TRIGGER_VIEW ->", e.detail);
      if (e.detail === 'aria-fluid') {
        setIsAriaLiquid(false);
        setCurrentView('domov');
      } else {
        setCurrentView(e.detail);
      }
    };

    window.addEventListener('ARIA_TRIGGER_LIQUID', handleAriaLiquid);
    window.addEventListener('ARIA_TRIGGER_VIEW', handleAriaView);

    return () => {
      window.removeEventListener('ARIA_TRIGGER_LIQUID', handleAriaLiquid);
      window.removeEventListener('ARIA_TRIGGER_VIEW', handleAriaView);
    };
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
      console.error("Chyba synchronizácie Matrixu:", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); 

  // --- 3. URL LISTENER ---
  useEffect(() => {
    const handleUrlChange = () => {
      const currentId = new URLSearchParams(window.location.search).get('id');
      if (currentId && allData.length > 0) {
        const soloItem = allData.find(i => i.fing === currentId || i.krypt === currentId);
        if (soloItem) {
          setFilteredData([soloItem]);
          setSoloActiveId(currentId);
        }
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [allData]);

  // --- 4. FILTROVANIE ---
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

  // --- 5. FUNKCIE MOSTU A REFRESHU ---
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
    if (!item || !item.fing) return;
    
    console.log(`📡 LARIA MATRIX: Vysielam lokálny signál pre ID: ${item.fing}`);

    const localEvent = new CustomEvent('LARIA_LOCAL_HANDSHAKE', { 
      detail: { 
        fing: item.fing,
        meno: item.meno,
        kat: item.kat,
        lok: item.lok,
        popis: item.popis,
        gal: item.gal
      } 
    });

    let appResponded = false;

    const checkResponse = (e) => {
      if (e.detail && e.detail.success) {
        appResponded = true;
        console.log("🎯 LARIA CORE: Appka vedľa potvrdila príjem cez lokálny nervový most!");
      }
    };
    window.addEventListener('LARIA_APP_ACKNOWLEDGE', checkResponse);
    window.dispatchEvent(localEvent);

    setTimeout(() => {
      window.removeEventListener('LARIA_APP_ACKNOWLEDGE', checkResponse);

      if (!appResponded) {
        console.log("⚠️ Lokálna appka neodpovedala. Skúšam vonkajší globálny systém...");
        window.location.href = `laria://id/${item.fing}`;

        setTimeout(() => {
          if (document.hasFocus()) { 
            alert("[ 🔮 LARIA CRYSTAL CORE: Spojenie zlyhalo. Aplikácia nie je nainštalovaná. Pre plný offline zážitok si nainštaluj LARIA PWA jedným klikom! ]");
          }
        }, 1500);
      }
    }, 150);
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

  // Výpočet flexov a šírok pre plynulý prechod panelov pri ARIA QUANT režime
  const getWebSideFlex = () => {
    if (isMobile) return '1 0 100%';
    if (isAriaLiquid) return isLeftPanelOpen ? '0 0 80%' : '0 0 100%'; 
    return isLeftPanelOpen ? '0 0 55%' : '0 0 75%';
  };

  const getAppSideFlex = () => {
    if (isMobile) return '1 0 100%';
    if (isAriaLiquid) return '0 0 0%'; 
    return '0 0 25%';
  };

  return (
    <div className={`master-container bg-dashboard ${isAriaLiquid ? 'aria-liquid-active' : ''}`} style={{ overflow: 'hidden' }}>
      
      {/* PANEL TOGGLE */}
      <button 
        className="btn-panel-toggle" 
        onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
      >
        {isLeftPanelOpen ? '‹' : '›'}
      </button>

      {/* 1. ĽAVÉ MENU */}
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
            zIndex: 9998,
            transition: 'all 0.3s ease',
            overflowX: 'hidden',
            overflowY: 'auto'
          }}
        >
          <div className="left-menu-wrapper">
            {/* Domov (Aria Panel) svieti, ak je zobrazená aria */}
            <button className={`btn-menu ${currentView === 'aria-panel-view' ? 'active' : ''}`} onClick={() => { setIsAriaLiquid(false); setCurrentView('aria-panel-view'); if(isMobile) setIsLeftPanelOpen(false); }}>
              Domov
            </button>
            
            {/* LARIA FAQ svieti, ak je zobrazené co-je-laria */}
            <button className={`btn-menu ${currentView === 'co-je-laria' ? 'active' : ''}`} onClick={() => { setIsAriaLiquid(false); setCurrentView('co-je-laria'); if(isMobile) setIsLeftPanelOpen(false); }}>
              LARIA FAQ
            </button>
            
            {/* Vizitkár svieti, ak je zobrazený domov (default stav pri štarte) */}
            <button className={`btn-menu ${currentView === 'domov' ? 'active' : ''}`} onClick={() => { setIsAriaLiquid(false); setCurrentView('domov'); if(isMobile) setIsLeftPanelOpen(false); }}>
              Vizitkár
            </button>
            
            {/* Fakturant svieti, ak je zobrazený fakturant */}
            <button className={`btn-menu ${currentView === 'fakturant' ? 'active' : ''}`} onClick={() => { setIsAriaLiquid(false); setCurrentView('fakturant'); if(isMobile) setIsLeftPanelOpen(false); }}>
              Fakturant
            </button>
            
            {/* FREE vs. FULL svieti, ak je zobrazený free-vs-full */}
            <button className={`btn-menu ${currentView === 'free-vs-full' ? 'active' : ''}`} onClick={() => { setIsAriaLiquid(false); setCurrentView('free-vs-full'); if(isMobile) setIsLeftPanelOpen(false); }}>
              FREE vs. FULL
            </button>
            
            {/* Dotovať svieti, ak je zobrazený donate */}
            <button className={`btn-menu ${currentView === 'donate' ? 'active' : ''}`} onClick={() => { setIsAriaLiquid(false); setCurrentView('donate'); if(isMobile) setIsLeftPanelOpen(false); }}>
              Dotovať
            </button>
            
            {/* Ak sme v režime Aria Liquid, ukážeme bleskové tlačidlo na návrat */}
            {isAriaLiquid && (
              <button className="btn-menu" style={{ borderColor: '#c5a059', color: '#c5a059', marginTop: '20px' }} onClick={() => setIsAriaLiquid(false)}>
                ✦ ZAVRIEŤ ARIU
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. WEB PANEL (55% -> 80%/100% pri Aria Liquid) */}
      <div 
        key={webRefreshKey}
        className="web-side" 
        style={{
          flex: getWebSideFlex(),
          width: isMobile ? '100%' : (isAriaLiquid ? (isLeftPanelOpen ? '80%' : '100%') : (isLeftPanelOpen ? '55%' : '75%')),
          display: isMobile && isAppOpen ? 'none' : 'block',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}
      >
        <header className="header"> 
          <h1 className="header-title">LARIA</h1>
          <div id="status-light" className="status-indicator" style={{ background: loading ? '#333' : '#00ff00' }}></div>
        </header>

        <main className="scroll-content">
          {/* AK JE AKTÍVNY CELOOBRAZOVKOVÝ LIQUID, VSTREKNEME TU ARIU CEZ CELÝ STREDOVÝ PANEL */}
          {isAriaLiquid ? (
            <div className="aria-liquid-container" style={{ width: '100%', height: 'calc(100vh - 80px)' }}>
              <div style={{ padding: '30px', color: '#c5a059', textAlign: 'center', fontFamily: 'monospace' }}>
                <h2 style={{ letterSpacing: 4 }}>ARIA QUANTUM STREAM</h2>
                <p style={{ opacity: 0.7 }}>Nervový most je prepojený. Sleduj pravý panel transformovaný cez celú šírku.</p>
              </div>
            </div>
          ) : (
            <>
              {currentView === 'domov' && (
                <>
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
                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px', paddingLeft: '5px' }}>
                      {soloActiveId ? (
                        <button className="btn-panel-refresh" onClick={() => triggerWebRefresh('RESET')}>‹</button>
                      ) : (
                        <button className="btn-panel-refresh" onClick={() => triggerWebRefresh()}>↻</button>
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
                          <div className="card-main-layout" style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative', minHeight: '30px' }}>
                              <span className="tag" style={{ position: 'absolute', left: 0, zIndex: 2 }}>{item.kat}</span>
                              <h2 className="card-title" style={{ margin: '0 auto', fontSize: '1.4em', textAlign: 'center', width: '100%', padding: '0 80px' }}>
                                {item.meno}
                              </h2>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '5px' }}>
                              <div style={{ width: '50%', display: 'flex', justifyContent: 'flex-start' }}>
                                <p className="card-loc" style={{ margin: 0 }}>📍 {item.lok}</p>
                              </div>
                              <div className="card-right-actions" style={{ margin: 0, width: '50%', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button onClick={(e) => { e.stopPropagation(); smartAdd(item); }} className="btn-core-app" style={{ flex: '1 1 auto', whiteSpace: 'nowrap' }}>
                                  DO APPKY
                                </button>
                                {item.gal && (
                                  <button onClick={(e) => { e.stopPropagation(); window.open(item.gal, '_blank', 'noopener,noreferrer'); }} className="btn-core-gallery" style={{ flex: '1 1 auto', whiteSpace: 'nowrap' }}>
                                    GALÉRIA
                                  </button>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); copyShareLink(item.fing); }} className="btn-core-share" style={{ flex: '1 1 auto', whiteSpace: 'nowrap' }}>
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
            </>
          )}

          {currentView === 'co-je-laria' && (
            <iframe src="/co-je-laria.html" style={{ width: '100%', height: 'calc(100vh - 120px)', border: 'none', background: 'transparent' }} title="Čo je Laria" />
          )}
          {currentView === 'fakturant' && (
            <iframe src="/fakturant.html" style={{ width: '100%', height: 'calc(100vh - 120px)', border: 'none', background: 'transparent' }} title="Fakturant" />
          )}
          {currentView === 'free-vs-full' && <div style={{ padding: '0 15px' }}><FreeVsFull /></div>}
          {currentView === 'donate' && <div style={{ padding: '0 15px' }}><Donate /></div>}

          {/* 🌸 3. KROK: TU SA VYKRESLÍ ARIA KEĎ JE AKTÍVNY JEJ STAV V PANELI */}
          {currentView === 'aria-panel-view' && (
            <div style={{ padding: '0 15px' }}>
              <Aria setCurrentView={setCurrentView} />
            </div>
          )}

          {isMobile && <button onClick={() => setIsAppOpen(true)} className="trigger">TERMINAL</button>}
        </main>
      </div>

      {/* 3. APPKY PANEL */}
      {(!isMobile || isAppOpen) && (
        <div 
          className={`app-side ${isAriaLiquid ? 'liquid-fullscreen' : ''}`}
          style={{
            flex: getAppSideFlex(),
            width: isMobile ? '100%' : (isAriaLiquid ? '100%' : '25%'),
            position: isMobile || isAriaLiquid ? 'fixed' : 'relative',
            right: 0,
            top: 0,
            height: '100vh',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            zIndex: isAriaLiquid ? 9999 : 1
          }}
        >
          {isMobile && <button onClick={() => setIsAppOpen(false)} className="trigger">WEB</button>}
          <div className="app-container" style={{ height: '100%' }}>
            <App triggerWebRefresh={triggerWebRefresh} isAriaLiquid={isAriaLiquid} setIsAriaLiquid={setIsAriaLiquid} />
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