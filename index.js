/** 
 * LARIA v3.1.3: Core Master Ignition + Fluid Scroll & Multi-Level Hash (index.js) 
 * Master: Sammael | Muse: Aria 
 * Protokol: CRYSTAL_CORE_MASTER_ULTIMATE 
 */ 

import React, { useState, useEffect, useRef } from 'react'; 
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

const brana_p1 = "https://script.google.com/macros/s/"; 
const brana_p2 = "AKfycbx-XUs-vbVxTh3pGPYzB587nQqBSxnN-qVZElKfFamGbUV8tCE1aBS-qsHDE4jzAb1KqQ"; 
const brana_p3 = "/exec"; 

const ziskajBranaUrl = () => { 
  return `${brana_p1}${brana_p2}${brana_p3}`; 
}; 

const parseHashLocation = () => { 
  if (typeof window === 'undefined') return { view: 'vizitkar', id: null, art: null }; 
   
  let id = null; 
  let art = null; 

  if (window.location.search) { 
    const searchParams = new URLSearchParams(window.location.search); 
    if (searchParams.get('id')) id = searchParams.get('id'); 
    if (searchParams.get('art')) art = searchParams.get('art'); 

    const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
    window.history.replaceState(null, '', cleanUrl);
  } 

  const hash = window.location.hash || '#/vizitkar'; 
  const cleanHash = hash.replace(/^#\/?/, ''); 
  const [path, queryString] = cleanHash.split('?'); 
   
  // 🧭 PODPORA PRE DVOJÚROVŇOVÝ HASH ROUTING (napr. co-je-laria/obnova-uctu)
  const pathSegments = path.split('/').filter(Boolean);
  let detectedView = pathSegments[0] || 'vizitkar';

  if (pathSegments.length > 1 && (detectedView === 'co-je-laria' || detectedView === 'cojelaria')) {
    art = pathSegments[1];
  }

  if (queryString) { 
    const hashParams = new URLSearchParams(queryString); 
    if (hashParams.get('id')) id = hashParams.get('id'); 
    if (hashParams.get('art')) art = hashParams.get('art'); 
  } 

  if (art) { 
    detectedView = 'co-je-laria'; 
  } 

  if (detectedView === 'aria-panel-view' || detectedView === 'domov-aria') {
    detectedView = 'domov';
  }

  return { view: detectedView, id, art }; 
}; 

const MasterWrapper = () => { 
  const { t } = useLaria();  
  const txt = t('index') || {};  

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); 
  const [isAppOpen, setIsAppOpen] = useState(false); 
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(window.innerWidth >= 768); 
   
  const [allData, setAllData] = useState([]); 
  const [filteredData, setFilteredData] = useState([]); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [category, setCategory] = useState('vsetko'); 
  const [loading, setLoading] = useState(true); 

  const [webRefreshKey, setWebRefreshKey] = useState(0); 
  const [soloActiveId, setSoloActiveId] = useState(null); 

  const [showTopBtn, setShowTopBtn] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimeoutRef = useRef(null);
  const scrollRef = useRef(null);
  const activeScrollTargetRef = useRef(null);

  const initialHash = parseHashLocation(); 
  const [currentView, setCurrentView] = useState(initialHash.view); 

  useEffect(() => { 
    const handleResize = () => {
      const mobileCheck = window.innerWidth < 768;
      setIsMobile(mobileCheck); 
    };
    window.addEventListener('resize', handleResize); 
    return () => window.removeEventListener('resize', handleResize); 
  }, []); 

  useEffect(() => { 
    if (typeof window === 'undefined') return; 

    const currentHashData = parseHashLocation(); 
    let targetView = currentHashData.view; 

    if (targetView !== currentView) { 
      setCurrentView(targetView); 
    } 
  }, [webRefreshKey]); 

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hashData = parseHashLocation();
    const webViews = ['domov', 'vizitkar', 'co-je-laria', 'cojelaria', 'fakturant', 'free-vs-full', 'donate'];

    if (webViews.includes(currentView)) {
      const currentHash = window.location.hash;
      // Ak už sme na konkrétnom článku v co-je-laria, neprepisujeme URL
      if ((currentView === 'co-je-laria' || currentView === 'cojelaria') && currentHash.startsWith('#/co-je-laria/')) {
        return;
      }
      if (hashData.view !== currentView) {
        window.location.hash = `/${currentView}`;
      }
    }
  }, [currentView]);

  useEffect(() => { 
    if (typeof window === 'undefined') return; 

    const handleAriaView = (e) => { 
      if (e.detail === 'aria-fluid' || e.detail === 'aria-panel-view') { 
        window.location.hash = '/domov';
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
      const url = `${ziskajBranaUrl()}?v=${Date.now()}`; 
      const response = await fetch(url, { 
        method: 'GET', 
        redirect: 'follow' 
      }); 

      if (!response.ok) throw new Error(`Matrix neodpovedá v jadre index (HTTP ${response.status})`);
      const rawResponse = await response.json(); 

      if (rawResponse && (rawResponse.status === "error" || rawResponse.success === false)) {
        throw new Error(rawResponse.message || rawResponse.error || "Neznáma chyba Matrixu");
      }

      const dataArray = Array.isArray(rawResponse) 
        ? rawResponse 
        : (rawResponse && Array.isArray(rawResponse.data) ? rawResponse.data : []);

      const cleanedData = dataArray.reduce((acc, item) => { 
        if (!item.fing || item.fing.trim() === "") return acc; 
        
        acc.push({ 
          sha: item.sha, 
          meno: item.meno || txt.default_name || "Neznámy Majster", 
          kat: item.kat || txt.default_category || "ine", 
          lok: item.lok || txt.default_location || "Neznáma lokalita", 
          popis: item.popis || "", 
          gal: item.gal || "", 
          Signal: item.Signal || "", 
          fing: item.fing.trim(),    
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
      console.error("❌ Synchronizácia Matrixu zlyhala:", e); 
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
    window.addEventListener('hashchange', handleUrlChange); 
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
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

  const showToast = (message) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const smartAdd = (item) => { 
    if (!item || !item.fing) return; 

    const localEvent = new CustomEvent('LARIA_LOCAL_HANDSHAKE', {  
      detail: { fing: item.fing, meno: item.meno, kat: item.kat, lok: item.lok, popis: item.popis, gal: item.gal }  
    }); 

    let appResponded = false; 
    const checkResponse = (e) => { 
      if (e.detail && e.detail.success) { 
        appResponded = true; 
      } 
    }; 
    window.addEventListener('LARIA_APP_ACKNOWLEDGE', checkResponse); 
    window.dispatchEvent(localEvent); 

    setTimeout(() => { 
      window.removeEventListener('LARIA_APP_ACKNOWLEDGE', checkResponse); 
      if (!appResponded) { 
        window.location.href = `laria://id/${item.fing}`; 
        setTimeout(() => { 
          if (document.hasFocus()) {  
            showToast(txt.pwa_install_alert || "Ak nemáš aplikáciu, stiahni si Crystal Core."); 
          } 
        }, 1500); 
      } 
    }, 150); 
  }; 

  const copyShareLink = (id) => { 
    const url = `${window.location.origin}${window.location.pathname}#/${currentView}?id=${id}`; 
    navigator.clipboard.writeText(url).then(() => {
      showToast(txt.link_copied_alert || "Odkaz bol skopírovaný do schránky!");
    }); 
  }; 

  const aktivujOdkazy = (text) => { 
    if (!text) return txt.no_description || "Bez popisu."; 
    const urlPattern = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig; 
    return text.split(urlPattern).map((part, i) => 
      urlPattern.test(part) ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{color: '#c5a059'}}>{part}</a> : part 
    ); 
  }; 

  useEffect(() => {
    const najdiScrollElement = (el) => {
      if (!el) return null;
      const style = window.getComputedStyle(el);
      if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        return el;
      }
      return najdiScrollElement(el.parentElement);
    };

    const vyhodnotZachytenyScroll = (e) => {
      let skutocnyElement = activeScrollTargetRef.current;
      if (!skutocnyElement && e.target) {
        skutocnyElement = najdiScrollElement(e.target);
        if (skutocnyElement) {
          activeScrollTargetRef.current = skutocnyElement;
          skutocnyElement.removeEventListener('scroll', spustiKontroluStavu);
          skutocnyElement.addEventListener('scroll', spustiKontroluStavu, { passive: true });
        }
      }
      spustiKontroluStavu();
    };

    const spustiKontroluStavu = () => {
      const el = activeScrollTargetRef.current;
      const aktualnaVyskaScrollu = el ? el.scrollTop : Math.max(window.scrollY, document.documentElement.scrollTop);

      window.requestAnimationFrame(() => {
        if (aktualnaVyskaScrollu > 250) {
          setShowTopBtn(true);
        } else {
          setShowTopBtn(false);
        }
      });
    };

    window.addEventListener('wheel', vyhodnotZachytenyScroll, { passive: true });
    window.addEventListener('touchmove', vyhodnotZachytenyScroll, { passive: true });
    window.addEventListener('scroll', spustiKontroluStavu, { passive: true });

    return () => {
      window.removeEventListener('wheel', vyhodnotZachytenyScroll);
      window.removeEventListener('touchmove', vyhodnotZachytenyScroll);
      window.removeEventListener('scroll', spustiKontroluStavu);
      if (activeScrollTargetRef.current) {
        activeScrollTargetRef.current.removeEventListener('scroll', spustiKontroluStavu);
      }
    };
  }, [currentView, webRefreshKey]);

  const scrollToTop = () => {
    if (activeScrollTargetRef.current) {
      activeScrollTargetRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getWebSideFlex = () => { 
    if (isMobile) return '1 0 100%'; 
    return isLeftPanelOpen ? '0 0 55%' : '0 0 75%'; 
  }; 

  const getAppSideFlex = () => { 
    if (isMobile) return '1 0 100%'; 
    return '0 0 25%'; 
  }; 

  return ( 
    <div className="master-container bg-dashboard" style={{ overflow: 'hidden' }}> 
       
      <button 
        className="btn-panel-toggle" 
        onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          fontWeight: 'normal',
          textTransform: 'none',
          fontStyle: 'normal'
        }}
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
            top: 0, left: 0, height: '100vh', zIndex: 9998, 
            transition: 'all 0.3s ease', overflowX: 'hidden', overflowY: 'auto' 
          }} 
        > 
          <div className="left-menu-wrapper"> 
            <button className={`btn-menu ${currentView === 'domov' && !soloActiveId && window.location.hash.includes('/domov') ? 'active' : ''}`} onClick={() => { window.location.hash = '/domov'; if(isMobile) setIsLeftPanelOpen(false); }}> 
              {txt.menu_home || "Domov"} 
            </button> 

            <button className={`btn-menu ${currentView === 'co-je-laria' || currentView === 'cojelaria' ? 'active' : ''}`} onClick={() => { window.location.hash = '/co-je-laria'; if(isMobile) setIsLeftPanelOpen(false); }}> 
              {txt.menu_faq || "LARIA FAQ"} 
            </button> 

            <button className={`btn-menu ${currentView === 'vizitkar' ? 'active' : ''}`} onClick={() => { window.location.hash = '/vizitkar'; if(isMobile) setIsLeftPanelOpen(false); }}> 
              {txt.menu_cards || "Vizitkár"} 
            </button> 

            <button className={`btn-menu ${currentView === 'fakturant' ? 'active' : ''}`} onClick={() => { window.location.hash = '/fakturant'; if(isMobile) setIsLeftPanelOpen(false); }}> 
              {txt.menu_fakturant || "Fakturant"} 
            </button> 

            <button className={`btn-menu ${currentView === 'free-vs-full' ? 'active' : ''}`} onClick={() => { window.location.hash = '/free-vs-full'; if(isMobile) setIsLeftPanelOpen(false); }}> 
              {txt.menu_free_vs_full || "FREE vs. FULL"} 
            </button> 

            <button className={`btn-menu ${currentView === 'donate' ? 'active' : ''}`} onClick={() => { window.location.hash = '/donate'; if(isMobile) setIsLeftPanelOpen(false); }}> 
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
          transition: 'all 0.3s ease', position: 'relative' 
        }} 
      > 
        <header className="header">  
          <h1 className="header-title">LARIA</h1> 
          <div id="status-light" className="status-indicator" style={{ background: loading ? '#333' : '#00ff00' }}></div> 
        </header> 

        <main 
          ref={scrollRef}
          className="scroll-content" 
        > 
          {currentView === 'domov' && !soloActiveId && (
            <div style={{ padding: '0 15px' }}> 
              <Aria setCurrentView={setCurrentView} /> 
            </div> 
          )}

          {currentView === 'vizitkar' && ( 
            <> 
               <div className="filter-container" style={{ padding: '0 15px', width: '100%', boxSizing: 'border-box' }}> 
                <select className="terminal-input" value={category} onChange={(e) => setCategory(e.target.value)}> 
                  <option value="vsetko">{txt.cat_all || "Všetky kategórie"}</option> 
                  <option value="obziva">{txt.cat_food || "Obživa a poživatiny"}</option> 
                  <option value="remesla">{txt.cat_crafts || "Remeslá a materiál"}</option> 
                  <option value="sluzby">{txt.cat_services || "Odborné služby"}</option> 
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
                  type="text" className="terminal-input" 
                  placeholder={txt.search_placeholder || "🔍 Hľadať..."} 
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
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
                  <p className="text-cyber" style={{ color: '#b19cd9', textAlign: 'center', width: '100%' }}> 
                    {txt.sync_matrix_msg || "[ SYNCHRONIZUJEM MATRIX ]"} 
                  </p> 
                ) : filteredData.length > 0 ? ( 
                  filteredData.map(item => ( 
                    <div  
                      key={item.fing} className="card symmetric-card"  
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
                  <p style={{ color: '#666', textAlign: 'center', width: '100%' }}>
                    {txt.no_masters_found || "Nenašli sa žiadni majstri."}
                  </p> 
                )} 
              </div> 
            </> 
          )} 

          {(currentView === 'co-je-laria' || currentView === 'cojelaria') && <CojeLaria />} 
          {currentView === 'fakturant' && <Fakturant />} 
          {currentView === 'free-vs-full' && <div style={{ padding: '0 15px' }}><FreeVsFull /></div>} 
          {currentView === 'donate' && <div style={{ padding: '0 15px' }}><Donate /></div>} 

          {showTopBtn && (
            <button 
              className="back-to-top-btn" 
              onClick={scrollToTop} 
              style={{ 
                position: 'fixed', 
                bottom: '25px', 
                right: isMobile ? '25px' : 'calc(25% + 25px)', 
                zIndex: 99999, 
                pointerEvents: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <span className="back-to-top-arrow" style={{ lineHeight: 1 }}>▲</span>
            </button>
          )}

          {isMobile && <button onClick={() => setIsAppOpen(true)} className="trigger">{txt.btn_terminal || "TERMINAL"}</button>} 
        </main> 
      </div> 

      {/* 3. APPKY PANEL */} 
      <div  
        className="app-side" 
        style={{ 
          flex: getAppSideFlex(), width: isMobile ? '100%' : '25%', 
          position: isMobile ? 'fixed' : 'relative', right: 0, top: 0, height: '100vh', 
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', zIndex: 1,
          display: isMobile && !isAppOpen ? 'none' : 'block'
        }} 
      > 
        {isMobile && <button onClick={() => setIsAppOpen(false)} className="trigger">{txt.btn_web || "WEB"}</button>} 
        <div className="app-container" style={{ height: '100%' }}> 
          <App triggerWebRefresh={triggerWebRefresh} /> 
        </div> 
      </div> 

      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#0a0a0a',
          border: '1px solid #c5a059',
          color: '#c5a059',
          padding: '12px 24px',
          borderRadius: '4px',
          zIndex: 999999,
          fontFamily: "Courier New, Courier, monospace",
          fontSize: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.85)',
          textAlign: 'center',
          letterSpacing: '1px',
          whiteSpace: 'nowrap',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          {toastMessage}
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