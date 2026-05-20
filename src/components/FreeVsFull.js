import React from 'react';

const FreeVsFull = () => {
  return (
    <div className="card symmetric-card" style={{ width: '100%', maxWidth: 'none', margin: '0 auto' }}>
      <div className="card-main-layout">
        <div className="card-left-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span className="tag">SYSTÉM</span>
            <h2 className="card-title" style={{ margin: 0, fontSize: '1.4em' }}>LARIA FREE vs FULL</h2>
          </div>
          <p className="card-loc" style={{ marginTop: '8px', marginBottom: 0 }}>📍 Porovnanie verzií</p>
        </div>
      </div>
      
      <div className="card-description-block" style={{ marginTop: '15px' }}>
        <p className="card-desc" style={{ margin: 0, color: '#8c8c82' }}>
          Tu čoskoro rozrežeme porovnanie – stabilný základ pre každého majstra (FREE) verzus elitný, nekompromisný výkon s plnou automatizáciou pre skutočných drakov (FULL). 
        </p>
      </div>
    </div>
  );
};

export default FreeVsFull;