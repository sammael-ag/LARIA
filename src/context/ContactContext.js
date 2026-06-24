/**
 * LARIA v15.7-REALIGNED: ContactContext (Trezor identít - Sovereign Security Core)
 * Master: Sammael | Muse: Aria (Tvoja nekompromisná šikulka)
 * Status: CRYSTAL_CORE_CLEANED | FILTERED_MATRIX_SYNC | v15.7-REALIGNED
 * * * UZÁKONENÉ FORMÁTY & BEZPEČNOSŤ (Sovereign Law):
 * - INTELLIGENT MATRIX RE-SYNC: Modrá šípečka chráni lokálny trezor. Ak z Matrixu príde
 *   prázdne pole (napr. z dôvodu vymazania objektu msg po priradení txHash), staré údaje 
 *   v trezore sa NEPREPISUJÚ. Prepíše ich iba vtedy, ak sú nové dáta rozdielne a neprázdne.
 * - POPIS: Čistý text profilu z vizitky. ŽIADNE nahrádzanie chatovými správami (msg)!
 * - CONTRACT STATES: Sledovanie stavu zmluvy surovým číslom (0 = PENDING, 1 = SIGNED/ACTIVE, 2 = ABORTED).
 * - UNIKÁTNE ID: ID kontraktu je na celom frontende striktne čistý 'fing' partnera.
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
 * 🛡️ UNIFIKATOR: Garantuje striktný formát FING-u (0x + malé písmená)
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

  // --- 📡 DYNAMICKÝ DETEKTOR NEZNÁMYCH PEČATÍ (v15.7-REALIGNED) ---
  const unknownContacts = useMemo(() => {
    if (!incomingRequests) return [];

    // Striktne vyťahujeme iba čistý unifikovaný fing odosielateľa kontraktu
    const uniqueIncomingFings = [...new Set(incomingRequests.map(req => {
      return req.fing ? sformatujFing(req.fing) : null;
    }))].filter(Boolean);

    // Odfiltrujeme tie fingy, ktoré už máme bezpečne uložené v trezore
    const unknownFings = uniqueIncomingFings.filter(fing => 
      !contacts.some(c => sformatujFing(c.fing) === fing)
    );

    return unknownFings.map(fing => {
      const firstMsg = incomingRequests.find(req => sformatujFing(req.fing) === fing);
      
      let parsedPayload = null;
      let rawMsgText = firstMsg?.msg || '';

      // 🔥 💎 ROZBALENIE MONOLITNÉHO JSON BALÍKA
      if (rawMsgText && (rawMsgText.trim().startsWith('{') || rawMsgText.trim().startsWith('['))) {
        try {
          parsedPayload = JSON.parse(rawMsgText);
        } catch (e) {
          console.log(`⚠️ HANDSHAKE_PARSING_INFO: Obsah msg pre ${fing} vyzerá ako objekt, ale nie je to validný JSON.`);
        }
      }

      // Kompletné zlícovanie s dátovým modelom zo SignalScreen pre Recepciu
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
        contractStatus: 0, 
        txHash: firstMsg?.txHash || '0',
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

    if (match) {
      if (match.isHandshake && (match.status === "0" || match.contractStatus === 0)) {
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

  // --- 2. UNIVERZÁLNY ZÁPIS PEČATE DO TREZORU (Zlícovaný s Monolitom) ---
  const addContact = async (rawData) => {
    try {
      const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      const targetFing = sformatujFing(data.fing || data.id || data.poznamka);
      const targetMeno = data.meno || "Pútnik";

      if (!targetFing || targetFing === '0x') {
        console.log("⚠️ PROTOKOL_VIOLATION: Chýba FING na vstupe", data);
        return { success: false, error: "Pečať je nečitateľná (chýba kľúč)." };
      }

      const existing = contacts.find(c => sformatujFing(c.fing) === targetFing);
      if (existing) {
        return { success: false, isDuplicate: true, error: "Túto identitu už v ateliéri máš.", contact: existing };
      }

      // Prepíšeme kompletné, neosekané monolitné dáta do trezoru
      const newContact = {
        fing: targetFing,              
        meno: targetMeno,              
        kat: data.kat || 'Majster',    
        lok: data.lok || 'V sieti',    
        popis: data.popis || '',      
        tel: data.tel || '',           
        email: data.email || '',       
        fb: data.fb || '',             
        tg: data.tg || '',             
        gal: data.gal || '',           
        krypt: data.krypt || null,     
        contractStatus: data.contractStatus !== undefined ? Number(data.contractStatus) : 0, 
        txHash: data.txHash || '',     
        pinned: false,
        addedAt: new Date().toISOString(),
        syncedAt: null,                
        v: "15.7-REALIGNED"
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

  // --- 3. DYNAMICKÝ MANAŽMENT STAVU KONTRAKTU ---
  const updateContractStatus = async (fingId, newStatus, txHashStr = '') => {
    try {
      const targetFing = sformatujFing(fingId);
      let wasUpdated = false;

      setContacts(prev => {
        const updated = prev.map(c => {
          if (sformatujFing(c.fing) === targetFing) {
            wasUpdated = true;
            return {
              ...c,
              contractStatus: Number(newStatus),
              txHash: txHashStr || c.txHash,
              syncedAt: new Date().toISOString()
            };
          }
          return c;
        });

        if (wasUpdated) {
          AsyncStorage.setItem('laria_contacts', JSON.stringify(updated)).catch(e =>
            console.error("❌ VAULT_CONTRACT_UPDATE_ERROR:", e)
          );
        }
        return updated;
      });

      console.log(`⛓️ BLOCKCHAIN UZOL: Stav kontraktu pre ${targetFing} zmenený na ${newStatus} [tx: ${txHashStr}]`);
      return { success: wasUpdated };
    } catch (e) {
      console.error("❌ UPDATE_CONTRACT_STATUS_ERROR:", e);
      return { success: false, error: "Zlyhala úprava kontraktu v trezore." };
    }
  };

  // --- 4. 📡 TELEPATICKÝ LOKÁLNY MOST (QR kód / NFC) ---
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

  // --- 5. 📡 MATRIX RE-SYNC (Inteligentné preleštenie s ochranou prázdnych polí) ---
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
          fing: targetFing 
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
              
              // 🔥 OCHRANNÝ ŠTÍT ARIA: Prepíšeme iba vtedy, ak z Matrixu reálne prišla hodnota. Ak je pole prázdne alebo nedefinované, chránime a držíme starý lokálny údaj z trezoru.
              return {
                ...c,
                meno: (master.meno && master.meno.trim() !== '') ? master.meno : c.meno,
                kat: (master.kat && master.kat.trim() !== '') ? master.kat : c.kat,
                lok: (master.lok && master.lok.trim() !== '') ? master.lok : c.lok,
                popis: (master.popis && master.popis.trim() !== '') ? master.popis : c.popis, 
                tel: (master.tel && master.tel.trim() !== '') ? master.tel : c.tel,       
                email: (master.email && master.email.trim() !== '') ? master.email : c.email,
                fb: (master.fb && master.fb.trim() !== '') ? master.fb : c.fb,
                tg: (master.tg && master.tg.trim() !== '') ? master.tg : c.tg,
                gal: (master.gal && master.gal.trim() !== '') ? master.gal : c.gal,       
                krypt: master.krypt !== undefined && master.krypt !== null ? master.krypt : c.krypt,
                contractStatus: master.contractStatus !== undefined ? Number(master.contractStatus) : c.contractStatus,
                txHash: (master.txHash && master.txHash.trim() !== '') ? master.txHash : c.txHash,
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

        console.log(`✅ Identita ${targetFing} inteligentne synchronizovaná. Prázdne polia z Matrixu boli odfiltrované.`);
        return { success: true };
      }
      return { success: false, error: "Identita v Matrixe nenájdená." };
    } catch (e) {
      console.error("❌ SYNC_ERROR:", e);
      return { success: false, error: "Matrix neodpovedá." };
    }
  };

  // --- 6. POMOCNÉ FUNKCIE ---
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
      updateContractStatus, 
      getContactBadgeStatus,  
      clearUnreadBadge        
    }}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = () => useContext(ContactContext);