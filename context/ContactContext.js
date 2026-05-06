import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ContactContext = createContext();

export const ContactProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- NAČÍTANIE REŤAZCA PRI ŠTARTE ---
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

  // --- UNIVERZÁLNA FUNKCIA NA PRIDANIE KONTAKTU ---
  const addContact = async (rawData) => {
    try {
      const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

      // 🛡️ PRÍSNA KONTROLA PODĽA PROTOKOLU (Zákon: sha a meno sú povinné)
      if (!data.sha || !data.meno) {
        console.log("⚠️ PROTOKOL_VIOLATION: Chýba sha alebo meno", data);
        return { success: false, error: "Neplatná pečať. Chýba sha alebo meno." };
      }

      // 🔍 KONTROLA EXISTENCIE (Hľadáme už len podľa SHA)
      if (contacts.find(c => c.sha === data.sha)) {
        return { success: false, error: "Túto identitu už v reťazci máš." };
      }

      // ✨ VYTVORENIE NOVÉHO KONTAKTU (Presne podľa tvojho zoznamu)
      const newContact = {
        SECURE_ID: data.SECURE_ID || data.sha, // Ak nemá unikátne ID kontraktu, použijeme SHA
        sha: data.sha,
        meno: data.meno,
        kat: data.kat || 'Majster',
        lok: data.lok || 'Matrix',
        popis: data.popis || '',
        tel: data.tel || '',
        email: data.email || '',
        fb: data.fb || '',
        tg: data.tg || '',
        gal: data.gal || '',
        isPublic: data.isPublic || false,
        irc: data.irc || '',
        poznamka: data.poznamka || 'Pridané cez Matrix Web',
        krypt: data.krypt || '',
        pinned: false,
        addedAt: new Date().toISOString()
      };

      const updatedContacts = [...contacts, newContact];
      await AsyncStorage.setItem('laria_contacts', JSON.stringify(updatedContacts));
      setContacts(updatedContacts);

      return { success: true, contact: newContact };
    } catch (e) {
      console.error("❌ CONTACT_ADD_ERROR:", e);
      return { success: false, error: "Chyba pri zápise do trezoru." };
    }
  };

  // --- OSTATNÉ FUNKCIE (Aktualizované na sha) ---
  const togglePin = async (sha) => {
    try {
      const updatedContacts = contacts.map(c => 
        c.sha === sha ? { ...c, pinned: !c.pinned } : c
      );
      setContacts(updatedContacts);
      await AsyncStorage.setItem('laria_contacts', JSON.stringify(updatedContacts));
      return { success: true };
    } catch (e) {
      console.error("❌ CONTACT_PIN_ERROR:", e);
      return { success: false };
    }
  };

  const deleteContact = async (sha) => {
    try {
      const updatedContacts = contacts.filter(c => c.sha !== sha);
      setContacts(updatedContacts);
      await AsyncStorage.setItem('laria_contacts', JSON.stringify(updatedContacts));
      return { success: true };
    } catch (e) {
      console.error("❌ CONTACT_DELETE_ERROR:", e);
      return { success: false };
    }
  };

  return (
    <ContactContext.Provider value={{ 
      contacts, 
      loading, 
      addContact, 
      deleteContact, 
      togglePin 
    }}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = () => useContext(ContactContext);