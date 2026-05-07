/**
 * LARIA SIGNAL CONTEXT v8.8
 * STATUS: ULTRA-PURE / THE LAW
 * LOGIKA: IRC Nick = FING. Žiadne SecureID, žiadne SHA v éteri.
 * PORADIE: sha, meno, kat, lok, popis, gal, irc, poznamka (fing), krypt
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import TcpSocket from 'react-native-tcp-socket';
import { useLaria } from './LariaContext';
import { SignalService } from '../src/services/SignalService';

const SignalContext = createContext();

const IRC_HOST = 'irc.libera.chat'; 
const IRC_PORT = 6667;

export const SignalProvider = ({ children }) => {
  const { vault } = useLaria(); 
  const [client, setClient] = useState(null);
  const [isIrcConnected, setIsIrcConnected] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);

  // --- 1. PRIPOJENIE DO IRC (Verejná identita FING) ---
  const connectToIrc = (fing) => { 
    if (client || !fing) return;

    console.log(`[SIGNAL] Štýlujem potrubie pre FING: ${fing}`);

    const newClient = TcpSocket.createConnection({
      host: IRC_HOST,
      port: IRC_PORT,
    }, () => {
      // IRC Nickname je odvodený z tvojho verejného FINGu
      const nick = `L_${fing.substring(0, 15)}`; 
      newClient.write(`NICK ${nick}\r\n`);
      newClient.write(`USER ${nick} 8 * :LariaNode_${fing}\r\n`);
      newClient.write(`JOIN #LARIA_CORE\r\n`);
      setIsIrcConnected(true);
    });

    newClient.on('data', async (data) => {
      const msg = data.toString();
      if (msg.startsWith('PING')) {
        newClient.write(`PONG ${msg.split(' ')[1]}\r\n`);
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
  };

  // --- 2. SPRACOVANIE PRICHÁDZAJÚCEHO BALÍKA ---
  const handleIncomingLariaPackage = async (rawMsg) => {
    try {
      const payloadPart = rawMsg.split('#LRQ#')[1];
      const data = JSON.parse(payloadPart);
      
      // Aria spracuje logiku správy
      const ariaResponse = await SignalService.processAriaLogic(data.msg);
      
      // ZÁPIS DO BUFFERA (Synchronizácia s G-Matrix)
      // rowData podľa protokolu: [ID, sender_sha, target_sha, msg, status, time]
      const rowData = [
        `MSG_${Date.now()}`,
        data.sha,              // SHA odosielateľa (vnútri balíka)
        vault.identity.sha,    // Moje SHA (príjemca)
        ariaResponse.msg,      // Odpoveď alebo správa
        '0',                   // Status: doručené/neprečítané
        new Date().toISOString()
      ];

      await SignalService.writeToBuffer('Signal_Buffer_1', { rowData });

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

  // --- 3. ODOSIELANIE VIZITKY (HANDSHAKE) ---
  const sendLariaPackage = async (targetFing, targetSha, personalMessage) => {
    if (!client || !isIrcConnected) return { success: false, error: 'NOT_CONNECTED' };

    try {
      // Priama inicializácia kontraktu v G-Matrix bez zbytočného SecureID
      await SignalService.manageContract('INIT_CONTRACT', {
        sha: vault.identity.sha,
        target_sha: targetSha,
        status_a: "1",
        status_b: "0"
      });

      // Balenie dát - Čistý Laria Protokol v3
      const lariaPackage = {
        h: "LRQ_V3",
        type: "HANDSHAKE_REQ",
        sha: vault.identity.sha,       // SHA posielame len koncovému bodu
        fing: vault.identity.poznamka, // Náš verejný FING
        msg: personalMessage,
        d: {
            n: vault.identity.meno,    // meno
            ib: vault.identity.irc,    // irc/revolut
            kr: vault.identity.krypt   // krypt peňaženka
        }
      };

      // Cieľový Nick na IRC je FING adresáta
      const targetNick = `L_${targetFing.substring(0, 15)}`; 
      const payload = JSON.stringify(lariaPackage);
      
      client.write(`PRIVMSG ${targetNick} :#LRQ#${payload}\r\n`);
      
      return { success: true };

    } catch (err) {
      console.error("[SIGNAL] Odosielanie zlyhalo:", err);
      return { success: false, error: err.message };
    }
  };

  // --- 4. WATCHDOG PRE PRIPOJENIE ---
  useEffect(() => {
    const myFing = vault.identity.poznamka; // FING je uložený v poznámke
    if (myFing && !client) {
      connectToIrc(myFing);
    }
  }, [vault.identity.poznamka]);

  return (
    <SignalContext.Provider value={{
      isIrcConnected,
      incomingRequests,
      sendLariaPackage,
    }}>
      {children}
    </SignalContext.Provider>
  );
};

export const useSignal = () => useContext(SignalContext);