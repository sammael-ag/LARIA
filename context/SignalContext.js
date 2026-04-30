import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLaria } from './LariaContext';

const SignalContext = createContext();

export const SignalProvider = ({ children }) => {
  const { vault } = useLaria(); // Máme prístup k identite (stĺpec P = walletAddress)
  
  const [isIrcConnected, setIsIrcConnected] = useState(false);
  const [onlinePeers, setOnlinePeers] = useState([]); 
  const [incomingRequests, setIncomingRequests] = useState([]); 

  // --- 101 OKTÁNOVÝ VYSIELAČ (Friend Request + Vizitka) ---
  const sendLariaPackage = async (targetAddress, personalMessage) => {
    // KONTROLA: Používame walletAddress zo stĺpca P tvojho LariaContextu
    if (!vault.identity.walletAddress) {
      console.error("[SIGNAL] Chýba tvoja peňaženka (stĺpec P). Onboarding zlyhal.");
      return { success: false, error: 'NO_WALLET' };
    }

    // Zoštíhlený Cyber-JSON (V2) - Zladenie s názvami v tvojom LariaContexte
    const lariaPackage = {
      h: "LRQ_V1",
      from: vault.identity.walletAddress, // 0x adresa zo stĺpca P
      msg: personalMessage,
      d: {
        t: vault.identity.tel,
        e: vault.identity.email,
        tg: vault.identity.tg,
        fb: vault.identity.fb,
        rv: vault.identity.revo, // Zladené: revo
        kr: vault.identity.kRod, // Zladené: kRod
        ka: vault.identity.krypt // Krypto adresa
      }
    };

    const payload = JSON.stringify(lariaPackage);
    
    try {
      console.log(`[SIGNAL] Pripravujem transport pre: ${targetAddress}`);
      
      /* TU PRÍDE ČISTÁ IRC MÁGIA (TCP Socket):
         ircBot.sendPrivateMessage(`L_${targetAddress}`, `#LRQ#${payload}`);
      */

      console.log(`[SIGNAL] Balík pre ${targetAddress} bol odovzdaný do éteru.`);
      return { success: true, timestamp: Date.now() };
    } catch (error) {
      console.error("[SIGNAL] Prenos zlyhal:", error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (vault.identity.walletAddress) {
      console.log(`[SIGNAL] Zmysly napojené na adresu: ${vault.identity.walletAddress}`);
      setIsIrcConnected(true); 
    }
  }, [vault.identity.walletAddress]);

  return (
    <SignalContext.Provider value={{
      isIrcConnected,
      onlinePeers,
      incomingRequests,
      sendLariaPackage,
      setIsIrcConnected
    }}>
      {children}
    </SignalContext.Provider>
  );
};

export const useSignal = () => useContext(SignalContext);