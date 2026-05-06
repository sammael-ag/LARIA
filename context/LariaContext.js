import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device'; 
import { ethers } from 'ethers';
import { runLariaProtocol, saveToVault, loadFromVault, generatePureSHA } from '../src/services/LariaLogic';
import { useKrypto } from './KryptoContext';

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

  // --- ✨ ŠTRUKTÚRA PODĽA ZÁKONA O PREMENNÝCH ---
  const [vault, setVault] = useState({
    status: { 
      isOnline: false, isIrcOnline: false, hasNFC: false, 
      isParanoid: false, isGoogleFull: false, isChainNode: false, isAdmin: false 
    },
    identity: { 
      SECURE_ID: null, 
      sha: null, 
      meno: "Sammael", // Pôvodne name
      kat: "Majster",  // Pôvodne kategoria/cat
      lok: "Rákoš",    // Pôvodne lokalita
      popis: "", 
      tel: "", 
      email: "", 
      fb: "", 
      tg: "", 
      gal: "", 
      isPublic: false, 
      irc: "", 
      poznamka: "", 
      krypt: null,     // Pôvodne walletAddress/wallet
      privateKey: null 
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
        
        let rawDeviceId = Platform.OS === 'android' 
          ? (Application.androidId || Device.osBuildId || "S_DEVICE_A") 
          : await Application.getIosIdForVendorAsync();

        // Generujeme SHA (Naše posvätné ID)
        const currentSha = generatePureSHA(rawDeviceId, savedIdentity?.meno || "Sammael");

        if (!savedIdentity) {
          savedIdentity = { 
            ...vault.identity, 
            sha: currentSha, 
            SECURE_ID: currentSha // Na začiatku je SECURE_ID rovné SHA
          };
        } else {
          savedIdentity.sha = currentSha;
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
      const updatedIdentity = { ...vault.identity, krypt: newWallet.address, privateKey: newWallet.privateKey };
      await syncIdentity(updatedIdentity);
      setTimeout(() => onboardNewUser(newWallet.address), 2000);
      return newWallet.address;
    }
    return null;
  };

  const syncIdentity = async (newIdentityData) => {
    const currentAdminStatus = vault.status.isAdmin;
    const updatedIdentity = { ...vault.identity, ...newIdentityData };
    const newStatus = runLariaProtocol(updatedIdentity, currentAdminStatus);
    setVault({ status: newStatus, identity: updatedIdentity });
    await saveToVault('identity', updatedIdentity);
  };

  // Ostatné funkcie zostávajú...
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
      vault, syncIdentity, unlockSeal, lockSeal, ensureLariaIdentity, reinkarnaciaIdentity 
    }}>
      {children}
    </LariaContext.Provider>
  );
};

export const useLaria = () => useContext(LariaContext);