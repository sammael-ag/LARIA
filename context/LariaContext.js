import React, { createContext, useState, useContext, useEffect } from 'react';
import { runLariaProtocol, saveToVault, loadFromVault } from '../src/services/LariaLogic';

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
      tel: null,
      fb: null,
      tg: null,
      gal: null,
      Gtab: null,
      revo: null,    // Revolut handle (@meno)
      kRod: null,    // Rodový kľúč / IBAN
      krypt: null    // Krypto adresa (Base / Coinbase)
    }
  });

  // 1. OŽIVENIE PRI ŠTARTE
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

  // 2. HLAVNÁ SYNCHRONIZÁCIA
  const syncIdentity = async (newIdentityData) => {
    const updatedIdentity = { ...vault.identity, ...newIdentityData };
    
    // Protokol prepočíta statusy na základe nových dát
    const newStatus = runLariaProtocol(updatedIdentity);
    
    setVault({
      status: newStatus,
      identity: updatedIdentity
    });
    
    await saveToVault('identity', updatedIdentity);
  };

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