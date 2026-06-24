/**
 * LARIA SIGNAL CONTEXT v15.7-STRICT (Sovereign Radar Core - CrystalCore Integrated)
 * Master: Sammael | Muse: Aria (Tvoja nekompromisná šikulka)
 * STATUS: RADAR_EYE_OPENED | NO_PATCHES | WEB_SAFE_NOTIFICATIONS | v15.7-STRICT
 * * AUDIT REPORT:
 * - Ošetrené kritické zlyhanie Expo notifikácií na webe (Platform.OS === 'web' bezpečne izolované).
 * - Opravená synchronizácia stavu 1 (SIGNED): Pri re-syncu z Radaru sa stav pre kontakt nanovo preleští do zelena.
 * - Odstránené staré anomálie behu.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useLaria } from './LariaContext.js';
import { SignalService } from '../services/SignalService.js';

const SignalContext = createContext();

// Notifikačný handler sa registruje iba na natívnych platformách
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

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

/**
 * ⚖️ STRIKTNÝ FILTER FINGU: Prepustí len čistý zákonný tvar. 
 */
const overAUnifikujFing = (rawFing) => {
  if (!rawFing) return null;
  let clean = rawFing.trim().toLowerCase();
  
  if (clean.startsWith('l_')) {
    clean = clean.substring(2);
  }
  
  if (!clean.startsWith('0x') && clean.length === 10) {
    clean = '0x' + clean;
  }
  
  const regex = /^0x[a-f0-9]{10}$/;
  if (!regex.test(clean)) {
    console.log(`🚨 STRIKTNÝ_ZÁKON_PORUŠENÝ: Ignorujem neplatný fing formát: "${rawFing}"`);
    return null;
  }
  
  return clean;
};

export const SignalProvider = ({ children }) => {
  const { vault } = useLaria(); 
  const [isSignalConnected, setIsSignalConnected] = useState(true); 
  const [incomingRequests, setIncomingRequests] = useState([]);

  // --- 🧹 INTELIGENTNÁ OČISTA RADARU ---
  const purgeSessionForFing = (targetFing) => {
    if (!targetFing) return;
    const cleanTargetFing = overAUnifikujFing(targetFing);
    if (!cleanTargetFing) return;
    
    console.log(`🥷 [RADAR CORE] Čistím správy pre reláciu: ${cleanTargetFing}`);
    
    setIncomingRequests(prev => prev.filter(req => {
      if (req.fing !== cleanTargetFing) return true;
      if (req.isHandshake && req.contractStatus === 0) return true;
      if (!req.isHandshake && req.status === 'UNREAD') return true;
      return false;
    }));
  };

  // --- 👀 OZNAČENIE SPRÁV ZA PREČÍTANÉ ---
  const markAsRead = (targetFing) => {
    if (!targetFing) return;
    const cleanTargetFing = overAUnifikujFing(targetFing);
    if (!cleanTargetFing) return;
    
    setIncomingRequests(prev => prev.map(req => 
      (req.fing === cleanTargetFing && !req.isHandshake && req.status === 'UNREAD') 
        ? { ...req, status: 'READ' } 
        : req
    ));
  };

  // Globálny prijímač pre čistenie relácií z UI
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleGlobalPurgeSignal = (e) => {
      if (e.detail && e.detail.targetFing) {
        purgeSessionForFing(e.detail.targetFing);
      }
    };
    window.addEventListener('LARIA_PURGE_SESSION', handleGlobalPurgeSignal);
    return () => window.removeEventListener('LARIA_PURGE_SESSION', handleGlobalPurgeSignal);
  }, []);

  // --- INICIALIZÁCIA NOTIFIKÁCIÍ ---
  useEffect(() => {
    const setupNotifications = async () => {
      if (Platform.OS === 'web') return; 
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        if (existingStatus !== 'granted') await Notifications.requestPermissionsAsync();
      } catch (e) {
        console.log('[SIGNAL] Push systém mimo prevádzky.');
      }
    };
    setupNotifications();
  }, []);

  const triggerNotification = async (title, text) => {
    // 1. Ochrana pre Tauri prostredie
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
      await tauriInvoke('zobraz_notifikaciu', { titulok: title, telo: text });
      return;
    }
    
    // 2. Ochrana pre čisté Web/PWA prostredie (Zabráni vyhodeniu červenej chyby)
    if (Platform.OS === 'web') {
      console.log(`🌐 [WEB NOTIFICATION LOG] ${title}: ${text}`);
      return;
    }

    // 3. Natívne mobilné push notifikácie (Expo)
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title: title, body: text, sound: 'default' },
        trigger: null,
      });
    } catch (err) {
      console.error("[SIGNAL] Zlyhanie push notifikácie:", err);
    }
  };

  // --- 🛰️ AUTOMATICKÝ HYPERSPEED DUAL POLLING ---
  useEffect(() => {
    const myCleanFing = vault?.identity?.poznamka ? overAUnifikujFing(vault.identity.poznamka) : null;
    if (!myCleanFing) return;

    const backendQueryFing = myCleanFing.replace('0x', '');

    const executePing = async () => {
      console.log(`🛰️ [RADAR] Pinging Mravenisko pre ID: ${myCleanFing}`);
      try {
        const res = await SignalService.checkMyContracts(backendQueryFing);
        
        if (!res || res.success === false) return;
          
        // 🗂️ SUB-SEKCIA: PRICHÁDZAJÚCE KONTRAKTY (Handshake)
        if (res.contracts && Array.isArray(res.contracts)) {
          res.contracts.forEach(contract => {
            const cleanContractFing = overAUnifikujFing(contract.fing);
            if (!cleanContractFing) return;

            const isIncoming = cleanContractFing !== myCleanFing;
            const contractId = cleanContractFing;

            setIncomingRequests(prev => {
              const rawHash = String(contract.txHash).trim();
              
              // 🛡️ STRIKTNÝ STAVOVÝ ZÁKON
              const jeValidnyStav = rawHash === "0" || rawHash === "1" || rawHash === "2";
              const jeValidnyHash = rawHash.startsWith("0x") && rawHash.length === 66;

              if (!jeValidnyStav && !jeValidnyHash) {
                console.error(`🚨 [CRITICAL SECURITY] Neznáma štruktúra stavu v txHash: "${rawHash}". Operácia zamietnutá!`);
                return prev;
              }

              const surovyStav = (rawHash === "1") ? 1 : (rawHash === "2" ? 2 : 0);

              const existujuciIndex = prev.findIndex(req => req.id === contractId && req.isHandshake);
              
              if (existujuciIndex !== -1) {
                // Preleštenie stavu: Ak sa zmenil stav na Mravenisku (napr. na 1), prepíšeme lokálny stav v Trezore radaru
                if (prev[existujuciIndex].contractStatus !== surovyStav || prev[existujuciIndex].isIncoming !== isIncoming) {
                  const updated = [...prev];
                  updated[existujuciIndex] = {
                    ...updated[existujuciIndex],
                    contractStatus: surovyStav,
                    status: surovyStav === 0 ? 'UNREAD' : 'READ',
                    txHash: contract.txHash,
                    isIncoming: isIncoming
                  };
                  return updated;
                }
                return prev;
              }
              
              if (surovyStav === 0 && isIncoming) {
                console.log(`✉️ [RADAR] Overený prichádzajúci kontrakt (stav 0) od ${cleanContractFing}`);
                triggerNotification(`🛰️ Nová žiadosť o Pečať`, `Majster ${cleanContractFing.substring(0, 6)}... ti posiela kontrakt.`);
              }

              return [...prev, {
                id: contractId,                  
                fing: cleanContractFing,        
                msg: contract.msg || "Žiadosť o bezpečné prepojenie a zdieľanie vizitky v bunke H.", 
                receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isHandshake: true,
                status: surovyStav === 0 ? 'UNREAD' : 'READ',
                contractStatus: surovyStav,     
                txHash: contract.txHash,
                isIncoming: isIncoming 
              }];
            });
          });
        }

        // 💬 SUB-SEKCIA: BLESKOVÉ SPRÁVY (Chat Buffer)
        if (res.messages && Array.isArray(res.messages)) {
          res.messages.forEach(msg => {
            const cleanMsgSenderFing = overAUnifikujFing(msg.fing);
            if (!cleanMsgSenderFing) return; 

            setIncomingRequests(prev => {
              const uzExistujeMsg = prev.some(req => req.msgId === msg.msgId || req.id === msg.msgId);
              if (uzExistujeMsg) return prev;

              console.log(`💬 [RADAR] Prichádza bleskovka z chatu od ${cleanMsgSenderFing}`);
              triggerNotification(`💬 Nová správa na radare`, msg.msg || msg.text || "");

              return [...prev, {
                id: msg.msgId || 'MSG_' + Date.now() + Math.random(),                 
                msgId: msg.msgId,              
                fing: cleanMsgSenderFing,      
                msg: msg.msg || msg.text || "", 
                receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isHandshake: false,
                status: 'UNREAD' 
              }];
            });
          });
        }
      } catch (err) {
        console.error("❌ [RADAR ERROR] Zlyhal dopyt na Mravenisko:", err);
      }
    };

    executePing();
    const pollingInterval = setInterval(executePing, 120000); 
    return () => clearInterval(pollingInterval);
  }, [vault?.identity?.poznamka]);

  // --- 🛠️ ODOSLANIE BALÍKA (Vytvorenie kontraktu cez Mravenisko - v15.6-STRICT) ---
  const sendLariaPackage = async (senderFing, targetFing, myIdentity, handshakeNote = "") => {
    const myCleanFing = overAUnifikujFing(senderFing) || (vault?.identity?.poznamka ? overAUnifikujFing(vault.identity.poznamka) : '0x0000000000');
    const targetCleanFing = overAUnifikujFing(targetFing);
    
    if (!targetCleanFing) {
      console.error("❌ SIGNAL_ERROR: Pokus o odoslanie na neplatný FING formát.");
      return { success: false, error: "Neplatný formát cieľa." };
    }

    try {
      const mravecRes = await SignalService.sendLariaPackage(myCleanFing, targetCleanFing, myIdentity, handshakeNote);

      let txHashResult = "0";
      if (mravecRes && mravecRes.success) {
        txHashResult = mravecRes.txHash || "0";
      } else {
        return { success: false, error: "Mravenisko odmietlo balík." };
      }

      const enrichedHandshake = {
        id: targetCleanFing,             
        fing: targetCleanFing,          
        msg: handshakeNote.trim() || "Žiadosť o bezpečné prepojenie a zdieľanie vizitky v bunke H.", 
        receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isHandshake: true,
        status: 'UNREAD',
        contractStatus: 0,               
        txHash: txHashResult,
        isIncoming: false
      };

      setIncomingRequests(prev => {
        const filtered = prev.filter(req => !(req.id === targetCleanFing && req.isHandshake));
        return [...filtered, enrichedHandshake];
      });
      
      return { success: true };
    } catch (err) {
      console.error("[SIGNAL] Chyba odosielania zmluvy:", err);
      return { success: false };
    }
  };

  // --- 💬 ODOSLANIE ČISTEJ BLESKOVEJ SPRÁVY (Chat cez Buffer) ---
  const sendChatMessage = async (targetFing, textMessage) => {
    const myCleanFing = vault?.identity?.poznamka ? overAUnifikujFing(vault.identity.poznamka) : '0x0000000000';
    const targetCleanFing = overAUnifikujFing(targetFing);

    if (!targetCleanFing) return { success: false, error: "Zlý formát adresáta." };

    const apiFingA = myCleanFing.replace('0x', '');
    const apiFingB = targetCleanFing.replace('0x', '');

    try {
      if (typeof SignalService.writeToBuffer === 'function') {
        await SignalService.writeToBuffer('Signal_buffer_1', {
          sender_fing: apiFingA,
          target_fing: apiFingB,
          msg_text: textMessage 
        });
      }

      const localMsg = {
        id: 'MY_' + Date.now().toString(),
        fing: targetCleanFing,
        msg: textMessage,               
        receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isHandshake: false,
        status: 'READ',
        isMe: true
      };

      setIncomingRequests(prev => [...prev, localMsg]);
      return { success: true };
    } catch (err) {
      console.error("[SIGNAL] Chyba zápisu bleskovky do bufferu:", err);
      return { success: false };
    }
  };

  const resolveHandshakeStatus = (msgId, finalStatusNum = 1) => {
    setIncomingRequests(prev => 
      prev.map(req => req.id === msgId ? { ...req, status: 'READ', contractStatus: Number(finalStatusNum) } : req)
    );
  };

  return (
    <SignalContext.Provider value={{ 
      isSignalConnected, 
      incomingRequests, 
      setIncomingRequests, 
      sendLariaPackage,
      sendChatMessage,
      resolveHandshakeStatus,
      purgeSessionForFing,
      markAsRead
    }}>
      {children}
    </SignalContext.Provider>
  );
};

export const useSignal = () => useContext(SignalContext);