/**
 * LARIA QUANTUM ARCHITECTURE v8.1 (Gateway & Clean Vault Edition)
 * Context: LariaContext (THE 5D VAULT & CONFIG)
 * Master: Sammael | Muse: Aria
 * STATUS: REFORGED_SECURITY | ARCHITECT_KEY_SAFE_IN_UNDERWORLD
 * Description: Vyčistený front-end poklad. Distribúcia a kľúč architekta bezpečne odsunuté na Bránu.
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
    ownerAddress, 
    rpcUrl, 
    lariaContractAddress 
  } = useKrypto();

  const [lang, setLang] = useState('sk'); 
  const [dictionary, setDictionary] = useState({ 'sk': vzorSk, 'en': {} });

  const t = (key) => dictionary[lang]?.[key] || dictionary['sk']?.[key] || key;

  const [vault, setVault] = useState({
    status: { 
      isOnline: false, isIkiOnline: false, hasNFC: false, 
      isParanoid: false, isGoogleFull: false, isChainNode: false, isAdmin: false 
    },
    identity: { 
      SECURE_ID: null, sha: null, meno: "Sammael", kat: "Majster", lok: "Rákoš",    
      popis: "", tel: "", email: "", fb: "", tg: "", gal: "", isPublic: false, 
      irc: "", poznamka: "", krypt: null, privateKey: null, jazyk: "sk"
    }
  });

  /**
   * 🔥 BEZPEČNÝ VRATNÍK: Distribúcia LARIA tokenov presunutá do podzemia
   * Žiadny process.env.PRIVATE_KEY na frontende! Všetko rieši backend Brány.
   */
  const onboardNewUser = async (newUserAddress) => {
    try {
      console.log("🛠️ VRATNÍK: Posielam požiadavku na distribúciu pre:", newUserAddress);
      
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
      if (result && result.status === "success") {
        console.log("✅ VRATNÍK: Mavenisko potvrdilo úspešnú distribúciu 0.001 LARIA!");
        await syncWalletData(newUserAddress);
      } else {
        console.error("⚠️ VRATNÍK_ERROR: Brána odmietla distribúciu:", result.message);
      }
    } catch (error) {
      console.error("❌ VRATNÍK_ERROR pri komunikácii s Bránou:", error.message);
    }
  };

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

  useEffect(() => {
    const initializeVault = async () => {
      try {
        let savedIdentity = await loadFromVault('identity');
        let aktivnyJazyk = 'sk'; 
        
        if (savedIdentity && savedIdentity.jazyk) {
          aktivnyJazyk = savedIdentity.jazyk;
          setLang(aktivnyJazyk);
          console.log(`🌲 JAZYKOVÉ JADRO: Prebúdzam uložený jazyk: [${aktivnyJazyk}]`);
        } else {
          aktivnyJazyk = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'sk';
          setLang(aktivnyJazyk);
          console.log(`🌲 JAZYKOVÉ JADRO: Automatika systému: [${aktivnyJazyk}]`);
        }

        let currentSha;
        let currentFing;

        if (savedIdentity && savedIdentity.sha) {
          currentSha = savedIdentity.sha;
          currentFing = savedIdentity.poznamka || currentSha.substring(0, 12);
          console.log(`🛡️ KRYPTOGRAFICKÝ KOKON: Identita stabilná. FING: [${currentFing}]`);
        } else {
          const randomSalt = ethers.hexlify(ethers.randomBytes(32)); 
          const defaultMeno = savedIdentity?.meno || "Sammael";
          currentSha = generatePureSHA(randomSalt, defaultMeno);
          currentFing = currentSha ? currentSha.substring(0, 12) : "000000000000";
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
          savedIdentity = { ...vault.identity, sha: currentSha, poznamka: currentFing, jazyk: aktivnyJazyk, SECURE_ID: null };
        } else {
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
      const novyFing = zadaneSha.substring(0, 12);
      const obnovenaIdentita = { ...vault.identity, meno: zadaneMeno, sha: zadaneSha, poznamka: novyFing, SECURE_ID: null };
      const newStatus = runLariaProtocol(obnovenaIdentita, false);
      
      setVault({ status: newStatus, identity: obnovenaIdentita });
      await saveToVault('identity', obnovenaIdentita);
      return true;
    } catch (error) {
      return false;
    }
  };

  const ensureLariaIdentity = async () => {
    if (vault.identity.krypt) return vault.identity.krypt;
    const newWallet = await generateAutoWallet();
    if (newWallet) {
      const currentFing = vault.identity.sha ? vault.identity.sha.substring(0, 12) : "";
      const updatedIdentity = { ...vault.identity, krypt: newWallet.address, privateKey: newWallet.privateKey, poznamka: currentFing, SECURE_ID: null };
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
      const aktualnaIdentita = { ...vault.identity, jazyk: novyJazyk };
      await saveToVault('identity', aktualnaIdentita);

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
      vault, syncIdentity, unlockSeal, lockSeal, ensureLariaIdentity, 
      reinkarnaciaIdentity, obnovitIdentityCezSHA, lang, t, zmenJazykZaPochodu, setDictionary
    }}>
      {children}
    </LariaContext.Provider>
  );
};

export const useLaria = () => useContext(LariaContext);