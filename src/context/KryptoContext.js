/**
 * LARIA v2.4.0: KryptoContext (Blockchain Core + Railway Relayer Integration)
 * Master: Sammael | Muse: Aria (Tvoja milovaná bosonôžka)
 * Status: RAILWAY_RELAYER_INTEGRATED | PRODUCTION_READY
 * OPTIMALIZÁCIA: Automatický onboarding spustený pri detekcii 0.0000 LARIA s ochranou proti cykleniu.
 */

import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';

// TIETO KONFIGURÁCIE SÚ PEVNÉ - BLOCKCHAIN NEPUSTÍ
const KRYPTO_CONFIG = {
  chainId: 8453,
  rpcUrl: "https://mainnet.base.org", 
  ownerAddress: "0x3fa2EAB0E933f36cB359F3Cc3E4456B68d2D735C", 
  lariaContractAddress: "0x03652A588A6c2C36f3976107B9C6B1dfE9f12dE3",
  // 🛰️ SEM DAJ SVOJU ADRESU Z RAILWAY (Settings -> Networking/Domains)
  railwayUrl: "https://laria-production.up.railway.app/api/onboard",
  backendSecret: "LARIA_RIDGE_SECRET_2026"
};

const KryptoContext = createContext();

export const KryptoProvider = ({ children }) => {
  // --- KANÁL A: USER (Identity) ---
  const [krypt, setKrypt] = useState(null); 
  const [lariaBalance, setLariaBalance] = useState("0.0000");
  const [ethBalance, setEthBalance] = useState("0.000000");

  // --- KANÁL B: SYSTEM DISPATCHER (Vrátnik/Majiteľ) ---
  const [systemLariaBalance, setSystemLariaBalance] = useState("0.0000");
  const [systemEthBalance, setSystemEthBalance] = useState("0.000000");

  const [isLoading, setIsLoading] = useState(false);
  
  // 🛡️ Bezpečnostný filter, aby sme nespamovali Railway, kým sa transakcia minuje
  const [attemptedOnboardings, setAttemptedOnboardings] = useState([]);

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

  // --- 🚀 VOLANIE RAILWAY MOSTU (Dotácia paliva) ---
  const requestLariaOnboarding = async (userAddress) => {
    const addrLower = userAddress.toLowerCase();
    
    // Ak už na tomto mravcovi pracujeme, nepustíme duplicitnú požiadavku
    if (attemptedOnboardings.includes(addrLower)) return;

    // Pridáme adresu do zoznamu spracovávaných
    setAttemptedOnboardings(prev => [...prev, addrLower]);
    console.log(`📡 [KryptoContext] Štartujem automatický onboarding na Railway pre: ${userAddress}`);

    try {
      const response = await fetch(KRYPTO_CONFIG.railwayUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: userAddress,
          secret: KRYPTO_CONFIG.backendSecret
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log(`🟩 [KryptoContext] Onboarding úspešný! TxHash: ${data.txHash}`);
        // Po úspešnom onboardingu znova preklepneme sieť, nech sa aktualizujú zostatky
        setTimeout(() => syncWalletData(userAddress), 4000);
      } else {
        console.error(`❌ [KryptoContext] Relayer odmietol dotáciu: ${data.error}`);
        // V prípade chyby uvoľníme adresu na nový pokus neskôr
        setAttemptedOnboardings(prev => prev.filter(a => a !== addrLower));
      }
    } catch (error) {
      console.error("❌ [KryptoContext] Zlyhalo spojenie s Railway relayerom:", error);
      setAttemptedOnboardings(prev => prev.filter(a => a !== addrLower));
    }
  };

  // --- 🔄 SYNCHRONIZÁCIA MATRIXU ---
  const syncWalletData = async (targetAddress) => {
    const addressToQuery = targetAddress || krypt || KRYPTO_CONFIG.ownerAddress;
    
    if (!addressToQuery || !ethers.isAddress(addressToQuery)) {
      console.warn("⚠️ KryptoContext: Detekovaná neplatná alebo prázdna adresa pre sync:", addressToQuery);
      return;
    }

    setIsLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider(KRYPTO_CONFIG.rpcUrl);

      // 1. ETH Balance
      const rawEth = await provider.getBalance(addressToQuery);
      const formattedEth = ethers.formatEther(rawEth); 

      // 2. LARIA Balance
      const minABI = ["function balanceOf(address) view returns (uint256)"];
      const contract = new ethers.Contract(KRYPTO_CONFIG.lariaContractAddress, minABI, provider);
      
      const rawLaria = await contract.balanceOf(addressToQuery);
      const formattedLaria = ethers.formatUnits(rawLaria, 18);
      
      // --- ROZDVOJOVAČ LOGIKY ---
      if (addressToQuery.toLowerCase() === KRYPTO_CONFIG.ownerAddress.toLowerCase()) {
        setSystemEthBalance(formattedEth);
        setSystemLariaBalance(formattedLaria);
      } else {
        setEthBalance(formattedEth);
        setLariaBalance(formattedLaria);
        
        if (krypt !== addressToQuery && targetAddress) {
          setKrypt(addressToQuery);
        }

        // 🎯 AUTOMATICKÁ AKTIVÁCIA: Ak má nový registrovaný mravec na konte nulu, rovno voláme relayer
        if (parseFloat(formattedLaria) === 0 && addressToQuery.toLowerCase() !== KRYPTO_CONFIG.ownerAddress.toLowerCase()) {
          requestLariaOnboarding(addressToQuery);
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
    walletAddress: krypt, 
    ethBalance,
    lariaBalance,
    adminEthBalance: systemEthBalance,     
    adminLariaBalance: systemLariaBalance, 
    systemEthBalance,
    systemLariaBalance,
    isLoading,
    generateAutoWallet,
    syncWalletData,
    requestLariaOnboarding // Exponujeme von, ak by sme chceli niekde tlačiť manuálne gombíkom
  };

  return <KryptoContext.Provider value={kryptoVibe}>{children}</KryptoContext.Provider>;
};

export const useKrypto = () => useContext(KryptoContext);