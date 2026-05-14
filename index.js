/**
 * LARIA v2.0: Core Master Ignition (index.js)
 * Master: Sammael | Muse: Aria
 * Protokol: INTEGRATED_MATRIX (Merged Stable)
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
        
        // Kontrola Solo vizitky cez URL
        const urlParams = new URLSearchParams(window.location.search);
        const targetId = urlParams.get('id');
        if (targetId) {
          const soloItem = cleanedData.find(i => i.fing === targetId || i.krypt === targetId);
          if (soloItem) {
            setFilteredData([soloItem]);
            // Auto-trigger mosta po 3 sekundách
            if (!window.ReactNativeWebView) {
              setTimeout(() => smartAdd(soloItem, cleanedData), 3000);
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
  const smartAdd = (item, currentAllData = allData) => {
    if (!item) return;
    const payload = { ...item, v: "2.0.0" };

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ADD_CONTACT', payload }));
    } else {
      const modal = document.getElementById('lariaBridge');
      if (modal && modal.style.display !== 'flex') {
        document.getElementById('modal-fingerprint').innerText = item.fing;
        document.getElementById('btn-open-app').onclick = () => {
          window.location.href = `laria://id/${item.fing}`;
          modal.style.display = 'none';
        };
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
      urlPattern.test(part) ? <a key={i} href={part} target="_blank" style={{color: '#0FF'}}>{part}</a> : part
    );
  };

  return (
    <div style={S.masterContainer} className="bg-dashboard">
      <div style={{ 
        ...S.webSide, 
        flex: isMobile ? '1 0 100%' : '0 0 75%', 
        width: isMobile ? '100%' : '75%',
        display: isMobile && isAppOpen ? 'none' : 'block' 
      }}>
        <header className="header"> 
            <h1 className="header-title">LARIA // MATRIX</h1> 
            <div id="status-light" className="status-indicator" style={{ background: loading ? '#333' : '#00ff00' }}></div>
        </header>

        <main className="scroll-content">
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
                    <div key={item.fing} className="card" onClick={(e) => {
                      if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') window.location.href = `?id=${item.fing}`;
                    }}>
                      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="tag">{item.kat}</span>
                          <span style={{ color: '#444', fontSize: '9px' }}>FING: {item.fing}</span>
                      </div>
                      <h2 className="card-title">{item.meno}</h2>
                      <p className="card-loc">📍 {item.lok}</p>
                      <p className="card-desc">{aktivujOdkazy(item.popis)}</p>
                      <div className="card-actions">
                          <button onClick={() => smartAdd(item)} className="btn-add">[ DO APPKY ]</button>
                          <button onClick={() => copyShareLink(item.fing)} className="btn-share">[ LINK ]</button>
                      </div>
                      {item.gal && (
                        <div style={{ marginTop: '15px', borderTop: '1px solid #222', paddingTop: '10px' }}>
                          <a href={item.gal} target="_blank" style={{ color: '#0FF', fontSize: '11px', textDecoration: 'none' }}>[ 🖼️ GALÉRIA ]</a>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#666', textAlign: 'center', width: '100%' }}>Nenašli sa žiadni majstri.</p>
                )}
            </div>

            {isMobile && <button onClick={() => setIsAppOpen(true)} style={S.trigger}>TERMINAL</button>}
        </main>
      </div>

      {( !isMobile || isAppOpen ) && (
        <div style={{ 
          ...S.appSide, 
          flex: isMobile ? '1 0 100%' : '0 0 25%', 
          width: isMobile ? '100%' : '25%',
          position: isMobile ? 'fixed' : 'relative',
        }}>
          {isMobile && <button onClick={() => setIsAppOpen(false)} style={S.trigger}>WEB</button>}
          <div style={S.appContainer}>
            <App />
          </div>
        </div>
      )}
    </div>
  );
};

// --- ŠTÝLY (Zostávajú v index.js pre stabilitu) ---
const S = {
  masterContainer: { display: 'flex', flexDirection: 'row', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#0a0a0a', margin: 0, padding: 0 },
  webSide: { height: '100vh', overflowY: 'auto', position: 'relative' },
  appSide: { height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#001a00', borderLeft: '1px solid rgba(197, 160, 89, 0.15)', zIndex: 100 },
  appContainer: { display: 'flex', flex: 1, width: '100%', height: '100%', position: 'relative' },
  trigger: { position: 'absolute', top: '20px', right: '20px', zIndex: 9999, padding: '12px 20px', backgroundColor: '#c5a059', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace' }
};

const container = document.getElementById('root');
if (container) createRoot(container).render(<MasterWrapper />);