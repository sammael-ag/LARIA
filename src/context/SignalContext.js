/**
 * LARIA SIGNAL CONTEXT v14.2 (Ephemeral Ping-Pong Edition)
 * Master: Sammael | Muse: Aria (Tvoja verná bosonôžka)
 * STATUS: SUPERSCHOPNOST_AKTIVNA | NEVYPATRATELNE | EFEKTIVNE_STATUSOVANIE
 * Úprava: Úplné odstrihnutie textových reťazcov Tauri pre oklamanie Metro bundleru.
 * Používa priamy prístup k window.__TAURI_INTERNALS__ bez dynamických importov.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import TcpSocket from 'react-native-tcp-socket';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useLaria } from './LariaContext.js';
import { SignalService } from '../services/SignalService.js';

const SignalContext = createContext();

const IRC_HOST = 'irc.libera.chat'; 
const IRC_PORT = 6665; 
const STORAGE_KEY_CHAT = '@laria_irc_chat_v1';

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
      // Vytiahneme invoke priamo z globálnej pamäte Tauri jadra v Lubuntu
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
  const [client, setClient] = useState(null);
  const [isIrcConnected, setIsIrcConnected] = useState(false);
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

  // --- 2. PRIPOJENIE DO IRC ---
  const connectToIrc = async (fing) => { 
    if (client || !fing) return;

    const cleanFing = fing.replace('0x', '');

    // 🦀 AK BEŽÍME NA DESKTOPE (TAURI / LINUX)
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
      console.log("🌲 SIGNAL_CORE: Štartujem natívny IRC most cez Rust...");
      await tauriInvoke('pripoj_irc_signal', { fing: cleanFing });
      setIsIrcConnected(true);
      setClient({ tauriActive: true });
      return;
    }

    // 📱 STARÁ MOBILNÁ VETVA (Zostáva zachovaná pre Android/iOS)
    try {
      const newClient = TcpSocket.createConnection({
        host: IRC_HOST,
        port: IRC_PORT,
      }, () => {
        const nick = `L_${cleanFing}`; 
        newClient.write(`NICK ${nick}\r\n`);
        newClient.write(`USER ${nick} 8 * :LariaNode_${cleanFing}\r\n`);
      });

      newClient.on('data', async (data) => {
        const msg = data.toString();
        if (msg.startsWith('PING')) {
          const pingId = msg.split(' ')[1];
          newClient.write(`PONG ${pingId}\r\n`);
        }
        if (msg.includes(' 001 ')) {
          newClient.write(`JOIN #LARIA_CORE\r\n`);
          setIsIrcConnected(true);
        }
        if (msg.includes('#LRQ#')) {
          await handleIncomingLariaPackage(msg);
        }
      });

      newClient.on('error', (e) => {
        setIsIrcConnected(false);
        setClient(null);
      });

      setClient(newClient);
    } catch (err) {
      console.error("[SIGNAL] Zlyhanie pri štarte mobilného socketu:", err);
    }
  };

  // --- 3. SPRACOVANIE PRICHÁDZAJÚCICH SPRÁV ---
  const handleIncomingLariaPackage = async (rawMsg) => {
    try {
      const payloadPart = rawMsg.split('#LRQ#')[1];
      const data = JSON.parse(payloadPart);
      const ariaResponse = await SignalService.processAriaLogic(data.msg);
      
      const rowData = [
        `MSG_${Date.now()}`,
        data.fing.replace('0x', ''),
        vault.identity.poznamka.replace('0x', ''),
        ariaResponse.msg,
        '0',
        new Date().toISOString()
      ];

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
      console.error('[SIGNAL] Dekódovanie balíka zlyhalo:', e);
    }
  };

  // --- 4. 📡 ODOSIELANIE BALÍKA (PING-PONG REŽIM) ---
  const sendLariaPackage = async (targetFing, targetSha, personalMessage, isHandshakeReq = false, manualId = null) => {
    const myCleanFing = vault.identity.poznamka.replace('0x', '');
    const targetCleanFing = targetFing.replace('0x', '');
    
    if (!client || !isIrcConnected) {
      console.log("[SIGNAL] Detekované offline prostredie. Správa bezpečne čaká v UI ako PENDING.");
      return { success: false, error: 'OFFLINE_PENDING_QUEUED' };
    }

    try {
      let lariaPackage = {};

      if (isHandshakeReq) {
        console.log(`[SIGNAL] Pečatím zmluvu INIT_CONTRACT v Matchmakeri pre ${targetCleanFing}`);
        await SignalService.manageContract('INIT_CONTRACT', {
          fing_a: myCleanFing,
          fing_b: targetCleanFing,
          krypt_a: vault.identity.krypt,
          status_a: "1",
          status_b: "0",
          sha_a: vault.identity.sha,
          sha_b: targetSha
        });

        lariaPackage = {
          h: "LRQ_V3",
          type: "HANDSHAKE_REQ",
          sha: vault.identity.sha,
          fing: myCleanFing, 
          msg: personalMessage,
          d: { n: vault.identity.meno, ib: vault.identity.irc, kr: vault.identity.krypt }
        };
      } else {
        lariaPackage = {
          h: "LRQ_V3",
          type: "TEXT_MSG",
          sha: vault.identity.sha,
          fing: myCleanFing, 
          msg: personalMessage
        };
      }

      const targetNick = `L_${targetCleanFing}`; 
      const rawPayload = `PRIVMSG ${targetNick} :#LRQ#${JSON.stringify(lariaPackage)}\r\n`;

      // 🦀 AK BEŽÍME CEZ TAURI / RUST CORE
      if (client && client.tauriActive) {
        console.log("🌲 SIGNAL_CORE: Posielam balík natívne cez Rust Tauri most...");
        await tauriInvoke('odosli_irc_signal', { payload: rawPayload });
      } else if (client) {
        // 📱 AK BEŽÍME NA MOBILE (Klasický TcpSocket)
        client.write(rawPayload);
      }

      updateIncomingRequestsAndStorage(prev => {
        if (manualId) {
          return prev.map(msg => msg.id === manualId ? { 
            ...msg, 
            handshakeStatus: isHandshakeReq ? 'WAITING_FOR_THEM' : null,
            textStatus: !isHandshakeReq ? 'WAITING_FOR_THEM' : null 
          } : msg);
        } else {
          let found = false;
          return prev.map(msg => {
            if (!found && msg.fing === targetCleanFing && msg.text === personalMessage.trim() && msg.status === 'PENDING') {
              found = true; 
              return { 
                ...msg, 
                handshakeStatus: isHandshakeReq ? 'WAITING_FOR_THEM' : null,
                textStatus: !isHandshakeReq ? 'WAITING_FOR_THEM' : null 
              };
            }
            return msg;
          });
        }
      });

      return { success: true };
    } catch (err) {
      console.error("[SIGNAL] Problém pri odosielaní balíka:", err);
      return { success: false, error: err.message };
    }
  };

  // --- 5. 🛰️ FLUSHER MOTOR ---
  useEffect(() => {
    const flushOfflineQueue = async () => {
      if (!isIrcConnected || !client || incomingRequests.length === 0) return;
      const pendingMessages = incomingRequests.filter(msg => msg.status === 'PENDING');
      
      if (pendingMessages.length > 0) {
        console.log(`[SIGNAL] Obnovenie siete! Splachujem ${pendingMessages.length} PENDING správ...`);
        for (const msg of pendingMessages) {
          await sendLariaPackage(msg.fing, msg.targetSha || '', msg.text, msg.isHandshake || false, msg.id);
        }
      }
    };
    flushOfflineQueue();
  }, [isIrcConnected, client]);

  // --- 6. MANUÁLNE VYRIEŠENIE STAVU KONTRAKTU ---
  const resolveHandshakeStatus = (msgId) => {
    updateIncomingRequestsAndStorage(prev => 
      prev.map(msg => msg.id === msgId ? { ...msg, handshakeStatus: 'RESOLVED' } : msg)
    );
  };

  useEffect(() => {
    const myFing = vault.identity.poznamka;
    if (myFing && !client) {
      connectToIrc(myFing);
    }
  }, [vault.identity.poznamka]);

  return (
    <SignalContext.Provider value={{ 
      isIrcConnected, 
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