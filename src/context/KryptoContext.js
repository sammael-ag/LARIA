import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';

// TIETO KONFIGURÁCIE SÚ PEVNÉ - BLOCKCHAIN NEPUSTÍ
const KRYPTO_CONFIG = {
  apiKey: "R6h9kbHCWY2GxHhhQTgpMmY9mw4R7nGM", 
  projectId: "98074637-80ee-4f12-8f5e-f186a388d2da", 
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

  // --- KANÁL B: ARCHITECT (Vrátnik/Majiteľ) ---
  const [adminLariaBalance, setAdminLariaBalance] = useState("0.0000");
  const [adminEthBalance, setAdminEthBalance] = useState("0.000000");

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
      // Pripájame sa priamo na stabilný Base uzol, ktorý máme vo WalletProvideri
      const provider = new ethers.JsonRpcProvider(KRYPTO_CONFIG.rpcUrl);

      // 1. ETH Balance (Základné palivo siete Base)
      const rawEth = await provider.getBalance(addressToQuery);
      const formattedEth = ethers.formatEther(rawEth); // Necháme čistý string z ethers

      // 2. LARIA Balance (Náš SmartContract)
      const minABI = ["function balanceOf(address) view returns (uint256)"];
      const contract = new ethers.Contract(KRYPTO_CONFIG.lariaContractAddress, minABI, provider);
      const rawLaria = await contract.balanceOf(addressToQuery);
      const formattedLaria = ethers.formatUnits(rawLaria, 18);
      
      // --- ROZDVOJOVAČ LOGIKY S OCHRANOU PROTI CYKLENIU ---
      if (addressToQuery.toLowerCase() === KRYPTO_CONFIG.ownerAddress.toLowerCase()) {
        setAdminEthBalance(formattedEth);
        setAdminLariaBalance(formattedLaria);
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
    adminEthBalance,
    adminLariaBalance,
    isLoading,
    generateAutoWallet,
    syncWalletData
  };

  return <KryptoContext.Provider value={kryptoVibe}>{children}</KryptoContext.Provider>;
};

export const useKrypto = () => useContext(KryptoContext);