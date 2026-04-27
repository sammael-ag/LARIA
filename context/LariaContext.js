import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device'; 
// Importujeme protokol a alchymistické nástroje z LariaLogic
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

  // --- 1. INICIALIZÁCIA MATRIXU (S ARCHITEKTOVOU PEČAŤOU) ---
  useEffect(() => {
    const initializeVault = async () => {
      try {
        // A. Načítanie existujúcej identity z trezoru
        let savedIdentity = await loadFromVault('identity');
        
        // B. Načítanie Architektovej pečate (či už bolo niekedy zadané slovo moci)
        const hasSeal = await loadFromVault('architect_seal');
        
        // C. Získanie unikátneho odtlačku zariadenia pre výpočet SHA
        let rawDeviceId = null;
        if (Platform.OS === 'android') {
          rawDeviceId = Application.androidId || Device.osBuildId || "S_DEVICE_A";
        } else if (Platform.OS === 'ios') {
          rawDeviceId = await Application.getIosIdForVendorAsync();
        }

        // D. ALCHÝMIA: Vygenerujeme aktuálne SHA
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

        // E. PROTOKOL: Výpočet statusov (Dvojitý zámok: SHA + Pečať)
        const updatedStatus = runLariaProtocol(savedIdentity, hasSeal === true);
        
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

  // --- 2. ODOMKNUTIE ARCHITEKTOVEJ PEČATE ---
  // Táto funkcia sa zavolá, keď úspešne prejde overenie "Slova moci"
  const unlockSeal = async (isCorrect) => {
    if (isCorrect) {
      // Zapíšeme pečať do fyzickej pamäte mobilu
      await saveToVault('architect_seal', true);
      
      // Okamžitý update stavu v pamäti appky, aby sa Admin Panel hneď zjavil
      const newStatus = runLariaProtocol(vault.identity, true);
      setVault(prev => ({
        ...prev,
        status: newStatus
      }));
      return true;
    }
    return false;
  };

  // --- 3. SYNCHRONIZÁCIA IDENTITY ---
  const syncIdentity = async (newIdentityData) => {
    // Pri synch sa musíme znova pozrieť, či máme pečať
    const hasSeal = await loadFromVault('architect_seal');
    const updatedIdentity = { ...vault.identity, ...newIdentityData };
    const newStatus = runLariaProtocol(updatedIdentity, hasSeal === true);
    
    setVault({ 
      status: newStatus, 
      identity: updatedIdentity 
    });
    
    await saveToVault('identity', updatedIdentity);
  };

  // --- 4. AKTUALIZÁCIA TREZORU ---
  const updateVault = (category, data) => {
    setVault(prev => ({
      ...prev,
      [category]: { ...prev[category], ...data }
    }));
  };

  return (
    <LariaContext.Provider value={{ vault, syncIdentity, updateVault, unlockSeal }}>
      {children}
    </LariaContext.Provider>
  );
};

export const useLaria = () => useContext(LariaContext);