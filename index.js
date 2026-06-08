/**
 * LARIA v2.9.3: Core Master Ignition (index.js)
 * Master: Sammael | Muse: Aria
 * Protokol: CRYSTAL_CORE_MASTER_ULTIMATE
 * FIX: Opravený fatálny crash contextu oddelením inicializácie providerov od MasterWrapperu.
 * ENHANCEMENT: Implementovaný nepriestrelný multisenzor na detekciu Tauri okna v dev prostredí.
 * UPDATE 2026: Kompletné prelinkovanie statických textov na lokalizačný JSON (Dynamic URL/TABs).
 * REACT UNIFICATION: Úplná eliminácia iframe prvkov. Natívne prepojenie modulov Fakturant a CojeLaria.
 * HASHTAG ROUTING PATCH: Implementovaná mriežková navigácia pre 100% ochranu pred 404 chybami na GH Pages.
 * MULTI-PARAM FIX: Ošetrené parametre 'id' pre Vizitkár aj 'art' pre sekciu CojeLaria.
 * PWA INTEGRATION: Oživenie inštalačného tlačidla pre bezbalíčkovú distribúciu Crystal Core.
 * PWA AUTO-STANDALONE FIX: Automatické spustenie aplikácie v pravom paneli, ak beží ako PWA standalone.
 * PWA INTELLIGENT PROMPT: Ošetrenie chýbajúcich promptov a používateľského zrušenia (Abort) s fallbackom priamo na web-app.
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import './styles.css';
import FreeVsFull from './src/components/FreeVsFull';
import Donate from './src/components/Donate';
import Aria from './src/components/Aria'; 
import Fakturant from './src/components/Fakturant';
import CojeLaria from './src/components/CojeLaria';

import { KryptoProvider } from './src/context/KryptoContext';
import { LariaProvider, useLaria } from './src/context/LariaContext'; 

const READ_URL = "https://script.google.com/macros/s/AKfycbzZVeNuvqSdNU0RwD-rRlvcRaOjEHrcQI5TY7fm7eJYVo5_Dl-zISKP089bH6gR50SX/exec";

// --- 🛸 Pomocná funkcia na komplexné parsovanie hash-u a čistenie anomálií URL ---
const parseHashLocation = () => {
  if (typeof window === 'undefined') return { view: 'domov', id: null, art: null };
  
  const fullUrl = window.location.href;
  let detectedView = 'domov';
  let id = null;
  let art = null;

  // 1. Skontrolujeme klasické parametre pred mriežkou
  if (window.location.search) {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('id')) id = searchParams.get('id');
    if (searchParams.get('art')) art = searchParams.get('art');
  }

  // 2. Skontrolujeme čistú mriežku za #
  const hash = window.location.hash || '';
  const cleanHash = hash.replace(/^#\/?/, '');
  const [path, queryString] = cleanHash.split('?');
  
  if (path) {
    detectedView = path;
  }

  // Ak sa našli parametre v mriežke, majú prioritetu
  if (queryString) {
    const hashParams = new URLSearchParams(queryString);
    if (hashParams.get('id')) id = hashParams.get('id');
    if (hashParams.get('art')) art = hashParams.get('art');
  }

  // 3. Špeciálne ošetrenie: Ak prišiel parameter 'art', systém VIE, že chceme ísť do sekcie CojeLaria!
  if (art && (detectedView === 'domov' || detectedView === 'vizitkar')) {
    detectedView = 'co-je-laria';
  }

  return { view: detectedView, id, art };
};

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

  // Inicializácia pohľadu priamo z aktuálneho hash-u
  const initialHash = parseHashLocation();
  const [currentView, setCurrentView] = useState(initialHash.view);

  // --- 🪐 UNIVERZÁLNY SENZOR PRE DETEKCIU TAURI OKNA ---
  const [isTauriWindow, setIsTauriWindow] = useState(false);

  // --- ⚡ PWA DETEKTOR INŠTALÁCIE ---
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAlreadyInstalled, setIsAlreadyInstalled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasTauriObject = window.__TAURI__ !== undefined || window.__TAURI_METADATA__ !== undefined;
      const hasTauriUserAgent = navigator.userAgent.includes('tauri') || navigator.userAgent.includes('Tauri');
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

  // Sledovanie PWA inštalačného eventu
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      console.log("🌲 LARIA PWA: Zachytený inštalačný prompt. Aktivujem zlaté tlačidlo!");
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      console.log("🌲 LARIA PWA: Aplikácia bola úspešne nainštalovaná na plochu.");
      setIsAlreadyInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // KĽÚČOVÁ KONTROLA: Ak už bežíme v samostatnom okne (z plochy), natvrdo zapíname App režim
    if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
      console.log("🌲 LARIA PWA: Detekovaný standalone režim (spustené z plochy).");
      setIsAlreadyInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 🔮 EFFECT PRE DYNAMICKÉ HASH URL A TAB NÁZVY ---
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let tabTitle = "LARIA";
    let urlSlug = "";

    const currentHashData = parseHashLocation();
    let currentArt = currentHashData.art;

    let targetView = currentView;
    if (currentArt && (targetView === 'domov' || targetView === 'vizitkar')) {
      targetView = 'co-je-laria';
    }

    switch (targetView) {
      case 'domov':
      case 'vizitkar':
        tabTitle = txt.tab_vizitkar || "Vizitkár";
        urlSlug = txt.url_vizitkar || "vizitkar";
        break;
      case 'co-je-laria':
      case 'cojelaria':
        tabTitle = txt.tab_faq || "Čo je LARIA";
        urlSlug = txt.url_faq || "co-je-laria";
        break;
      case 'fakturant':
        tabTitle = txt.tab_fakturant || "Fakturant";
        urlSlug = txt.url_fakturant || "fakturant";
        break;
      case 'free-vs-full':
        tabTitle = txt.tab_free_vs_full || "Free vs Full";
        urlSlug = txt.url_free_vs_full || "free-vs-full";
        break;
      case 'donate':
        tabTitle = txt.tab_donate || "Donate";
        urlSlug = txt.url_donate || "donate";
        break;
      case 'aria-panel-view':
      case 'domov-aria':
        tabTitle = txt.tab_domov || "Domov";
        urlSlug = txt.url_domov || "domov";
        break;
      default:
        tabTitle = "LARIA";
        urlSlug = targetView;
    }

    document.title = tabTitle;

    let newHash = `#/${urlSlug}`;
    
    if (urlSlug === 'co-je-laria' && currentArt) {
      newHash += `?art=${currentArt}`;
    } else if (soloActiveId && (urlSlug === 'domov' || urlSlug === 'vizitkar')) {
      newHash += `?id=${soloActiveId}`;
    }

    const cleanPath = window.location.origin + window.location.pathname;
    const finalTargetUrl = cleanPath + newHash;

    if (window.location.href !== finalTargetUrl) {
      window.history.pushState({}, '', finalTargetUrl);
    }

    if (targetView !== currentView) {
      setCurrentView(targetView);
    }
  }, [currentView, soloActiveId, txt]);

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

      const hashData = parseHashLocation();
      const currentId = targetId || hashData.id;
      
      if (currentId && currentId !== 'RESET') {
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
      const hashData = parseHashLocation();
      
      if (hashData.view && hashData.view !== currentView) {
        setCurrentView(hashData.view);
      }

      if (hashData.id && allData.length > 0) {
        const soloItem = allData.find(i => i.fing === hashData.id || i.krypt === hashData.id);
        if (soloItem) {
          setFilteredData([soloItem]);
          setSoloActiveId(hashData.id);
        }
      } else if (!hashData.id) {
        setFilteredData(allData);
        setSoloActiveId(null);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [allData, currentView]);

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
      setSoloActiveId(null);
      setWebRefreshKey(prev => prev + 1);
      fetchData('RESET');
      return;
    }
    if (targetId) {
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
    const url = `${window.location.origin}${window.location.pathname}#/${currentView}?id=${id}`;
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

  // --- 🔥 UPRAVENÁ INTELIGENTNÁ AKCIA PRE INTERAKTÍVNE PWA TLAČIDLO ---
  const handleDownloadClick = async () => {
    console.log("📥 LARIA CORE: Používateľ spustil inštalačnú sekvenciu Crystal Core.");
    
    // Stav A: Už sme detekovaní ako nainštalovaní
    if (isAlreadyInstalled) {
      alert("🌲 Crystal Core už beží ako plhodnotný systém na tomto zariadení.");
      return;
    }

    // Stav B: Chrome prompt nie je pripravený (keš, dev anomália) -> Odomykáme appku rovno na webe!
    if (!deferredPrompt) {
      console.log("⚠️ LARIA CORE: Systémový prompt nie je pripravený. Odomykám appku priamo na webe.");
      setIsAlreadyInstalled(true); 
      return;
    }

    // Stav C: Vyvolanie inštalačného dialógu
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`🌲 Crystal Core Inštalácia: Výsledok voľby -> [${outcome}]`);
    
    if (outcome === 'accepted') {
      console.log("✅ Používateľ schválil inštaláciu.");
      setIsAlreadyInstalled(true);
      setDeferredPrompt(null);
    } else {
      console.log("❌ Používateľ odmietol inštaláciu.");
      setDeferredPrompt(null);
      
      // OŠETRENIE REVERZU: Panel aj tak prepneme na app.js, nech používateľ funguje v prehliadači,
      // ale dáme mu návod, kde ikonu nájde ak neskôr zmení názor.
      setIsAlreadyInstalled(true); 
      alert("🌲 Systém bol spustený v prehliadači. Ak ho budete chcieť neskôr pridať na plochu, kliknite na ikonu 'Otvoriť/Inštalovať v aplikácii' priamo v pravom rohu adresného riadku prehliadača.");
    }
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
            <button className={`btn-menu ${currentView === 'co-je-laria' || currentView === 'cojelaria' ? 'active' : ''}`} onClick={() => { setCurrentView('co-je-laria'); if(isMobile) setIsLeftPanelOpen(false); }}>
              {txt.menu_faq || "LARIA FAQ"}
            </button>
            <button className={`btn-menu ${currentView === 'domov' || currentView === 'vizitkar' ? 'active' : ''}`} onClick={() => { setCurrentView('domov'); if(isMobile) setIsLeftPanelOpen(false); }}>
              {txt.menu_cards || "Vizitkár"}
            </button>
            <button className={`btn-menu ${currentView === 'fakturant' ? 'active' : ''}`} onClick={() => { setCurrentView('fakturant'); if(isMobile) setIsLeftPanelOpen(false); }}>
              {txt.menu_fakturant || "Fakturant"}
            </button>
            <button className={`btn-menu ${currentView === 'free-vs-full' ? 'active' : ''}`} onClick={() => { setCurrentView('free-vs-full'); if(isMobile) setIsLeftPanelOpen(false); }}>
              {txt.menu_free_vs_full || "FREE vs. FULL"}
            </button>
            <button className={`btn-menu ${currentView === 'donate' ? 'active' : ''}`} onClick={() => { setCurrentView('donate'); if(isMobile) setIsLeftPanelOpen(false); }}>
              {txt.menu_donate || "Dotovať"}
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
          {(currentView === 'domov' || currentView === 'vizitkar') && (
            <>
              <div className="filter-container" style={{ padding: '0 15px', width: '100%', boxSizing: 'border-box' }}>
                <select className="terminal-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="vsetko">{txt.cat_all || "Všetky kategórie"}</option>
                  <option value="obziva">{txt.cat_food || "Obživa a poživatiny"}</option>
                  <option value="remesla">{txt.cat_crafts || "Remeslá a materiál"}</option>
                  <option value="sluzby">{txt.cat_services || "Odborné cookies"}</option>
                  <option value="vzdelavanie">{txt.cat_education || "Vzdelávanie"}</option>
                  <option value="knihy">{txt.cat_books || "Knihy"}</option>
                  <option value="zdravie">{txt.cat_health || "Zdravie"}</option>
                  <option value="oblecenie">{txt.cat_clothes || "Oblečenie"}</option>
                  <option value="auto">{txt.cat_automoto || "Auto-moto"}</option>
                  <option value="volno">{txt.cat_leisure || "Voľný čas"}</option>
                  <option value="elektro">{txt.cat_electronics || "Elektro"}</option>
                  <option value="rodina">{txt.cat_family || "Deti a rodina"}</option>
                  <option value="ubytovanie">{txt.cat_accommodation || "Ubytovanie"}</option>
                  <option value="zahrada">{txt.cat_garden || "Záhrada"}</option>
                  <option value="nabytok">{txt.cat_furniture || "Nábytok"}</option>
                  <option value="kultura">{txt.cat_culture || "Kultúra"}</option>
                  <option value="osobne">{txt.cat_personal || "Osobné služby"}</option>
                  <option value="tvorba">{txt.cat_creation || "Tvorba"}</option>
                  <option value="ine">{txt.cat_other || "Iné"}</option>
                </select>
                <input
                  type="text"
                  className="terminal-input"
                  placeholder={txt.search_placeholder || "🔍 Hľadať..."}
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
                              {txt.btn_to_app || "DO APPKY"}
                            </button>
                            {item.gal && (
                              <button onClick={(e) => { e.stopPropagation(); window.open(item.gal, '_blank', 'noopener,noreferrer'); }} className="btn-core-gallery" style={{ flex: '1 1 auto', whiteSpace: 'nowrap' }}>
                                {txt.btn_gallery || "GALÉRIA"}
                              </button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); copyShareLink(item.fing); }} className="btn-core-share" style={{ flex: '1 1 auto', whiteSpace: 'nowrap' }}>
                              {txt.btn_link || "LINK"}
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

          {(currentView === 'co-je-laria' || currentView === 'cojelaria') && <CojeLaria />}
          {currentView === 'fakturant' && <Fakturant />}
          
          {currentView === 'free-vs-full' && <div style={{ padding: '0 15px' }}><FreeVsFull /></div>}
          {currentView === 'donate' && <div style={{ padding: '0 15px' }}><Donate /></div>}

          {currentView === 'aria-panel-view' && (
            <div style={{ padding: '0 15px' }}>
              <Aria setCurrentView={setCurrentView} />
            </div>
          )}

          {isMobile && <button onClick={() => setIsAppOpen(true)} className="trigger">{txt.btn_terminal || "TERMINAL"}</button>}
        </main>
      </div>

      {/* 3. APPKY PANEL (25% WRAPPER) */}
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
          {isMobile && <button onClick={() => setIsAppOpen(false)} className="trigger">{txt.btn_web || "WEB"}</button>}
          <div className="app-container" style={{ height: '100%' }}>
            
            {/* 🎯 MASTER SPÍNAČ: Ak sme v Tauri, ALEBO ak už máme stav nainštalované/odomknuté (isAlreadyInstalled), rovno štartujeme app.js! */}
            {isTauriWindow || isAlreadyInstalled ? (
              <App triggerWebRefresh={triggerWebRefresh} />
            ) : (
              /* Tento blok textu s tlačidlom sa ukáže IBA dovtedy, kým používateľ nespustí inštalačnú akciu */
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
                <div className="modal-title" style={{ marginBottom: '40px', marginTop: '40px', textTransform: 'none' }}>
                  CrystalCore
                </div>

                <div className="card-description-text" style={{ textAlign: 'center', padding: '0 10px', marginBottom: '40px', fontSize: '13px', lineHeight: '22px' }}>
                  Pre plnú synchronizáciu so sieťami, Gopher protokolom a prístup k hardvérovým uzlom spustite lokálny systém.
                </div>

                <div style={{ flexGrow: 1 }}></div>

                <div style={{ width: '100%', maxWidth: '320px', alignSelf: 'center', marginBottom: '30px' }}>
                  <button className="primary-btn" onClick={handleDownloadClick}>
                    <span className="primary-btn-text">
                      {deferredPrompt ? (txt.btn_download || "Stiahnuť Crystal Core") : "Inštalovať Crystal Core"}
                    </span>
                  </button>
                </div>

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

const LariaCoreApp = () => {
  return (
    <KryptoProvider>
      <LariaProvider>
        <MasterWrapper />
      </LariaProvider>
    </KryptoProvider>
  );
};

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <LariaCoreApp />
    </React.StrictMode>
  );
}