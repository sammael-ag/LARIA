/**
 * LARIA v16.1-LIGHTWEIGHT: ContactContext (Kniha priateľov - Sovereign Friends Registry)
 * Master: Sammael | Muse: Aria (Tvoja nekompromisná šikulka)
 * Status: PURE_CORE_ALIGNED | UNIFIED_JSON_FORMAT | v16.1-LIGHTWEIGHT
 * * * UZÁKONENÉ FORMÁTY & BEZPEČNOSŤ (Sovereign Law):
 * - UNIFIED MONOLITH FORMAT: Na základe rozhodnutia Majstra ukladáme kompletný formát vizitky
 *   vrátane popisov, lokácie, kategórie, galérie a sociálnych sietí na jedno miesto. Žiadne kúskovanie.
 * - ZERO LAYER STATES: Tento context už NEUKLADÁ contractStatus ani txHash! O stavy a farby
 *   guličiek sa stará výhradne Radar v SignalContext.
 * - MODRÁ ŠÍPEČKA LIVE-PERSISTENCE: Re-sync s Mraveniskom stiahne kompletné dáta a okamžite
 *   ich zapíše do lokálneho trezoru, čím okamžite preleští vizitku na obrazovke.
 */

import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSignal } from './SignalContext.js'; 

const ContactContext = createContext();

// 🔐 TROJZUBEC: Bezpečné rozdelenie URL brány
const brana_p1 = "https://script.google.com/macros/s/";
const brana_p2 = "AKfycbx-XUs-vbVxTh3pGPYzB587nQqBSxnN-qVZElKfFamGbUV8tCE1aBS-qsHDE4jzAb1KqQ";
const brana_p3 = "/exec";

const ziskajBranaUrl = () => `${brana_p1}${brana_p2}${brana_p3}`;

/**
 * 🛡️ UNIFIKATOR: Garantuje striktný formát FING-u (0x + 10 lowerCase znakov) s opravou technologického dlhu č.1
 */
const sformatujFing = (fing) => {
  if (!fing) return '';
  const clean = fing.trim().toLowerCase();
  return clean.startsWith('0x') ? clean : `0x${clean}`;
};

export const ContactProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 2. Použijeme bezpečné načítanie SignalContextu kvôli poistke kruhovej závislosti v App.js
  const signalCtx = useSignal();
  const incomingRequests = signalCtx?.incomingRequests || [];
  const setIncomingRequests = signalCtx?.setIncomingRequests || (() => {});

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

  // --- 2. UNIVERZÁLNY ZÁPIS PEČATE DO TREZORU (Zjednotený kompletný formát) ---
  const addContact = async (rawData) => {
    try {
      const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      const targetFing = sformatujFing(data.fing || data.id || data.poznamka);

      if (!targetFing || targetFing === '0x') {
        console.log("⚠️ PROTOKOL_VIOLATION: Chýba FING na vstupe addContact", data);
        return { success: false, error: "Pečať je nečitateľná (chýba kľúč)." };
      }

      const existing = contacts.find(c => sformatujFing(c.fing) === targetFing);
      if (existing) {
        return { success: false, isDuplicate: true, error: "Túto identitu už v ateliéri máš.", contact: existing };
      }

      // ✨ UNIFIKOVANÝ MONOLITNÝ FORMÁT: Všetko na jednom mieste bez osekávania
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
        krypt: data.krypt || null,
        pinned: false,
        addedAt: new Date().toISOString(),
        v: "16.1-LIGHTWEIGHT"
      };

      let updatedContacts;
      setContacts(prev => {
        if (prev.find(c => sformatujFing(c.fing) === targetFing)) return prev;
        updatedContacts = [...prev, newContact];
        AsyncStorage.setItem('laria_contacts', JSON.stringify(updatedContacts)).catch(e => 
          console.error("❌ VAULT_WRITE_FAST_ERROR:", e)
        );
        return updatedContacts;
      });

      return { success: true, contact: newContact };
    } catch (e) {
      console.error("❌ CONTACT_ADD_ERROR:", e);
      return { success: false, error: "Chyba pri zápise do trezoru." };
    }
  };

  // --- 3. 📡 LIVE MATRIX FETCH (Modrá šípečka - Živé dotiahnutie a trvalé uloženie vizitky) ---
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

      if (result && result.status === "success" && result.data) {
        console.log(`✅ Detaily pre ${targetFing} úspešne stiahnuté pre potreby zobrazenia.`);
        
        const partnerData = result.data;

        // 💎 PRELEŠTENIE A ZÁPIS DO DATABÁZY: Dáta už neostanú visieť v ľufte!
        let updatedContacts;
        setContacts(prev => {
          const exists = prev.some(c => sformatujFing(c.fing) === targetFing);
          
          if (exists) {
            // Ak už kontakt máme, aktualizujeme mu stiahnuté premenné
            updatedContacts = prev.map(c => sformatujFing(c.fing) === targetFing ? {
              ...c,
              meno: partnerData.meno || c.meno,
              kat: partnerData.kat || c.kat || 'Overený partner',
              lok: partnerData.lok || c.lok || 'V sieti',
              popis: partnerData.popis || c.popis || '',
              tel: partnerData.tel || c.tel || '',
              email: partnerData.email || c.email || '',
              fb: partnerData.fb || c.fb || '',
              tg: partnerData.tg || c.tg || '',
              gal: partnerData.gal || c.gal || '',
              krypt: partnerData.krypt || c.krypt
            } : c);
          } else {
            // Ak prišiel z webu/recepcie a leštíme ho, rovno ho vytvoríme ako plný kontakt
            updatedContacts = [...prev, {
              fing: targetFing,
              meno: partnerData.meno || targetFing,
              kat: partnerData.kat || 'Pútnik z webu',
              lok: partnerData.lok || 'V sieti',
              popis: partnerData.popis || '',
              tel: partnerData.tel || '',
              email: partnerData.email || '',
              fb: partnerData.fb || '',
              tg: partnerData.tg || '',
              gal: partnerData.gal || '',
              krypt: partnerData.krypt || null,
              pinned: false,
              addedAt: new Date().toISOString(),
              v: "16.1-LIGHTWEIGHT"
            }];
          }

          AsyncStorage.setItem('laria_contacts', JSON.stringify(updatedContacts)).catch(e => 
            console.error("❌ VAULT_SYNC_WRITE_ERROR:", e)
          );
          return updatedContacts;
        });

        return { success: true, liveData: partnerData };
      }
      return { success: false, error: "Identita v Matrixe nenájdená." };
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
        alert(`🔮 ATELIÉR INFO: Tohto partnera už vo svojom trezore bezpečne držíš.`);
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
  }, [contacts]);

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

  const deleteContact = (fingId) => {
    const targetFing = sformatujFing(fingId);
    setContacts(prev => {
      const updatedContacts = prev.filter(c => sformatujFing(c.fing) !== targetFing);
      AsyncStorage.setItem('laria_contacts', JSON.stringify(updatedContacts)).catch(e =>
        console.error("❌ VAULT_DELETE_WRITE_ERROR:", e)
      );
      return updatedContacts;
    });
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