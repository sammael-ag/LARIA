import React, { createContext, useState, useContext, useEffect } from 'react';
import { runLariaProtocol, saveToVault, loadFromVault } from '../services/LariaLogic';

const LariaContext = createContext();

export const LariaProvider = ({ children }) => {
  const [vault, setVault] = useState({
    status: {
      isOnline: false,
      isIrcOnline: false, 
      hasNFC: false,
      isParanoid: false,
      isGoogleFull: false,
      isChainNode: false
    },
    identity: {
      name: "Sammael",
      sha: null,
      irc: null,
      nfc: null,
      email: null,
      gTab: null,
      tel: null,
      fb: null,
      tg: null,
      gal: null
    }
  });

  // 1. OŽIVENIE PRI ŠTARTE: Načíta dáta z mobilu hneď, ako sa appka zapne
  useEffect(() => {
    const initializeVault = async () => {
      const savedIdentity = await loadFromVault('identity');
      if (savedIdentity) {
        const newStatus = runLariaProtocol(savedIdentity);
        setVault({
          status: newStatus,
          identity: savedIdentity
        });
      }
    };
    initializeVault();
  }, []);

  // 2. HLAVNÁ SYNCHRONIZÁCIA: Toto voláme, keď pridáme nové info (napr. email alebo SHA)
  const syncIdentity = async (newIdentityData) => {
    const updatedIdentity = { ...vault.identity, ...newIdentityData };
    
    // Protokol prepočíta statusy na základe nových dát
    const newStatus = runLariaProtocol(updatedIdentity);
    
    // Uložíme do stavu appky (pre okamžitú zmenu na displeji)
    setVault({
      status: newStatus,
      identity: updatedIdentity
    });
    
    // Uložíme do pamäte mobilu (aby to tam bolo aj zajtra)
    await saveToVault('identity', updatedIdentity);
  };

  // Ponechávam aj pôvodný updateVault, keby si chcel meniť len statusy manuálne
  const updateVault = (category, data) => {
    setVault(prev => ({
      ...prev,
      [category]: { ...prev[category], ...data }
    }));
  };

  return (
    <LariaContext.Provider value={{ vault, syncIdentity, updateVault }}>
      {children}
    </LariaContext.Provider>
  );
};

export const useLaria = () => useContext(LariaContext);