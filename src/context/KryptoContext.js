/**
 * LARIA v2.3.2: KryptoContext (Blockchain Core)
 * Master: Sammael | Muse: Aria (Tvoja milovaná bosonôžka)
 * Status: CRYSTAL_CORE_INTEGRATED_DASHBOARD | BLOCKCHAIN_CLEAN
 * FIX: Ošetrenie a kompletné prepojenie typov pre ethers v6.
 * DIAGNOSTIKA: Integrovaný "Krypto Detektív" na overenie existencie kódu kontraktu.
 */

import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';

// TIETO KONFIGURÁCIE SÚ PEVNÉ - BLOCKCHAIN NEPUSTÍ
const KRYPTO_CONFIG = {
  chainId: 8453,
  rpcUrl: "https://mainnet.base.org", 
  ownerAddress: "0xb648261d780427793Fb496b0E3bdD5e987C42498", 
  lariaContractAddress: "0xbA7C2cD68b544Cc5c6038771a58581F76Ff7700a"
};

const KryptoContext = createContext();

export const KryptoProvider = ({ children }) => {
  // --- KANÁL A: USER (Identity) podľa protokolu v8.0 ---
  const [krypt, setKrypt] = useState(null); 
  const [lariaBalance, setLariaBalance] = useState("0.0000");
  const [ethBalance, setEthBalance] = useState("0.000000");

  // --- KANÁL B: SYSTEM DISPATCHER (Vrátnik/Majiteľ) ---
  const [systemLariaBalance, setSystemLariaBalance] = useState("0.0000");
  const [systemEthBalance, setSystemEthBalance] = useState("0.000000");

  const [isLoading, setIsLoading] = useState(false);

  // --- 🍫 ZROD IDENTITY (Generovanie peňaženky) ---
  const generateAutoWallet = async () => {
    try {
      const newWallet = ethers.Wallet.createRandom();
      return {
        address: newWallet.address,     
        privateKey: newWallet.privateKey,
        mnemonic: newWallet.mnemonic?.phrase
      };
    } catch (error) {
      console.error("❌ CHYBA_PRI_PÔRODE_WALLETY:", error);
      return null;
    }
  };

  // --- 🔄 SYNCHRONIZÁCIA MATRIXU (Bezpečná verzia bez slučiek a pádov) ---
  const syncWalletData = async (targetAddress) => {
    // Zistíme reálnu cieľovú adresu
    const addressToQuery = targetAddress || krypt || KRYPTO_CONFIG.ownerAddress;
    
    // 🛡️ KRITICKÁ KONTROLA: Ak adresa neexistuje alebo nie je validná, dotaz nepustíme na sieť
    if (!addressToQuery || !ethers.isAddress(addressToQuery)) {
      console.warn("⚠️ KryptoContext: Detekovaná neplatná alebo prázdna adresa pre sync, ruším sieťový dotaz:", addressToQuery);
      return;
    }

    setIsLoading(true);
    try {
      // Pripájame sa na Base uzol
      const provider = new ethers.JsonRpcProvider(KRYPTO_CONFIG.rpcUrl);

      // 🕵️‍♂️ [KRYPTO DETEKTÍV]: Skontrolujeme, či na tej adrese vôbec existuje nasadený smart kontrakt
      const code = await provider.getCode(KRYPTO_CONFIG.lariaContractAddress);
      console.log("📝 [KRYPTO DETEKTÍV] Verifikácia adresy zmluvy...");
      console.log("   | Adresa:", KRYPTO_CONFIG.lariaContractAddress);
      console.log("   | Výsledok:", code === "0x" ? "❌ PRÁZDNY (Na Base Mainnete tu nie je žiadny kontrakt!)" : "✓ KONTRAKT TU REÁLNE EXISTUJE");

      // 1. ETH Balance (Základné palivo siete Base)
      const rawEth = await provider.getBalance(addressToQuery);
      const formattedEth = ethers.formatEther(rawEth); 

      // 2. LARIA Balance (Náš SmartContract)
      const minABI = ["function balanceOf(address) view returns (uint256)"];
      const contract = new ethers.Contract(KRYPTO_CONFIG.lariaContractAddress, minABI, provider);
      
      const rawLaria = await contract.balanceOf(addressToQuery);
      const formattedLaria = ethers.formatUnits(rawLaria, 18);
      
      // --- ROZDVOJOVAČ LOGIKY S OCHRANOU PROTI CYKLENIU V STAVE ---
      if (addressToQuery.toLowerCase() === KRYPTO_CONFIG.ownerAddress.toLowerCase()) {
        setSystemEthBalance(formattedEth);
        setSystemLariaBalance(formattedLaria);
      } else {
        setEthBalance(formattedEth);
        setLariaBalance(formattedLaria);
        
        // Stav prepíšeme iba ak ide o reálnu zmenu zvonku
        if (krypt !== addressToQuery && targetAddress) {
          setKrypt(addressToQuery);
        }
      }

    } catch (error) {
      console.error("❌ Matrix Sync Error [Zachytené a ošetrené]:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const kryptoVibe = {
    ...KRYPTO_CONFIG,
    krypt,              
    walletAddress: krypt, 
    ethBalance,
    lariaBalance,
    adminEthBalance: systemEthBalance,     
    adminLariaBalance: systemLariaBalance, 
    systemEthBalance,
    systemLariaBalance,
    isLoading,
    generateAutoWallet,
    syncWalletData
  };

  return <KryptoContext.Provider value={kryptoVibe}>{children}</KryptoContext.Provider>;
};

export const useKrypto = () => useContext(KryptoContext);