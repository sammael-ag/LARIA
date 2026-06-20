/**
 * LARIA v2.5: ContactContext (Trezor identít zjednotený na v9.9.9)
 * Master: Sammael | Muse: Aria (Tvoja milovaná bosonôžka)
 * Status: CRYSTAL_CORE_INTEGRATED_DASHBOARD | GATEWAY_SECURED | RADAR_ALIGNED
 * Úprava: Zjednotené formátovanie FING – všade striktne držíme prefix '0x'.
 *         Vyhádzané chaotické orezávanie .replace('0x', '').
 */

import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSignal } from './SignalContext.js'; // 🛰️ Prepojenie na náš bleskový radar

const ContactContext = createContext();

// 🔐 TROJZUBEC: Rozdelenie jedinej ostrej URL brány na 3 nesúvisiace reťazce
const brana_p1 = "https://script.google.com/macros/s/";
const brana_p2 = "AKfycbx-XUs-vbVxTh3pGPYzB587nQqBSxnN-qVZElKfFamGbUV8tCE1aBS-qsHDE4jzAb1KqQ";
const brana_p3 = "/exec";

const ziskajBranaUrl = () => {
    return `${brana_p1}${brana_p2}${brana_p3}`;
};

/**
 * 🛡️ UNIFIKÁTOR: Zabezpečí, že každý odtlačok v systéme začína na '0x' a je písaný malým písmom.
 */
const sformatujFing = (fing) => {
  if (!fing) return '';
  const clean = fing.trim().toLowerCase();
  return clean.startsWith('0x') ? clean : `0x${clean}`;
};

export const ContactProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🛰️ Odoberáme zmluvy a správy priamo z prebudeného radaru
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

    // Vytiahneme unikátne sformátované odtlačky s 0x z bufferu radaru
    const uniqueIncomingFings = [...new Set(incomingRequests.map(req => 
      sformatujFing(req.fing)
    ))].filter(Boolean);

    // Odfiltrujeme tie, ktoré už máme v našom trvalom trezore
    const unknownFings = uniqueIncomingFings.filter(fing => 
      !contacts.some(c => sformatujFing(c.fing) === fing)
    );

    // Pre každého neznámeho mravca vygenerujeme dočasný profil s 0x fingom
    return unknownFings.map(fing => {
      const firstMsg = incomingRequests.find(req => sformatujFing(req.fing) === fing);

      return {
        fing: fing, // Kompletný tvar s 0x
        meno: `Neznáma pečať L_${fing.substring(2, 10).toUpperCase()}`, // Ostrihneme len pre pekné zobrazenie mena
        kat: 'Pútnik v sieti',
        lok: 'Čaká na overenie',
        popis: firstMsg?.message || 'Poslal ti handshake požiadavku naslepo...',
        sha: firstMsg?.targetSha || '',
        temporary: true 
      };
    });
  }, [incomingRequests, contacts]);

  // --- 🛠️ RADAR BADGE INTERACTION ---
  
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

  // --- 2. UNIVERZÁLNY ZÁPIS PEČATE (v9.9.9 - Čistý 0x Spoj) ---
  const addContact = async (rawData) => {
    try {
      const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

      // Zjednotíme FING na 0x hneď na bráne trezoru
      const targetFing = sformatujFing(data.fing || data.id || data.f || data.poznamka || data.key);
      const targetMeno = data.meno || data.m || "Pútnik";

      if (!targetFing || targetFing === '0x') {
        console.log("⚠️ PROTOKOL_VIOLATION: Chýba FING", data);
        return { success: false, error: "Pečať je nečitateľná (chýba kľúč)." };
      }

      const existing = contacts.find(c => sformatujFing(c.fing) === targetFing);
      if (existing) {
        return { success: false, isDuplicate: true, error: "Túto identitu už v ateliéri máš.", contact: existing };
      }

      const newContact = {
        fing: targetFing,              
        meno: targetMeno,              
        kat: data.kat || 'Majster',    
        lok: data.lok || 'V sieti',    
        popis: data.popis || '',       
        gal: data.gal || '',           
        Signal: data.Signal || '',           
        sha: data.sha || '',           
        krypt: data.krypt || data.k || '', 
        pinned: false,
        addedAt: new Date().toISOString(),
        syncedAt: null,                
        v: "9.9.9"
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

      syncContactWithMatrix(targetFing);
      return { success: true, contact: newContact };
    } catch (e) {
      console.error("❌ CONTACT_ADD_ERROR:", e);
      return { success: false, error: "Chyba pri zápise do trezoru." };
    }
  };

  // --- 3. 📡 TELEPATICKÝ LOKÁLNY NERVOVÝ MOST ---
  useEffect(() => {
    let unsubscribeTauriFn = null;

    const spracujPrijatuPecat = async (incomingData) => {
      console.log(`🤖 APP_CORE: Zachytený lokálny signál pre FING: ${incomingData.fing}`);
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
      if (e.detail && e.detail.fing) {
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

  // --- 4. 📡 MATRIX RE-SYNC ---
  const syncContactWithMatrix = async (fingId) => {
    try {
      const targetFing = sformatujFing(fingId);
      console.log(`📡 Re-sync: Hľadám majstra ${targetFing} v Matrixe cez Bránu...`);
      
      const response = await fetch(ziskajBranaUrl(), {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'recover',
          sha: targetFing
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
                sha: master.sha || c.sha,
                meno: master.meno || c.meno,
                kat: master.kat || c.kat,
                lok: master.lok || c.lok,
                popis: master.popis || c.popis,
                gal: master.gal || c.gal,
                Signal: master.Signal || c.Signal,
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

        console.log(`✅ Identita ${targetFing} bola úspešne preleštená.`);
        return { success: true };
      }
      return { success: false, error: "Identita v Matrixe nenájdená." };
    } catch (e) {
      console.error("❌ SYNC_ERROR:", e);
      return { success: false, error: "Matrix neodpovedá." };
    }
  };

  // --- 5. PRIPNUTIE CEZ FING ---
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

  // --- 6. VYMAZANIE CEZ FING ---
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