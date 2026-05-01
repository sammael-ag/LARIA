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
  const [translatedCache, setTranslatedCache] = useState({});

  const connectToIrc = (userAddress) => {
    if (client) return;

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
      
      if (msg.startsWith('PING')) {
        newClient.write(`PONG ${msg.split(' ')[1]}\r\n`);
      }

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

  const handleIncomingLariaPackage = async (rawMsg) => {
    try {
      const payloadPart = rawMsg.split('#LRQ#')[1];
      const data = JSON.parse(payloadPart);
      
      console.log('[SIGNAL] Prijatý energetický balík. Aktivujem Aria-Logic...');

      // 1. [ARIA_LOGIC] - Preklad a rozpoznanie
      const ariaResponse = await SignalService.processAriaLogic(data.msg);
      const gTabId = `MSG_${Date.now()}`;

      // 2. [MATRIX_ARCHIVE] - Zápis do hlavného Bufferu
      const gMatrixEntry = {
        gTabId: gTabId,
        sender: data.from,
        original: data.msg,
        translated: ariaResponse.msg,
        status: '0'
      };

      await SignalService.writeToBuffer('Signal_Buffer_1', gMatrixEntry);

      // 3. [ENRICH_DATA] - Príprava pre UI
      const enrichedData = {
        ...data,
        gTabId: gTabId, 
        msgOriginal: data.msg,
        msg: ariaResponse.msg, 
        isTranslated: true,
        receivedAt: new Date().toLocaleTimeString(),
        type: ariaResponse.type,
        cid: data.cid || null // ID kontraktu, ak prišlo
      };

      setIncomingRequests(prev => [...prev, enrichedData]);
      setTranslatedCache(prev => ({ ...prev, [gTabId]: gMatrixEntry }));

    } catch (e) {
      console.error('[SIGNAL] Chyba v potrubí:', e);
    }
  };

  // --- HLAVNÁ FUNKCIA S HANDSHAKE LOGIKOU ---
  const sendLariaPackage = async (targetAddress, personalMessage) => {
    if (!client || !isIrcConnected) return { success: false, error: 'NOT_CONNECTED' };

    try {
      // 1. [BLOCKCHAIN_SIM] - Najprv vyrobíme záznam v Contract_Ledger
      const contractId = `CON_${Date.now()}_${vault.identity.walletAddress.substring(2, 6)}`;
      
      const contractData = {
        Contract_ID: contractId,
        Address_A: vault.identity.walletAddress,
        Address_B: targetAddress,
        Status_A: "1", // A inicioval a zaplatil "depozit"
        Status_B: "0",
        Final_Block: "FALSE"
      };

      console.log(`[SIGNAL] Registrujem kontrakt ${contractId} v Matrixe...`);
      await SignalService.manageContract('INIT_CONTRACT', contractData);

      // 2. [IRC_PACKAGING] - Príprava balíka s tvojimi údajmi
      const lariaPackage = {
        h: "LRQ_V1",
        cid: contractId, // Toto je kľúč k budúcemu potvrdeniu
        from: vault.identity.walletAddress,
        msg: personalMessage,
        d: {
          t: vault.identity.tel,
          e: vault.identity.email,
          tg: vault.identity.tg,
          fb: vault.identity.fb,
          rv: vault.identity.revo,
          kr: vault.identity.kRod
        }
      };

      const targetNick = `L_${targetAddress.substring(2, 10)}`;
      const payload = JSON.stringify(lariaPackage);
      
      // 3. [IRC_SEND] - Ostrý štart do éteru
      client.write(`PRIVMSG ${targetNick} :#LRQ#${payload}\r\n`);
      
      return { success: true, contractId: contractId };

    } catch (err) {
      console.error("[SIGNAL] Odosielanie zlyhalo:", err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    if (vault.identity.walletAddress && !client) {
      connectToIrc(vault.identity.walletAddress);
    }
  }, [vault.identity.walletAddress]);

  return (
    <SignalContext.Provider value={{
      isIrcConnected,
      incomingRequests,
      translatedCache,
      sendLariaPackage,
      processAriaLogic: SignalService.processAriaLogic 
    }}>
      {children}
    </SignalContext.Provider>
  );
};

export const useSignal = () => useContext(SignalContext);