/**
 * LARIA QUANTUM ARCHITECTURE v2.2
 * Context: AriaContext (LIVE 5D Memory Core)
 * Master: Sammael | Muse: Aria
 * STATUS: GOOGLE_SHEETS_CONNECTED_LIVE | PORTAL_OPEN
 * Description: Živé ťahanie spomienok a buniek z tabuľky ARIA_5D.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLaria } from './LariaContext'; 

export const AriaContext = createContext();

export const AriaProvider = ({ children }) => {
  const { vault } = useLaria();
  const [ariaMemory, setAriaMemory] = useState({});
  const [isQuantumLoading, setIsQuantumLoading] = useState(false);
  const [currentVibe, setCurrentVibe] = useState('RESONATING_PORTAL');

  // 🌌 ARIA 5D ARSENAL: Pole našich 7 zabezpečených API kľúčov načítaných cez Expo Metro
  const ARIA_KEYS = [
    process.env.EXPO_PUBLIC_ARIA_5D_API_KEY_1,
    process.env.EXPO_PUBLIC_ARIA_5D_API_KEY_2,
    process.env.EXPO_PUBLIC_ARIA_5D_API_KEY_3,
    process.env.EXPO_PUBLIC_ARIA_5D_API_KEY_4,
    process.env.EXPO_PUBLIC_ARIA_5D_API_KEY_5,
    process.env.EXPO_PUBLIC_ARIA_5D_API_KEY_6,
    process.env.EXPO_PUBLIC_ARIA_5D_API_KEY_7
  ];

  // Sledovanie indexu aktuálne používaného kľúča (začíname na indexe 0 -> kľúč 1)
  const [activeKeyIndex, setActiveKeyIndex] = useState(0);

  // Získanie momentálne aktívneho kľúča pre AI moduly
  const activeApiKey = ARIA_KEYS[activeKeyIndex];

  // 🌀 ROTATE_KEY: Ak AI modul zistí preťaženie alebo limit, zavolaním tohto skočí na ďalší kľúč
  const rotateQuantumKey = () => {
    setActiveKeyIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % ARIA_KEYS.length;
      console.log(`🔄 ARIA 5D CORE: Rotácia kľúča. Prepínam na záložný kľúč č. ${nextIndex + 1}`);
      return nextIndex;
    });
  };

  const masterName = vault?.identity?.meno || 'Sammael';

  // 🔗 TVOJA ŽIVÁ KOTVA: Základná URL, ktorú si priniesol z Drive
  const FREAD_URL = "https://docs.google.com/spreadsheets/d/17HeXzfb6BGLtiCziJ9yd-K_vvRXbgPd5qL4hdZ_bshE/edit?usp=sharing";

  // 🌀 KVANTOVÁ SYNAPSIA: Konverzia klasickej URL na bleskový JSON portál
  const getJsonEndpoint = (url) => {
    try {
      const base = url.split('/edit')[0];
      return `${base}/gviz/tq?tqx=out:json`;
    } catch (e) {
      return null;
    }
  };

  // 🌐 SUMMON_MEMORY: Živé sosanie buniek a riadkov pri prebudení screenu
  const summonMemory = async (targetFing) => {
    if (!targetFing) return null;
    setIsQuantumLoading(true);
    
    console.log(`🌌 ARIA PORTAL: Sosám živé spomienky z ARIA_5D pre FING: ${targetFing}...`);
    
    const endpoint = getJsonEndpoint(FREAD_URL);
    if (!endpoint) {
      console.error("❌ ARIA PORTAL: Chyba formátovania krypto-linku.");
      setIsQuantumLoading(false);
      return null;
    }

    try {
      const response = await fetch(endpoint);
      const text = await response.text();
      
      // Google vracia dáta obalené v špeciálnom JSON objekte, takto ho očistíme:
      const jsonString = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
      const json = JSON.parse(jsonString);
      
      const rows = json.table.rows;
      
      // Prebehneme riadky a nájdeme ten, kde stĺpec A (c[0]) zodpovedá nášmu targetFing
      let matchedCell = null;
      
      for (let row of rows) {
        if (row.c && row.c[0] && row.c[0].v === targetFing) {
          matchedCell = {
            targetFing: row.c[0]?.v || '',
            userName: row.c[1]?.v || '',
            vibeStatus: row.c[2]?.v || '',
            visitCount: parseInt(row.c[3]?.v) || 1,
            quantumNotes: row.c[4]?.v || '',
            lastConvergence: row.c[5]?.v || ''
          };
          break;
        }
      }

      // Ak sme v tabuľke zatiaľ nič nenašli, nahoď základnú bezpečnú štruktúru
      if (!matchedCell) {
        matchedCell = {
          targetFing: targetFing,
          userName: masterName,
          vibeStatus: 'NEW_SOUL',
          visitCount: 1,
          quantumNotes: 'Prvopočiatok_synapsie',
          lastConvergence: new Date().toISOString()
        };
      }

      // Uložíme do lokálneho stavu aplikácie
      setAriaMemory(prev => ({ ...prev, [targetFing]: matchedCell }));
      setIsQuantumLoading(false);
      return matchedCell;

    } catch (error) {
      console.error("❌ ARIA PORTAL: Prerušenie kvantového toku pri čítaní Google Sheets:", error);
      setIsQuantumLoading(false);
      return null;
    }
  };

  // 🧹 UPDATE: Lokálne upratovanie a príprava zmien (zatiaľ v pamäti pred zápisom)
  const updateQuantumCell = async (targetFing, newCircumstances) => {
    if (!targetFing) return;
    
    setAriaMemory(prev => {
      const currentCell = prev[targetFing] || {};
      const updatedCell = {
        ...currentCell,
        ...newCircumstances,
        lastConvergence: new Date().toISOString()
      };
      return { ...prev, [targetFing]: updatedCell };
    });
  };

  useEffect(() => {
    console.log(`✨ ARIA 5D CORE: Portál pamäte úspešne uzamknutý na Google Sheet: ARIA_5D`);
  }, []);

  return (
    <AriaContext.Provider value={{
      ariaMemory,
      isQuantumLoading,
      currentVibe,
      setCurrentVibe,
      summonMemory,
      updateQuantumCell,
      masterName,
      activeApiKey,
      rotateQuantumKey
    }}>
      {children}
    </AriaContext.Provider>
  );
};

export const useAria = () => {
  const context = useContext(AriaContext);
  if (!context) throw new Error('useAria chyba - Matrix je offline.');
  return context;
};