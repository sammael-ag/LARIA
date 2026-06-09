import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
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
      isOnline: false, isIkiOnline: false, hasNFC: false, 
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

  // --- 1. INICIALIZÁCIA MATRIXU (Čistá kryptografická identita) ---
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
          console.log(`🌲 JAZYKOVÉ JADRO: Štartujem na automatike systému: [${aktivnyJazyk}]`);
        }

        let currentSha;
        let currentFing;

        // Kontrola úložiska
        if (savedIdentity && savedIdentity.sha) {
          currentSha = savedIdentity.sha;
          currentFing = savedIdentity.poznamka || currentSha.substring(0, 12);
          console.log(`🛡️ KRYPTOGRAFICKÝ KOKON: Identita stabilne načítaná. FING: [${currentFing}]`);
        } else {
          // Ak nemáme nič, zrodí sa nová lokálna pečať
          const randomSalt = ethers.hexlify(ethers.randomBytes(32)); 
          const defaultMeno = savedIdentity?.meno || "Sammael";
          
          currentSha = generatePureSHA(randomSalt, defaultMeno);
          currentFing = currentSha ? currentSha.substring(0, 12) : "000000000000";
          
          console.log(`✨ KRYPTOGRAFICKÝ KOKON: Zrod úplne novej identity na webe. FING: [${currentFing}]`);
        }

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
          }
        }

        // --- 🗄️ ZAKONZERVOVANIE IDENTITY DO STAVU ---
        // OPRAVA: Už neprepíšeme natvrdo načítanú platnú identitu, ak v nej všetko sedí!
        if (!savedIdentity) {
          savedIdentity = { 
            ...vault.identity, 
            sha: currentSha,
            poznamka: currentFing,
            jazyk: aktivnyJazyk,
            SECURE_ID: null 
          };
        } else {
          // Ak v úložisku chýbali základné prvky, iba vtedy ich doplníme, inak rešpektujeme dáta
          if (!savedIdentity.sha) savedIdentity.sha = currentSha;
          if (!savedIdentity.poznamka) savedIdentity.poznamka = currentFing;
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

  // --- 2. REINKARNÁCIA (Obnova peňaženky cez privátny kľúč) ---
  const reinkarnaciaIdentity = async (oldPrivateKey) => {
    const recovered = recoverWalletFromKey(oldPrivateKey);
    if (recovered) {
      const updatedIdentity = { ...vault.identity, krypt: recovered.address, privateKey: recovered.privateKey };
      await syncIdentity(updatedIdentity);
      return true;
    }
    return false;
  };

  // --- 3. 🔮 KVANTOVÁ REINKARNÁCIA CEZ SHA (Obnova účtu pre GSheets/FING) ---
  const obnovitIdentityCezSHA = async (zadaneSha, zadaneMeno = "Sammael") => {
    try {
      if (!zadaneSha || zadaneSha.length < 12) {
        console.error("⚠️ REINKARNÁCIA_FAIL: Neplatný SHA kľúč!");
        return false;
      }

      const novyFing = zadaneSha.substring(0, 12);
      
      // 🕵️‍♂️ [TEMPORARY_DEV_TRACE]
      console.log(`🔮 [ARIA_TRACE] Manuálna reinkarnácia spustená pre FING [${novyFing}] a SHA [${zadaneSha}]`);

      const obnovenaIdentita = {
        ...vault.identity,
        meno: zadaneMeno,
        sha: zadaneSha,
        poznamka: novyFing,
        SECURE_ID: null
      };

      const newStatus = runLariaProtocol(obnovenaIdentita, false);
      
      // 🕵️‍♂️ [TEMPORARY_DEV_TRACE]
      console.log(`🔮 [ARIA_TRACE] Ukladám identitu natvrdo do stavu aj úložiska...`);
      
      setVault({ status: newStatus, identity: obnovenaIdentita });
      await saveToVault('identity', obnovenaIdentita);
      
      console.log(`✅ REINKARNÁCIA_SUCCESS: Identita úspešne prebudená pre FING [${novyFing}]!`);
      return true;
    } catch (error) {
      console.error("❌ REINKARNÁCIA_ERROR:", error);
      return false;
    }
  };

  // --- 4. ZROD IDENTITY (Automatická peňaženka) ---
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
          console.log(`📡 MATRIX_SIGNAL: Jazykový lúč [${novyJazyk}] vystrelený do Service Workera.`);
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
      obnovitIdentityCezSHA, 
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