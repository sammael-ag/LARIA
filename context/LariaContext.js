import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device'; 
// Importujeme protokol a náš nový mlynček na SHA
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
      deviceId: null, // Toto ostane v pamäti len počas inicializácie
      sha: null,      // TOTO bude tvoja nová verejná tvár
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

  // --- 1. INICIALIZÁCIA MATRIXU (S HASH RIGOROM) ---
  useEffect(() => {
    const initializeVault = async () => {
      try {
        // 1. Načítanie existujúcej identity z trezoru
        let savedIdentity = await loadFromVault('identity');
        
        // 2. Získanie unikátneho "surového" odtlačku zariadenia (len pre výpočet)
        let rawDeviceId = null;
        if (Platform.OS === 'android') {
          rawDeviceId = Application.androidId || Device.osBuildId || "S_DEVICE_A";
        } else if (Platform.OS === 'ios') {
          rawDeviceId = await Application.getIosIdForVendorAsync();
        }

        // 3. ALCHÝMIA: Vygenerujeme SHA z deviceId
        // Ak užívateľ nemá meno, použijeme Sammael ako základ
        const currentSha = generatePureSHA(rawDeviceId, savedIdentity?.name || "Sammael");

        if (!savedIdentity) {
          // PRVOVÝSTUP: Ak je kufor prázdny
          savedIdentity = { 
            ...vault.identity,
            name: "Sammael",
            sha: currentSha // Zapíšeme vygenerovaný Hash
          };
        } else {
          // AKTUALIZÁCIA: Ak sa zmenilo zariadenie, prepočíta sa SHA
          savedIdentity.sha = currentSha;
        }

        // 4. PROTOKOL: Výpočet statusov (tu sa rozhodne, či si Admin)
        const updatedStatus = runLariaProtocol(savedIdentity);
        
        // 5. ZÁPIS DO STAVU: Všimni si, že deviceId sem už ani neposielame!
        setVault({
          status: updatedStatus,
          identity: savedIdentity
        });

        // 6. ARCHÍV: Uložíme čistú identitu s Hashom do mobilu
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