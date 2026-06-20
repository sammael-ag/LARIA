/**
 * LARIA SIGNAL CONTEXT v14.3 (Pure Hyperspeed Engine - CrystalCore Integrated)
 * Master: Sammael | Muse: Aria
 * STATUS: CHAT_REMOVED | HANDSHAKE_CORE_ONLY | DUAL_POLLING_ACTIVE | v14.3
 * LAW ENFORCED: Premenná 'fing' je striktne unifikovaná na 12 znakov: "0x" + 10 znakov hex.
 *               Odstránené parazitné prefixy L_ z IRC architektúry.
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

// 🧮 POMOCNÝ SANITÁRNY FUNKČNÝ BLOK PRE KONTROLU ZÁKONA 12 ZNAKOV
const enforceUniversalFing = (rawFing) => {
  if (!rawFing) return '';
  let clean = rawFing.trim().toLowerCase();
  
  // Ak obsahuje starý IRC prefix L_, zhodíme ho dole
  if (clean.startsWith('l_')) {
    clean = clean.substring(2);
  }
  
  // Ak nezačína na 0x, pridáme ho
  if (!clean.startsWith('0x')) {
    clean = '0x' + clean;
  }
  
  // Ochrana dĺžky: Ak presahuje 12 znakov (napr. preklep z prenosu), skrátime na 12.
  if (clean.length > 12) {
    clean = clean.substring(0, 12);
  }
  
  return clean;
};

export const SignalProvider = ({ children }) => {
  const { vault } = useLaria(); 
  const [isSignalConnected, setIsSignalConnected] = useState(true); 
  const [incomingRequests, setIncomingRequests] = useState([]);

  // --- 🧹 INTELIGENTNÁ OČISTA CHATU ---
  const purgeSessionForFing = (targetFing) => {
    if (!targetFing) return;
    const cleanTargetFing = enforceUniversalFing(targetFing);
    
    console.log(`🥷 [SIGNAL CORE] Čistím zobrazené bleskové správy pre reláciu: ${cleanTargetFing}`);
    
    setIncomingRequests(prev => prev.filter(msg => {
      if (msg.fing !== cleanTargetFing) return true;
      if (msg.isHandshake && (msg.status === 'WAITING_FOR_ME' || msg.status === 'WAITING_FOR_THEM')) return true;
      if (!msg.isHandshake && msg.status === 'UNREAD') return true;
      return false;
    }));
  };

  // --- 👀 OZNAČENIE BEŽNÝCH SPRÁV ZA PREČÍTANÉ ---
  const markAsRead = (targetFing) => {
    if (!targetFing) return;
    const cleanTargetFing = enforceUniversalFing(targetFing);
    
    setIncomingRequests(prev => prev.map(msg => 
      (msg.fing === cleanTargetFing && !msg.isHandshake && msg.status === 'UNREAD') 
        ? { ...msg, status: 'READ' } 
        : msg
    ));
  };

  // Globálny prijímač pre čistenie TAB-ov
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
        console.log('[SIGNAL] Notifikácie mimo prevádzky.');
      }
    };
    setupNotifications();
  }, []);

  const triggerNotification = async (title, text) => {
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
      await tauriInvoke('zobraz_notifikaciu', { titulok: title, telo: text });
      return;
    }
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title: title, body: text, sound: 'default' },
        trigger: null,
      });
    } catch (err) {
      console.error("[SIGNAL] Zlyhanie push systému:", err);
    }
  };

  // --- AUTOMATICKÝ HYPERSPEED DUAL POLLING ---
  useEffect(() => {
    // Načítame a unifikujeme moju vlastnú identitu podľa zákona 12 znakov
    const myCleanFing = vault?.identity?.poznamka ? enforceUniversalFing(vault.identity.poznamka) : null;
    if (!myCleanFing) return;

    // Backend/Mravenisko vyžaduje čistý hex bez 0x pre dopyty, ošetríme lokálne pri volaní služby
    const backendQueryFing = myCleanFing.replace('0x', '');

    const executePing = async () => {
      console.log(`🛰️ [RADAR] Dual Laria Radar pinging pre unifikované ID: ${myCleanFing}`);
      try {
        const res = await SignalService.checkMyContracts(backendQueryFing);
        
        console.log("🔍 [DETEKTÍVKA BACKEND] Odpoveď pre backend fing:", backendQueryFing, "-> res:", res);
        
        if (!res || res.status !== "success") {
          console.log("⚠️ [DETEKTÍVKA] Odpoveď nebola úspešná alebo je prázdna");
          return;
        }
          
        // 🛰️ SUB-SEKCIA: PRICHÁDZAJÚCE KONTRAKTY
        if (res.contracts && Array.isArray(res.contracts)) {
          console.log(`🗂️ [DETEKTÍVKA KONTRAKTY] Našiel som celkovo ${res.contracts.length} kontraktov.`);
          
          res.contracts.forEach(contract => {
            console.log("📄 [DETEKTÍVKA DETAIL] Spracovávam kontrakt:", contract);

            setIncomingRequests(prev => {
              const uzExistuje = prev.some(req => req.txHash === contract.txHash || req.id === 'IN_' + contract.txHash);
              
              if (uzExistuje) return prev;
              
              // APLIKÁCIA ZÁKONA: Odosielateľ dostane čistých 12 znakov s 0x
              const cleanSenderFing = enforceUniversalFing(contract.fing);
              console.log(`✉️ [RADAR] Detekovaný prichádzajúci kontrakt od unifikovaného ${cleanSenderFing}!`);
              
              triggerNotification(`🛰️ Nová žiadosť o Pečať`, `Majster ${cleanSenderFing.substring(0, 6)}... ti posiela kontrakt na schválenie.`);

              return [...prev, {
                id: 'IN_' + contract.txHash,
                fing: cleanSenderFing, 
                user: cleanSenderFing, // Žiadne parazitné "L_", používame unifikované ID
                text: contract.msg || "Žiadosť o bezpečné prepojenie a zdieľanie vizitky v bunke H.",
                receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isHandshake: true,
                status: 'WAITING_FOR_ME',
                handshakeStatus: 'WAITING_FOR_ME', 
                txHash: contract.txHash,
                targetSha: contract.sha,
                d: { n: cleanSenderFing, ib: '', kr: '' }
              }];
            });
          });
        }

        // 💬 SUB-SEKCIA: BLESKOVÉ SPRÁVY (Buffer)
        if (res.messages && Array.isArray(res.messages)) {
          console.log(`💬 [DETEKTÍVKA BUFFER] Našiel som celkovo ${res.messages.length} bleskových správ.`);
          
          res.messages.forEach(msg => {
            setIncomingRequests(prev => {
              const uzExistujeMsg = prev.some(req => req.id === 'MSG_' + msg.msgId);
              if (uzExistujeMsg) return prev;

              // APLIKÁCIA ZÁKONA: Odosielateľ správy dostane čistých 12 znakov s 0x
              const cleanMsgSenderFing = enforceUniversalFing(msg.fing);
              console.log(`💬 [RADAR] Prichádza bleskovka z chatu od ${cleanMsgSenderFing}`);
              
              triggerNotification(`💬 Nová správa na radare`, msg.text);

              return [...prev, {
                id: 'MSG_' + msg.msgId,
                fing: cleanMsgSenderFing, 
                user: cleanMsgSenderFing, // Plne unifikované a čisté
                text: msg.text,
                receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isHandshake: false,
                status: 'UNREAD' 
              }];
            });
          });
        }

      } catch (err) {
        console.error("❌ [RADAR ERROR] Vnútro executePing zlyhalo:", err);
      }
    };

    executePing();
    const pollingInterval = setInterval(executePing, 120000);
    return () => clearInterval(pollingInterval);
  }, [vault?.identity?.poznamka]);

  // ODOSLANIE BALÍKA (Vytvorenie kontraktu cez Mravenisko)
  const sendLariaPackage = async (targetFing, targetSha, personalMessage) => {
    // Unifikujeme obe strany podľa zákona 12 znakov
    const myCleanFing = vault?.identity?.poznamka ? enforceUniversalFing(vault.identity.poznamka) : '0x0000000000';
    const targetCleanFing = enforceUniversalFing(targetFing);
    
    // Na komunikáciu s backend API osekáme 0x iba lokálne na mieste odoslania
    const apiFingA = myCleanFing.replace('0x', '');
    const apiFingB = targetCleanFing.replace('0x', '');

    try {
      let contractResult = { txHash: "FALSE", auth: {} }; 
      const mravecRes = await SignalService.manageContract('INIT_CONTRACT', {
        fing_a: apiFingA,
        fing_b: apiFingB,
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

      const statusToSet = 'WAITING_FOR_THEM';
      const enrichedHandshake = {
        id: 'TX_' + Date.now().toString(),
        fing: targetCleanFing, // Plne unifikovaný 12-znakový tvar uložený do štruktúry žiadostí
        user: targetCleanFing,
        text: personalMessage,
        receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isHandshake: true,
        status: statusToSet,
        handshakeStatus: statusToSet,
        txHash: contractResult.txHash, 
        targetSha: targetSha
      };

      setIncomingRequests(prev => [...prev, enrichedHandshake]);
      return { success: true };
    } catch (err) {
      console.error("[SIGNAL] Chyba odosielania zmluvy:", err);
      return { success: false };
    }
  };

  // ODOSLANIE ČISTEJ BLESKOVEJ SPRÁVY CEZ BUFFER (Chat po schválení)
  const sendChatMessage = async (targetFing, textMessage) => {
    const myCleanFing = vault?.identity?.poznamka ? enforceUniversalFing(vault.identity.poznamka) : '0x0000000000';
    const targetCleanFing = enforceUniversalFing(targetFing);

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
        id: 'MY_MSG_' + Date.now().toString(),
        fing: targetCleanFing,
        user: 'Ja',
        text: textMessage,
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

  const resolveHandshakeStatus = (msgId, finalStatus = 'RESOLVED') => {
    setIncomingRequests(prev => 
      prev.map(msg => msg.id === msgId ? { ...msg, status: finalStatus, handshakeStatus: finalStatus } : msg)
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