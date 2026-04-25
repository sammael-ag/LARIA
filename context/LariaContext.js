import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device'; 
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
      isChainNode: false,
      isAdmin: false 
    },
    identity: {
      name: "Sammael",
      deviceId: null,
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

  // --- 1. INICIALIZÁCIA MATRIXU ---
  useEffect(() => {
    const initializeVault = async () => {
      try {
        // Načítanie existujúcej identity z trezoru
        let savedIdentity = await loadFromVault('identity');
        
        // Získanie unikátneho odtlačku zariadenia
        let currentDeviceId = null;
        if (Platform.OS === 'android') {
          currentDeviceId = Application.androidId || Device.osBuildId || "S_DEVICE_A";
        } else if (Platform.OS === 'ios') {
          currentDeviceId = await Application.getIosIdForVendorAsync();
        }

        // Ak je trezor prázdny, vytvoríme nový základ pre Sammaela
        if (!savedIdentity) {
          savedIdentity = { 
            ...vault.identity,
            name: "Sammael",
            deviceId: currentDeviceId
          };
        } else {
          // Vždy aktualizujeme deviceId pre prípad zmeny
          savedIdentity.deviceId = currentDeviceId;
        }

        // Spustenie protokolu LARIA - výpočet statusov a oprávnení
        const updatedStatus = runLariaProtocol(savedIdentity);
        
        setVault({
          status: updatedStatus,
          identity: savedIdentity
        });

        // Tichý zápis do trezoru
        await saveToVault('identity', savedIdentity);
        
      } catch (error) {
        console.error("Laria Initialization Error:", error);
      }
    };

    initializeVault();
  }, []);

  // --- 2. SYNCHRONIZÁCIA IDENTITY ---
  const syncIdentity = async (newIdentityData) => {
    const updatedIdentity = { ...vault.identity, ...newIdentityData };
    const newStatus = runLariaProtocol(updatedIdentity);
    
    setVault({ 
      status: newStatus, 
      identity: updatedIdentity 
    });
    
    await saveToVault('identity', updatedIdentity);
  };

  // --- 3. AKTUALIZÁCIA TREZORU ---
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