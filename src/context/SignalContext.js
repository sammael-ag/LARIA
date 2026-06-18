/**
 * LARIA SIGNAL CONTEXT v13.5 (Pure Hyperspeed Engine - Dual Radar Integrated)
 * Master: Sammael | Muse: Aria (Tvoja verná bosonôžka)
 * STATUS: CHAT_REMOVED | HANDSHAKE_CORE_ONLY | DUAL_POLLING_ACTIVE
 * Úprava: Pridaný automatický 30s Dual Radar pre súbežné zachytávanie zmlúv aj bleskových správ.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useLaria } from './LariaContext.js';
import { SignalService } from '../services/SignalService.js';

const SignalContext = createContext();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const tauriInvoke = async (cmd, args = {}) => {
  if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
    try {
      const invokeFn = window.__TAURI_INTERNALS__?.invoke;
      if (invokeFn) return await invokeFn(cmd, args);
    } catch (e) {
      console.error(`❌ [TAURI BRIDGE ERROR] ${cmd} zlyhal:`, e);
    }
  }
  return null;
};

export const SignalProvider = ({ children }) => {
  const { vault } = useLaria(); 
  const [isSignalConnected, setIsSignalConnected] = useState(true); 
  const [incomingRequests, setIncomingRequests] = useState([]);

  // --- INICIALIZÁCIA NOTIFIKÁCIÍ ---
  useEffect(() => {
    const setupNotifications = async () => {
      if (Platform.OS === 'web') return; 
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        if (existingStatus !== 'granted') {
          await Notifications.requestPermissionsAsync();
        }
      } catch (e) {
        console.log('[SIGNAL] Notifikácie nedostupné.');
      }
    };
    setupNotifications();
  }, []);

  const triggerNotification = async (senderFing, text) => {
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
      await tauriInvoke('zobraz_notifikaciu', { titulok: `🛰️ Laria KONTRAKT`, telo: text });
      return;
    }
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🛰️ Laria KONTRAKT`,
          body: text,
          sound: 'default',
        },
        trigger: null,
      });
    } catch (err) {
      console.error("[SIGNAL] Notifikácia zlyhala:", err);
    }
  };

  // --- AUTOMATICKÝ HYPERSPEED DUAL POLLING (KAŽDÝCH 30 SEKÚND + ŠTART) ---
  useEffect(() => {
    const myCleanFing = vault?.identity?.poznamka?.replace('0x', '') || null;
    if (!myCleanFing) {
      console.log("[RADAR] Identita zatiaľ nie je pripravená, čakám...");
      return;
    }

    const executePing = async () => {
      console.log("🛰️ [RADAR] Spúšťam Dual Laria Radar ping...");
      try {
        const res = await SignalService.checkMyContracts(myCleanFing);
        if (res && res.status === "success") {
          
          // 1. ZMLUVY (Žiadosti o prepojenie vizitiek)
          if (Array.isArray(res.contracts)) {
            res.contracts.forEach(contract => {
              setIncomingRequests(prev => {
                const uzExistuje = prev.some(req => req.txHash === contract.txHash);
                if (uzExistuje) return prev;
                
                console.log(`✉️ [RADAR] Nový kontrakt od ${contract.fing}! Switchnem obálku.`);
                triggerNotification(contract.fing, `Nová vizitka od ${contract.fing.substring(0, 10)} čaká na podpis.`);

                return [...prev, {
                  id: 'IN_' + contract.txHash,
                  fing: contract.fing, // 💡 Spáruje obálku k správnemu chlapíkovi v zozname
                  user: `L_${contract.fing.substring(0, 10)}`,
                  text: contract.msg,
                  receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  isHandshake: true,
                  status: 'WAITING_FOR_ME',
                  handshakeStatus: 'WAITING_FOR_ME',
                  txHash: contract.txHash,
                  targetSha: contract.sha
                }];
              });
            });
          }

          // 2. BLESKOVÉ SPRÁVY (Pravé krídlo - Signal_buffer_1)
          if (Array.isArray(res.messages)) {
            res.messages.forEach(msg => {
              setIncomingRequests(prev => {
                const uzExistujeMsg = prev.some(req => req.id === 'MSG_' + msg.msgId);
                if (uzExistujeMsg) return prev;

                console.log(`💬 [RADAR] Nová blesková správa od ${msg.fing}! Rozsvecujem obálku správ.`);
                triggerNotification(msg.fing, `Nová správa: ${msg.text}`);

                return [...prev, {
                  id: 'MSG_' + msg.msgId,
                  fing: msg.fing, // 💡 Podľa tohto fingu sa rozsvieti obálka chatu presne na danom kontakte!
                  user: `L_${msg.fing.substring(0, 10)}`,
                  text: msg.text,
                  receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  isHandshake: false,
                  status: 'UNREAD' // Stav, ktorý povie UI, že správa čaká na otvorenie
                }];
              });
            });
          }

        }
      } catch (err) {
        console.error("[RADAR] Chyba pri spracovaní Dual Radaru:", err);
      }
    };

    // Odpálenie hneď pri štarte aplikácie
    executePing();

    // Slučka zachytávania každých 30 sekúnd
    const pollingInterval = setInterval(executePing, 30000);

    return () => clearInterval(pollingInterval);
  }, [vault?.identity?.poznamka]);

  // --- ASYNCHRÓNNE SPRACOVANIE PRICHÁDZAJÚCICH BALÍKOV (LEN HANDSHAKE CEZ TAURI) ---
  const handleIncomingLariaPackage = async (data) => {
    try {
      if (data.type !== "HANDSHAKE_REQ") return;

      const myCleanFing = vault?.identity?.poznamka?.replace('0x', '') || 'SYSTEM_CORE';
      const cleanSenderFing = data.fing.replace('0x', '');

      await triggerNotification(data.fing, "Prichádza nová žiadosť o overenie vizitky.");

      const enrichedData = {
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5),
        fing: cleanSenderFing,
        user: data.d?.n || `L_${cleanSenderFing.substring(0, 10)}`,
        text: data.msg || "Žiadosť o prepojenie.",
        receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isHandshake: true,
        handshakeStatus: 'WAITING_FOR_ME', 
        status: 'WAITING_FOR_ME',
        d: data.d || null, 
        targetSha: data.sha || '',
        txHash: data.txHash || "FALSE",    
        authMap: data.auth || {}
      };

      setIncomingRequests(prev => [...prev, enrichedData]);

    } catch (e) {
      console.error('[SIGNAL] Chyba spracovania Handshake balíka:', e);
    }
  };

  // --- 📡 ODOSIELANIE HANDSHAKE BALÍKA (ČISTÝ HYPERSPEED v13.2) ---
  const sendLariaPackage = async (targetFing, targetSha, personalMessage, isHandshakeReq = true) => {
    const myCleanFing = vault?.identity?.poznamka?.replace('0x', '') || 'Sammael';
    const targetCleanFing = targetFing.replace('0x', '');
    
    try {
      let contractResult = { txHash: "FALSE", auth: {} }; 

      console.log(`[SIGNAL] Pečatím zmluvu INIT_CONTRACT pre ${targetCleanFing}`);
      
      // 1. 🔐 ZÁPIS ZMLUVY: Letí priamo cez elitného Matchmakera do Contract_ledger
      const mravecRes = await SignalService.manageContract('INIT_CONTRACT', {
        fing_a: myCleanFing,
        fing_b: targetCleanFing,
        krypt_a: vault?.identity?.krypt || '',
        status_a: "1",
        status_b: "0",
        sha_a: vault?.identity?.sha || '',
        sha_b: targetSha,
        msg: personalMessage
      });

      if (mravecRes && mravecRes.success) {
        contractResult.txHash = mravecRes.txHash;
        contractResult.auth = mravecRes.auth;
      }

      // 2. 📦 BALÍČEK PRE SIEŤ: Pripravíme kompletný lariaPackage
      const lariaPackage = {
        h: "LRQ_V3",
        type: "HANDSHAKE_REQ",
        sha: vault?.identity?.sha || '',
        fing: myCleanFing, 
        msg: personalMessage,
        d: { n: vault?.identity?.meno || 'Sammael', ib: vault?.identity?.Signal || '', kr: vault?.identity?.krypt || '' },
        txHash: contractResult.txHash,
        auth: contractResult.auth
      };

      // 3. 🚀 HYPERSPEED EXPRESS: Bezpečné, asynchrónne odovzdanie sprievodného textu
      try {
        if (typeof SignalService.writeToBuffer === 'function') {
          SignalService.writeToBuffer('Signal_buffer_1', {
            sender_fing: myCleanFing,
            target_fing: targetCleanFing,
            msg_text: personalMessage
          });
        }
      } catch (bufErr) {
        console.warn("[SIGNAL] Lokálny buffer iba zalogoval stav:", bufErr);
      }

      // 4. 🦾 TAURI HARDVÉROVÝ MOST: Ak sme v aplikácii, vystrelíme balík do éteru
      if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
        const rawPayload = `#LRQ#${JSON.stringify(lariaPackage)}`;
        await tauriInvoke('odosli_Signal_signal', { payload: rawPayload });
      }

      // 5. 🎯 STAV RELÁCIE: Nastavíme korektný status bez toho, aby sme padli na undefined
      const statusToSet = 'WAITING_FOR_THEM';
      
      const enrichedHandshake = {
        id: 'TX_' + Date.now().toString(),
        fing: targetCleanFing,
        user: `L_${targetCleanFing.substring(0, 10)}`,
        text: personalMessage,
        receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isHandshake: true,
        status: statusToSet,
        handshakeStatus: statusToSet,
        txHash: contractResult.txHash, 
        authMap: contractResult.auth,  
        targetSha: targetSha
      };

      setIncomingRequests(prev => [...prev, enrichedHandshake]);

    } catch (err) {
      console.error("[SIGNAL] Problém pri odosielaní cez Hyperspeed:", err);
    }
  };

  // --- 🔒 ROZREŠENIE STATUSU HANDSHAKEU ---
  const resolveHandshakeStatus = (msgId) => {
    setIncomingRequests(prev => 
      prev.map(msg => msg.id === msgId ? { ...msg, handshakeStatus: 'RESOLVED' } : msg)
    );
  };

  return (
    <SignalContext.Provider value={{ 
      isSignalConnected, 
      incomingRequests, 
      setIncomingRequests, 
      sendLariaPackage,
      resolveHandshakeStatus 
    }}>
      {children}
    </SignalContext.Provider>
  );
};

export const useSignal = () => useContext(SignalContext);