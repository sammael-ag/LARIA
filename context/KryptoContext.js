import React, { createContext, useContext, useState } from 'react';

// 1. NASTAVENIA (To, čo sme predtým nazvali LARIA_CONFIG)
const KRYPTO_CONFIG = {
  apiKey: "R6h9kbHCWY2GxHhhQTgpMmY9mw4R7nGM", // Tu vlož ten kľúč z Coinbase
  projectId: "98074637-80ee-4f12-8f5e-f186a388d2da", // Ak nemáš, nechaj prázdne ""
  chainId: 8453, // Sieť Base (naše ihrisko)
  networkName: "Base Mainnet",
};

const KryptoContext = createContext();

export const KryptoProvider = ({ children }) => {
  // 2. STAVY (Čo sa práve v peňaženke deje)
  const [walletAddress, setWalletAddress] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [balance, setBalance] = useState("0.00");

  // 3. LOGIKA (To, čo ten stroj reálne robí)
  const kryptoVibe = {
    ...KRYPTO_CONFIG, // Týmto do vibu "vtesnáme" všetky tie kľúče a ID
    walletAddress,
    isWalletConnected,
    balance,
    
    // Funkcia na pripojenie k Matrixu
    connectWallet: async () => {
      console.log("Sammael, štartujeme krypto-motory na sieti Base...");
      // Tu neskôr napojíme tú "vagin..." (Wagmi) pre reálny login
      // Nateraz len pre test:
      setIsWalletConnected(true);
      setWalletAddress("0x...Vtesnaná_Adresa");
    },

    // Funkcia pre náš Taviaci Kotol (Phase 2)
    meltDust: () => {
      console.log("Tavíme krypto-prach na čisté svetlo...");
      // Sem príde tá tvoja mágia so zvyškami mincí
    }
  };

  return (
    <KryptoContext.Provider value={kryptoVibe}>
      {children}
    </KryptoContext.Provider>
  );
};

// Hook, aby sme k tomu mali prístup v celej appke
export const useKrypto = () => useContext(KryptoContext);