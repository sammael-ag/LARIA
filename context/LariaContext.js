import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device'; 
import { runLariaProtocol, saveToVault, loadFromVault, generatePureSHA } from '../src/services/LariaLogic';
import { useKrypto } from './KryptoContext'; // Importujeme čokoládu

const LariaContext = createContext();

export const LariaProvider = ({ children }) => {
  const { generateAutoWallet, recoverWalletFromKey, syncWalletData } = useKrypto();
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
      walletAddress: null, // Tu budeme mať adresu
      privateKey: null,    // Tu schováme kľúč (v Encrypted Vault)
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
        let savedIdentity = await loadFromVault('identity');
        const hasSeal = false; 
        
        let rawDeviceId = null;
        if (Platform.OS === 'android') {
          rawDeviceId = Application.androidId || Device.osBuildId || "S_DEVICE_A";
        } else if (Platform.OS === 'ios') {
          rawDeviceId = await Application.getIosIdForVendorAsync();
        }

        const currentSha = generatePureSHA(rawDeviceId, savedIdentity?.name || "Sammael");

        if (!savedIdentity) {
          savedIdentity = { ...vault.identity, name: "Sammael", sha: currentSha };
        } else {
          savedIdentity.sha = currentSha;
        }

        const updatedStatus = runLariaProtocol(savedIdentity, hasSeal);
        setVault({ status: updatedStatus, identity: savedIdentity });

        // Ak už peňaženku máme, rovno ju skúsime "nacítiť" na blockchaine
        if (savedIdentity.walletAddress) {
          syncWalletData(savedIdentity.walletAddress);
        }

        await saveToVault('identity', savedIdentity);
      } catch (error) {
        console.error("Laria Initialization Error:", error);
      }
    };
    initializeVault();
  }, []);

  // --- 2. MOŽNOSŤ: OBNOVA STARÉHO ÚČTU (Reinkarnácia) ---
  const reinkarnaciaIdentity = async (oldPrivateKey) => {
    const recovered = recoverWalletFromKey(oldPrivateKey);
    if (recovered) {
      const updatedIdentity = { 
        ...vault.identity, 
        walletAddress: recovered.address,
        privateKey: recovered.privateKey 
      };
      await syncIdentity(updatedIdentity);
      await syncWalletData(recovered.address);
      return true;
    }
    return false;
  };

  // --- 3. MOŽNOSŤ: ZROD NOVEJ IDENTITY (AutoWallet) ---
  const ensureLariaIdentity = async () => {
    // Ak už adresu máme, nerobíme nič
    if (vault.identity.walletAddress) return vault.identity.walletAddress;

    const newWallet = await generateAutoWallet();
    if (newWallet) {
      const updatedIdentity = { 
        ...vault.identity, 
        walletAddress: newWallet.address,
        privateKey: newWallet.privateKey 
      };
      await syncIdentity(updatedIdentity);
      // Tu v budúcnu zavoláme tvoj Gtab, aby "minti" 0.0001 LARIA
      await syncWalletData(newWallet.address);
      return newWallet.address;
    }
    return null;
  };

  // --- OSTATNÉ FUNKCIE (unlock, lock, update...) ---
  const unlockSeal = async (isCorrect) => {
    if (isCorrect) {
      const newStatus = runLariaProtocol(vault.identity, true);
      setVault(prev => ({ ...prev, status: newStatus }));
      return true;
    }
    return false;
  };

  const lockSeal = () => {
    const newStatus = runLariaProtocol(vault.identity, false);
    setVault(prev => ({ ...prev, status: newStatus }));
  };

  const syncIdentity = async (newIdentityData) => {
    const currentAdminStatus = vault.status.isAdmin;
    const updatedIdentity = { ...vault.identity, ...newIdentityData };
    const newStatus = runLariaProtocol(updatedIdentity, currentAdminStatus);
    
    setVault({ status: newStatus, identity: updatedIdentity });
    await saveToVault('identity', updatedIdentity);
  };

  const updateVault = (category, data) => {
    setVault(prev => ({ ...prev, [category]: { ...prev[category], ...data } }));
  };

  return (
    <LariaContext.Provider value={{ 
      vault, 
      syncIdentity, 
      updateVault, 
      unlockSeal, 
      lockSeal, 
      ensureLariaIdentity, // Nová jahôdka
      reinkarnaciaIdentity  // Nový šaman
    }}>
      {children}
    </LariaContext.Provider>
  );
};

export const useLaria = () => useContext(LariaContext);