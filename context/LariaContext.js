import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device'; 
import { ethers } from 'ethers'; // Potrebné pre Vratníka
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
      walletAddress: null,
      privateKey: null,
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

  // --- 🔥 VRATNÍK: ONBOARDING PROTOKOL (0.001 LARIA) ---
  const onboardNewUser = async (newUserAddress) => {
    try {
      console.log("🛠️ VRATNÍK: Štartujem distribúciu pre:", newUserAddress);
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Načítanie kľúča z .env
      const architectKey = process.env.PRIVATE_KEY || process.env.EXPO_PUBLIC_PRIVATE_KEY;

      if (!architectKey) {
        console.error("⚠️ VRATNÍK_ERROR: Chýba PRIVATE_KEY v .env súbore!");
        return;
      }

      const architectWallet = new ethers.Wallet(architectKey, provider);
      const minABI = ["function transfer(address to, uint256 amount) returns (bool)"];
      const contract = new ethers.Contract(lariaContractAddress, minABI, architectWallet);

      const amount = ethers.parseUnits("0.001", 18);
      const tx = await contract.transfer(newUserAddress, amount);
      console.log("🚀 VRATNÍK: Transakcia odoslaná:", tx.hash);
      
      await tx.wait();
      console.log("✅ VRATNÍK: 0.001 LARIA doručených!");
      
      await syncWalletData(newUserAddress);
      await syncWalletData(ownerAddress);
    } catch (error) {
      console.error("❌ VRATNÍK_ERROR:", error.message);
    }
  };

  // --- 1. INICIALIZÁCIA MATRIXU ---
  useEffect(() => {
    const initializeVault = async () => {
      try {
        let savedIdentity = await loadFromVault('identity');
        const hasSeal = false; 
        
        let rawDeviceId = Platform.OS === 'android' 
          ? (Application.androidId || Device.osBuildId || "S_DEVICE_A") 
          : await Application.getIosIdForVendorAsync();

        const currentSha = generatePureSHA(rawDeviceId, savedIdentity?.name || "Sammael");

        if (!savedIdentity) {
          savedIdentity = { ...vault.identity, name: "Sammael", sha: currentSha };
        } else {
          savedIdentity.sha = currentSha;
        }

        const updatedStatus = runLariaProtocol(savedIdentity, hasSeal);
        setVault({ status: updatedStatus, identity: savedIdentity });

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

  // --- 2. REINKARNÁCIA ---
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

  // --- 3. ZROD IDENTITY (S AKTIVÁCIOU VRATNÍKA) ---
  const ensureLariaIdentity = async () => {
    if (vault.identity.walletAddress) return vault.identity.walletAddress;

    const newWallet = await generateAutoWallet();
    if (newWallet) {
      const updatedIdentity = { 
        ...vault.identity, 
        walletAddress: newWallet.address,
        privateKey: newWallet.privateKey 
      };
      await syncIdentity(updatedIdentity);
      
      // Onboarding s oneskorením, aby blockchain stihol spracovať adresu
      setTimeout(() => {
        onboardNewUser(newWallet.address);
      }, 2000);

      return newWallet.address;
    }
    return null;
  };

  // --- OSTATNÉ FUNKCIE ---
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

  // Tvoja dôležitá funkcia, ktorá predtým chýbala:
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
      ensureLariaIdentity, 
      reinkarnaciaIdentity 
    }}>
      {children}
    </LariaContext.Provider>
  );
};

export const useLaria = () => useContext(LariaContext);