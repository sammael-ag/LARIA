import React, { createContext, useContext, useState, useEffect } from 'react';
import TcpSocket from 'react-native-tcp-socket';
import { useLaria } from './LariaContext';

const SignalContext = createContext();

// KONFIGURÁCIA POTRUBIA
const IRC_HOST = 'irc.freenode.net'; // Pre test, neskôr náš vlastný node
const IRC_PORT = 6667;

export const SignalProvider = ({ children }) => {
  const { vault } = useLaria();
  const [client, setClient] = useState(null);
  const [isIrcConnected, setIsIrcConnected] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);

  // --- ŠTART IRC AGENTA ---
  const connectToIrc = (userAddress) => {
    if (client) return; // Už sme pripojení

    console.log(`[SIGNAL] Štartujem TCP potrubie pre: ${userAddress}`);

    const newClient = TcpSocket.createConnection({
      host: IRC_HOST,
      port: IRC_PORT,
    }, () => {
      // HANDSHAKE - Tu sa predstavujeme serveru
      const nick = `L_${userAddress.substring(2, 10)}`; // Skrátený Nick pre IRC limity
      newClient.write(`NICK ${nick}\r\n`);
      newClient.write(`USER ${nick} 8 * :LariaNode_${userAddress}\r\n`);
      newClient.write(`JOIN #LARIA_CORE\r\n`);
      setIsIrcConnected(true);
    });

    newClient.on('data', (data) => {
      const msg = data.toString();
      // 1. Logika PING/PONG (Udržiavač života)
      if (msg.startsWith('PING')) {
        newClient.write(`PONG ${msg.split(' ')[1]}\r\n`);
      }

      // 2. Zachytenie nášho balíka (Friend Request)
      if (msg.includes('#LRQ#')) {
        handleIncomingLariaPackage(msg);
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

  const handleIncomingLariaPackage = (rawMsg) => {
    try {
      const payloadPart = rawMsg.split('#LRQ#')[1];
      const data = JSON.parse(payloadPart);
      console.log('[SIGNAL] Prijatý energetický balík od:', data.from);
      setIncomingRequests(prev => [...prev, data]);
    } catch (e) {
      console.error('[SIGNAL] Chyba pri rozbalovaní balíka:', e);
    }
  };

  const sendLariaPackage = async (targetAddress, personalMessage) => {
    if (!client || !isIrcConnected) return { success: false, error: 'NOT_CONNECTED' };

    const lariaPackage = {
      h: "LRQ_V1",
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
    
    // POSIELAME CEZ IRC POTRUBIE
    client.write(`PRIVMSG ${targetNick} :#LRQ#${payload}\r\n`);
    
    return { success: true };
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
      sendLariaPackage
    }}>
      {children}
    </SignalContext.Provider>
  );
};

export const useSignal = () => useContext(SignalContext);