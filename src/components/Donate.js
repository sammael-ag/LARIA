import React from 'react';

const Donate = () => {
  return (
    <div className="card symmetric-card" style={{ width: '100%', maxWidth: 'none', margin: '0 auto', borderLeft: '4px solid #cc0000' }}>
      <div className="card-main-layout">
        <div className="card-left-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span className="tag" style={{ background: '#cc0000', color: '#fff' }}>WEB3</span>
            <h2 className="card-title" style={{ margin: 0, fontSize: '1.4em', color: '#cc0000' }}>DECENTRALIZED SUPPORT</h2>
          </div>
          <p className="card-loc" style={{ marginTop: '8px', marginBottom: 0 }}>📍 Krypto-brána do budúcna</p>
        </div>
      </div>
      
      <div className="card-description-block" style={{ marginTop: '15px' }}>
        <p className="card-desc" style={{ margin: 0, color: '#8c8c82' }}>
          Táto zóna bude napojená priamo na Smart Contracts. Naša krypto-krivka zo slidu úspechu začína presne tu! Synchronizácia peňaženiek a podpora systému sú vo fáze mechanických príprav.
        </p>
      </div>
    </div>
  );
};

export default Donate;