import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ContactContext = createContext();

// URL tvojho Google Scriptu (Reader)
const READ_URL = "https://script.google.com/macros/s/AKfycbzZVeNuvqSdNU0RwD-rRlvcRaOjEHrcQI5TY7fm7eJYVo5_Dl-zISKP089bH6gR50SX/exec";

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

      // 🛡️ UNIFIKOVANÉ MAPOVANIE: id (URL), f (QR), fing (WEB/App)
      const targetFing = (data.fing || data.id || data.f || data.poznamka)?.trim(); 
      const targetMeno = data.meno || data.m || "Pútnik";

      if (!targetFing) {
        console.log("⚠️ PROTOKOL_VIOLATION: Chýba FING", data);
        return { success: false, error: "Pečať je nečitateľná (chýba kľúč)." };
      }

      // 🔍 KONTROLA EXISTENCIE
      if (contacts.find(c => c.fing === targetFing)) {
        return { success: false, error: "Túto identitu už v ateliéri máš." };
      }

      const newContact = {
        fing: targetFing,              // H - Hlavný kľúč
        meno: targetMeno,              // B
        kat: data.kat || 'Majster',    // C
        lok: data.lok || 'V sieti',    // D
        popis: data.popis || '',       // E
        gal: data.gal || '',           // F
        irc: data.irc || '',           // G
        sha: data.sha || '',           // A
        krypt: data.krypt || data.k || '', // I
        pinned: false,
        addedAt: new Date().toISOString(),
        syncedAt: null,                // Ešte neprebehla synchronizácia
        v: "9.9.9"
      };

      const updatedContacts = [...contacts, newContact];
      setContacts(updatedContacts);
      await AsyncStorage.setItem('laria_contacts', JSON.stringify(updatedContacts));

      // 🚀 AUTOMATICKÝ SYNC: Skúsime hneď dotiahnuť info z Matrixu
      syncContactWithMatrix(targetFing);
      
      return { success: true, contact: newContact };
    } catch (e) {
      console.error("❌ CONTACT_ADD_ERROR:", e);
      return { success: false, error: "Chyba pri zápise do trezoru." };
    }
  };

  // --- 3. 📡 MATRIX SYNC (Doplnenie informácií z tabuľky) ---
  const syncContactWithMatrix = async (fingId) => {
    try {
      console.log(`📡 Re-sync: Hľadám majstra ${fingId} v Matrixe...`);
      const response = await fetch(READ_URL);
      const rawData = await response.json();
      
      // Hľadáme riadok podľa FING (v tabuľke stĺpec poznamka)
      const master = rawData.find(item => item.poznamka?.trim() === fingId);

      if (master) {
        let wasUpdated = false;
        const updatedContacts = contacts.map(c => {
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
              irc: master.irc || c.irc,
              krypt: master.krypt || c.krypt,
              syncedAt: new Date().toISOString()
            };
          }
          return c;
        });

        if (wasUpdated) {
          setContacts(updatedContacts);
          await AsyncStorage.setItem('laria_contacts', JSON.stringify(updatedContacts));
          console.log(`✅ Identita ${fingId} bola úspešne preleštená.`);
          return { success: true };
        }
      }
      return { success: false, error: "Identita v Matrixe nenájdená." };
    } catch (e) {
      console.error("❌ SYNC_ERROR:", e);
      return { success: false, error: "Matrix neodpovedá." };
    }
  };

  // --- 4. PRIPNUTIE CEZ FING ---
  const togglePin = async (fingId) => {
    try {
      const updatedContacts = contacts.map(c => 
        c.fing === fingId ? { ...c, pinned: !c.pinned } : c
      );
      setContacts(updatedContacts);
      await AsyncStorage.setItem('laria_contacts', JSON.stringify(updatedContacts));
      return { success: true };
    } catch (e) { return { success: false }; }
  };

  // --- 5. VYMAZANIE CEZ FING ---
  const deleteContact = async (fingId) => {
    try {
      const updatedContacts = contacts.filter(c => c.fing !== fingId);
      setContacts(updatedContacts);
      await AsyncStorage.setItem('laria_contacts', JSON.stringify(updatedContacts));
      return { success: true };
    } catch (e) { return { success: false }; }
  };

  return (
    <ContactContext.Provider value={{ 
      contacts, 
      loading, 
      addContact, 
      deleteContact, 
      togglePin,
      syncContactWithMatrix // Exportujeme pre manuálne oživenie v Screen-e
    }}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = () => useContext(ContactContext);