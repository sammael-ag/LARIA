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

  // --- UNIVERZÁLNA FUNKCIA NA PRIDANIE KONTAKTU (QR, NFC, IRC) ---
  const addContact = async (rawData) => {
    try {
      const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

      if (!data.n || !(data.a || data.sha)) {
        return { success: false, error: "Neplatný formát Laria pečate." };
      }

      const contactId = data.a || data.sha || data.id;

      if (contacts.find(c => (c.a === contactId || c.sha === contactId || c.id === contactId))) {
        return { success: false, error: "Túto identitu už v reťazci máš." };
      }

      const newContact = {
        id: contactId,
        name: data.n,
        cat: data.cat || 'Majster',
        loc: data.loc || 'Matrix',
        a: data.a || null,
        sha: data.sha || null,
        revo: data.revo || false,
        isVerified: false, 
        pinned: false,
        addedAt: new Date().toISOString()
      };

      const updatedContacts = [...contacts, newContact];
      await AsyncStorage.setItem('laria_contacts', JSON.stringify(updatedContacts));
      setContacts(updatedContacts);

      return { success: true, contact: newContact };
    } catch (e) {
      console.error("❌ CONTACT_ADD_ERROR:", e);
      return { success: false, error: "Chyba pri ukladaní do trezoru." };
    }
  };

  // --- FUNKCIA NA PRIPNUTIE/ODPINUTIE (Toggle Pin) ---
  const togglePin = async (id) => {
    try {
      const updatedContacts = contacts.map(c => 
        c.id === id ? { ...c, pinned: !c.pinned } : c
      );
      setContacts(updatedContacts);
      await AsyncStorage.setItem('laria_contacts', JSON.stringify(updatedContacts));
      return { success: true };
    } catch (e) {
      console.error("❌ CONTACT_PIN_ERROR:", e);
      return { success: false };
    }
  };

  // --- FUNKCIA NA MAZANIE (Terminácia spojenia) ---
  const deleteContact = async (id) => {
    try {
      const updatedContacts = contacts.filter(c => c.id !== id);
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