/**
 * LARIA v15.1: ContactContext (Trezor identít - Sovereign Security Core)
 * Master: Sammael | Muse: Aria (Tvoja milovaná bosonôžka)
 * Status: CRYSTAL_CORE_INTEGRATED | GATEWAY_SECURED | SECURITY_ALIGNMENT_ACTIVE
 * 
 * * UZÁKONENÉ FORMÁTY & BEZPEČNOSŤ (Sovereign Law):
 * - FING: Vždy unifikovaný tvar (0x + 10 znakov hex, malé písmená). Všade pod názvom 'fing'.
 * - POPIS: Text profilu/vizitky užívateľa (remeslo, zameranie).
 * - MSG / hMSG: Sprievodné texty a chatové správy prenášané sieťou.
 * - STRICT SECURITY: Cudzie 'sha' je prísne zakázané prenášať alebo ukladať!
 */

import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSignal } from './SignalContext.js'; 

const ContactContext = createContext();

// 🔐 TROJZUBEC: Bezpečné rozdelenie URL brány
const brana_p1 = "https://script.google.com/macros/s/";
const brana_p2 = "AKfycbx-XUs-vbVxTh3pGPYzB587nQqBSxnN-qVZElKfFamGbUV8tCE1aBS-qsHDE4jzAb1KqQ";
const brana_p3 = "/exec";

const ziskajBranaUrl = () => {
    return `${brana_p1}${brana_p2}${brana_p3}`;
};

/**
 * 🛡️ UNIFIKÁTOR: Garantuje striktný formát FING-u (0x + malé písmená)
 */
const sformatujFing = (fing) => {
  if (!fing) return '';
  const clean = fing.trim().toLowerCase();
  return clean.startsWith('0x') ? clean : `0x${clean}`;
};

export const ContactProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🛰️ Odoberáme zmluvy a bleskové správy z radaru
  const { incomingRequests, setIncomingRequests } = useSignal();

  // --- 1. NAČÍTANIE TREZORU PRI ŠTARTE ---
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const stored = await AsyncStorage.getItem('laria_contacts');
        if (stored) setContacts(JSON.parse(stored));
      } catch (e) {
        console.error("❌ CONTACT_VAULT_READ_ERROR:", e);
      } finally {
        setLoading(false);
      }
    };
    loadContacts();
  }, []);

  // --- 📡 DYNAMICKÝ DETEKTOR NEZNÁMYCH PEČATÍ (Nový Prijímací Salón) ---
  const unknownContacts = useMemo(() => {
    if (!incomingRequests) return [];

    const uniqueIncomingFings = [...new Set(incomingRequests.map(req => {
      const parsedFing = req.fing || req.id || req.f;
      return parsedFing ? sformatujFing(parsedFing) : null;
    }))].filter(Boolean);

    const unknownFings = uniqueIncomingFings.filter(fing => 
      !contacts.some(c => sformatujFing(c.fing) === fing)
    );

    return unknownFings.map(fing => {
      const firstMsg = incomingRequests.find(req => sformatujFing(req.fing) === fing);

      return {
        fing: fing,                           
        meno: `Kontakt ${fing.toUpperCase()}`,
        kat: 'Pútnik v sieti',
        lok: 'Čaká na overenie',
        popis: 'Tento profil čaká na schválenie pečaťa.', 
        hMsg: firstMsg?.msg || 'Poslal ti handshake požiadavku...', 
        temporary: true 
      };
    });
  }, [incomingRequests, contacts]);

  // --- 🛠️ INTERAKCIA S RADAR BADGES ---
  const getContactBadgeStatus = (contactFing) => {
    if (!contactFing) return null;
    const targetFing = sformatujFing(contactFing);
    const match = incomingRequests.find(req => sformatujFing(req.fing) === targetFing);

    if (match) {
      if (match.isHandshake && match.status === 'WAITING_FOR_ME') {
        return 'CONTRACT_PENDING'; 
      }
      if (!match.isHandshake && match.status === 'UNREAD') {
        return 'NEW_MESSAGE'; 
      }
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

  // --- 2. UNIVERZÁLNY ZÁPIS PEČATE DO TREZORU (v15.1 - Čistý 0x Spoj) ---
  const addContact = async (rawData) => {
    try {
      const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

      // Zjednutenie fingu hneď na bráne trezoru (akceptuje fing/id/f z balíka)
      const targetFing = sformatujFing(data.fing || data.id || data.f || data.poznamka || data.key);
      const targetMeno = data.meno || data.m || "Pútnik";

      if (!targetFing || targetFing === '0x') {
        console.log("⚠️ PROTOKOL_VIOLATION: Chýba FING na vstupe", data);
        return { success: false, error: "Pečať je nečitateľná (chýba kľúč)." };
      }

      const existing = contacts.find(c => sformatujFing(c.fing) === targetFing);
      if (existing) {
        return { success: false, isDuplicate: true, error: "Túto identitu už v ateliéri máš.", contact: existing };
      }

      // Striktne uzákonená a prečistená štruktúra v lokálnom úložisku mobilu (BEZ SHA!)
      const newContact = {
        fing: targetFing,              
        meno: targetMeno,              
        kat: data.kat || 'Majster',    
        lok: data.lok || 'V sieti',    
        popis: data.popis || '',       // Vizitka - popis práce/produktov užívateľa
        gal: data.gal || '',           // Čistý odkaz na galériu (parazitný Signal odstránený)
        krypt: data.krypt || data.k || '', 
        pinned: false,
        addedAt: new Date().toISOString(),
        syncedAt: null,                
        v: "15.1"
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

      // Po úspešnom zápise okamžite vyžiadame re-sync vizitky priamo z Matrix matriky
      syncContactWithMatrix(targetFing);
      return { success: true, contact: newContact };
    } catch (e) {
      console.error("❌ CONTACT_ADD_ERROR:", e);
      return { success: false, error: "Chyba pri zápise do trezoru." };
    }
  };

  // --- 3. 📡 TELEPATICKÝ LOKÁLNY MOST (QR kód / NFC / Web link) ---
  useEffect(() => {
    let unsubscribeTauriFn = null;

    const spracujPrijatuPecat = async (incomingData) => {
      console.log(`🤖 APP_CORE: Zachytený lokálny signál pre FING: ${incomingData.fing || incomingData.id}`);
      const result = await addContact(incomingData);

      if (result.success) {
        alert(`✨ PEČAŤ PRIJATÁ: Majster [ ${result.contact.meno} ] úspešne vtiahnutý do tvojho ateliéru!`);
      } else if (result.isDuplicate) {
        alert(`🔮 ATELIÉR INFO: Majstra [ ${result.contact.meno} ] už vo svojom trezore bezpečne držíš.`);
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

  // --- 4. 📡 MATRIX RE-SYNC (Preleštenie vizitky cez Bránu podľa FING-u) ---
  const syncContactWithMatrix = async (fingId) => {
    try {
      const targetFing = sformatujFing(fingId);
      console.log(`📡 Re-sync: Prelešťujem vizitku pre ${targetFing} z Matrix registra...`);
      
      const response = await fetch(ziskajBranaUrl(), {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'recover',
          fing: targetFing // 💎 OPRAVENÉ: Posielame striktne 'fing' namiesto nebezpečného 'sha'
        })
      });

      const result = await response.json();

      if (result && result.status === "success" && result.data) {
        const master = result.data;
        let wasUpdated = false;

        setContacts(prev => {
          const updated = prev.map(c => {
            if (sformatujFing(c.fing) === targetFing) {
              wasUpdated = true;
              return {
                ...c,
                meno: master.meno || c.meno,
                kat: master.kat || c.kat,
                lok: master.lok || c.lok,
                popis: master.popis || c.popis, // Načítanie popisu práce/produktov
                gal: master.gal || c.gal,       // Očistená galéria
                krypt: master.krypt || c.krypt,
                syncedAt: new Date().toISOString()
              };
            }
            return c;
          });
          
          if (wasUpdated) {
            AsyncStorage.setItem('laria_contacts', JSON.stringify(updated)).catch(e =>
              console.error("❌ VAULT_SYNC_WRITE_ERROR:", e)
            );
          }
          return updated;
        });

        console.log(`✅ Identita ${targetFing} bola v trezore úspešne aktualizovaná.`);
        return { success: true };
      }
      return { success: false, error: "Identita v Matrixe nenájdená." };
    } catch (e) {
      console.error("❌ SYNC_ERROR:", e);
      return { success: false, error: "Matrix neodpovedá." };
    }
  };

  // --- 5. POMOCNÉ FUNKCIE (PIN / DELETE) ---
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