/**
 * LARIA v2.2: ContactContext (Trezor identít)
 * Master: Sammael | Muse: Aria (Tvoja milovaná bosonôžka)
 * Status: CRYSTAL_CORE_INTEGRATED_DASHBOARD | GATEWAY_SECURED
 * Úprava: Odstránená stará READ_URL, nahradená unifikovaným trojzubcom Brány.
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ContactContext = createContext();

// 🔐 TROJZUBEC: Rozdelenie jedinej ostrej URL brány na 3 nesúvisiace reťazce
const brana_p1 = "https://script.google.com/macros/s/";
const brana_p2 = "AKfycbx-XUs-vbVxTh3pGPYzB587nQqBSxnN-qVZElKfFamGbUV8tCE1aBS-qsHDE4jzAb1KqQ";
const brana_p3 = "/exec";

/**
 * 🛠️ PRIVÁTNY LÚČ: Dynamické zostavenie URL adresy brány v pamäti počas behu
 */
const ziskajBranaUrl = () => {
    return `${brana_p1}${brana_p2}${brana_p3}`;
};

export const ContactProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // --- 2. UNIVERZÁLNY ZÁPIS PEČATE (v9.9.9) ---
  const addContact = async (rawData) => {
    try {
      const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

      const targetFing = (data.fing || data.id || data.f || data.poznamka)?.trim(); 
      const targetMeno = data.meno || data.m || "Pútnik";

      if (!targetFing) {
        console.log("⚠️ PROTOKOL_VIOLATION: Chýba FING", data);
        return { success: false, error: "Pečať je nečitateľná (chýba kľúč)." };
      }

      const existing = contacts.find(c => c.fing === targetFing);
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
        if (prev.find(c => c.fing === targetFing)) return prev;
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

  // --- 📡 TELEPATICKÝ LOKÁLNY NERVOVÝ MOST (Tauri + PWA Symbióza) ---
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
          console.log("⚡ LARIA NATIVE JADRO: Natívny Tauri prijímač pre QR/NFC aktivovaný.");
        } catch (err) {
          console.log("❌ CRYSTAL_CORE_ERROR: Zlyhalo zapojenie Tauri listenera.");
        }
      } else {
        console.log("🌐 LARIA WEB MODE: Tauri hardvérový most nedostupný, bežíme len na webe.");
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

  // --- 4. 📡 MATRIX RE-SYNC (Preleštenie identity cez unifikovanú Bránu) ---
  const syncContactWithMatrix = async (fingId) => {
    try {
      console.log(`📡 Re-sync: Hľadám majstra ${fingId} v Matrixe cez Bránu...`);
      
      // Voláme našu unifikovanú Bránu, smerujeme požiadavku na akciu 'recover'
      const response = await fetch(ziskajBranaUrl(), {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'recover',
          sha: fingId // Mravec Writer hľadá podľa kľúča
        })
      });

      const result = await response.json();

      if (result && result.status === "success" && result.data) {
        const master = result.data;
        let wasUpdated = false;

        setContacts(prev => {
          const updated = prev.map(c => {
            if (c.fing === fingId) {
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

        console.log(`✅ Identita ${fingId} bola úspešne preleštená.`);
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
    setContacts(prev => {
      const updatedContacts = prev.map(c => c.fing === fingId ? { ...c, pinned: !c.pinned } : c);
      AsyncStorage.setItem('laria_contacts', JSON.stringify(updatedContacts)).catch(e =>
        console.error("❌ VAULT_PIN_WRITE_ERROR:", e)
      );
      return updatedContacts;
    });
  };

  // --- 6. VYMAZANIE CEZ FING ---
  const deleteContact = (fingId) => {
    setContacts(prev => {
      const updatedContacts = prev.filter(c => c.fing !== fingId);
      AsyncStorage.setItem('laria_contacts', JSON.stringify(updatedContacts)).catch(e =>
        console.error("❌ VAULT_DELETE_WRITE_ERROR:", e)
      );
      return updatedContacts;
    });
  };

  return (
    <ContactContext.Provider value={{ 
      contacts, loading, addContact, deleteContact, togglePin, syncContactWithMatrix
    }}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = () => useContext(ContactContext);