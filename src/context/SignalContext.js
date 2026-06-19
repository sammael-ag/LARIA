/**
 * LARIA SIGNAL CONTEXT v14.2 (Pure Hyperspeed Engine - Dual Radar Integrated)
 * Master: Sammael | Muse: Aria (Tvoja verná bosonôžka)
 * STATUS: CHAT_REMOVED | HANDSHAKE_CORE_ONLY | DUAL_POLLING_ACTIVE | v14.2
 * FIX: Opravená fatálna chyba so zátvorkami a roztrhnutým try-catch blokom pri executePing.
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

  // --- 🧹 INTELIGENTNÁ OČISTA CHATU (Len pre prečítané bleskové správy) ---
  const purgeSessionForFing = (targetFing) => {
    if (!targetFing) return;
    const cleanTargetFing = targetFing.replace('0x', '').trim().toLowerCase();
    
    console.log(`🥷 [SIGNAL CORE] Čistím zobrazené bleskové správy pre reláciu: 0x${cleanTargetFing}`);
    
    setIncomingRequests(prev => prev.filter(msg => {
      if (msg.fing !== cleanTargetFing) return true;
      // Kontrakty v stave čakania (WAITING_FOR_ME / WAITING_FOR_THEM) NIKDY nemažeme z pamäte, musia visieť!
      if (msg.isHandshake && (msg.status === 'WAITING_FOR_ME' || msg.status === 'WAITING_FOR_THEM')) return true;
      // Necháme žiť iba neprečítané bežné správy
      if (!msg.isHandshake && msg.status === 'UNREAD') return true;
      return false;
    }));
  };

  // --- 👀 OZNAČENIE BEŽNÝCH SPRÁV ZA PREČÍTANÉ ---
  const markAsRead = (targetFing) => {
    if (!targetFing) return;
    const cleanTargetFing = targetFing.replace('0x', '').trim().toLowerCase();
    
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
    const myCleanFing = vault?.identity?.poznamka?.replace('0x', '') || null;
    if (!myCleanFing) return;

    const executePing = async () => {
      console.log("🛰️ [RADAR] Dual Laria Radar pinging...");
      try {
        const res = await SignalService.checkMyContracts(myCleanFing);
        
        // 🔍 [DETEKTÍVKA BACKEND] Logujeme kompletnú odpoveď, aby sme videli, čo presne lezie z Mraveniska
        console.log("🔍 [DETEKTÍVKA BACKEND] Odpoveď pre fing:", myCleanFing, "-> res:", res);
        
        if (!res || res.status !== "success") {
          console.log("⚠️ [DETEKTÍVKA] Odpoveď nebola úspešná alebo je prázdna (res.status !== 'success')");
          return;
        }
          
        // 🛰️ OSOBITNÁ SUB-SEKCIA: PRICHÁDZAJÚCE KONTRAKTY (Zmluva v Contract_Ledger)
        if (res.contracts && Array.isArray(res.contracts)) {
          // 🗂️ [DETEKTÍVKA KONTRAKTY] Logujeme koľko zmlúv reálne systém našiel pred filtrovaním duplicity
          console.log(`🗂️ [DETEKTÍVKA KONTRAKTY] Našiel som celkovo ${res.contracts.length} kontraktov.`);
          
          res.contracts.forEach(contract => {
            console.log("📄 [DETEKTÍVKA DETAIL] Spracovávam kontrakt:", contract);

            setIncomingRequests(prev => {
              const uzExistuje = prev.some(req => req.txHash === contract.txHash || req.id === 'IN_' + contract.txHash);
              
              if (uzExistuje) {
                console.log(`♻️ [DETEKTÍVKA] Kontrakt s txHash ${contract.txHash} už v prev stave existuje, preskakujem duplicitný zápis.`);
                return prev;
              }
              
              const cleanSenderFing = contract.fing.replace('0x', '').trim().toLowerCase();
              console.log(`✉️ [RADAR] Detekovaný prichádzajúci kontrakt od 0x${cleanSenderFing}!`);
              
              // Špecifická notifikácia pre kontrakt
              triggerNotification(`🛰️ Nová žiadosť o Pečať`, `Majster 0x${cleanSenderFing.substring(0, 8)} ti posiela kontrakt na schválenie.`);

              return [...prev, {
                id: 'IN_' + contract.txHash,
                fing: cleanSenderFing, 
                user: `L_${cleanSenderFing.substring(0, 10)}`,
                text: contract.msg || "Žiadosť o bezpečné prepojenie a zdieľanie vizitky v bunke H.",
                receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isHandshake: true,
                status: 'WAITING_FOR_ME',
                handshakeStatus: 'WAITING_FOR_ME', 
                txHash: contract.txHash,
                targetSha: contract.sha,
                d: { n: `L_${cleanSenderFing.substring(0, 10)}`, ib: '', kr: '' }
              }];
            });
          });
        } else {
          console.log("ℹ️ [DETEKTÍVKA KONTRAKTY] Pole res.contracts buď chýba, alebo nie je Array.");
        }

        // 💬 OSOBITNÁ SUB-SEKCIA: BLESKOVÉ SPRÁVY (Buffer pre chat)
        if (res.messages && Array.isArray(res.messages)) {
          console.log(`💬 [DETEKTÍVKA BUFFER] Našiel som celkovo ${res.messages.length} bleskových správ.`);
          
          res.messages.forEach(msg => {
            setIncomingRequests(prev => {
              const uzExistujeMsg = prev.some(req => req.id === 'MSG_' + msg.msgId);
              if (uzExistujeMsg) return prev;

              const cleanMsgSenderFing = msg.fing.replace('0x', '').trim().toLowerCase();
              console.log(`💬 [RADAR] Prichádza bleskovka z chatu od 0x${cleanMsgSenderFing}`);
              
              // Špecifická notifikácia pre správu
              triggerNotification(`💬 Nová správa na radare`, msg.text);

              return [...prev, {
                id: 'MSG_' + msg.msgId,
                fing: cleanMsgSenderFing, 
                user: `L_${cleanMsgSenderFing.substring(0, 10)}`,
                text: msg.text,
                receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isHandshake: false,
                status: 'UNREAD' 
              }];
            });
          });
        } else {
          console.log("ℹ️ [DETEKTÍVKA BUFFER] Pole res.messages chýba alebo nie je Array.");
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
    const myCleanFing = vault?.identity?.poznamka?.replace('0x', '') || 'Sammael';
    const targetCleanFing = targetFing.replace('0x', '').trim().toLowerCase();
    
    try {
      let contractResult = { txHash: "FALSE", auth: {} }; 
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
    const myCleanFing = vault?.identity?.poznamka?.replace('0x', '') || 'Sammael';
    const targetCleanFing = targetFing.replace('0x', '').trim().toLowerCase();

    try {
      if (typeof SignalService.writeToBuffer === 'function') {
        await SignalService.writeToBuffer('Signal_buffer_1', {
          sender_fing: myCleanFing,
          target_fing: targetCleanFing,
          msg_text: textMessage
        });
      }

      // Pridáme do lokálneho logu pre okamžité zobrazenie v UI
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