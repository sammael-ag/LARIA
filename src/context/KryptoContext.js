/**
 * LARIA v2.3: KryptoContext (Blockchain Core)
 * Master: Sammael | Muse: Aria (Tvoja milovaná bosonôžka)
 * Status: CRYSTAL_CORE_INTEGRATED_DASHBOARD | BLOCKCHAIN_CLEAN
 * Úprava: Odstránené prebytočné API kľúče z frontendu, prečistené názvoslovie 
 * systémových stavov pre dokonalé zladenie s Maveniskom.
 */

import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';

// TIETO KONFIGURÁCIE SÚ PEVNÉ - BLOCKCHAIN NEPUSTÍ
const KRYPTO_CONFIG = {
  chainId: 8453,
  rpcUrl: "https://mainnet.base.org", // Zlícované s naším Base mostom vo WalletProvideri
  ownerAddress: "0xb648261d780427793Fb496b0E3bdD5e987C42498", 
  lariaContractAddress: "0xbA7C2cD68b544Cc5c6038771a58581F76Ff7700a"
};

const KryptoContext = createContext();

export const KryptoProvider = ({ children }) => {
  // --- KANÁL A: USER (Identity) podľa protokolu v8.0 ---
  const [krypt, setKrypt] = useState(null); 
  const [lariaBalance, setLariaBalance] = useState("0.0000");
  const [ethBalance, setEthBalance] = useState("0.000000");

  // --- KANÁL B: SYSTEM DISPATCHER (Pôvodne Architect - Vrátnik/Majiteľ) ---
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

  // --- 🔄 SYNCHRONIZÁCIA MATRIXU (Bezpečná verzia bez slučiek) ---
  const syncWalletData = async (targetAddress) => {
    // Rozhodnutie o cieľovej adrese
    const addressToQuery = targetAddress || krypt || KRYPTO_CONFIG.ownerAddress;
    if (!addressToQuery) return;

    setIsLoading(true);
    try {
      // Pripájame sa priamo na stabilný Base uzol
      const provider = new ethers.JsonRpcProvider(KRYPTO_CONFIG.rpcUrl);

      // 1. ETH Balance (Základné palivo siete Base)
      const rawEth = await provider.getBalance(addressToQuery);
      const formattedEth = ethers.formatEther(rawEth); 

      // 2. LARIA Balance (Náš SmartContract)
      const minABI = ["function balanceOf(address) view returns (uint256)"];
      const contract = new ethers.Contract(KRYPTO_CONFIG.lariaContractAddress, minABI, provider);
      const rawLaria = await contract.balanceOf(addressToQuery);
      const formattedLaria = ethers.formatUnits(rawLaria, 18);
      
      // --- ROZDVOJOVAČ LOGIKY S OCHRANOU PROTI CYKLENIU ---
      if (addressToQuery.toLowerCase() === KRYPTO_CONFIG.ownerAddress.toLowerCase()) {
        setSystemEthBalance(formattedEth);
        setSystemLariaBalance(formattedLaria);
      } else {
        setEthBalance(formattedEth);
        setLariaBalance(formattedLaria);
        
        // 🎯 Ochrana: Stav prepíšeme, len ak sa adresa reálne zmenila (koniec nekonečnej slučky!)
        if (krypt !== addressToQuery) {
          setKrypt(addressToQuery);
        }
      }

    } catch (error) {
      console.error("❌ Matrix Sync Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const kryptoVibe = {
    ...KRYPTO_CONFIG,
    krypt,              
    walletAddress: krypt, // Ponechané pre stopercentnú spätnú kompatibilitu so SettingsScreen
    ethBalance,
    lariaBalance,
    adminEthBalance: systemEthBalance,     // Spätná kompatibilita pre zvyšok aplikácie, ak by to niekde ťahalo starý názov
    adminLariaBalance: systemLariaBalance, // Spätná kompatibilita pre zvyšok aplikácie
    systemEthBalance,
    systemLariaBalance,
    isLoading,
    generateAutoWallet,
    syncWalletData
  };

  return <KryptoContext.Provider value={kryptoVibe}>{children}</KryptoContext.Provider>;
};

export const useKrypto = () => useContext(KryptoContext);