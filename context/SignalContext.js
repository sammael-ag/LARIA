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

  // --- PRIPOJENIE DO IRC ---
  const connectToIrc = (userKrypt) => { // Premenované na krypt podľa zákona
    if (client || !userKrypt) return;

    console.log(`[SIGNAL] Štartujem TCP potrubie pre krypt: ${userKrypt}`);

    const newClient = TcpSocket.createConnection({
      host: IRC_HOST,
      port: IRC_PORT,
    }, () => {
      // IRC Nickname zostáva krátky (protokol siete)
      const nick = `L_${userKrypt.substring(2, 10)}`;
      newClient.write(`NICK ${nick}\r\n`);
      newClient.write(`USER ${nick} 8 * :LariaNode_${userKrypt}\r\n`);
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
      
      const ariaResponse = await SignalService.processAriaLogic(data.msg);
      
      // UNIFIKÁCIA PRE G-MATRIX (Hyperspeed Recycler)
      // rowData: [SECURE_ID, sender_sha, target_sha, msg_text, status, timestamp]
      const rowData = [
        `MSG_${Date.now()}`,
        data.sha || data.from, // sender_sha
        vault.identity.sha,    // target_sha (ja)
        ariaResponse.msg,      // msg_text
        '0',                   // status
        new Date().toISOString()
      ];

      await SignalService.writeToBuffer('Signal_Buffer_1', { rowData });

      const enrichedData = {
        ...data,
        sha: data.sha || data.from, // Uistíme sa, že máme sha
        meno: data.d?.n || data.meno || "Pútnik",
        msgOriginal: data.msg,
        msg: ariaResponse.msg,
        receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isHandshake: data.type === "HANDSHAKE_REQ"
      };

      setIncomingRequests(prev => [...prev, enrichedData]);
    } catch (e) {
      console.error('[SIGNAL] Chyba pri dekódovaní:', e);
    }
  };

  // --- ODOSIELANIE VIZITKY / HANDSHAKE ---
  const sendLariaPackage = async (targetSha, personalMessage) => {
    if (!client || !isIrcConnected) return { success: false, error: 'NOT_CONNECTED' };

    try {
      const secureId = `CON_${Date.now()}_${vault.identity.sha.substring(0, 4)}`;
      
      // Inicializácia v G-Matrix (Contract_Ledger) podľa v8.0
      await SignalService.manageContract('INIT_CONTRACT', {
        SECURE_ID: secureId,
        sha: vault.identity.sha,
        target_sha: targetSha,
        status_a: "1",
        status_b: "0",
        final_block: "FALSE"
      });

      // Balenie dát - TU JE TEN PREKLAD DO STARÉHO IRC BALÍKA
      // Aby ostatné staršie verzie appky (ak sú) ešte rozumeli
      const lariaPackage = {
        h: "LRQ_V1",
        type: "HANDSHAKE_REQ",
        sha: vault.identity.sha, // NAŠE NOVÉ SHA
        secId: secureId,
        from: vault.identity.krypt,
        msg: personalMessage,
        d: {
          n: vault.identity.meno, // meno
          t: vault.identity.tel,
          e: vault.identity.email,
          f: vault.identity.fb,
          tg: vault.identity.tg,
          ib: vault.identity.irc, // irc (revolut)
          kr: vault.identity.krypt
        }
      };

      const targetNick = `L_${targetSha.substring(0, 8)}`; // IRC Nick podľa SHA
      const payload = JSON.stringify(lariaPackage);
      
      client.write(`PRIVMSG ${targetNick} :#LRQ#${payload}\r\n`);
      
      return { success: true, secureId: secureId };

    } catch (err) {
      console.error("[SIGNAL] Odosielanie zlyhalo:", err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    if (vault.identity.krypt && !client) {
      connectToIrc(vault.identity.krypt);
    }
  }, [vault.identity.krypt]);

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