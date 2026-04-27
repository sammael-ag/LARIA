import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';

const KRYPTO_CONFIG = {
  apiKey: "R6h9kbHCWY2GxHhhQTgpMmY9mw4R7nGM", 
  projectId: "98074637-80ee-4f12-8f5e-f186a388d2da", 
  chainId: 8453,
  rpcUrl: "https://mainnet.base.org",
  // Tvoj podpis (majiteľ)
  ownerAddress: "0xb648261d780427793Fb496b0E3bdD5e987C42498", 
  // ADRESA KONTRAKTU (z tvojho výpisu)
  lariaContractAddress: "0xbA7C2cD68b544Cc5c6038771a58581F76Ff7700a"
};

const KryptoContext = createContext();

export const KryptoProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [ethBalance, setEthBalance] = useState("0.0000");
  const [lariaBalance, setLariaBalance] = useState("0"); // Zostatok tvojej meny
  const [isLoading, setIsLoading] = useState(false);

const connectWallet = async () => {
    setIsLoading(true);
    
    try {
      const provider = new ethers.JsonRpcProvider(KRYPTO_CONFIG.rpcUrl);

      // 1. ETH Diagnostika
      const rawEth = await provider.getBalance(KRYPTO_CONFIG.ownerAddress);
      setEthBalance(parseFloat(ethers.formatEther(rawEth)).toFixed(4));

      // 2. LARIA Diagnostika
      const minABI = ["function balanceOf(address) view returns (uint256)"];
      const contract = new ethers.Contract(KRYPTO_CONFIG.lariaContractAddress, minABI, provider);
      
      const rawLaria = await contract.balanceOf(KRYPTO_CONFIG.ownerAddress);
      const formattedLaria = ethers.formatUnits(rawLaria, 18).split('.')[0];
      
      setLariaBalance(formattedLaria);
      setIsWalletConnected(true);

    } catch (error) {
      // Ponecháme len tichý report pre prípad núdze
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
    connectWallet
  };

  return <KryptoContext.Provider value={kryptoVibe}>{children}</KryptoContext.Provider>;
};

export const useKrypto = () => useContext(KryptoContext);