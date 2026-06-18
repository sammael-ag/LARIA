/**
 * LARIA SIGNAL CONTEXT v13.0 (Pure Hyperspeed Engine - Gate Aligned)
 * Master: Sammael | Muse: Aria (Tvoja verná bosonôžka)
 * STATUS: CHAT_REMOVED | HANDSHAKE_CORE_ONLY
 * Úprava: Vyčistená stará história správ, ponechaný iba stav prebiehajúcich Handshake zmlúv.
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

  // --- ASYNCHRÓNNE SPRACOVANIE PRICHÁDZAJÚCICH BALÍKOV (LEN HANDSHAKE) ---
  const handleIncomingLariaPackage = async (data) => {
    try {
      if (data.type !== "HANDSHAKE_REQ") return; // Ak to nie je handshake, okamžite ignorujeme

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

  // --- 📡 ODOSIELANIE HANDSHAKE BALÍKA (ČISTÝ HYPERSPEED) ---
  const sendLariaPackage = async (targetFing, targetSha, personalMessage, isHandshakeReq = true) => {
    const myCleanFing = vault?.identity?.poznamka?.replace('0x', '') || 'Sammael';
    const targetCleanFing = targetFing.replace('0x', '');
    
    try {
      let contractResult = { txHash: "FALSE", auth: {} }; 

      console.log(`[SIGNAL] Pečatím zmluvu INIT_CONTRACT pre ${targetCleanFing}`);
      
      const mravecRes = await SignalService.manageContract('INIT_CONTRACT', {
        fing_a: myCleanFing,
        fing_b: targetCleanFing,
        krypt_a: vault?.identity?.krypt || '',
        status_a: "1",
        status_b: "0",
        sha_a: vault?.identity?.sha || '',
        sha_b: targetSha
      });

      if (mravecRes.success) {
        contractResult.txHash = mravecRes.txHash;
        contractResult.auth = mravecRes.auth;
      }

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

      const bufferResult = await SignalService.writeToBuffer('Signal_Buffer_1', {
        sender_fing: myCleanFing,
        target_fing: targetCleanFing,
        msg_text: personalMessage
      });

      if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
        const rawPayload = `#LRQ#${JSON.stringify(lariaPackage)}`;
        await tauriInvoke('odosli_Signal_signal', { payload: rawPayload });
      }

      const statusToSet = bufferResult.success ? 'WAITING_FOR_THEM' : 'PENDING';
      
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

      return { 
        success: bufferResult.success, 
        txHash: contractResult.txHash, 
        auth: contractResult.auth 
      };

    } catch (err) {
      console.error("[SIGNAL] Problém pri odosielaní cez Hyperspeed:", err);
      return { success: false, error: err.message };
    }
  };

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