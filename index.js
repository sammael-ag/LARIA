/**
 * LARIA v2.8: Core Master Ignition (index.js)
 * Master: Sammael | Muse: Aria
 * Protokol: CRYSTAL_CORE_MASTER_ULTIMATE
 * FIX: Opravený fatálny crash contextu oddelením inicializácie providerov od MasterWrapperu.
 * ENHANCEMENT: Implementovaný nepriestrelný multisenzor na detekciu Tauri okna v dev prostredí.
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import './styles.css';
import FreeVsFull from './src/components/FreeVsFull';
import Donate from './src/components/Donate';
import Aria from './src/components/Aria'; 

import { KryptoProvider } from './src/context/KryptoContext';
import { LariaProvider, useLaria } from './src/context/LariaContext'; 

const READ_URL = "https://script.google.com/macros/s/AKfycbzZVeNuvqSdNU0RwD-rRlvcRaOjEHrcQI5TY7fm7eJYVo5_Dl-zISKP089bH6gR50SX/exec";

// --- 🛸 HLAVNÝ VNÚTORNÝ PANEL (Už bezpečne obalený v Contexte) ---
const MasterWrapper = () => {
  const { t } = useLaria(); 
  const txt = t('index') || {}; 

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

  // --- 🪐 UNIVERZÁLNY SENZOR PRE DETEKCIU TAURI OKNA (Namiesto starého useEffectu) ---
  const [isTauriWindow, setIsTauriWindow] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Kontrola cez globálne objekty a metadáta Tauri
      const hasTauriObject = window.__TAURI__ !== undefined || window.__TAURI_METADATA__ !== undefined;
      
      // 2. Kontrola cez User Agent okna (Tauri na Linuxe beží pod WebKitom a nesie podpis tauri)
      const hasTauriUserAgent = navigator.userAgent.includes('tauri') || navigator.userAgent.includes('Tauri');

      // 3. Poistka pre IPC (inter-process communication) mechanizmus, ktorý Tauri vstrekuje
      const hasTauriIPC = window.__TAURI_IPC__ !== undefined;

      if (hasTauriObject || hasTauriUserAgent || hasTauriIPC) {
        console.log("🛸 LARIA CORE DETECTOR: Detekované natívne okno Tauri! Prebúdzam Ateliér.");
        setIsTauriWindow(true);
      } else {
        console.log("🌐 LARIA CORE DETECTOR: Detekovaný bežný webový prehliadač.");
        setIsTauriWindow(false);
      }
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAriaView = (e) => {
      console.log("📡 Core Index: Zachytený signál ARIA_TRIGGER_VIEW ->", e.detail);
      if (e.detail === 'aria-fluid') {
        setCurrentView('domov');
      } else {
        setCurrentView(e.detail);
      }
    };

    window.addEventListener('ARIA_TRIGGER_VIEW', handleAriaView);
    return () => window.removeEventListener('ARIA_TRIGGER_VIEW', handleAriaView);
  }, []);

  const fetchData = async (targetId = null) => {
    setLoading(true);
    try {
      const response = await fetch(READ_URL);
      const rawData = await response.json();
      const cleanedData = rawData.reduce((acc, item) => {
        if (!item.poznamka || item.poznamka.trim() === "") return acc;
        acc.push({
          sha: item.sha,
          meno: item.meno || txt.default_name || "Neznámy Majster",
          kat: item.kat || txt.default_category || "ine",
          lok: item.lok || txt.default_location || "Neznáma lokalita",
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
            alert(txt.pwa_install_alert || "Ak nemáte aplikáciu, stiahnite si Crystal Core.");
          }
        }, 1500);
      }
    }, 150);
  };

  const copyShareLink = (id) => {
    const url = `${window.location.origin}${window.location.pathname}?id=${id}`;
    navigator.clipboard.writeText(url).then(() => alert(txt.link_copied_alert || "Odkaz bol skopírovaný!"));
  };

  const aktivujOdkazy = (text) => {
    if (!text) return txt.no_description || "Bez popisu";
    const urlPattern = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.split(urlPattern).map((part, i) =>
      urlPattern.test(part) ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{color: '#c5a059'}}>{part}</a> : part
    );
  };

  const getWebSideFlex = () => {
    if (isMobile) return '1 0 100%';
    return isLeftPanelOpen ? '0 0 55%' : '0 0 75%';
  };

  const getAppSideFlex = () => {
    if (isMobile) return '1 0 100%';
    return '0 0 25%';
  };

  const handleDownloadClick = () => {
    console.log("📥 LARIA CORE: Používateľ klikol na tlačidlo stiahnutia Crystal Core z webu.");
  };

  return (
    <div className="master-container bg-dashboard" style={{ overflow: 'hidden' }}>
      
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
            <button className={`btn-menu ${currentView === 'aria-panel-view' ? 'active' : ''}`} onClick={() => { setCurrentView('aria-panel-view'); if(isMobile) setIsLeftPanelOpen(false); }}>
              {txt.menu_home || "Domov"}
            </button>
            <button className={`btn-menu ${currentView === 'co-je-laria' ? 'active' : ''}`} onClick={() => { setCurrentView('co-je-laria'); if(isMobile) setIsLeftPanelOpen(false); }}>
              {txt.menu_faq || "Čo je LARIA"}
            </button>
            <button className={`btn-menu ${currentView === 'domov' ? 'active' : ''}`} onClick={() => { setCurrentView('domov'); if(isMobile) setIsLeftPanelOpen(false); }}>
              {txt.menu_cards || "Vizitky"}
            </button>
            <button className={`btn-menu ${currentView === 'fakturant' ? 'active' : ''}`} onClick={() => { setCurrentView('fakturant'); if(isMobile) setIsLeftPanelOpen(false); }}>
              {txt.menu_fakturant || "Fakturant"}
            </button>
            <button className={`btn-menu ${currentView === 'free-vs-full' ? 'active' : ''}`} onClick={() => { setCurrentView('free-vs-full'); if(isMobile) setIsLeftPanelOpen(false); }}>
              {txt.menu_free_vs_full || "Free vs Full"}
            </button>
            <button className={`btn-menu ${currentView === 'donate' ? 'active' : ''}`} onClick={() => { setCurrentView('donate'); if(isMobile) setIsLeftPanelOpen(false); }}>
              {txt.menu_donate || "Donate"}
            </button>
          </div>
        </div>
      )}

      {/* 2. WEB PANEL */}
      <div 
        key={webRefreshKey}
        className="web-side" 
        style={{
          flex: getWebSideFlex(),
          width: isMobile ? '100%' : (isLeftPanelOpen ? '55%' : '75%'),
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
          {currentView === 'domov' && (
            <>
              <div className="filter-container" style={{ padding: '0 15px', width: '100%', boxSizing: 'border-box' }}>
                <select className="terminal-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="vsetko">{txt.cat_all || "Všetko"}</option>
                  <option value="obziva">{txt.cat_food || "Obživa"}</option>
                  <option value="remesla">{txt.cat_crafts || "Remeslá"}</option>
                  <option value="sluzby">{txt.cat_services || "Služby"}</option>
                  <option value="vzdelavanie">{txt.cat_education || "Vzdelávanie"}</option>
                  <option value="knihy">{txt.cat_books || "Knihy"}</option>
                  <option value="zdravie">{txt.cat_health || "Zdravie"}</option>
                  <option value="oblecenie">{txt.cat_clothes || "Oblečenie"}</option>
                  <option value="auto">{txt.cat_automoto || "Auto-Moto"}</option>
                  <option value="volno">{txt.cat_leisure || "Voľný čas"}</option>
                  <option value="elektro">{txt.cat_electronics || "Elektro"}</option>
                  <option value="rodina">{txt.cat_family || "Rodina"}</option>
                  <option value="ubytovanie">{txt.cat_accommodation || "Ubytovanie"}</option>
                  <option value="zahrada">{txt.cat_garden || "Záhrada"}</option>
                  <option value="nabytok">{txt.cat_furniture || "Nábytok"}</option>
                  <option value="kultura">{txt.cat_culture || "Kultúra"}</option>
                  <option value="osobne">{txt.cat_personal || "Osobné"}</option>
                  <option value="tvorba">{txt.cat_creation || "Tvorba"}</option>
                  <option value="ine">{txt.cat_other || "Iné"}</option>
                </select>
                <input
                  type="text"
                  className="terminal-input"
                  placeholder={txt.search_placeholder || "Hľadať..."}
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
                  <p className="text-cyber" style={{ color: '#b19cd9', textAlign: 'center', width: '100%' }}> {txt.sync_matrix_msg || "[ SYNCHRONIZUJEM MATRIX ]"} </p>
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
                              {txt.btn_to_app || "Do appky"}
                            </button>
                            {item.gal && (
                              <button onClick={(e) => { e.stopPropagation(); window.open(item.gal, '_blank', 'noopener,noreferrer'); }} className="btn-core-gallery" style={{ flex: '1 1 auto', whiteSpace: 'nowrap' }}>
                                {txt.btn_gallery || "Galéria"}
                              </button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); copyShareLink(item.fing); }} className="btn-core-share" style={{ flex: '1 1 auto', whiteSpace: 'nowrap' }}>
                              {txt.btn_link || "Odkaz"}
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
                  <p style={{ color: '#666', textAlign: 'center', width: '100%' }}>{txt.no_masters_found || "Nenašli sa žiadni majstri."}</p>
                )}
              </div>
            </>
          )}

          {currentView === 'co-je-laria' && (
            <iframe src="./co-je-laria.html" style={{ width: '100%', height: 'calc(100vh - 120px)', border: 'none', background: 'transparent' }} title="Čo je Laria" />
          )}
          {currentView === 'fakturant' && (
            <iframe src="./fakturant.html" style={{ width: '100%', height: 'calc(100vh - 120px)', border: 'none', background: 'transparent' }} title="Fakturant" />
          )}
          {currentView === 'free-vs-full' && <div style={{ padding: '0 15px' }}><FreeVsFull /></div>}
          {currentView === 'donate' && <div style={{ padding: '0 15px' }}><Donate /></div>}

          {currentView === 'aria-panel-view' && (
            <div style={{ padding: '0 15px' }}>
              <Aria setCurrentView={setCurrentView} />
            </div>
          )}

          {isMobile && <button onClick={() => setIsAppOpen(true)} className="trigger">{txt.btn_terminal || "Terminál"}</button>}
        </main>
      </div>

      {/* 3. APPKY PANEL */}
      {(!isMobile || isAppOpen) && (
        <div 
          className="app-side"
          style={{
            flex: getAppSideFlex(),
            width: isMobile ? '100%' : '25%',
            position: isMobile ? 'fixed' : 'relative',
            right: 0,
            top: 0,
            height: '100vh',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            zIndex: 1
          }}
        >
          {isMobile && <button onClick={() => setIsAppOpen(false)} className="trigger">{txt.btn_web || "Web"}</button>}
          <div className="app-container" style={{ height: '100%' }}>
            
            {isTauriWindow ? (
              <App triggerWebRefresh={triggerWebRefresh} />
            ) : (
              /* 🪐 FINÁLNE UPRAVENÝ PROMO PANEL (Biliardový filc s dymovým závojom bez pulzovania) */
              <div 
                className="aria-liquid-container" 
                style={{ 
                  padding: '30px 20px', 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  background: 'linear-gradient(rgba(20, 20, 20, 0.75), rgba(20, 20, 20, 0.75)), #022002',
                  animation: 'none'
                }}
              >
                
                {/* Elegantný tenký Art Deco nadpis - vypnuté vynútené veľké písmená */}
                <div className="modal-title" style={{ marginBottom: '40px', marginTop: '40px', textTransform: 'none' }}>
                  CrystalCore
                </div>

                {/* Popisný text voľne dýchajúci bez Node System linky */}
                <div className="card-description-text" style={{ textAlign: 'center', padding: '0 10px', marginBottom: '40px', fontSize: '13px', lineHeight: '22px' }}>
                  Pre plnú synchronizáciu so sieťami, Gopher protokolom a prístup k hardvérovým uzlom spustite lokálny systém.
                </div>

                {/* Flexibilná výplň, ktorá drží akciu pevne na spodku */}
                <div style={{ flexGrow: 1 }}></div>

                {/* Hlavné sťahovacie tlačidlo - plne naviazané na BRONZE_GLOW efekty */}
                <div style={{ width: '100%', maxWidth: '320px', alignSelf: 'center', marginBottom: '30px' }}>
                  <button className="primary-btn" onClick={handleDownloadClick}>
                    <span className="primary-btn-text">{txt.btn_download || "Stiahnuť Crystal Core"}</span>
                  </button>
                </div>

                {/* Tichý systémový podpis na úplnom spodku panela */}
                <div style={{ textAlign: 'center', opacity: 0.3, marginTop: 'auto', marginBottom: '10px' }}>
                  <span className="text-terminal" style={{ fontSize: '9px', letterSpacing: '1px' }}>
                    SYSTEM_READY // BYTES_ALIGNED // 2026
                  </span>
                </div>

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

// --- 🪐 NOVÝ KOREŇOVÝ WRAFFER PRE BEZPEČNÝ ŠTART MATRIXU ---
const LariaCoreApp = () => {
  return (
    <KryptoProvider>
      <LariaProvider>
        <MasterWrapper />
      </LariaProvider>
    </KryptoProvider>
  );
};

// --- RENDER JADRA ---
const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <LariaCoreApp />
    </React.StrictMode>
  );
}