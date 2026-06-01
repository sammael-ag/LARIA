import React, { useState, useEffect, useRef } from 'react';
import './fakturant.css';

const Fakturant = () => {
  // --- 🧊 STATE PRE FORMULÁR ---
  const [dodavatel, setDodavatel] = useState('');
  const [odberatel, setOdberatel] = useState('');
  const [banka, setBanka] = useState('');
  const [vs, setVs] = useState('');
  const [customVystavenie, setCustomVystavenie] = useState('');
  const [dDodania, setDDodania] = useState('');
  const [dSplatnosti, setDSplatnosti] = useState('');
  const [popis, setPopis] = useState('');
  const [kw, setKw] = useState('');
  const [suma, setSuma] = useState('');
  const [mena, setMena] = useState('EUR');

  // --- 🛠️ REŽIM ZOBRAZENIA (Editor vs Náhľad) ---
  const [viewMode, setViewMode] = useState('editor'); // 'editor' alebo 'nahlad'
  
  // --- 📋 STATE PRE ZATERMOVANÝ NÁHĽAD (Zachytený v momente kliku) ---
  const [previewData, setPreviewData] = useState({});

  const captureAreaRef = useRef(null);

  // --- 💾 NAČÍTANIE Z LOCALSTORAGE PRI ŠTARTE ---
  useEffect(() => {
    setDodavatel(localStorage.getItem('fa_dodavatel') || '');
    setBanka(localStorage.getItem('fa_banka') || '');
    setOdberatel(localStorage.getItem('fa_odberatel') || '');
    setMena(localStorage.getItem('fa_mena') || 'EUR');
  }, []);

  // --- ⚡ ŽIVÉ UKLADANIE ---
  const handleLiveSave = (field, value) => {
    if (field === 'dodavatel') { setDodavatel(value); localStorage.setItem('fa_dodavatel', value); }
    if (field === 'odberatel') { setOdberatel(value); localStorage.setItem('fa_odberatel', value); }
    if (field === 'banka') { setBanka(value); localStorage.setItem('fa_banka', value); }
    if (field === 'mena') { setMena(value); localStorage.setItem('fa_mena', value); }
  };

  // --- 🛸 AKTIVÁCIA NÁHĽADU ---
  const zobraziNahlad = () => {
    let finalVystavenie;
    if (customVystavenie) {
      const parts = customVystavenie.split("-");
      finalVystavenie = `${parts[2]}.${parts[1]}.${parts[0]}`;
    } else {
      finalVystavenie = new Date().toLocaleDateString('sk-SK');
    }

    setPreviewData({
      dodavatel,
      odberatel,
      banka,
      vs: vs ? `Faktúra číslo (VS): ${vs}` : 'Faktúra číslo (VS): ',
      vystavenie: finalVystavenie,
      dDodania,
      dSplatnosti,
      popis,
      kw,
      suma: `${suma || "0.00"} ${mena}`,
      celkom: `Celkom k úhrade: ${suma || "0.00"} ${mena}`
    });

    if (vs) {
      document.title = `Faktúra ${vs}`;
    }
    setViewMode('nahlad');
    window.scrollTo(0, 0);
    console.log("🛸 LARIA SYSTEM: Režim náhľadu aktivovaný.");
  };

  // --- ❌ ZAVRETIE NÁHĽADU ---
  const zavriNahlad = () => {
    document.title = "LARIA - Profesionálna Faktúra";
    setViewMode('editor');
    window.scrollTo(0, 0);
  };

  // --- 📋 KOPÍROVANIE TEXTU ---
  const skopirujText = () => {
    if (captureAreaRef.current) {
      navigator.clipboard.writeText(captureAreaRef.current.innerText);
      alert('Text faktúry bol skopírovaný do schránky!');
    }
  };

  return (
    <div className="fakturant-wrapper">
      
      {/* ==================== 📝 SEKCE EDITOR ==================== */}
      {viewMode === 'editor' && (
        <div id="sekcia-editor" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* HLAVNÝ NADPIS + PODNADPIS */}
            <div className="info-core-header">        
                <h2 className="info-core-title">
                Fakturant
                </h2>
            </div>

          <div className="f-pdf-preview-container">
            <table className="invoice-table">
              <tbody>
                <tr>
                  <td style={{ width: '50%' }}>
                    <label className="form-label">Dodávateľ:</label>
                    <textarea 
                      className="invoice-textarea" 
                      rows="6" 
                      value={dodavatel}
                      onChange={(e) => handleLiveSave('dodavatel', e.target.value)}
                      placeholder="Meno, Adresa, IČO, DIČ..."
                    />
                  </td>
                  <td style={{ width: '50%' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>Faktúra číslo (VS):</span>
                      <input 
                        type="text" 
                        className="invoice-input" 
                        style={{ fontWeight: 'bold', fontSize: '14px', width: '50%' }} 
                        value={vs}
                        onChange={(e) => setVs(e.target.value)}
                        placeholder="napr. 2026001"
                      />
                    </div>
                    <label className="form-label">Odberateľ:</label>
                    <textarea 
                      className="invoice-textarea" 
                      rows="4" 
                      value={odberatel}
                      onChange={(e) => handleLiveSave('odberatel', e.target.value)}
                      placeholder="Názov firmy, Adresa..."
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label className="form-label">Platobné údaje:</label>
                    <textarea 
                      className="invoice-textarea" 
                      rows="3" 
                      value={banka}
                      onChange={(e) => handleLiveSave('banka', e.target.value)}
                      placeholder={"IBAN...\nSWIFT..."}
                    />
                    <div style={{ fontSize: '11px', color: '#555', marginTop: '5px', fontWeight: 'bold' }}>Forma úhrady: Prevodný príkaz</div>
                  </td>
                  <td>
                    <table className="inner-meta-table">
                      <tbody>
                        <tr>
                          <td className="form-label" style={{ width: '55%' }}>Dátum vyhotovenia:</td>
                          <td><input type="date" className="invoice-input" value={customVystavenie} onChange={(e) => setCustomVystavenie(e.target.value)} /></td>
                        </tr>
                        <tr>
                          <td className="form-label">Dátum dodania:</td>
                          <td><input type="text" className="invoice-input" value={dDodania} onChange={(e) => setDDodania(e.target.value)} placeholder="DD.MM.RRRR" /></td>
                        </tr>
                        <tr>
                          <td className="form-label" style={{ fontWeight: 'bold' }}>Dátum splatnosti:</td>
                          <td><input type="text" className="invoice-input" style={{ fontWeight: 'bold' }} value={dSplatnosti} onChange={(e) => setDSplatnosti(e.target.value)} placeholder="DD.MM.RRRR" /></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            <table className="items-table">
              <thead>
                <tr>
                  <th>Názov položky - Popis</th>
                  <th style={{ width: '160px', textAlign: 'right' }}>Suma a mena</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div style={{ marginBottom: '10px' }}>
                      <label className="form-label">Hlavný popis prác alebo produktu:</label>
                      <input type="text" className="invoice-input" value={popis} onChange={(e) => setPopis(e.target.value)} placeholder="Stavebné a stolárske práce" />
                    </div>
                    <div>
                      <label className="form-label">Týždeň (KW):</label>
                      <input type="text" className="invoice-input" style={{ width: '100px' }} value={kw} onChange={(e) => setKw(e.target.value)} placeholder="napr. 14" />
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <label className="form-label" style={{ textAlign: 'right' }}>Suma:</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="invoice-input" 
                      style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '15px', marginBottom: '15px' }}
                      value={suma}
                      onChange={(e) => setSuma(e.target.value)}
                    />
                    
                    <label className="form-label" style={{ textAlign: 'right' }}>Mena:</label>
                    <select 
                      className="invoice-input" 
                      value={mena}
                      onChange={(e) => handleLiveSave('mena', e.target.value)}
                      style={{ textAlignLast: 'right', direction: 'rtl', fontWeight: 'bold' }}
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="k-ROD">k-ROD</option>
                      <option value="USD">USD ($)</option>
                      <option value="CZK">CZK (Kč)</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="total-block">
              Celkom k úhrade: <span style={{ color: '#000' }}>{suma || "0.00"} {mena}</span>
            </div>
          </div>

          <button className="fbtn-action" onClick={zobraziNahlad}>⬇ GENEROVAŤ FAKTÚRU</button>
        </div>
      )}

      {/* ==================== 👁️ SEKCE NÁHĽAD ==================== */}
      {viewMode === 'nahlad' && (
        <div id="sekcia-nahlad" className="sekcia-nahlad-react" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Horná ovládacia lišta */}
          <div className="preview-top-bar no-print">
            <button className="fbtn-print" onClick={() => window.print()}>🖨️ Uložiť PDF</button>
            <button className="fbtn-copy" onClick={skopirujText}>📋 Kopírovať</button>
            <button className="fbtn-close" onClick={zavriNahlad}>Zavrieť ×</button>
          </div>

          <div id="invoice-capture-area" ref={captureAreaRef} className="f-pdf-preview-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%', verticalAlign: 'top', border: '1px solid #000', padding: '10px' }}>
                    <strong style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase' }}>Dodávateľ:</strong><br />
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '13px', marginTop: '5px', lineHeight: '1.3' }}>{previewData.dodavatel}</div>
                  </td>
                  <td style={{ width: '50%', verticalAlign: 'top', border: '1px solid #000', padding: '10px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px' }}>{previewData.vs}</div>
                    <strong style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase' }}>Odberateľ:</strong><br />
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '13px', marginTop: '5px', lineHeight: '1.3' }}>{previewData.odberatel}</div>
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '10px', verticalAlign: 'top' }}>
                    <strong style={{ fontSize: '11px' }}>Platobné údaje:</strong><br />
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px', marginTop: '5px', lineHeight: '1.3' }}>{previewData.banka}</div>
                    <div style={{ fontSize: '11px', marginTop: '8px' }}>Forma úhrady: Prevodný príkaz</div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '10px', verticalAlign: 'top' }}>
                    <table style={{ width: '100%', fontSize: '12px', lineHeight: '1.5' }}>
                      <tbody>
                        <tr><td>Dátum vyhotovenia:</td><td align="right">{previewData.vystavenie}</td></tr>
                        <tr><td>Dátum dodania:</td><td align="right">{previewData.dDodania}</td></tr>
                        <tr style={{ fontWeight: 'bold' }}><td>Dátum splatnosti:</td><td align="right">{previewData.dSplatnosti}</td></tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <tbody>
                <tr style={{ background: '#f2f2f2', fontSize: '11px' }}>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Názov položky / Popis</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', width: '120px' }}>Suma</th>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '20px 10px', height: '350px', verticalAlign: 'top', fontSize: '14px' }}>
                    <span>{previewData.popis}</span>
                    {previewData.kw && (
                      <div style={{ marginTop: '5px', fontSize: '12px', color: '#555' }}>(Týždeň: KW {previewData.kw})</div>
                    )}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '20px 10px', textAlign: 'right', verticalAlign: 'top', fontSize: '15px', fontWeight: 'bold' }}>
                    <span>{previewData.suma}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: '20px', textAlign: 'right', fontSize: '18px' }}>
              <strong>{previewData.celkom}</strong>
            </div>

            <div style={{ marginTop: '40px', fontSize: '10px', color: '#333' }}>
              Dodávateľ nie je platiteľom DPH.<br />
              Dodanie je oslobodené od dane podľa zákona o DPH.
            </div>
            
            <div style={{ marginTop: '80px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '10px', fontSize: '9px', color: '#999' }}>
              Vyhotovil: LARIA SYSTEM | 2026
            </div>
          </div>
        </div>
      )}

      <div className="system-footer no-print">LARIA SYSTEM | 2026</div>
    </div>
  );
};

export default Fakturant;