/**
 * LARIA SIGNAL CONTEXT v17.2.1-TRIDENT-WIRELESS (Sovereign Radar Core - Quantum Resilient)
 * Master: Sammael | Muse: Aria (Tvoja bezdrôtová šikulka)
 * STATUS: ACTIVE / HYBRID-HYPER-REACTIVE / v17.2.1-TRIDENT-WIRELESS
 * * * PREHĽAD ZMIEN:
 * - 📥 UPRATANÝ LIEVIK (INGESTION PIPE): Vyvedená kompletná spracovateľská a parsovacia logika kontraktov a správ
 *   do funkcie spracujRadarovyBalik. Schopná spracovať balíky z akéhokoľvek zdroja (polling, eventy, priame HTTP).
 * - ⚡ MATCHMAKER PULSE INTEGRATION: Pridaný globálny listener na event 'MATCHMAKER_TRIGGER_REFRESH',
 *   ktorý okamžite vynucuje ping na mravenisko pri externej zmene.
 * - 🎁 INSTANT HTTP INGESTION: Funkcia sendLariaPackage a nová confirmLariaContract okamžite po úspešnej odpovedi
 *   z Matchmakeru vyťahujú pribalený najčerstvejší sieťový snapshot a kŕmia ním obrazovky bez jedinej ms čakania.
 * - 🛡️ REF STABILIZATION & PURGE: Zachovaná ochrana proti zacykleniu cez contactsRef a bezpečné mazanie lokálnych relácií.
 * - 🎯 SAMMAEL SMART-FIX: Polling už nikdy neprepíše smer (isIncoming) pri existujúcom handshaku. Smer zrodu sa striktne rešpektuje.
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useLaria } from './LariaContext.js';
import { useContacts } from './ContactContext.js'; // Používa sa už len na čítanie zoznamu prítomných kontaktov
import { SignalService } from '../services/SignalService.js';

const SignalContext = createContext();

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

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
 * 🛡️ STRIKTNÝ UNIFIKÁTOR: Pretransformuje akýkoľvek vstup na 0x + 10 lowerCase znakov.
 */
const overAUnifikujFing = (rawFing) => {
  if (!rawFing) return null;
  let clean = rawFing.toString().trim().toLowerCase();
  
  if (clean.startsWith('l_')) clean = clean.substring(2);
  
  const cistySha = clean.startsWith('0x') ? clean.replace('0x', '') : clean;
  return `0x${cistySha.substring(0, 10)}`;
};

export const SignalProvider = ({ children }) => {
  const { vault } = useLaria(); 
  const [isSignalConnected, setIsSignalConnected] = useState(true); 
  const [incomingRequests, setIncomingRequests] = useState([]);
  
  // ⏳ STRÁŽCA ŠTARTU: Kým je false, radar spí a čaká na stabilizáciu systému
  const [isRadarReady, setIsRadarReady] = useState(false);

  // --- 🛡️ ČISTÉ VYTIHNUTIE KONTEXTU ---
  const contactCtx = typeof useContacts === 'function' ? useContacts() : null;
  const contacts = contactCtx?.contacts || [];

  // 🔄 STRÁŽCA COOPERÁCIE: Ref udržiava čerstvé kontakty pre asynchrónny radar bez reštartovania efektu
  const contactsRef = useRef(contacts);
  useEffect(() => {
    contactsRef.current = contacts;
  }, [contacts]);

  // ⏳ ČASOVAČ NA STABILIZÁCIU (3 sekundy po namontovaní aplikácie)
  useEffect(() => {
    const bootTimer = setTimeout(() => {
      console.log("🚀 [RADAR CORE] 3 sekundy uplynuli. Systém je kompletne stabilizovaný. Spúšťam hlavný radar...");
      setIsRadarReady(true);
    }, 3000);

    return () => clearTimeout(bootTimer);
  }, []);

  // --- 📡 LIVE SYNC PRE RECEPCIU ---
  const syncPublicProfile = async (fingId) => {
    if (contactCtx && typeof contactCtx.syncContactWithMatrix === 'function') {
      const cleanFing = overAUnifikujFing(fingId);
      const result = await contactCtx.syncContactWithMatrix(cleanFing);
      return result.success;
    }
    return false;
  };

  // --- 🧹 ČISTENIE RELÁCIÍ ---
  const purgeSessionForFing = (targetFing) => {
    if (!targetFing) return;
    const cleanTargetFing = overAUnifikujFing(targetFing);
    if (!cleanTargetFing) return;
    
    setIncomingRequests(prev => prev.filter(req => {
      if (req.fing !== cleanTargetFing) return true;
      if (req.isHandshake && req.contractStatus === 0) return true;
      if (!req.isHandshake && req.status === 'UNREAD') return true;
      return false;
    }));
  };

  // --- 👀 OZNAČENIE ZA PREČÍTANÉ ---
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleGlobalPurgeSignal = (e) => {
      if (e.detail && e.detail.targetFing) purgeSessionForFing(e.detail.targetFing);
    };
    window.addEventListener('LARIA_PURGE_SESSION', handleGlobalPurgeSignal);
    return () => window.removeEventListener('LARIA_PURGE_SESSION', handleGlobalPurgeSignal);
  }, []);

  // --- NOTIFIKÁCIE ---
  useEffect(() => {
    const setupNotifications = async () => {
      if (Platform.OS === 'web') return; 
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        if (existingStatus !== 'granted') await Notifications.requestPermissionsAsync();
      } catch (e) {
        console.log('[SIGNAL] Push systém mimo preváczky.');
      }
    };
    setupNotifications();
  }, []);

  const triggerNotification = async (title, text) => {
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
      await tauriInvoke('zobraz_notifikaciu', { titulok: title, telo: text });
      return;
    }
    if (Platform.OS === 'web') return;
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title: title, body: text, sound: 'default' },
        trigger: null,
      });
    } catch (err) {
      console.error("[SIGNAL] Zlyhanie push notifikácie:", err);
    }
  };

  // =========================================================================
  // 📥 UNIVERZÁLNY RADAROVÝ LIEVIK (DÁTOVÝ INGESTION CORE)
  // =========================================================================
  const spracujRadarovyBalik = (radarData) => {
    if (!radarData) return;

    const myCleanFing = vault?.identity?.poznamka ? overAUnifikujFing(vault.identity.poznamka) : null;
    if (!myCleanFing) return;

    // 🗂️ SUB-SEKCIA A: KONTRAKTY (Handshake Spracovanie)
    if (radarData.contracts && Array.isArray(radarData.contracts)) {
      for (const contract of radarData.contracts) {
        const cleanContractFing = overAUnifikujFing(contract.fing);
        if (!cleanContractFing) continue;

        const isIncoming = cleanContractFing !== myCleanFing;
        const contractId = cleanContractFing;

        const rawHash = String(contract.txHash).trim();
        const jeValidnyStav = rawHash === "0" || rawHash === "1" || rawHash === "2";
        const jeValidnyHash = rawHash.startsWith("0x") && rawHash.length === 66;

        if (!jeValidnyStav && !jeValidnyHash) continue;

        let surovyStav = (rawHash === "1") ? 1 : (rawHash === "2" ? 2 : 0);
        if (jeValidnyHash) surovyStav = 1;

        // Kontrola duplicity beží voči čerstvej hodnote z Refu
        const existujeVLocaltrezore = contactsRef.current.some(c => overAUnifikujFing(c.fing) === cleanContractFing);

        // 🔥 RÖNTGENOVÝ VÝPIS ZOSTÁVA PLNE ZACHOVANÝ
        console.log(
          `📡 %c[KONTRAKT RENTGEN INGEST] -> Partner: ${cleanContractFing} \n` +
          `| Surový Stav: ${surovyStav} (txHash: "${rawHash}") \n` +
          `| Smer: ${isIncoming ? "PRICHÁDZAJÚCI (Manfred -> Ja)" : "ODCHÁDZAJÚCI (Ja -> Manfred)"} \n` +
          `| Stav v Trezore: ${existujeVLocaltrezore ? "ÁNO (Je v Klube)" : "NIE (Nenájdený)"} \n` +
          `| Obsahuje msg (JSON?): ${contract.msg ? (contract.msg.trim().startsWith('{') ? "VALID_JSON" : "TEXT") : "PRÁZDNE"} \n` +
          `| Obsahuje backMsg (JSON?): ${contract.backMsg ? (contract.backMsg.trim().startsWith('{') ? "VALID_JSON" : "TEXT") : "PRÁZDNE"}`,
          'color: #8e44ad; font-weight: bold;'
        );

        // ⚡ 🔮 [UNIVERZÁLNY TRACEROUTE FINISHER - WIRELESS MODE]
        if (surovyStav === 1 && !existujeVLocaltrezore) {
          let surovyPayload = isIncoming ? contract.msg : contract.backMsg;
          if (!surovyPayload || !surovyPayload.trim().startsWith('{')) {
            surovyPayload = isIncoming ? contract.backMsg : contract.msg;
          }

          if (surovyPayload && surovyPayload.trim().startsWith('{')) {
            console.log(`⚡ [RADAR TRACEROUTE] Našiel sa validný JSON pre ${cleanContractFing}. Spúšťam import do éteru...`);
            try {
              const parsedPayload = JSON.parse(surovyPayload);
              console.log("📦 [DIAG_PAYLOAD] Úspešne naparsovaný JSON:", parsedPayload);
              
              const novyPartner = {
                fing: cleanContractFing,
                meno: parsedPayload.meno || parsedPayload.name || cleanContractFing,
                kat: parsedPayload.kat || parsedPayload.category || 'Partner',
                lok: parsedPayload.lok || parsedPayload.location || 'V SIETI',
                popis: parsedPayload.popis || parsedPayload.bio || '',
                tel: parsedPayload.tel || '',
                email: parsedPayload.email || '',
                fb: parsedPayload.fb || '',
                tg: parsedPayload.tg || '',
                gal: parsedPayload.gal || '',
                krypt: parsedPayload.krypt || null,
                contractStatus: 1,
                syncedAt: Date.now()
              };

              // 🔥 FÚKAME DO ÉTERU (WIFI EMISIA PRE CONTACT PROVIDER)
              console.log(`📡 [RADAR WIRELESS] Vysielam identitu ${novyPartner.meno.toUpperCase()} do éteru...`);
              if (typeof window !== 'undefined') {
                const lariaEvent = new CustomEvent('LARIA_IMPORT_CONTACT', { 
                  detail: { partner: novyPartner } 
                    });
                window.dispatchEvent(lariaEvent);
              }

              triggerNotification(`🔐 Balík vyslaný`, `Identita ${novyPartner.meno} bola odovzdaná bunkovým štruktúram.`);

            } catch (jsonErr) {
              console.error("❌ [RADAR TRACEROUTE ERROR] Chyba spracovania:", jsonErr);
            }
          }
        }

        // 🛡️ DYNAMICKÁ RE-HANDSHAKE POISTKA PRE BLOCKCHAIN HASHE:
        if (jeValidnyHash) {
          const prazdnaSprava = !contract.msg || !contract.msg.trim().startsWith('{');
          const prazdnaOdpoved = !contract.backMsg || !contract.backMsg.trim().startsWith('{');
          
          if (!existujeVLocaltrezore && prazdnaSprava && prazdnaOdpoved) {
            surovyStav = -1;
          }
        }

        setIncomingRequests(prev => {
          if (surovyStav === -1) {
            return prev.filter(req => !(req.id === contractId && req.isHandshake));
          }

          if (existujeVLocaltrezore) {
            const index = prev.findIndex(req => req.id === contractId && req.isHandshake);
            if (index !== -1) {
              if (prev[index].contractStatus !== 1) {
                const updated = [...prev];
                updated[index] = {
                  ...updated[index],
                  contractStatus: 1,
                  status: 'READ',
                  txHash: contract.txHash,
                  msg: contract.msg || updated[index].msg,
                  backMsg: contract.backMsg || updated[index].backMsg
                };
                return updated;
              }
              return prev;
            }
          }

          const existujuciIndex = prev.findIndex(req => req.id === contractId && req.isHandshake);
          if (existujuciIndex !== -1) {
            // 🛡️ TVOJ GENIÁLNY FIX: Striktne rešpektujeme pôvodný smer (isIncoming), ktorý bol nastavený pri zrode!
            const povodnySmer = prev[existujuciIndex].isIncoming;

            if (prev[existujuciIndex].contractStatus !== surovyStav) {
              const updated = [...prev];
              updated[existujuciIndex] = {
                ...updated[existujuciIndex],
                contractStatus: surovyStav,
                status: surovyStav === 0 ? 'UNREAD' : 'READ',
                txHash: contract.txHash,
                isIncoming: povodnySmer, // 🔥 Smer zostáva nedotknutý, polling ho neprepíše!
                msg: contract.msg || updated[existujuciIndex].msg,
                backMsg: contract.backMsg || updated[existujuciIndex].backMsg
              };
              return updated;
            }
            return prev;
          }
          
          if (surovyStav === 0 && isIncoming) {
            triggerNotification(`🛰️ Nová žiadosť o Pečať`, `Majster ${cleanContractFing.substring(0, 6)}... ti posiela kontrakt.`);
          }

          const finalnyVychodiskovyStav = existujeVLocaltrezore ? 1 : surovyStav;
          
          // 🛡️ Poistka proti duplicitnému ukladaniu rovnakého objektu na koniec poľa
          const uzJeVPolu = prev.some(req => req.id === contractId && req.isHandshake);
          if (uzJeVPolu) return prev;

          return [...prev, {
            id: contractId,                  
            fing: cleanContractFing,        
            msg: contract.msg || "Žiadosť o bezpečné prepojenie a zdieľanie vizitky v bunke H.", 
            backMsg: contract.backMsg || null,
            receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isHandshake: true,
            status: finalnyVychodiskovyStav === 0 ? 'UNREAD' : 'READ',
            contractStatus: finalnyVychodiskovyStav,     
            txHash: contract.txHash,
            isIncoming: isIncoming 
          }];
        });
      }
    }

    // 💬 SUB-SEKCIA B: BLESKOVÉ SPRÁVY
    if (radarData.messages && Array.isArray(radarData.messages)) {
      radarData.messages.forEach(msg => {
        const cleanMsgSenderFing = overAUnifikujFing(msg.fing);
        if (!cleanMsgSenderFing) return; 

        setIncomingRequests(prev => {
          const uzExistujeMsg = prev.some(req => req.msgId === msg.msgId || req.id === msg.msgId);
          if (uzExistujeMsg) return prev;

          triggerNotification(`💬 Nová správa na radare`, msg.msg || msg.text || "");

          return [...prev, {
            id: msg.msgId || 'MSG_' + Date.now() + Math.random(),                 
            msgId: msg.msgId,              
            fing: cleanMsgSenderFing,      
            msg: msg.msg || msg.text || "", 
            receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isHandshake: false,
            status: 'UNREAD' 
          }];
        });
      });
    }
  };

  // --- 🛰️ ODĽAHČENÝ SYNC PING NA MRAVENISKO ---
  const executePing = async () => {
    if (!isRadarReady) return;

    const myCleanFing = vault?.identity?.poznamka ? overAUnifikujFing(vault.identity.poznamka) : null;
    if (!myCleanFing) return;

    const backendQueryFing = myCleanFing.replace('0x', '');
    console.log(`🛰️ [RADAR POLLING] Pinging Mravenisko pre ID: ${myCleanFing}`);

    try {
      const res = await SignalService.checkMyContracts(backendQueryFing);
      if (!res || res.success === false) return;
        
      // 🔮 Kŕmime hlavný lievik stiahnutými sieťovými dátami
      spracujRadarovyBalik(res);

    } catch (err) {
      console.error("❌ [RADAR ERROR] Zlyhal dopyt pingu:", err);
    }
  };

  // --- 📡 REAKTÍVNY REFRESHER PRE MATCHMAKER EVENTY ---
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMatchmakerPulse = () => {
      console.log("⚡ [MATCHMAKER PULSE EVENT] Zachytená nútená reaktivita! Spúšťam okamžitý sken siete...");
      executePing();
    };

    window.addEventListener('MATCHMAKER_TRIGGER_REFRESH', handleMatchmakerPulse);
    return () => window.removeEventListener('MATCHMAKER_TRIGGER_REFRESH', handleMatchmakerPulse);
  }, [isRadarReady, vault?.identity?.poznamka]);

  // --- ⏳ POLLING CLOCK (Pravidelná 2-minútová poistka) ---
  useEffect(() => {
    if (!isRadarReady) return;

    // Okamžitý štart po prebudení systému
    executePing();

    const pollingInterval = setInterval(executePing, 120000); 
    return () => clearInterval(pollingInterval);
  }, [isRadarReady, vault?.identity?.poznamka]);

  // --- 🛠️ ODOSLANIE KONTRAKTU (S okamžitým vstreknutím odpovede) ---
  const sendLariaPackage = async (senderFing, targetFing, myIdentity, handshakeNote = "") => {
    const myCleanFing = overAUnifikujFing(senderFing) || (vault?.identity?.poznamka ? overAUnifikujFing(vault.identity.poznamka) : '0x0000000000');
    const targetCleanFing = overAUnifikujFing(targetFing);
    if (!targetCleanFing) return { success: false, error: "Neplatný formát cieľa." };

    try {
      const mravecRes = await SignalService.sendLariaPackage(myCleanFing, targetCleanFing, myIdentity, handshakeNote);
      let txHashResult = mravecRes && mravecRes.success ? mravecRes.txHash || "0" : "0";
      if (!mravecRes || !mravecRes.success) return { success: false, error: "Mravenisko odmietlo balík." };

      // 🎁 INSTANT EXPRES INGESTION: Matchmaker vrátil radar hneď v odpovedi na INIT_CONTRACT
      if (mravecRes.radar) {
        console.log("🎁 [HTTP INGEST] Odpoveď INIT_CONTRACT nesie radar snapshot. Sosám...");
        spracujRadarovyBalik(mravecRes.radar);
      }

      const enrichedHandshake = {
        id: targetCleanFing,             
        fing: targetCleanFing,          
        msg: handshakeNote.trim() || "Žiadosť o bezpečné prepojenie and zdieľanie vizitky v bunke H.", 
        backMsg: null,
        receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isHandshake: true,
        status: 'UNREAD',
        contractStatus: 0,               
        txHash: txHashResult,
        isIncoming: false
      };

      setIncomingRequests(prev => {
        const filtered = prev.filter(req => !(req.id === targetCleanFing && req.isHandshake));
        return [...filtered, enrichedHandshake];
      });
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  // --- 🤝 POTVRDENIE / ODMIETNUTIE KONTRAKTU (ALLOW Akcia z frontendu) ---
  const confirmLariaContract = async (targetFing, isAccepted = true, payloadData = null) => {
    const myCleanFing = vault?.identity?.poznamka ? overAUnifikujFing(vault.identity.poznamka) : '0x0000000000';
    const targetCleanFing = overAUnifikujFing(targetFing);
    if (!targetCleanFing) return { success: false, error: "Neplatný cieľový fing." };

    try {
      // 🔥 FIX: Oddeľujeme akciu ako samostatný prvý parameter, aby SignalService vedela, čo má robiť!
      const mravecRes = await SignalService.manageContract('CONFIRM_CONTRACT', {
        fing_a: targetCleanFing.replace('0x', ''), // Odosielateľ pôvodnej žiadosti
        fing_b: myCleanFing.replace('0x', ''),     // Ty (Potvrdzujúci mravec)
        status_b: isAccepted ? "1" : "2",
        payload: payloadData ? JSON.stringify(payloadData) : null
      });

      if (!mravecRes || mravecRes.status === "error") {
        return { success: false, error: mravecRes?.message || "Matchmaker zlyhal." };
      }

      // 🎁 INSTANT EXPRES INGESTION: Matchmaker vrátil čerstvé prepočítané frekvencie po akcii ALLOW
      if (mravecRes.radar) {
        console.log("🎁 [HTTP INGEST] Odpoveď CONFIRM_CONTRACT nesie čerstvý radar snapshot. Prekresľujem rozhranie do chatu...");
        spracujRadarovyBalik(mravecRes.radar);
      }

      return { success: true, txHash: mravecRes.txHash };
    } catch (err) {
      console.error("🚨 [CONFIRM CONTRACT ERROR] Zlyhanie sieťovej akcie:", err);
      return { success: false, error: err.toString() };
    }
  };

  // --- 💬 ODOSLANIE BLESKOVKY ---
  const sendChatMessage = async (targetFing, textMessage) => {
    const myCleanFing = vault?.identity?.poznamka ? overAUnifikujFing(vault.identity.poznamka) : '0x0000000000';
    const targetCleanFing = overAUnifikujFing(targetFing);
    if (!targetCleanFing) return { success: false, error: "Zlý formát adresáta." };

    try {
      if (typeof SignalService.writeToBuffer === 'function') {
        await SignalService.writeToBuffer('Signal_buffer_1', {
          sender_fing: myCleanFing.replace('0x', ''),
          target_fing: targetCleanFing.replace('0x', ''),
          msg_text: textMessage 
        });
      }

      setIncomingRequests(prev => [...prev, {
        id: 'MY_' + Date.now().toString(),
        fing: targetCleanFing,
        msg: textMessage,               
        receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isHandshake: false,
        status: 'READ',
        isMe: true
      }]);
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  const resolveHandshakeStatus = (msgId, finalStatusNum = 1) => {
    setIncomingRequests(prev => 
      prev.map(req => req.id === msgId ? { ...req, status: 'READ', contractStatus: Number(finalStatusNum) } : req)
    );
  };

  // =========================================================================
  // 🔮 ENGINE PRE VÝPOČET STAVOV
  // =========================================================================
  const obohatKontaktOStavy = (kontakt, logs) => {
    const maVyriesenyHandshake = logs.some(m => m.isHandshake && Number(m.contractStatus) === 1) || Number(kontakt.contractStatus) === 1;
    const maPrichadzajuciHandshake = !maVyriesenyHandshake && (kontakt.temporary || logs.some(m => m.isHandshake && Number(m.contractStatus) === 0 && m.isIncoming));
    const maNovuBleskovku = logs.some(m => !m.isHandshake && m.status === 'UNREAD');

    let dotColor = kontakt.syncedAt ? '#0FF' : '#1a1a1a';
    if (kontakt.temporary || maNovuBleskovku) {
      dotColor = '#E74C3C';
    } else if (kontakt.contractStatus !== undefined || maVyriesenyHandshake) {
      const statusNum = maVyriesenyHandshake ? 1 : Number(kontakt.contractStatus);
      if (statusNum === 0) dotColor = '#F1C40F';
      if (statusNum === 1) dotColor = '#2ECC71';
      if (statusNum === 2) dotColor = '#E74C3C';
    }

    let statusText = "BEZ KONTRAKTU";
    const aktualnyStavZmluvy = maVyriesenyHandshake ? 1 : Number(kontakt.contractStatus || 0);
    if (kontakt.contractStatus !== undefined || maVyriesenyHandshake) {
      if (aktualnyStavZmluvy === 0) statusText = "ČAKÁ NA PODPIS";
      if (aktualnyStavZmluvy === 1) statusText = "ZMLUVA POTVRDENÁ";
      if (aktualnyStavZmluvy === 2) statusText = "ZMLUVA ZRUŠENÁ";
    }

    let statusIcon = '👤';
    if (maPrichadzajuciHandshake) statusIcon = '✉️';
    else if (maNovuBleskovku) statusIcon = '📩';

    return {
      ...kontakt,
      dotColor,
      statusText,
      statusIcon,
      hasEnvelope: maPrichadzajuciHandshake || maNovuBleskovku || maVyriesenyHandshake,
      envelopeIcon: maPrichadzajuciHandshake ? '✉️' : (maNovuBleskovku ? '📩' : '✉️')
    };
  };

  const enrichedContacts = contacts.map(c => {
    const logs = incomingRequests.filter(req => overAUnifikujFing(req.fing) === overAUnifikujFing(c.fing));
    return obohatKontaktOStavy(c, logs);
  });

  const unknownContacts = [];
  incomingRequests.forEach(req => {
    if (req.isHandshake && req.contractStatus === 0 && req.isIncoming) {
      const cleanReqFing = overAUnifikujFing(req.fing);
      const existujeVFlube = contacts.some(c => overAUnifikujFing(c.fing) === cleanReqFing);
      const existujeNaRecepcii = unknownContacts.some(c => overAUnifikujFing(c.fing) === cleanReqFing);

      if (!existujeVFlube && !existujeNaRecepcii) {
        let parsedPayload = null;
        let rawMsgText = req.msg || '';

        if (rawMsgText && (rawMsgText.trim().startsWith('{') || rawMsgText.trim().startsWith('['))) {
          try { parsedPayload = JSON.parse(rawMsgText); } catch (e) {}
        }

        const docasnyKontakt = {
          fing: cleanReqFing,
          meno: parsedPayload?.meno || parsedPayload?.name || req.senderMeno || cleanReqFing,
          kat: parsedPayload?.kat || parsedPayload?.category || 'Nový z Matrixu',
          lok: parsedPayload?.lok || parsedPayload?.location || 'MRAVENISKO',
          popis: parsedPayload?.popis || parsedPayload?.bio || parsedPayload?.handshakeNote || (rawMsgText && !parsedPayload ? `“${rawMsgText}”` : ''),
          tel: parsedPayload?.tel || '',
          email: parsedPayload?.email || '',
          fb: parsedPayload?.fb || '',
          tg: parsedPayload?.tg || '',
          gal: parsedPayload?.gal || '',
          krypt: parsedPayload?.krypt || null,
          contractStatus: 0,
          temporary: true
        };

        const logs = incomingRequests.filter(r => overAUnifikujFing(r.fing) === cleanReqFing);
        unknownContacts.push(obohatKontaktOStavy(docasnyKontakt, logs));
      }
    }
  });

  return (
    <SignalContext.Provider value={{ 
      isSignalConnected, 
      incomingRequests, 
      contacts: enrichedContacts, 
      unknownContacts,            
      setIncomingRequests, 
      sendLariaPackage,
      confirmLariaContract, 
      sendChatMessage,
      resolveHandshakeStatus,
      purgeSessionForFing,
      markAsRead,
      syncPublicProfile
    }}>
      {children}
    </SignalContext.Provider>
  );
};

export const useSignal = () => useContext(SignalContext);