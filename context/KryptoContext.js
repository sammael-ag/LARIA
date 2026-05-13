import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';

// TIETO KONFIGURÁCIE SÚ PEVNÉ - BLOCKCHAIN NEPUSTÍ
const KRYPTO_CONFIG = {
  apiKey: "R6h9kbHCWY2GxHhhQTgpMmY9mw4R7nGM", 
  projectId: "98074637-80ee-4f12-8f5e-f186a388d2da", 
  chainId: 8453,
  rpcUrl: "https://mainnet.base.org",
  ownerAddress: "0xb648261d780427793Fb496b0E3bdD5e987C42498", 
  lariaContractAddress: "0xbA7C2cD68b544Cc5c6038771a58581F76Ff7700a"
};

const KryptoContext = createContext();

export const KryptoProvider = ({ children }) => {
  // --- KANÁL A: USER (Identity) podľa protokolu v8.0 ---
  const [krypt, setKrypt] = useState(null); // Premapované z walletAddress
  const [lariaBalance, setLariaBalance] = useState("0");
  const [ethBalance, setEthBalance] = useState("0.0000");

  // --- KANÁL B: ARCHITECT (Vrátnik/Majiteľ) ---
  const [adminLariaBalance, setAdminLariaBalance] = useState("0");
  const [adminEthBalance, setAdminEthBalance] = useState("0.0000");

  const [isLoading, setIsLoading] = useState(false);

  // --- 🍫 ZROD IDENTITY (Generovanie peňaženky) ---
  const generateAutoWallet = async () => {
    try {
      const newWallet = ethers.Wallet.createRandom();
      return {
        address: newWallet.address,     // Toto pôjde do nášho 'krypt'
        privateKey: newWallet.privateKey,
        mnemonic: newWallet.mnemonic?.phrase
      };
    } catch (error) {
      console.error("CHYBA_PRI_PÔRODE:", error);
      return null;
    }
  };

  // --- 🔄 SYNCHRONIZÁCIA MATRIXU (S premapovaním) ---
  const syncWalletData = async (targetAddress) => {
    // Ak targetAddress nie je zadaná, použijeme naše 'krypt', inak majiteľa
    const addressToQuery = targetAddress || krypt || KRYPTO_CONFIG.ownerAddress;
    if (!addressToQuery) return;

    setIsLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider(KRYPTO_CONFIG.rpcUrl);

      // 1. ETH Balance (Základné palivo siete Base)
      const rawEth = await provider.getBalance(addressToQuery);
      const formattedEth = parseFloat(ethers.formatEther(rawEth)).toFixed(6);

      // 2. LARIA Balance (Náš SmartContract)
      const minABI = ["function balanceOf(address) view returns (uint256)"];
      const contract = new ethers.Contract(KRYPTO_CONFIG.lariaContractAddress, minABI, provider);
      const rawLaria = await contract.balanceOf(addressToQuery);
      const formattedLaria = ethers.formatUnits(rawLaria, 18);
      
      // --- ROZDVOJOVAČ LOGIKY ---
      if (addressToQuery.toLowerCase() === KRYPTO_CONFIG.ownerAddress.toLowerCase()) {
        setAdminEthBalance(formattedEth);
        setAdminLariaBalance(formattedLaria);
      } else {
        setEthBalance(formattedEth);
        setLariaBalance(formattedLaria);
        setKrypt(addressToQuery); // Zapisujeme do 'krypt' podľa protokolu
      }

    } catch (error) {
      console.error("Matrix Sync Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const kryptoVibe = {
    ...KRYPTO_CONFIG,
    krypt,              // Exportujeme už pod novým názvom
    walletAddress: krypt, // Ponechané ako tieň pre kompatibilitu so SmartContract volaniami
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