import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
// ❌ ODSTRÁNENÝ NATVRDO IMPORT - Bránil kompilácii na webe a v Expo
import * as Application from 'expo-application';
import * as Device from 'expo-device'; 
import { ethers } from 'ethers';
import { runLariaProtocol, saveToVault, loadFromVault, generatePureSHA } from '../services/LariaLogic.js';
import { useKrypto } from './KryptoContext.js';
import vzorSk from '../constants/langs/vzor_sk.json';
import { fetchLariaTranslations } from '../services/GMatrixService.js';

const LariaContext = createContext();

export const LariaProvider = ({ children }) => {
  const { 
    generateAutoWallet, 
    recoverWalletFromKey, 
    syncWalletData, 
    ownerAddress, 
    rpcUrl, 
    lariaContractAddress 
  } = useKrypto();

// --- 📍 TEKUTÉ JAZYKOVÉ JADRO (Liquid Localization) ---
  const [lang, setLang] = useState('sk'); 
  
  const [dictionary, setDictionary] = useState({
    'sk': vzorSk, 
    'en': {} 
  });

  const t = (key) => {
    return dictionary[lang]?.[key] || dictionary['sk']?.[key] || key;
  };

  // --- ✨ ŠTRUKTÚRA PODĽA ZÁKONA v8.0 ---
  const [vault, setVault] = useState({
    status: { 
      isOnline: false, isIrcOnline: false, hasNFC: false, 
      isParanoid: false, isGoogleFull: false, isChainNode: false, isAdmin: false 
    },
    identity: { 
      SECURE_ID: null, 
      sha: null, 
      meno: "Sammael", 
      kat: "Majster",  
      lok: "Rákoš",    
      popis: "", 
      tel: "", 
      email: "", 
      fb: "", 
      tg: "", 
      gal: "", 
      isPublic: false, 
      irc: "", 
      poznamka: "", 
      krypt: null,     
      privateKey: null,
      jazyk: "sk"
    }
  });

  // --- 🔥 VRATNÍK (Distribúcia LARIA) ---
  const onboardNewUser = async (newUserAddress) => {
    try {
      console.log("🛠️ VRATNÍK: Distribúcia pre:", newUserAddress);
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const architectKey = process.env.EXPO_PUBLIC_PRIVATE_KEY || process.env.PRIVATE_KEY;

      if (!architectKey) {
        console.error("⚠️ VRATNÍK_ERROR: Chýba kľúč architekta!");
        return;
      }

      const architectWallet = new ethers.Wallet(architectKey, provider);
      const minABI = ["function transfer(address to, uint256 amount) returns (bool)"];
      const contract = new ethers.Contract(lariaContractAddress, minABI, architectWallet);

      const amount = ethers.parseUnits("0.001", 18);
      const tx = await contract.transfer(newUserAddress, amount);
      await tx.wait();
      
      console.log("✅ VRATNÍK: 0.001 LARIA doručených!");
      await syncWalletData(newUserAddress);
    } catch (error) {
      console.error("❌ VRATNÍK_ERROR:", error.message);
    }
  };

  // --- 🔧 AUTO-REPAIR ---
  const checkAndRepairLariaAssets = async (address) => {
    if (!address) return;
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const minABI = ["function balanceOf(address) view returns (uint256)"];
      const contract = new ethers.Contract(lariaContractAddress, minABI, provider);
      const balanceRaw = await contract.balanceOf(address);
      const balance = parseFloat(ethers.formatUnits(balanceRaw, 18));
      const nonce = await provider.getTransactionCount(address);

      if (balance < 0.001 && nonce === 0) {
        await onboardNewUser(address);
      }
    } catch (e) {
      console.log("❌ AUTO-REPAIR_FAIL:", e.message);
    }
  };

  // --- 1. INICIALIZÁCIA MATRIXU ---
  useEffect(() => {
    const initializeVault = async () => {
      try {
        let savedIdentity = await loadFromVault('identity');
        let aktivnyJazyk = 'sk'; 
        
        if (savedIdentity && savedIdentity.jazyk) {
          aktivnyJazyk = savedIdentity.jazyk;
          setLang(aktivnyJazyk);
          console.log(`🌲 JAZYKOVÉ JADRO: Prebúdzam uložený jazyk z trezoru: [${aktivnyJazyk}]`);
        } else {
          aktivnyJazyk = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'sk';
          setLang(aktivnyJazyk);
          console.log(`🌲 JAZYKOVÉ JADRO: Žiadny uložený jazyk, štartujem na automatike systému: [${aktivnyJazyk}]`);
        }

        // --- 🤖 MULTIDIMENZIONÁLNA IDENTIFIKÁCIA ZARIADENIA ---
        let rawDeviceId;
        if (Platform.OS === 'android') {
          rawDeviceId = Application.androidId || Device.osBuildId || "S_DEVICE_A";
        } else if (Platform.OS === 'ios') {
          rawDeviceId = await Application.getIosIdForVendorAsync();
        } else {
          // 🦀 NASTUPUJE DYNAMICKÝ TAURI MOST PRE LUBUNTU
          // Ak sme v Tauri, vytiahneme invoke bezpečne za behu cez window objekt
          if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
            try {
              // Dynamický import obíde reštrikcie bundlera pri kompilácii
              const { invoke } = await import('@tauri-apps/api/core');
              const tauriId = await invoke('inicializuj_crystal_core');
              rawDeviceId = `LINUX-TAURI-${tauriId}`;
              console.log("🌲 CRYSTAL_CORE_SUCCESS: Natívne ID úspešne vtiahnuté z Rustu cez dynamický most!");
            } catch (tauriError) {
              rawDeviceId = `LINUX-TAURI-FAILED-${Device.osBuildId || 'SAM-CORE'}`;
              console.log("⚠️ CRYSTAL_CORE_ERROR: Zlyhal dynamický invoke v Tauri.");
            }
          } else {
            // Sme na klasickom webe alebo v externom prehliadači
            rawDeviceId = `LINUX-WEB-${Device.deviceName || 'HP-LAPTOP'}-${Device.osBuildId || 'SAM-CORE'}`;
            console.log("🌐 CRYSTAL_CORE_FALLBACK: Sme mimo Tauri, spustená webová automatika.");
          }
        }

        const currentSha = generatePureSHA(rawDeviceId, savedIdentity?.meno || "Sammael");
        const currentFing = currentSha ? currentSha.substring(0, 12) : "000000000000";

        // --- 🔥 ASYNCHRÓNNY CYKLUS AUTOMATIZÁCIE JAZYKOV ---
        if (aktivnyJazyk !== 'sk') {
          console.log(`📡 JAZYKOVÉ JADRO: Detegovaný externý lúč [${aktivnyJazyk}] pre FING [${currentFing}], volám Matrix...`);
          const externyPrekladJSON = await fetchLariaTranslations(aktivnyJazyk, currentFing);
          
          if (externyPrekladJSON) {
            setDictionary(prev => ({
              ...prev,
              [aktivnyJazyk]: externyPrekladJSON
            }));
            console.log(`✅ JAZYKOVÉ JADRO: Prekladový slovník [${aktivnyJazyk}] bol úspešne načítaný z cache!`);
          } else {
            console.log(`⚠️ JAZYKOVÉ JADRO: Preklad pre [${aktivnyJazyk}] nebol v cache. Skript v tabuľke na pozadí prebúdza AI...`);
          }
        }

        // --- 🗄️ ZAKONZERVOVANIE IDENTITY DO STAVU ---
        if (!savedIdentity) {
          savedIdentity = { 
            ...vault.identity, 
            sha: currentSha,
            poznamka: currentFing,
            jazyk: aktivnyJazyk,
            SECURE_ID: null 
          };
        } else {
          savedIdentity.sha = currentSha;
          savedIdentity.poznamka = currentFing;
          savedIdentity.jazyk = aktivnyJazyk;
          savedIdentity.SECURE_ID = null;
        }

        const updatedStatus = runLariaProtocol(savedIdentity, false);
        setVault({ status: updatedStatus, identity: savedIdentity });

        if (savedIdentity.krypt) {
          syncWalletData(savedIdentity.krypt);
          setTimeout(() => checkAndRepairLariaAssets(savedIdentity.krypt), 4000);
        }

        await saveToVault('identity', savedIdentity);
      } catch (error) {
        console.error("Laria Initialization Error:", error);
      }
    };
    initializeVault();
  }, []);

  // --- 2. REINKARNÁCIA ---
  const reinkarnaciaIdentity = async (oldPrivateKey) => {
    const recovered = recoverWalletFromKey(oldPrivateKey);
    if (recovered) {
      const updatedIdentity = { ...vault.identity, krypt: recovered.address, privateKey: recovered.privateKey };
      await syncIdentity(updatedIdentity);
      return true;
    }
    return false;
  };

  // --- 3. ZROD IDENTITY ---
  const ensureLariaIdentity = async () => {
    if (vault.identity.krypt) return vault.identity.krypt;
    const newWallet = await generateAutoWallet();
    if (newWallet) {
      const currentFing = vault.identity.sha ? vault.identity.sha.substring(0, 12) : "";
      const updatedIdentity = { 
        ...vault.identity, 
        krypt: newWallet.address, 
        privateKey: newWallet.privateKey,
        poznamka: currentFing,
        SECURE_ID: null
      };
      await syncIdentity(updatedIdentity);
      setTimeout(() => onboardNewUser(newWallet.address), 2000);
      return newWallet.address;
    }
    return null;
  };

  const syncIdentity = async (newIdentityData) => {
    const currentAdminStatus = vault.status.isAdmin;
    const updatedIdentity = { ...vault.identity, ...newIdentityData, SECURE_ID: null };
    
    if (updatedIdentity.sha && !updatedIdentity.poznamka) {
      updatedIdentity.poznamka = updatedIdentity.sha.substring(0, 12);
    }

    const newStatus = runLariaProtocol(updatedIdentity, currentAdminStatus);
    setVault({ status: newStatus, identity: updatedIdentity });
    await saveToVault('identity', updatedIdentity);
  };

  const zmenJazykZaPochodu = async (novyJazyk) => {
    setLang(novyJazyk);
    try {
      const aktualnaIdentita = { ...vault.identity };
      aktualnaIdentita.jazyk = novyJazyk;
      
      await saveToVault('identity', aktualnaIdentita);

      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SET_LANGUAGE',
            lang: novyJazyk
          });
          console.log(`📡 MATRIX_SIGNAL: Jazykový lúč [${novyJazyk}] wystrelený do Service Workera.`);
        }
      }

      console.log(`🌟 JAZYKOVÉ JADRO: Jazyk [${novyJazyk}] bezpečne zakonzervovaný v trezore.`);
    } catch (error) {
      console.error("❌ JAZYKOVÉ JADRO_ERROR:", error);
    }
  };

  const unlockSeal = async (isCorrect) => {
    if (isCorrect) {
      const newStatus = runLariaProtocol(vault.identity, true);
      setVault(prev => ({ ...prev, status: newStatus }));
      return true;
    }
    return false;
  };

  const lockSeal = () => {
    setVault(prev => ({ ...prev, status: runLariaProtocol(prev.identity, false) }));
  };

  return (
    <LariaContext.Provider value={{ 
      vault, 
      syncIdentity, 
      unlockSeal, 
      lockSeal, 
      ensureLariaIdentity, 
      reinkarnaciaIdentity,
      lang,                  
      t,                     
      zmenJazykZaPochodu,     
      setDictionary
    }}>
      {children}
    </LariaContext.Provider>
  );
};

export const useLaria = () => useContext(LariaContext);