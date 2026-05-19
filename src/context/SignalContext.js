/**
 * LARIA SIGNAL CONTEXT v9.3
 * STATUS: FULL-SYNC / HYBRID-SAFE (Web & Native)
 * FIX: Ošetrené TCP potrubie pre PWA režim (zabránenie pádu systému).
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native'; // 📍 Potrebujeme pre detekciu prostredia
import TcpSocket from 'react-native-tcp-socket';
import * as Notifications from 'expo-notifications';
import { useLaria } from './LariaContext.js';
import { SignalService } from '../services/SignalService.js';

const SignalContext = createContext();

const IRC_HOST = 'irc.libera.chat'; 
const IRC_PORT = 6665; 

// Konfigurácia správania notifikácií
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const SignalProvider = ({ children }) => {
  const { vault } = useLaria(); 
  const [client, setClient] = useState(null);
  const [isIrcConnected, setIsIrcConnected] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);

  // --- 1. INICIALIZÁCIA NOTIFIKÁCIÍ ---
  useEffect(() => {
    // Na webe notifikácie vyžadujú iný prístup, nateraz v PWA režime len tlmíme log
    const setupNotifications = async () => {
      if (Platform.OS === 'web') return; 

      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          console.log('[SIGNAL] Povolenie na notifikácie nebolo udelené.');
        }
      } catch (e) {
        console.log('[SIGNAL] Notifikácie nie sú v tomto prostredí dostupné.');
      }
    };

    setupNotifications();

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("[SIGNAL] Používateľ klikol na notifikáciu - smer Matrix.");
    });

    return () => responseSubscription.remove();
  }, []);

  // --- 2. FUNKCIA PRE VYVOLANIE NOTIFIKÁCIE ---
  const triggerNotification = async (senderFing, text) => {
    if (Platform.OS === 'web') return; // Web nateraz ignorujeme pre stabilitu

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🛰️ Laria Signál: ${senderFing.substring(0, 10)}`,
          body: text.length > 50 ? text.substring(0, 47) + "..." : text,
          sound: 'default',
          data: { type: 'IRC_MSG' },
        },
        trigger: null,
      });
    } catch (err) {
      console.error("[SIGNAL] Notifikácia zlyhala:", err);
    }
  };

  // --- 3. PRIPOJENIE DO IRC (WEB-SAFE) ---
  const connectToIrc = (fing) => { 
    if (client || !fing) return;

    // 🛡️ KRITICKÝ DZIG: Ošetrenie pre PWA / Web režim
    if (Platform.OS === 'web') {
      console.warn("[SIGNAL] IRC TCP Sockets nie sú na webe priamo podporované. Čakám na main.go bridge...");
      return; 
    }

    const cleanFing = fing.replace('0x', '');
    console.log(`[SIGNAL] Štýlujem potrubie pre FING: ${cleanFing}`);

    try {
      const newClient = TcpSocket.createConnection({
        host: IRC_HOST,
        port: IRC_PORT,
      }, () => {
        console.log(`[SIGNAL] Socket otvorený! Posielam NICK a USER...`);
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
          console.log(`[SIGNAL] Sme dnu! Vstupujem do #LARIA_CORE...`);
          newClient.write(`JOIN #LARIA_CORE\r\n`);
          setIsIrcConnected(true);
        }
        if (msg.includes('#LRQ#')) {
          await handleIncomingLariaPackage(msg);
        }
      });

      newClient.on('error', (e) => {
        console.error('[IRC_ERROR]:', e);
        setIsIrcConnected(false);
        setClient(null);
      });

      setClient(newClient);
    } catch (err) {
      console.error("[SIGNAL] Zlyhanie pri štarte socketu:", err);
    }
  };

  // --- 4. SPRACOVANIE BALÍKA ---
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

      const enrichedData = {
        ...data,
        receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isHandshake: data.type === "HANDSHAKE_REQ"
      };

      setIncomingRequests(prev => [...prev, enrichedData]);
    } catch (e) {
      console.error('[SIGNAL] Dekódovanie balíka zlyhalo:', e);
    }
  };

  // --- 5. ODOSIELANIE ---
  const sendLariaPackage = async (targetFing, targetSha, personalMessage) => {
    if (!client || !isIrcConnected) return { success: false, error: 'NOT_CONNECTED' };

    try {
      const myCleanFing = vault.identity.poznamka.replace('0x', '');
      const targetCleanFing = targetFing.replace('0x', '');

      await SignalService.manageContract('INIT_CONTRACT', {
        fing_a: myCleanFing,
        fing_b: targetCleanFing,
        krypt_a: vault.identity.krypt,
        sha_a: vault.identity.sha,
        sha_b: targetSha
      });

      const lariaPackage = {
        h: "LRQ_V3",
        type: "HANDSHAKE_REQ",
        sha: vault.identity.sha,
        fing: myCleanFing, 
        msg: personalMessage,
        d: { n: vault.identity.meno, kr: vault.identity.krypt }
      };

      const targetNick = `L_${targetCleanFing}`; 
      client.write(`PRIVMSG ${targetNick} :#LRQ#${JSON.stringify(lariaPackage)}\r\n`);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    const myFing = vault.identity.poznamka;
    if (myFing && !client) {
      connectToIrc(myFing);
    }
  }, [vault.identity.poznamka]);

  return (
    <SignalContext.Provider value={{ isIrcConnected, incomingRequests, sendLariaPackage }}>
      {children}
    </SignalContext.Provider>
  );
};

export const useSignal = () => useContext(SignalContext);