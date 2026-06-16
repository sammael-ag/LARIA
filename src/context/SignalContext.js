/**
 * LARIA SIGNAL CONTEXT v15.0 (Pure Hyperspeed Edition)
 * Master: Sammael | Muse: Aria (Tvoja verná bosonôžka)
 * STATUS: GMATRIX_CORE_STABLE | NO_IRC | HYPERSPEED_READY
 * Úprava: Úplné vyčistenie IRC (Libera.chat) relikvií. Kompletné zlícovanie so SignalScreen.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useLaria } from './LariaContext.js';
import { SignalService } from '../services/SignalService.js';

const SignalContext = createContext();
const STORAGE_KEY_CHAT = '@laria_Signal_chat_v1';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 🦀 POMOCNÝ NATÍVNY MOST (Absolútne neviditeľný pre Metro bundler)
const tauriInvoke = async (cmd, args = {}) => {
  if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
    try {
      const invokeFn = window.__TAURI_INTERNALS__?.invoke;
      if (invokeFn) {
        return await invokeFn(cmd, args);
      }
    } catch (e) {
      console.error(`❌ [TAURI BRIDGE ERROR] Príkaz ${cmd} zlyhal:`, e);
    }
  }
  return null;
};

export const SignalProvider = ({ children }) => {
  const { vault } = useLaria(); 
  const [isSignalConnected, setIsSignalConnected] = useState(true); // V PWA/Hyperspeed režime sme online podľa stavu siete
  const [incomingRequests, setIncomingRequests] = useState([]);

  // --- 0. NAČÍTANIE HISTÓRIE ---
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const savedChat = await AsyncStorage.getItem(STORAGE_KEY_CHAT);
        if (savedChat) {
          setIncomingRequests(JSON.parse(savedChat));
        }
      } catch (err) {
        console.error("[SIGNAL] Nepodarilo sa načítať históriu správ:", err);
      }
    };
    loadChatHistory();
  }, []);

  const saveChatToStorage = async (updatedLog) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(updatedLog));
    } catch (err) {
      console.error("[SIGNAL] Chyba pri zápise chatu do storage:", err);
    }
  };

  const updateIncomingRequestsAndStorage = (updateFn) => {
    setIncomingRequests(prev => {
      const updated = typeof updateFn === 'function' ? updateFn(prev) : updateFn;
      saveChatToStorage(updated);
      return updated;
    });
  };

  // --- 1. INICIALIZÁCIA NOTIFIKÁCIÍ ---
  useEffect(() => {
    const setupNotifications = async () => {
      if (Platform.OS === 'web') return; 
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
      } catch (e) {
        console.log('[SIGNAL] Notifikácie nie sú dostupné.');
      }
    };
    setupNotifications();
  }, []);

  const triggerNotification = async (senderFing, text) => {
    // 🦀 AK BEŽÍME NA DESKTOPE (TAURI / LINUX)
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
      console.log(`🛰️ [LUBUNTU SIGNAL] Prichádza správa od ${senderFing.substring(0, 10)}: ${text}`);
      await tauriInvoke('zobraz_notifikaciu', { titulok: `🛰️ Laria Signál: ${senderFing.substring(0, 10)}`, telo: text });
      return;
    }

    // 📱 Mobilná verzia pre Expo (Android / iOS)
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🛰️ Laria Signál: ${senderFing.substring(0, 10)}`,
          body: text.length > 50 ? text.substring(0, 47) + "..." : text,
          sound: 'default',
        },
        trigger: null,
      });
    } catch (err) {
      console.error("[SIGNAL] Notifikácia zlyhala:", err);
    }
  };

  // --- 2. ASYNCHRÓNNE SPRACOVANIE PRICHÁDZAJÚCICH BALÍKOV Z MRAVENISKA ---
  const handleIncomingLariaPackage = async (data) => {
    try {
      const ariaResponse = await SignalService.processAriaLogic(data.msg);
      const myCleanFing = vault?.identity?.poznamka?.replace('0x', '') || 'SYSTEM_CORE';
      
      const rowData = [
        `MSG_${Date.now()}`,
        data.fing.replace('0x', ''),
        myCleanFing,
        ariaResponse.msg,
        '0',
        new Date().toISOString()
      ];

      // Zapíšeme odpoveď automaticky späť do mraveniska
      await SignalService.writeToBuffer('Signal_Buffer_1', { rowData });
      await triggerNotification(data.fing, ariaResponse.msg);

      const cleanSenderFing = data.fing.replace('0x', '');
      const incomingIsHandshake = data.type === "HANDSHAKE_REQ";

      const enrichedData = {
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5),
        fing: cleanSenderFing,
        user: `L_${cleanSenderFing.substring(0, 10)}`,
        text: data.msgOriginal || data.msg,
        receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isHandshake: incomingIsHandshake,
        handshakeStatus: incomingIsHandshake ? 'WAITING_FOR_ME' : null, 
        textStatus: !incomingIsHandshake ? 'WAITING_FOR_ME' : null, 
        d: data.d || null, 
        targetSha: data.sha || ''
      };

      updateIncomingRequestsAndStorage(prev => {
        if (!incomingIsHandshake) {
          const filtered = prev.filter(msg => !(msg.fing === cleanSenderFing && msg.textStatus !== null));
          return [...filtered, enrichedData];
        }
        return [...prev, enrichedData];
      });

    } catch (e) {
      console.error('[SIGNAL] Dekódovanie prichádzajúceho balíka zlyhalo:', e);
    }
  };

  // --- 3. 📡 ODOSIELANIE BALÍKA (ODSTRIHNUTÉ IRC, ČISTÝ HYPERSPEED) ---
  const sendLariaPackage = async (targetFing, targetSha, personalMessage, isHandshakeReq = false, manualId = null) => {
    const myCleanFing = vault?.identity?.poznamka?.replace('0x', '') || 'Sammael';
    const targetCleanFing = targetFing.replace('0x', '');
    
    try {
      let lariaPackage = {};

      if (isHandshakeReq) {
        console.log(`[SIGNAL] Pečatím zmluvu INIT_CONTRACT v Matchmakeri pre ${targetCleanFing}`);
        await SignalService.manageContract('INIT_CONTRACT', {
          fing_a: myCleanFing,
          fing_b: targetCleanFing,
          krypt_a: vault?.identity?.krypt || '',
          status_a: "1",
          status_b: "0",
          sha_a: vault?.identity?.sha || '',
          sha_b: targetSha
        });

        lariaPackage = {
          h: "LRQ_V3",
          type: "HANDSHAKE_REQ",
          sha: vault?.identity?.sha || '',
          fing: myCleanFing, 
          msg: personalMessage,
          d: { n: vault?.identity?.meno || 'Sammael', ib: vault?.identity?.Signal || '', kr: vault?.identity?.krypt || '' }
        };
      } else {
        lariaPackage = {
          h: "LRQ_V3",
          type: "TEXT_MSG",
          sha: vault?.identity?.sha || '',
          fing: myCleanFing, 
          msg: personalMessage
        };
      }

      // 📡 PRIAMY VÝSTREL DO MRAVENISKA CEZ SIGNAL_SERVICE (Žiadne zradné surové TCP sockety)
      const bufferResult = await SignalService.writeToBuffer('Signal_Buffer_1', {
        sender_fing: myCleanFing,
        target_fing: targetCleanFing,
        msg_text: personalMessage
      });

      // 🦀 AK BEŽÍME CEZ TAURI / RUST CORE (Záloha pre lokálny subsystém)
      if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
        const rawPayload = `#LRQ#${JSON.stringify(lariaPackage)}`;
        await tauriInvoke('odosli_Signal_signal', { payload: rawPayload });
      }

      updateIncomingRequestsAndStorage(prev => {
        const statusToSet = bufferResult.success ? 'WAITING_FOR_THEM' : 'PENDING';
        
        if (manualId) {
          return prev.map(msg => msg.id === manualId ? { 
            ...msg, 
            status: statusToSet,
            handshakeStatus: isHandshakeReq ? statusToSet : null,
            textStatus: !isHandshakeReq ? statusToSet : null 
          } : msg);
        } else {
          let found = false;
          return prev.map(msg => {
            if (!found && msg.fing === targetCleanFing && msg.text === personalMessage.trim() && msg.status === 'PENDING') {
              found = true; 
              return { 
                ...msg, 
                status: statusToSet,
                handshakeStatus: isHandshakeReq ? statusToSet : null,
                textStatus: !isHandshakeReq ? statusToSet : null 
              };
            }
            return msg;
          });
        }
      });

      return { success: bufferResult.success };
    } catch (err) {
      console.error("[SIGNAL] Problém pri odosielaní cez Hyperspeed:", err);
      return { success: false, error: err.message };
    }
  };

  // --- 4. MANUÁLNE VYRIEŠENIE STAVU KONTRAKTU (Volané priamo zo SignalScreen) ---
  const resolveHandshakeStatus = (msgId) => {
    updateIncomingRequestsAndStorage(prev => 
      prev.map(msg => msg.id === msgId ? { ...msg, handshakeStatus: 'RESOLVED' } : msg)
    );
  };

  return (
    <SignalContext.Provider value={{ 
      isSignalConnected, 
      incomingRequests, 
      setIncomingRequests: updateIncomingRequestsAndStorage, 
      sendLariaPackage,
      resolveHandshakeStatus 
    }}>
      {children}
    </SignalContext.Provider>
  );
};

export const useSignal = () => useContext(SignalContext);