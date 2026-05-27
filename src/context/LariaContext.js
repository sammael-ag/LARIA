import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
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
  const [lang, setLang] = useState('sk'); // Predvolený základ
  
  // Do slovníka natlačíme tvoj lokálny vzor_sk ako základnú kotvu.
  // 'en' necháme zatiaľ prázdny, pretože ten si neskôr docucne celý JSON z Gsheets bunky.
  const [dictionary, setDictionary] = useState({
    'sk': vzorSk, 
    'en': {} 
  });

  // Inteligentný prekladový nástroj, ktorý vstrekneme do celej aplikácie
  const t = (key) => {
    // Pozrie sa do zvoleného jazyka, ak kľúč chýba, vráti slovenský vzor, ak zlyhá aj ten, vráti samotný kľúč
    return dictionary[lang]?.[key] || dictionary['sk']?.[key] || key;
  };

  // --- ✨ ŠTRUKTÚRA PODĽA ZÁKONA v8.0 (SECURE_ID Odpojené) ---
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

  // --- 1. INICIALIZÁCIA MATRIXU (S podporou pre Linux/Electron) ---
  useEffect(() => {
    const initializeVault = async () => {
      try {
        let savedIdentity = await loadFromVault('identity');
        let aktivnyJazyk = 'sk'; // Predvolený základ bezpečnosti
        
        // 🌟 JAZYKOVÉ JADRO: Ak nájdeme v trezore uložený jazyk, okamžite ho zachytíme
        if (savedIdentity && savedIdentity.jazyk) {
          aktivnyJazyk = savedIdentity.jazyk;
          setLang(aktivnyJazyk);
          console.log(`🌲 JAZYKOVÉ JADRO: Prebúdzam uložený jazyk z trezoru: [${aktivnyJazyk}]`);
        } else {
          // Ak v trezore nič nie je, pozrieme sa na systémovú automatiku prehliadača
          aktivnyJazyk = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'sk';
          setLang(aktivnyJazyk);
          console.log(`🌲 JAZYKOVÉ JADRO: Žiadny uložený jazyk, štartujem na automatike systému: [${aktivnyJazyk}]`);
        }

        // --- 🤖 MULTIDIMENZIONÁLNA IDENTIFIKÁCIA ZARIADENIA A VÝPOČET FING ---
        let rawDeviceId;
        if (Platform.OS === 'android') {
          rawDeviceId = Application.androidId || Device.osBuildId || "S_DEVICE_A";
        } else if (Platform.OS === 'ios') {
          rawDeviceId = await Application.getIosIdForVendorAsync();
        } else {
          // Generujeme stabilné ID z mena zariadenia a systémových parametrov
          rawDeviceId = `LINUX-${Device.deviceName || 'HP-LAPTOP'}-${Device.osBuildId || 'SAM-CORE'}`;
        }

        // Generujeme SHA a hlavný FING (odtlačok prsta) pred volaním prekladov
        const currentSha = generatePureSHA(rawDeviceId, savedIdentity?.meno || "Sammael");
        const currentFing = currentSha.substring(0, 12);

        // --- 🔥 ASYNCHRÓNNY CYKLUS AUTOMATIZÁCIE JAZYKOV ---
        if (aktivnyJazyk !== 'sk') {
          console.log(`📡 JAZYKOVÉ JADRO: Detegovaný externý lúč [${aktivnyJazyk}] pre FING [${currentFing}], volám Matrix...`);
          
          // 🔥 TU JE ZMENA: Posielame jazyk AJ tvoj vypočítaný FING, aby ho skript v tabuľke vedel spracovať a uložiť!
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

  // Funkcia na zmenu jazyka za pochodu z hociktorej obrazovky s uložením do trezoru
  const zmenJazykZaPochodu = async (novyJazyk) => {
    setLang(novyJazyk);
    try {
      const aktualnaIdentita = { ...vault.identity };
      aktualnaIdentita.jazyk = novyJazyk;
      
      await saveToVault('identity', aktualnaIdentita);

      // --- 📡 MOSTÍK DO NEVIDITEĽNEJ DIMENZIE (PWA SW Port) ---
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
      console.error("❌ JAZYKOVÉ JADRO_ERROR (Zápis jazyka zlyhal):", error);
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
      lang,                  // <--- Posielame von aktuálny jazyk
      t,                     // <--- Posielame von prekladový motor
      zmenJazykZaPochodu,     // <--- Posielame von funkciu na prepínanie
      setDictionary
    }}>
      {children}
    </LariaContext.Provider>
  );
};

export const useLaria = () => useContext(LariaContext);