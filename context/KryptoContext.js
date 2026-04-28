import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';

const KRYPTO_CONFIG = {
  apiKey: "R6h9kbHCWY2GxHhhQTgpMmY9mw4R7nGM", 
  projectId: "98074637-80ee-4f12-8f5e-f186a388d2da", 
  chainId: 8453,
  rpcUrl: "https://mainnet.base.org",
  // Pôvodný majiteľ (ako default)
  ownerAddress: "0xb648261d780427793Fb496b0E3bdD5e987C42498", 
  lariaContractAddress: "0xbA7C2cD68b544Cc5c6038771a58581F76Ff7700a"
};

const KryptoContext = createContext();

export const KryptoProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [ethBalance, setEthBalance] = useState("0.0000");
  const [lariaBalance, setLariaBalance] = useState("0"); 
  const [isLoading, setIsLoading] = useState(false);

  // --- 🍫 ČOKOLÁDOVÁ FUNKCIA: ZROD NOVEJ IDENTITY ---
  const generateAutoWallet = async () => {
    try {
      const newWallet = ethers.Wallet.createRandom();
      console.log("ZROD_IDENTITY: Nová adresa:", newWallet.address);
      return {
        address: newWallet.address,
        privateKey: newWallet.privateKey,
        mnemonic: newWallet.mnemonic?.phrase
      };
    } catch (error) {
      console.error("CHYBA_PRI_PÔRODE_IDENTITY:", error);
      return null;
    }
  };

  // --- 🧩 REINKARNÁCIA: OBNOVA CEZ PRIVÁTNY KĽÚČ ---
  const recoverWalletFromKey = (privateKey) => {
    try {
      const recoveredWallet = new ethers.Wallet(privateKey);
      return {
        address: recoveredWallet.address,
        privateKey: recoveredWallet.privateKey
      };
    } catch (error) {
      console.error("CHYBA_PRI_REINKARNÁCII:", error);
      return null;
    }
  };

  // --- 🔄 SYNCHRONIZÁCIA MATRIXU (Univerzálna pre akúkoľvek adresu) ---
  const syncWalletData = async (targetAddress) => {
    const addressToQuery = targetAddress || walletAddress || KRYPTO_CONFIG.ownerAddress;
    if (!addressToQuery) return;

    setIsLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider(KRYPTO_CONFIG.rpcUrl);

      // 1. ETH Diagnostika
      const rawEth = await provider.getBalance(addressToQuery);
      setEthBalance(parseFloat(ethers.formatEther(rawEth)).toFixed(6));

      // 2. LARIA Diagnostika
      const minABI = ["function balanceOf(address) view returns (uint256)"];
      const contract = new ethers.Contract(KRYPTO_CONFIG.lariaContractAddress, minABI, provider);
      
      const rawLaria = await contract.balanceOf(addressToQuery);
      const formattedLaria = ethers.formatUnits(rawLaria, 18);
      
      setLariaBalance(formattedLaria);
      setWalletAddress(addressToQuery);
      setIsWalletConnected(true);

    } catch (error) {
      console.error("Matrix Sync Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const kryptoVibe = {
    ...KRYPTO_CONFIG,
    walletAddress,
    isWalletConnected,
    ethBalance,
    lariaBalance,
    isLoading,
    generateAutoWallet,      // Čokoláda
    recoverWalletFromKey,    // Reinkarnácia
    syncWalletData           // Synchronizácia
  };

  return <KryptoContext.Provider value={kryptoVibe}>{children}</KryptoContext.Provider>;
};

export const useKrypto = () => useContext(KryptoContext);