import React, { createContext, useContext, useState, useEffect } from 'react';
import TcpSocket from 'react-native-tcp-socket';
import { useLaria } from './LariaContext';
import { SignalService } from '../src/services/SignalService';

const SignalContext = createContext();

// Nastavenie prístavu v Libera vesmíre
const IRC_HOST = 'irc.libera.chat'; 
const IRC_PORT = 6667;

export const SignalProvider = ({ children }) => {
  const { vault } = useLaria(); // Tvoj hlavný kufor s identitou
  const [client, setClient] = useState(null);
  const [isIrcConnected, setIsIrcConnected] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);

  // --- PRIPOJENIE DO IRC ---
  const connectToIrc = (userAddress) => {
    if (client || !userAddress) return;

    console.log(`[SIGNAL] Štartujem TCP potrubie pre: ${userAddress}`);

    const newClient = TcpSocket.createConnection({
      host: IRC_HOST,
      port: IRC_PORT,
    }, () => {
      const nick = `L_${userAddress.substring(2, 10)}`;
      newClient.write(`NICK ${nick}\r\n`);
      newClient.write(`USER ${nick} 8 * :LariaNode_${userAddress}\r\n`);
      newClient.write(`JOIN #LARIA_CORE\r\n`);
      setIsIrcConnected(true);
    });

    newClient.on('data', async (data) => {
      const msg = data.toString();
      
      // IRC Heartbeat (Ping-Pong)
      if (msg.startsWith('PING')) {
        newClient.write(`PONG ${msg.split(' ')[1]}\r\n`);
      }

      // Detekcia Laria balíka
      if (msg.includes('#LRQ#')) {
        await handleIncomingLariaPackage(msg);
      }
      
      console.log('[IRC_RAW]:', msg);
    });

    newClient.on('error', (error) => {
      console.error('[IRC_ERROR]:', error);
      setIsIrcConnected(false);
      setClient(null);
    });

    setClient(newClient);
  };

  // --- SPRACOVANIE PRICHÁDZAJÚCEHO BALÍKA ---
  const handleIncomingLariaPackage = async (rawMsg) => {
    try {
      const payloadPart = rawMsg.split('#LRQ#')[1];
      const data = JSON.parse(payloadPart);
      
      console.log('[SIGNAL] Prijatý energetický balík. Aktivujem Aria-Logic...');

      // 1. [ARIA_BRIDGE] - Preklad a analýza správy
      const ariaResponse = await SignalService.processAriaLogic(data.msg);
      const gTabId = `MSG_${Date.now()}`;

      // 2. [G-MATRIX] - Archivácia do Signal_Buffer_1
      await SignalService.writeToBuffer('Signal_Buffer_1', {
        gTabId: gTabId,
        sender: data.from,
        original: data.msg,
        translated: ariaResponse.msg,
        status: '0'
      });

      // 3. [ENRICH_UI] - Príprava dát pre IRCScreen
      const enrichedData = {
        ...data,
        msgOriginal: data.msg,
        msg: ariaResponse.msg, // Preložená správa
        receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isHandshake: data.type === "HANDSHAKE_REQ" // Detekcia typu pre zobrazenie tlačidla
      };

      setIncomingRequests(prev => [...prev, enrichedData]);

    } catch (e) {
      console.error('[SIGNAL] Chyba pri dekódovaní balíka:', e);
    }
  };

  // --- ODOSIELANIE VIZITKY / HANDSHAKE ---
  const sendLariaPackage = async (targetAddress, personalMessage) => {
    if (!client || !isIrcConnected) return { success: false, error: 'NOT_CONNECTED' };

    try {
      // 1. Generovanie ID kontraktu
      const contractId = `CON_${Date.now()}_${vault.identity.walletAddress.substring(2, 6)}`;
      
      // 2. Inicializácia v G-Matrix (Contract_Ledger)
      await SignalService.manageContract('INIT_CONTRACT', {
        Contract_ID: contractId,
        Address_A: vault.identity.walletAddress,
        Address_B: targetAddress,
        Status_A: "1",
        Status_B: "0",
        Final_Block: "FALSE"
      });

      // 3. Balenie dát priamo z tvojho kufra (LariaContext)
      const lariaPackage = {
        h: "LRQ_V1",
        type: "HANDSHAKE_REQ",
        cid: contractId,
        from: vault.identity.walletAddress,
        msg: personalMessage,
        d: {
          n: vault.identity.name,
          t: vault.identity.tel,
          e: vault.identity.email,
          f: vault.identity.fb,
          tg: vault.identity.tg,
          ib: vault.identity.revo, // Tvoj Revolut IBAN
          kr: vault.identity.kRod  // Príbuzenstvo / Chlmec
        }
      };

      const targetNick = `L_${targetAddress.substring(2, 10)}`;
      const payload = JSON.stringify(lariaPackage);
      
      // 4. Výstrel do éteru
      client.write(`PRIVMSG ${targetNick} :#LRQ#${payload}\r\n`);
      
      return { success: true, contractId: contractId };

    } catch (err) {
      console.error("[SIGNAL] Odosielanie zlyhalo:", err);
      return { success: false, error: err.message };
    }
  };

  // Automatické pripojenie po zrodení identity
  useEffect(() => {
    if (vault.identity.walletAddress && !client) {
      connectToIrc(vault.identity.walletAddress);
    }
  }, [vault.identity.walletAddress]);

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