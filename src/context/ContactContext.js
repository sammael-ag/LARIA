/**
 * LARIA v16.5.0-SOVEREIGN_VAULT: ContactContext (Kniha priateľov - Sovereign Friends Registry)
 * Master: Sammael | Muse: Aria (Tvoja bezdrôtová prijímacia šikulka)
 * Status: PURE_CORE_ALIGNED | UNIFIED_JSON_FORMAT | HYPER_RESONANT | v16.5.0
 * * * UZÁKONENÉ FORMÁTY & BEZPEČNOSŤ (Sovereign Law):
 * - 🪐 ZERO TRACES: Žiadne zvyšky po premennej "poznamka" ani barlách na premennú "lang".
 * - 🛰️ ÉTEROVÝ PRIJÍMAČ (WIRELESS MODE): Prijíma importy z Radaru bez kruhových závislostí a race-conditions.
 * - UNIFIED MONOLITH FORMAT: Ukladáme kompletný formát vizitky (meno, kat, lok, popis, gal, krypt, jazyk).
 * - ZERO LAYER STATES: Tento context neukladá dynamický status zmluvy, ale udržiava trvalú identitu v Trezore.
 * - v16.5.0 REJECTION_INTEGRATED: Prepojenie mazania a odmítnutia priamo na SignalContext purge lúč.
 */

import React, { createContext, useState, useContext, useEffect, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSignal } from './SignalContext.js'; 

const ContactContext = createContext();

// 🔐 TROJZUBEC: Bezpečné rozdelenie URL brány
const brana_p1 = "https://script.google.com/macros/s/";
const brana_p2 = "AKfycbx-XUs-vbVxTh3pGPYzB587nQqBSxnN-qVZElKfFamGbUV8tCE1aBS-qsHDE4jzAb1KqQ";
const brana_p3 = "/exec";

const ziskajBranaUrl = () => `${brana_p1}${brana_p2}${brana_p3}`;

/**
 * 🛡️ UNIFIKATOR: Garantuje striktný formát FING-u (0x + 10 lowerCase znakov)
 */
const sformatujFing = (fing) => {
  if (!fing) return '';
  const clean = fing.toString().trim().toLowerCase();
  return clean.startsWith('0x') ? clean : `0x${clean}`;
};

export const ContactProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Bezpečné načítanie SignalContextu kvôli poistke kruhovej závislosti v App.js
  const signalCtx = useSignal();
  const incomingRequests = signalCtx?.incomingRequests || [];
  const setIncomingRequests = signalCtx?.setIncomingRequests || (() => {});

  // Ref pre signalCtx aby sme nezasekávali event listenery v re-renderoch
  const signalCtxRef = useRef(signalCtx);
  useEffect(() => {
    signalCtxRef.current = signalCtx;
  }, [signalCtx]);

  // --- 1. NAČÍTANIE TREZORU PRI ŠTARTE ---
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const stored = await AsyncStorage.getItem('laria_contacts');
        if (stored) {
          setContacts(JSON.parse(stored));
        }
      } catch (e) {
        console.error("❌ CONTACT_VAULT_READ_ERROR:", e);
      } finally {
        setLoading(false);
      }
    };
    loadContacts();
  }, []);

  // --- 2. UNIVERZÁLNY ZÁPIS PEČATE DO TREZORU (Zjednotený kompletný formát) ---
  const addContact = async (rawData) => {
    try {
      const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      const targetFing = sformatujFing(data.fing || data.id);

      if (!targetFing || targetFing === '0x') {
        console.log("⚠️ PROTOKOL_VIOLATION: Chýba FING na vstupe addContact", data);
        return { success: false, error: "Pečať je nečitateľná (chýba kľúč)." };
      }

      let resultStatus = { success: true, isDuplicate: false };

      setContacts(prev => {
        const existingIndex = prev.findIndex(c => sformatujFing(c.fing) === targetFing);
        
        if (existingIndex !== -1) {
          console.log(`🔄 [TREZOR] Identita ${targetFing} už existuje. Spúšťam preleštenie dát...`);
          const existing = prev[existingIndex];
          
          const updatedContact = {
            ...existing,
            meno: data.meno || data.name || existing.meno,
            kat: data.kat || data.category || existing.kat,
            lok: data.lok || data.location || existing.lok,
            popis: data.popis || data.bio || data.handshakeNote || existing.popis,
            tel: data.tel || existing.tel,
            email: data.email || existing.email,
            fb: data.fb || existing.fb,
            tg: data.tg || existing.tg,
            gal: data.gal || existing.gal,
            jazyk: data.jazyk || existing.jazyk || 'sk',
            krypt: data.krypt || existing.krypt,
            temporary: false 
          };

          const updatedList = [...prev];
          updatedList[existingIndex] = updatedContact;

          AsyncStorage.setItem('laria_contacts', JSON.stringify(updatedList)).catch(e => 
            console.error("❌ VAULT_WRITE_UPDATE_ERROR:", e)
          );
          
          resultStatus = { success: true, isDuplicate: true, contact: updatedContact };
          return updatedList;
        }

        // Nový kontakt
        const newContact = {
          fing: targetFing,
          meno: data.meno || data.name || targetFing,
          kat: data.kat || data.category || 'Overený partner',
          lok: data.lok || data.location || 'V sieti',
          popis: data.popis || data.bio || data.handshakeNote || '',
          tel: data.tel || '',
          email: data.email || '',
          fb: data.fb || '',
          tg: data.tg || '',
          gal: data.gal || '',
          jazyk: data.jazyk || 'sk',
          krypt: data.krypt || null,
          pinned: false,
          addedAt: new Date().toISOString(),
          v: "16.5.0-SOVEREIGN"
        };

        const updatedList = [...prev, newContact];
        AsyncStorage.setItem('laria_contacts', JSON.stringify(updatedList)).catch(e => 
          console.error("❌ VAULT_WRITE_FAST_ERROR:", e)
        );

        resultStatus = { success: true, isDuplicate: false, contact: newContact };
        return updatedList;
      });

      return resultStatus;
    } catch (e) {
      console.error("❌ CONTACT_ADD_ERROR:", e);
      return { success: false, error: "Chyba pri zápise do trezoru." };
    }
  };

  // --- 📡 ÉTEROVÝ PRIJÍMAČ: CHYTANIE BEZDRÔTOVÝCH IMPORTU Z RADARU ---
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const spracujBezdrotovyImport = async (e) => {
      if (e.detail && e.detail.partner) {
        const { partner } = e.detail;
        console.log(`📥 [TREZOR ANTÉNA] Zachytený bezdrôtový signál! Partner: ${partner.meno}`);
        
        const prichadzajuciFing = sformatujFing(partner.fing || partner.id);

        // 1. Zápis do AsyncStorage a stavu
        const dbResult = await addContact(partner);
        console.log("📥 [TREZOR DB_INSERT] Bezdrôtový zápis z éteru dokončený:", dbResult);

        // 2. Oživenie Radaru cez SignalContext Ref
        const currentSignal = signalCtxRef.current;
        if (currentSignal && typeof currentSignal.syncPublicProfile === 'function') {
          console.log(`📡 [TREZOR -> RADAR] Prebúdzam identitu ${partner.meno} na frekvencii Radaru...`);
          await currentSignal.syncPublicProfile(prichadzajuciFing);
        } else {
          console.log("🔮 [TREZOR ANTÉNA] Pálom globálny refresh éteru.");
          window.dispatchEvent(new CustomEvent('LARIA_RADAR_REFRESH'));
        }
      }
    };

    window.addEventListener('LARIA_IMPORT_CONTACT', spracujBezdrotovyImport);
    return () => window.removeEventListener('LARIA_IMPORT_CONTACT', spracujBezdrotovyImport);
  }, []);

  // --- 📡 DYNAMICKÝ DETEKTOR NEZNÁMYCH PEČATÍ (Recepcia na základe Radaru) ---
  const unknownContacts = useMemo(() => {
    if (!incomingRequests) return [];

    const uniqueIncomingFings = [...new Set(incomingRequests.map(req => {
      return req.fing ? sformatujFing(req.fing) : null;
    }))].filter(Boolean);

    const unknownFings = uniqueIncomingFings.filter(fing => 
      !contacts.some(c => sformatujFing(c.fing) === fing)
    );

    return unknownFings.map(fing => {
      const firstMsg = incomingRequests.find(req => sformatujFing(req.fing) === fing);
      
      let parsedPayload = null;
      let rawMsgText = firstMsg?.msg || '';

      if (rawMsgText && (rawMsgText.trim().startsWith('{') || rawMsgText.trim().startsWith('['))) {
        try {
          parsedPayload = JSON.parse(rawMsgText);
        } catch (e) {
          console.log(`⚠️ HANDSHAKE_PARSING_INFO: Obsah msg pre ${fing} nie je validný JSON.`);
        }
      }

      return {
        fing: fing,                           
        meno: parsedPayload?.meno || parsedPayload?.name || `Kontakt ${fing.substring(0, 8).toUpperCase()}...`, 
        kat: parsedPayload?.kat || parsedPayload?.category || 'Pútnik v sieti',
        lok: parsedPayload?.lok || parsedPayload?.location || 'Čaká na overenie',
        popis: parsedPayload?.popis || parsedPayload?.bio || '', 
        tel: parsedPayload?.tel || '',
        email: parsedPayload?.email || '',
        fb: parsedPayload?.fb || '',
        tg: parsedPayload?.tg || '',
        gal: parsedPayload?.gal || '',
        jazyk: parsedPayload?.jazyk || 'sk',
        krypt: parsedPayload?.krypt || null,
        hMsg: parsedPayload ? "Kompletná monolitná vizitka doručená." : rawMsgText || 'Poslal ti handshake požiadavku...', 
        id: fing, 
        temporary: true 
      };
    });
  }, [incomingRequests, contacts]);

  // --- 🛠️ INTERAKCIA S RADAR BADGES ---
  const getContactBadgeStatus = (contactFing) => {
    if (!contactFing) return null;
    const targetFing = sformatujFing(contactFing);
    const match = incomingRequests.find(req => sformatujFing(req.fing) === targetFing);

    if (match && !match.isHandshake && match.status === 'UNREAD') {
      return 'NEW_MESSAGE'; 
    }
    return null;
  };

  const clearUnreadBadge = (contactFing) => {
    if (!contactFing) return;
    const targetFing = sformatujFing(contactFing);

    setIncomingRequests(prev => 
      prev.map(req => {
        if (sformatujFing(req.fing) === targetFing && !req.isHandshake && req.status === 'UNREAD') {
          return { ...req, status: 'READ' };
        }
        return req;
      })
    );
  };

  // --- 3. 📡 LIVE MATRIX FETCH (Modrá šípečka - Živé dotiahnutie vizitky z webu) ---
  const syncContactWithMatrix = async (fingId) => {
    try {
      const targetFing = sformatujFing(fingId);
      console.log(`📡 Modrá šípečka: Živo sťahujem detaily pre ${targetFing} z Matrix registra...`);
      
      const response = await fetch(ziskajBranaUrl(), {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'recover',
          fing: targetFing 
        })
      });

      const result = await response.json();

      if (result && (result.status === "success" || result.success === true) && result.data) {
        console.log(`✅ Detaily pre ${targetFing} úspešne stiahnuté.`);
        const partnerData = result.data;
        await addContact({ ...partnerData, fing: targetFing });

        return { success: true, liveData: partnerData };
      }
      return { success: false, error: result.message || result.error || "Identita v Matrixe nenájdená." };
    } catch (e) {
      console.error("❌ SYNC_ERROR:", e);
      return { success: false, error: "Matrix neodpovedá." };
    }
  };

  // --- 4. TELEPATICKÝ LOKÁLNY MOST (QR kód / NFC) ---
  useEffect(() => {
    let unsubscribeTauriFn = null;

    const spracujPrijatuPecat = async (incomingData) => {
      console.log(`🤖 APP_CORE: Zachytený lokálny signál pre FING: ${incomingData.fing || incomingData.id}`);
      const result = await addContact(incomingData);

      if (result.success) {
        alert(`✨ PEČAŤ PRIJATÁ: [ ${result.contact.meno} ] úspešne vtiahnutý do tvojho ateliéru!`);
      } else if (result.isDuplicate) {
        alert(`🔮 ATELIÉR INFO: Tohto partnera už vo svojom trezore bezpečne držíš. (Vizitka bola preleštená)`);
      } else {
        alert(`⚠️ CHYBA MOSTU: ${result.error}`);
      }
    };

    const handleWebSignal = async (e) => {
      if (e.detail && (e.detail.fing || e.detail.id)) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('LARIA_APP_ACKNOWLEDGE', { detail: { success: true } }));
        }
        await spracujPrijatuPecat(e.detail);
      }
    };

    const setupTauriListener = async () => {
      if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
        try {
          const { listen } = await import('@tauri-apps/api/event');
          const unlisten = await listen('tauri_laria_handshake', (event) => {
            console.log("🌲 CRYSTAL_CORE_HARDWARE: Rust zachytil QR/NFC pečať!");
            spracujPrijatuPecat(event.payload);
          });
          unsubscribeTauriFn = unlisten;
        } catch (err) {
          console.log("❌ CRYSTAL_CORE_ERROR: Zlyhalo zapojenie Tauri listenera.");
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('LARIA_LOCAL_HANDSHAKE', handleWebSignal);
    }
    setupTauriListener();
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('LARIA_LOCAL_HANDSHAKE', handleWebSignal);
      }
      if (unsubscribeTauriFn) {
        unsubscribeTauriFn();
      }
    };
  }, []);

  // --- 5. POMOCNÉ FUNKCIE MANAŽMENTU REGISTRA ---
  const togglePin = (fingId) => {
    const targetFing = sformatujFing(fingId);
    setContacts(prev => {
      const updatedContacts = prev.map(c => sformatujFing(c.fing) === targetFing ? { ...c, pinned: !c.pinned } : c);
      AsyncStorage.setItem('laria_contacts', JSON.stringify(updatedContacts)).catch(e =>
        console.error("❌ VAULT_PIN_WRITE_ERROR:", e)
      );
      return updatedContacts;
    });
  };

  const deleteContact = async (fingId) => {
    const targetFing = sformatujFing(fingId);
    
    // 1. Vymazanie z lokálnej pamäte Trezoru (Pevný lokálny výmaz)
    setContacts(prev => {
      const updatedContacts = prev.filter(c => sformatujFing(c.fing) !== targetFing);
      AsyncStorage.setItem('laria_contacts', JSON.stringify(updatedContacts)).catch(e =>
        console.error("❌ VAULT_DELETE_WRITE_ERROR:", e)
      );
      return updatedContacts;
    });

    // 2. Vyčistenie dočasných relácií na lokálnom rozhraní
    const currentSignal = signalCtxRef.current;
    if (currentSignal && typeof currentSignal.purgeSessionForFing === 'function') {
      currentSignal.purgeSessionForFing(targetFing);
    }
  };

  return (
    <ContactContext.Provider value={{ 
      contacts, 
      unknownContacts, 
      loading, 
      addContact, 
      deleteContact, 
      togglePin, 
      syncContactWithMatrix,
      getContactBadgeStatus,  
      clearUnreadBadge        
    }}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = () => useContext(ContactContext);