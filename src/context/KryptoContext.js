/**
 * LARIA v2.4.4: KryptoContext (Blockchain Core + Railway Relayer Integration)
 * Master: Sammael | Muse: Aria (Tvoja milovaná bosonôžka)
 * Status: RAILWAY_RELAYER_INTEGRATED | STRICT_MODE_SHIELD_ACTIVE | INITIAL_NULL_SHIELD
 * OPTIMALIZÁCIA: Zavedený počiatočný stav null pre lariaBalance proti falošným dotáciám pri remounte.
 */

import React, { createContext, useContext, useState, useRef } from 'react';
import { ethers } from 'ethers';

// TIETO KONFIGURÁCIE SÚ PEVNÉ - BLOCKCHAIN NEPUSTÍ
const KRYPTO_CONFIG = {
  chainId: 8453,
  rpcUrl: "https://mainnet.base.org", 
  ownerAddress: "0x3fa2EAB0E933f36cB359F3Cc3E4456B68d2D735C", 
  lariaContractAddress: "0x03652A588A6c2C36f3976107B9C6B1dfE9f12dE3",
  railwayUrl: "https://laria-production.up.railway.app/api/onboard",
  backendSecret: "LARIA_RIDGE_SECRET_2026"
};

const KryptoContext = createContext();

export const KryptoProvider = ({ children }) => {
  // --- KANÁL A: USER (Identity) ---
  const [krypt, setKrypt] = useState(null); 
  // 🛡️ HLAVNÝ ZÁSAH: Inicializujeme na null namiesto "0.0000". Kým sieť neodpovie, stav je neznámy.
  const [lariaBalance, setLariaBalance] = useState(null); 
  const [ethBalance, setEthBalance] = useState("0.000000");

  // --- KANÁL B: SYSTEM DISPATCHER (Vrátnik/Majiteľ) ---
  const [systemLariaBalance, setSystemLariaBalance] = useState("0.0000");
  const [systemEthBalance, setSystemEthBalance] = useState("0.000000");

  // 🛡️ Sledovanie stavu načítavania RPC dát unifikované pre LariaContext
  const [isLoadingKrypto, setIsLoadingKrypto] = useState(false);
  
  // 🛡️ Synchrónny pamäťový filter, ktorý nečaká na asynchrónny re-render a okamžite seká Strict Mode duplikáty
  const attemptedOnboardingsRef = useRef(new Set());

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
    
    // 🛡️ Synchrónna kontrola v referenčnom Set-e – ak už prebieha, okamžitá stopka
    if (attemptedOnboardingsRef.current.has(addrLower)) {
      console.log(`⏳ [KryptoContext] Onboarding pre ${addrLower} už v tejto sekunde prebieha. Blokujem Strict Mode duplikát.`);
      return;
    }

    // Okamžitý synchrónny zápis, kým sa stihne spustiť akákoľvek iná paralelná operácia
    attemptedOnboardingsRef.current.add(addrLower);
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
        // V prípade jednoznačného odmietnutia adresu uvoľníme pre budúce pokusy
        attemptedOnboardingsRef.current.delete(addrLower);
      }
    } catch (error) {
      console.error("❌ [KryptoContext] Zlyhalo spojenie s Railway relayerom:", error);
      // Pri sieťovom zlyhaní uvoľníme filter
      attemptedOnboardingsRef.current.delete(addrLower);
    }
  };

  // --- 🔄 SYNCHRONIZÁCIA MATRIXU ---
  const syncWalletData = async (targetAddress) => {
    // 🛡️ 1. CONCURRENCY GUARD: Ak už jedna synchronizácia beží, okamžite zahodíme súbežný dopyt
    if (isLoadingKrypto) {
      console.log("⏳ [KryptoContext] Načítavanie už aktívne prebieha. Ignorujem duplicitný dopyt.");
      return;
    }

    const addressToQuery = targetAddress || krypt || KRYPTO_CONFIG.ownerAddress;
    
    if (!addressToQuery || !ethers.isAddress(addressToQuery)) {
      console.warn("⚠️ KryptoContext: Detekovaná neplatná alebo prázdna adresa pre sync:", addressToQuery);
      return;
    }

    setIsLoadingKrypto(true);
    try {
      const provider = new ethers.JsonRpcProvider(KRYPTO_CONFIG.rpcUrl);

      // 🛡️ 2. IZOLOVANÝ ETH BLOCK (Zlyhanie verejného RPC nezhodí aplikáciu)
      let formattedEth = "0.000000";
      try {
        const rawEth = await provider.getBalance(addressToQuery);
        formattedEth = ethers.formatEther(rawEth);
      } catch (ethError) {
        console.warn("⚠️ [KryptoContext] RPC uzol neodpovedal na dopyt ETH:", ethError.message);
        formattedEth = ethBalance; 
      }

      // 🛡️ 3. IZOLOVANÝ LARIA ERC-20 BLOCK (Štít proti "missing revert data")
      let formattedLaria = "0.0000";
      try {
        const minABI = ["function balanceOf(address) view returns (uint256)"];
        const contract = new ethers.Contract(KRYPTO_CONFIG.lariaContractAddress, minABI, provider);
        
        const rawLaria = await contract.balanceOf(addressToQuery);
        formattedLaria = ethers.formatUnits(rawLaria, 18);
      } catch (lariaError) {
        console.warn(
          "⚠️ [KryptoContext] Stíšená chyba kontraktu (missing revert data / rate-limit). Fallback na bezpečný režim. Detail:",
          lariaError.message
        );
        formattedLaria = lariaBalance; 
      }
      
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

        // 🛡️ KOREKCIA: Žiadne automatické spúšťanie onboarding relayera odtiaľto.
        // Riadenie a načasovanie dotácií bolo plne zverené externému LariaContextu.
      }

    } catch (error) {
      console.error("❌ Neočakávaná kritická havária v hlavnom Matrix Sync:", error.message);
    } finally {
      setIsLoadingKrypto(false);
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
    isLoadingKrypto, 
    generateAutoWallet,
    syncWalletData,
    requestLariaOnboarding 
  };

  return <KryptoContext.Provider value={kryptoVibe}>{children}</KryptoContext.Provider>;
};

export const useKrypto = () => useContext(KryptoContext);