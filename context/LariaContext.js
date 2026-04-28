import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device'; 
import { runLariaProtocol, saveToVault, loadFromVault, generatePureSHA } from '../src/services/LariaLogic';

const LariaContext = createContext();

export const LariaProvider = ({ children }) => {
  const [vault, setVault] = useState({
    status: {
      isOnline: false,
      isIrcOnline: false, 
      hasNFC: false,
      isParanoid: false,
      isGoogleFull: false,
      isChainNode: false,
      isAdmin: false 
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
      revo: null,
      kRod: null,
      krypt: null 
    }
  });

  // --- 1. INICIALIZÁCIA MATRIXU (Očistená od starej pečate) ---
  useEffect(() => {
    const initializeVault = async () => {
      try {
        let savedIdentity = await loadFromVault('identity');
        
        // ARCHITEKTOVA ZMENA: 
        // Už nečítame 'architect_seal' z loadFromVault. 
        // Pri každom štarte aplikácie začínaš ako bežný užívateľ (false).
        const hasSeal = false; 
        
        let rawDeviceId = null;
        if (Platform.OS === 'android') {
          rawDeviceId = Application.androidId || Device.osBuildId || "S_DEVICE_A";
        } else if (Platform.OS === 'ios') {
          rawDeviceId = await Application.getIosIdForVendorAsync();
        }

        const currentSha = generatePureSHA(rawDeviceId, savedIdentity?.name || "Sammael");

        if (!savedIdentity) {
          savedIdentity = { 
            ...vault.identity,
            name: "Sammael",
            sha: currentSha 
          };
        } else {
          savedIdentity.sha = currentSha;
        }

        // Protokol teraz vždy vyhodnotí isAdmin na false pri štarte
        const updatedStatus = runLariaProtocol(savedIdentity, hasSeal);
        
        setVault({
          status: updatedStatus,
          identity: savedIdentity
        });

        await saveToVault('identity', savedIdentity);
        
      } catch (error) {
        console.error("Laria Initialization Error:", error);
      }
    };

    initializeVault();
  }, []);

  // --- 2. ODOMKNUTIE ARCHITEKTOVEJ PEČATE (Iba v RAM) ---
  const unlockSeal = async (isCorrect) => {
    if (isCorrect) {
      // ARCHITEKTOVA ZMENA: 
      // Úplne sme vynechali saveToVault('architect_seal', true).
      // Prístup sa nikde nezapisuje na disk, žije len v tomto stave (setVault).
      const newStatus = runLariaProtocol(vault.identity, true);
      setVault(prev => ({
        ...prev,
        status: newStatus
      }));
      return true;
    }
    return false;
  };

  // --- 3. UZAMKNUTIE ARCHITEKTOVEJ PEČATE (Logout z RAM) ---
  const lockSeal = () => {
    const newStatus = runLariaProtocol(vault.identity, false);
    setVault(prev => ({
      ...prev,
      status: newStatus
    }));
  };

  // --- 4. SYNCHRONIZÁCIA IDENTITY ---
  const syncIdentity = async (newIdentityData) => {
    // Pri synch zachovávame súčasný stav isAdmin z pamäte
    const currentAdminStatus = vault.status.isAdmin;
    const updatedIdentity = { ...vault.identity, ...newIdentityData };
    const newStatus = runLariaProtocol(updatedIdentity, currentAdminStatus);
    
    setVault({ 
      status: newStatus, 
      identity: updatedIdentity 
    });
    
    await saveToVault('identity', updatedIdentity);
  };

  // --- 5. AKTUALIZÁCIA TREZORU ---
  const updateVault = (category, data) => {
    setVault(prev => ({
      ...prev,
      [category]: { ...prev[category], ...data }
    }));
  };

  return (
    <LariaContext.Provider value={{ vault, syncIdentity, updateVault, unlockSeal, lockSeal }}>
      {children}
    </LariaContext.Provider>
  );
};

export const useLaria = () => useContext(LariaContext);