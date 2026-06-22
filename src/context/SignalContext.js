/**
 * LARIA SIGNAL CONTEXT v15.1 (Sovereign Radar Core - CrystalCore Integrated)
 * Master: Sammael | Muse: Aria (Tvoja sexi šikulka)
 * STATUS: CHAT_ALIGNED | HANDSHAKE_STRICT_LAW | DUAL_POLLING_ACTIVE | v15.1
 * 
 * * SÚLAD S ÚSTAVNÝM ZÁKONOM (ContactContext Alignment):
 * - FING: Vždy unifikovaný tvar ("0x" + 10 znakov hex, malé písmená). Ak nesplní, letí z kola von.
 * - MSG: Jednotná premenná pre text správy všade (odstránené staré .text).
 * - TX_HASH: Blockchainový podpis pre overenie handshake zmluvy.
 * - STRICT SECURITY: Odstránené parazitné prefixy (IN_, MSG_), vyčistená duplicita user/fing.
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

/**
 * ⚖️ STRIKTNÝ FILTER FINGU: Prepustí len čistý zákonný tvar. 
 * Ak príde neplatný formát, nekompromisne vracia null.
 */
const overAUnifikujFing = (rawFing) => {
  if (!rawFing) return null;
  let clean = rawFing.trim().toLowerCase();
  
  // Odstránenie starého IRC balastu, ak by predsa odnekiaľ vyskočil
  if (clean.startsWith('l_')) {
    clean = clean.substring(2);
  }
  
  // Ak je to čistých 10 znakov hex, pridáme 0x
  if (!clean.startsWith('0x') && clean.length === 10) {
    clean = '0x' + clean;
  }
  
  // Striktná kontrola: Musí začínať na 0x a mať celkovo presne 12 znakov
  const regex = /^0x[a-f0-9]{10}$/;
  if (!regex.test(clean)) {
    console.log(`🚨 STRIKTNÝ_ZÁKON_PORUŠENÝ: Ignorujem neplatný fing formát: "${rawFing}"`);
    return null;
  }
  
  return clean;
};

export const SignalProvider = ({ children }) => {
  const { vault } = useLaria(); 
  const [isSignalConnected, setIsSignalConnected] = useState(true); 
  const [incomingRequests, setIncomingRequests] = useState([]);

  // --- 🧹 INTELIGENTNÁ OČISTA RADARU ---
  const purgeSessionForFing = (targetFing) => {
    if (!targetFing) return;
    const cleanTargetFing = overAUnifikujFing(targetFing);
    if (!cleanTargetFing) return;
    
    console.log(`🥷 [RADAR CORE] Čistím správy pre reláciu: ${cleanTargetFing}`);
    
    setIncomingRequests(prev => prev.filter(req => {
      if (req.fing !== cleanTargetFing) return true;
      if (req.isHandshake && (req.status === 'WAITING_FOR_ME' || req.status === 'WAITING_FOR_THEM')) return true;
      if (!req.isHandshake && req.status === 'UNREAD') return true;
      return false;
    }));
  };

  // --- 👀 OZNAČENIE SPRÁV ZA PREČÍTANÉ ---
  const markAsRead = (targetFing) => {
    if (!targetFing) return;
    const cleanTargetFing = overAUnifikujFing(targetFing);
    if (!cleanTargetFing) return;
    
    setIncomingRequests(prev => prev.map(req => 
      (req.fing === cleanTargetFing && !req.isHandshake && req.status === 'UNREAD') 
        ? { ...req, status: 'READ' } 
        : req
    ));
  };

  // Globálny prijímač pre čistenie relácií z UI
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleGlobalPurgeSignal = (e) => {
      if (e.detail && e.detail.targetFing) {
        purgeSessionForFing(e.detail.targetFing);
      }
    };
    window.addEventListener('LARIA_PURGE_SESSION', handleGlobalPurgeSignal);
    return () => window.removeEventListener('LARIA_PURGE_SESSION', handleGlobalPurgeSignal);
  }, []);

  // --- INICIALIZÁCIA NOTIFIKÁCIÍ ---
  useEffect(() => {
    const setupNotifications = async () => {
      if (Platform.OS === 'web') return; 
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        if (existingStatus !== 'granted') await Notifications.requestPermissionsAsync();
      } catch (e) {
        console.log('[SIGNAL] Push systém mimo prevádzky.');
      }
    };
    setupNotifications();
  }, []);

  const triggerNotification = async (title, text) => {
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
      await tauriInvoke('zobraz_notifikaciu', { titulok: title, telo: text });
      return;
    }
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title: title, body: text, sound: 'default' },
        trigger: null,
      });
    } catch (err) {
      console.error("[SIGNAL] Zlyhanie push notifikácie:", err);
    }
  };

  // --- 🛰️ AUTOMATICKÝ HYPERSPEED DUAL POLLING ---
  useEffect(() => {
    // Moja vlastná identita prehnaná prísnym filtrom
    const myCleanFing = vault?.identity?.poznamka ? overAUnifikujFing(vault.identity.poznamka) : null;
    if (!myCleanFing) return;

    // Pre komunikáciu s Mraveniskom osekáme 0x na čistý 10-znakový hex
    const backendQueryFing = myCleanFing.replace('0x', '');

    const executePing = async () => {
      console.log(`🛰️ [RADAR] Pinging Mravenisko pre ID: ${myCleanFing}`);
      try {
        const res = await SignalService.checkMyContracts(backendQueryFing);
        
        if (!res || res.status !== "success") return;
          
        // 🗂️ SUB-SEKCIA: PRICHÁDZAJÚCE KONTRAKTY (Handshake)
        if (res.contracts && Array.isArray(res.contracts)) {
          res.contracts.forEach(contract => {
            const cleanSenderFing = overAUnifikujFing(contract.fing);
            if (!cleanSenderFing) return; // Ak je fing pokazený, ignorujeme celý riadok

            setIncomingRequests(prev => {
              // Kontrola duplicity striktne cez čistý transakčný blockchain hash
              const uzExistuje = prev.some(req => req.txHash === contract.txHash);
              if (uzExistuje) return prev;
              
              console.log(`✉️ [RADAR] Nová žiadosť o Pečať od unifikovaného ${cleanSenderFing}!`);
              triggerNotification(`🛰️ Nová žiadosť o Pečať`, `Majster ${cleanSenderFing.substring(0, 6)}... ti posiela kontrakt.`);

              return [...prev, {
                id: contract.txHash,           // Čisté ID bez prefixov
                fing: cleanSenderFing,        // Striktný 12-znakový identifikátor
                msg: contract.msg || "Žiadosť o bezpečné prepojenie a zdieľanie vizitky v bunke H.", // Uzákonené .msg
                receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isHandshake: true,
                status: 'WAITING_FOR_ME',
                handshakeStatus: 'WAITING_FOR_ME', 
                txHash: contract.txHash,
                txSha: contract.sha            // Súlad s pomenovaním podpisového hashu transakcie
              }];
            });
          });
        }

        // 💬 SUB-SEKCIA: BLESKOVÉ SPRÁVY (Chat Buffer)
        if (res.messages && Array.isArray(res.messages)) {
          res.messages.forEach(msg => {
            const cleanMsgSenderFing = overAUnifikujFing(msg.fing);
            if (!cleanMsgSenderFing) return; // Filtrujeme anomálie

            setIncomingRequests(prev => {
              // Kontrola duplicity striktne a čisto cez msgId
              const uzExistujeMsg = prev.some(req => req.msgId === msg.msgId || req.id === msg.msgId);
              if (uzExistujeMsg) return prev;

              console.log(`💬 [RADAR] Prichádza bleskovka z chatu od ${cleanMsgSenderFing}`);
              triggerNotification(`💬 Nová správa na radare`, msg.text || msg.msg);

              return [...prev, {
                id: msg.msgId,                 // Čisté ID bez prefixov
                msgId: msg.msgId,              // Zachované uzákonené msgId pod svojím menom
                fing: cleanMsgSenderFing,      // Striktný unifikovaný odosielateľ
                msg: msg.text || msg.msg || "", // Uzákonená premenná .msg pre texty
                receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isHandshake: false,
                status: 'UNREAD' 
              }];
            });
          });
        }
      } catch (err) {
        console.error("❌ [RADAR ERROR] Zlyhal dopyt na Mravenisko:", err);
      }
    };

    executePing();
    const pollingInterval = setInterval(executePing, 120000); // 2 minúty bleskový cyklus
    return () => clearInterval(pollingInterval);
  }, [vault?.identity?.poznamka]);

  // --- 🛠️ ODOSLANIE BALÍKA (Vytvorenie kontraktu cez Mravenisko) ---
  const sendLariaPackage = async (targetFing, personalMessage) => {
    const myCleanFing = vault?.identity?.poznamka ? overAUnifikujFing(vault.identity.poznamka) : '0x0000000000';
    const targetCleanFing = overAUnifikujFing(targetFing);
    
    if (!targetCleanFing) {
      console.error("❌ SIGNAL_ERROR: Pokus o odoslanie na neplatný FING formát.");
      return { success: false, error: "Neplatný formát cieľa." };
    }

    try {
      let contractResult = { txHash: "FALSE", auth: {} }; 
      const mravecRes = await SignalService.manageContract('INIT_CONTRACT', {
        fing_a: myCleanFing, // Posielame čistý unifikovaný zákonný FING A
        fing_b: targetCleanFing, // Posielame čistý unifikovaný zákonný FING B
        krypt_a: vault?.identity?.krypt || '',
        status_a: "1",
        status_b: "0",
        txSha: "0", // Blockchainový podpis začína na nule, kým ho reálne nepotvrdí sieť
        msg: personalMessage
      });

      if (mravecRes && mravecRes.success) {
        contractResult.txHash = mravecRes.txHash;
        contractResult.auth = mravecRes.auth;
      }

      const statusToSet = 'WAITING_FOR_THEM';
      const enrichedHandshake = {
        id: contractResult.txHash || 'TX_' + Date.now().toString(),
        fing: targetCleanFing,          
        msg: personalMessage,           
        receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isHandshake: true,
        status: statusToSet,
        handshakeStatus: statusToSet,
        txHash: contractResult.txHash, 
        txSha: "0" // Lokálne zapísaná nula, čaká sa na podpis
      };

      setIncomingRequests(prev => [...prev, enrichedHandshake]);
      return { success: true };
    } catch (err) {
      console.error("[SIGNAL] Chyba odosielania zmluvy:", err);
      return { success: false };
    }
  };

  // --- 💬 ODOSLANIE ČISTEJ BLESKOVEJ SPRÁVY (Chat cez Buffer) ---
  const sendChatMessage = async (targetFing, textMessage) => {
    const myCleanFing = vault?.identity?.poznamka ? overAUnifikujFing(vault.identity.poznamka) : '0x0000000000';
    const targetCleanFing = overAUnifikujFing(targetFing);

    if (!targetCleanFing) return { success: false, error: "Zlý formát adresáta." };

    const apiFingA = myCleanFing.replace('0x', '');
    const apiFingB = targetCleanFing.replace('0x', '');

    try {
      if (typeof SignalService.writeToBuffer === 'function') {
        await SignalService.writeToBuffer('Signal_buffer_1', {
          sender_fing: apiFingA,
          target_fing: apiFingB,
          msg_text: textMessage // Backend očakáva msg_text, prispôsobíme len v tele dopytu
        });
      }

      const localMsg = {
        id: 'MY_' + Date.now().toString(),
        fing: targetCleanFing,
        msg: textMessage,               // Lokálne držíme striktne .msg zákon
        receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isHandshake: false,
        status: 'READ',
        isMe: true
      };

      setIncomingRequests(prev => [...prev, localMsg]);
      return { success: true };
    } catch (err) {
      console.error("[SIGNAL] Chyba zápisu bleskovky do bufferu:", err);
      return { success: false };
    }
  };

  const resolveHandshakeStatus = (msgId, finalStatus = 'RESOLVED') => {
    setIncomingRequests(prev => 
      prev.map(req => req.id === msgId ? { ...req, status: finalStatus, handshakeStatus: finalStatus } : req)
    );
  };

  return (
    <SignalContext.Provider value={{ 
      isSignalConnected, 
      incomingRequests, 
      setIncomingRequests, 
      sendLariaPackage,
      sendChatMessage,
      resolveHandshakeStatus,
      purgeSessionForFing,
      markAsRead
    }}>
      {children}
    </SignalContext.Provider>
  );
};

export const useSignal = () => useContext(SignalContext);