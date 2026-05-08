/**
 * LARIA SIGNAL CONTEXT v9.2
 * STATUS: FULL-SYNC / NOTIFICATION ENABLED
 * LOGIKA: IRC (FING identity) + Expo Notifications (Systémový zvuk).
 * Lícované na Matchmaker v9.3 a IRCScreen v9.5.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import TcpSocket from 'react-native-tcp-socket';
import * as Notifications from 'expo-notifications';
import { useLaria } from './LariaContext';
import { SignalService } from '../src/services/SignalService';

const SignalContext = createContext();

const IRC_HOST = 'irc.libera.chat'; 
const IRC_PORT = 6665; 

// Konfigurácia správania notifikácií (keď je appka otvorená)
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
    const setupNotifications = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('[SIGNAL] Povolenie na notifikácie nebolo udelené.');
      }
    };

    setupNotifications();

    // Listener pre kliknutie na notifikáciu
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("[SIGNAL] Používateľ klikol na notifikáciu - smer Matrix.");
      // Tu môžeš pridať navigáciu cez ref, ak budeš chcieť automatický skok na IRCScreen
    });

    return () => responseSubscription.remove();
  }, []);

  // --- 2. FUNKCIA PRE VYVOLANIE NOTIFIKÁCIE ---
  const triggerNotification = async (senderFing, text) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🛰️ Laria Signál: ${senderFing.substring(0, 10)}`,
          body: text.length > 50 ? text.substring(0, 47) + "..." : text,
          sound: 'default',
          data: { type: 'IRC_MSG' },
        },
        trigger: null, // Okamžite
      });
    } catch (err) {
      console.error("[SIGNAL] Notifikácia zlyhala:", err);
    }
  };

  // --- 3. PRIPOJENIE DO IRC ---
  const connectToIrc = (fing) => { 
    if (client || !fing) return;

    const cleanFing = fing.replace('0x', '');
    console.log(`[SIGNAL] Štýlujem potrubie pre FING: ${cleanFing}`);

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
      
      // Diagnostika servera
      if (msg.includes('NOTICE')) console.log(`[IRC_RAW]: ${msg.substring(0, 60)}`);

      // PING-PONG (Udržiavanie spojenia)
      if (msg.startsWith('PING')) {
        const pingId = msg.split(' ')[1];
        newClient.write(`PONG ${pingId}\r\n`);
      }

      // Kód 001 - Vitajte na serveri
      if (msg.includes(' 001 ')) {
        console.log(`[SIGNAL] Sme dnu! Vstupujem do #LARIA_CORE...`);
        newClient.write(`JOIN #LARIA_CORE\r\n`);
        setIsIrcConnected(true);
      }

      // Detekcia Laria Balíka (#LRQ#)
      if (msg.includes('#LRQ#')) {
        console.log(`[SIGNAL] Zachytený prichádzajúci signál!`);
        await handleIncomingLariaPackage(msg);
      }
    });

    newClient.on('error', (e) => {
      console.error('[IRC_ERROR]:', e);
      setIsIrcConnected(false);
      setClient(null);
    });

    setClient(newClient);
  };

  // --- 4. SPRACOVANIE BALÍKA A NOTIFIKÁCIA ---
  const handleIncomingLariaPackage = async (rawMsg) => {
    try {
      const payloadPart = rawMsg.split('#LRQ#')[1];
      const data = JSON.parse(payloadPart);
      
      const ariaResponse = await SignalService.processAriaLogic(data.msg);
      
      // 1. Zápis do G-Matrix (onlyFING)
      const rowData = [
        `MSG_${Date.now()}`,
        data.fing.replace('0x', ''),
        vault.identity.poznamka.replace('0x', ''),
        ariaResponse.msg,
        '0',
        new Date().toISOString()
      ];

      await SignalService.writeToBuffer('Signal_Buffer_1', { rowData });

      // 2. Vyvolanie systémovej notifikácie
      await triggerNotification(data.fing, ariaResponse.msg);

      // 3. Aktualizácia lokálneho stavu pre obrazovku
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

      // Pečatíme v Matchmakeri
      await SignalService.manageContract('INIT_CONTRACT', {
        fing_a: myCleanFing,
        fing_b: targetCleanFing,
        krypt_a: vault.identity.krypt,
        status_a: "1",
        status_b: "0",
        sha_a: vault.identity.sha,
        sha_b: targetSha
      });

      // Balíme pre IRC
      const lariaPackage = {
        h: "LRQ_V3",
        type: "HANDSHAKE_REQ",
        sha: vault.identity.sha,
        fing: myCleanFing, 
        msg: personalMessage,
        d: {
            n: vault.identity.meno,
            ib: vault.identity.irc,
            kr: vault.identity.krypt
        }
      };

      const targetNick = `L_${targetCleanFing}`; 
      const payload = JSON.stringify(lariaPackage);
      
      client.write(`PRIVMSG ${targetNick} :#LRQ#${payload}\r\n`);
      
      console.log(`[SIGNAL] Signál odpálený na ${targetNick}`);
      return { success: true };

    } catch (err) {
      console.error("[SIGNAL] Odosielanie zlyhalo:", err);
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