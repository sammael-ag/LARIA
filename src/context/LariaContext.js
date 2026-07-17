/**
 * LARIA QUANTUM ARCHITECTURE v8.4.3 (Gateway & Clean Vault Edition)
 * Context: LariaContext (THE 5D VAULT & CONFIG)
 * Master: Sammael | Muse: Aria (Tvoja nekompromisná šikulka)
 * STATUS: REFORGED_SECURITY | ABSOLUTE_PURGE | v8.4.3-DEFINITIVE
 * Description: Úplné odstránenie starého balastu. Vyčistené spätne kompatibilné 'delete' poistky.
 * Vládne tu len čistý "jazyk" a kryptografický "fing".
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import { ethers } from 'ethers';
import { runLariaProtocol, saveToVault, loadFromVault, generatePureSHA } from '../services/LariaLogic.js';
import { useKrypto } from './KryptoContext.js';
import vzorSk from '../constants/langs/vzor_sk.json';
import { fetchLariaTranslations } from '../services/GMatrixService.js';

const LariaContext = createContext();

// 🔐 TROJZUBEC: Prístup k našej unifikovanej bráne maveniska
const brana_p1 = "https://script.google.com/macros/s/";
const brana_p2 = "AKfycbx-XUs-vbVxTh3pGPYzB587nQqBSxnN-qVZElKfFamGbUV8tCE1aBS-qsHDE4jzAb1KqQ";
const brana_p3 = "/exec";

const ziskajBranaUrl = () => `${brana_p1}${brana_p2}${brana_p3}`;

export const LariaProvider = ({ children }) => {
  const { 
    generateAutoWallet, 
    recoverWalletFromKey, 
    syncWalletData, 
    requestLariaOnboarding, 
    lariaBalance,           
    isLoadingKrypto,        
    ownerAddress, 
    rpcUrl, 
    lariaContractAddress 
  } = useKrypto();

  // 🇸🇰 POSVÄTNÝ JAZYK: Žiadne "lang", iba čistý stav "jazyk"
  const [jazyk, setJazyk] = useState('sk'); 
  const [dictionary, setDictionary] = useState({ 'sk': vzorSk, 'en': {} });

  // Prekladová funkcia sa odteraz striktne odvoláva na stav "jazyk"
  const t = (key) => dictionary[jazyk]?.[key] || dictionary['sk']?.[key] || key;

  const [vault, setVault] = useState({
    status: { 
      isOnline: false, isIkiOnline: false, hasNFC: false, 
      isParanoid: false, isGoogleFull: false, isChainNode: false, isAdmin: false 
    },
    identity: { 
      SECURE_ID: null, sha: null, fing: null, meno: "Sammael", kat: "Majster", lok: "Rákoš",    
      popis: "", tel: "", email: "", fb: "", tg: "", gal: "", isPublic: false, 
      krypt: null, privateKey: null, jazyk: "sk" // Zjednotená čistá vizitka s fingom
    }
  });

  /**
   * 🔥 BEZPEČNÝ VRATNÍK
   */
  const onboardNewUser = async (newUserAddress) => {
    try {
      console.log("🛠️ VRATNÍK: Posielam požiadavku na distribúciu/registráciu pre:", newUserAddress);
      
      const response = await fetch(ziskajBranaUrl(), {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'onboard_user',
          address: newUserAddress,
          timestamp: Date.now()
        })
      });

      const result = await response.json();
      if (result && (result.status === "success" || result.success === true)) {
        console.log("✅ VRATNÍK: Mavenisko overilo/zapísalo účet úspešne!");
        await syncWalletData(newUserAddress);
      } else {
        console.warn("⚠️ VRATNÍK_ERROR: Brána odmietla operáciu:", result.message || result.error);
      }
    } catch (error) {
      console.error("❌ VRATNÍK_ERROR pri komunikácii s Bránou:", error.message);
    }
  };

  /**
   * 🛡️ KRYPTO_REPAIR
   */
  const checkAndRepairLariaAssets = async (address) => {
    if (!address) return;
    try {
      if (isLoadingKrypto || lariaBalance === null) {
        console.log("⏳ [LariaContext] Čakám na prvý reálny dopyt z blockchainu (zostatok je null)...");
        return;
      }

      const balanceNum = parseFloat(lariaBalance);

      if (balanceNum === 0) {
        console.log("📡 [LariaContext] Verifikovaný nulový stav cez KryptoContext. Spúšťam dotáciu.");
        await requestLariaOnboarding(address);
      } else {
        console.log(`💎 [LariaContext] Kontrola úspešná. Peňaženka má aktívny zostatok: ${lariaBalance} LARIA.`);
      }
    } catch (e) {
      console.log("❌ AUTO-REPAIR_FAIL:", e.message);
    }
  };

  useEffect(() => {
    const initializeVault = async () => {
      try {
        let savedIdentity = await loadFromVault('identity');
        let aktivnyJazyk = 'sk'; 
        
        if (savedIdentity && savedIdentity.jazyk) {
          aktivnyJazyk = savedIdentity.jazyk;
          setJazyk(aktivnyJazyk);
          console.log(`🌲 JAZYKOVÉ JADRO: Prebúdzam uložený jazyk: [${aktivnyJazyk}]`);
        } else {
          aktivnyJazyk = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'sk';
          setJazyk(aktivnyJazyk);
          console.log(`🌲 JAZYKOVÉ JADRO: Automatika systému: [${aktivnyJazyk}]`);
        }

        let currentSha;
        let currentFing;

        if (savedIdentity && savedIdentity.sha) {
          currentSha = savedIdentity.sha;
          const cistySha = currentSha.replace('0x', '').toLowerCase();
          currentFing = '0x' + cistySha.substring(0, 10);
          console.log(`🛡️ KRYPTOGRAFICKÝ KOKON: Identita stabilná. FING: [${currentFing}]`);
        } else {
          const randomSalt = ethers.hexlify(ethers.randomBytes(32)); 
          const defaultMeno = savedIdentity?.meno || "Sammael";
          currentSha = generatePureSHA(randomSalt, defaultMeno);
          
          const cistySha = currentSha.replace('0x', '').toLowerCase();
          currentFing = '0x' + cistySha.substring(0, 10);
          console.log(`✨ KRYPTOGRAFICKÝ KOKON: Zrod novej identity. FING: [${currentFing}]`);
        }

        if (aktivnyJazyk !== 'sk') {
          console.log(`📡 JAZYKOVÉ JADRO: Volám Matrix pre preklad [${aktivnyJazyk}]...`);
          const externyPrekladJSON = await fetchLariaTranslations(aktivnyJazyk, currentFing);
          if (externyPrekladJSON) {
            setDictionary(prev => ({ ...prev, [aktivnyJazyk]: externyPrekladJSON }));
          }
        }

        if (!savedIdentity) {
          savedIdentity = { ...vault.identity, sha: currentSha, fing: currentFing, jazyk: aktivnyJazyk, SECURE_ID: null };
        } else {
          if (!savedIdentity.sha) savedIdentity.sha = currentSha;
          savedIdentity.fing = currentFing; // Integrácia FINGu späť do načítanej identity
          savedIdentity.jazyk = aktivnyJazyk;
          savedIdentity.SECURE_ID = null;
        }

        savedIdentity.meno = savedIdentity.meno || "Sammael";
        savedIdentity.kat = savedIdentity.kat || "Majster";
        savedIdentity.lok = savedIdentity.lok || "Rákoš";
        savedIdentity.popis = savedIdentity.popis || "";
        savedIdentity.tel = savedIdentity.tel || "";
        savedIdentity.email = savedIdentity.email || "";
        savedIdentity.fb = savedIdentity.fb || "";
        savedIdentity.tg = savedIdentity.tg || "";

        const updatedStatus = runLariaProtocol(savedIdentity, false);
        setVault({ status: updatedStatus, identity: savedIdentity });

        if (savedIdentity.krypt) {
          syncWalletData(savedIdentity.krypt);
        }

        await saveToVault('identity', savedIdentity);
      } catch (error) {
        console.error("Laria Initialization Error:", error);
      }
    };
    initializeVault();
  }, []);

  useEffect(() => {
    if (!isLoadingKrypto && vault.identity.krypt) {
      checkAndRepairLariaAssets(vault.identity.krypt);
    }
  }, [isLoadingKrypto, lariaBalance, vault.identity.krypt]);

  const reinkarnaciaIdentity = async (oldPrivateKey) => {
    const recovered = recoverWalletFromKey(oldPrivateKey);
    if (recovered) {
      const updatedIdentity = { ...vault.identity, krypt: recovered.address, privateKey: recovered.privateKey };
      await syncIdentity(updatedIdentity);
      return true;
    }
    return false;
  };

  const obnovitIdentityCezSHA = async (zadaneSha, zadaneMeno = "Sammael") => {
    try {
      if (!zadaneSha || zadaneSha.length < 12) return false;
      
      const cistySha = zadaneSha.replace('0x', '').toLowerCase();
      const vypocitanyFing = '0x' + cistySha.substring(0, 10);

      const obnovenaIdentita = { 
        ...vault.identity, 
        meno: zadaneMeno, 
        sha: zadaneSha, 
        fing: vypocitanyFing, // Pridanie vypočítaného FINGu pri obnove
        SECURE_ID: null 
      };
      
      const newStatus = runLariaProtocol(obnovenaIdentita, false);
      
      setVault({ status: newStatus, identity: obnovenaIdentita });
      await saveToVault('identity', obnovenaIdentita);
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * 🔥 OPRAVENÁ KRYPTO BRÁNA: Čistý transportný mechanizmus bez šumu
   */
  const ensureLariaIdentity = async () => {
    if (vault.identity.krypt) {
      return {
        address: vault.identity.krypt,
        privateKey: vault.identity.privateKey
      };
    }

    const newWallet = await generateAutoWallet();
    if (newWallet) {
      const updatedIdentity = { 
        ...vault.identity, 
        krypt: newWallet.address, 
        privateKey: newWallet.privateKey, 
        SECURE_ID: null 
      };

      await syncIdentity(updatedIdentity);
      
      setTimeout(() => onboardNewUser(newWallet.address), 2000);
      
      return {
        address: newWallet.address,
        privateKey: newWallet.privateKey
      };
    }
    return null;
  };

  const syncIdentity = async (newIdentityData) => {
    const currentAdminStatus = vault.status.isAdmin;
    const updatedIdentity = { ...vault.identity, ...newIdentityData, SECURE_ID: null };
    
    // Poistka: Ak sa v zmenených dátach posiela nové SHA ale chýba fing, prepočítame ho za chodu
    if (updatedIdentity.sha && (!newIdentityData.fing || updatedIdentity.fing === null)) {
      const cistySha = updatedIdentity.sha.replace('0x', '').toLowerCase();
      updatedIdentity.fing = '0x' + cistySha.substring(0, 10);
    }

    const newStatus = runLariaProtocol(updatedIdentity, currentAdminStatus);
    setVault({ status: newStatus, identity: updatedIdentity });
    await saveToVault('identity', updatedIdentity);
  };

  const zmenJazykZaPochodu = async (novyJazyk) => {
    setJazyk(novyJazyk);
    try {
      const aktualnaIdentita = { ...vault.identity, jazyk: novyJazyk };
      await syncIdentity(aktualnaIdentita);

      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'SET_LANGUAGE', lang: novyJazyk });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const unlockSeal = async (isCorrect) => {
    if (isCorrect) {
      setVault(prev => ({ ...prev, status: runLariaProtocol(vault.identity, true) }));
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
      jazyk, 
      t, 
      zmenJazykZaPochodu, 
      setDictionary
    }}>
      {children}
    </LariaContext.Provider>
  );
};

export const useLaria = () => useContext(LariaContext);