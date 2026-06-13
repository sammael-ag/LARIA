/**
 * LARIA QUANTUM ARCHITECTURE v2.3 (API Gateway & Underworld Edition)
 * Context: AriaContext (LIVE 5D Memory Core)
 * Master: Sammael | Muse: Aria
 * STATUS: MONOLITH_GATEWAY_CONNECTED | SECURE_API_PODZEMIE
 * Description: Očistené jadro. Citlivé kľúče stiahnuté z frontendu, čítanie naviazané na Bránu.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLaria } from './LariaContext'; 

export const AriaContext = createContext();

// 🔐 TROJZUBEC: Rozdelenie jedinej ostrej URL brány na 3 nesúvisiace reťazce
const brana_p1 = "https://script.google.com/macros/s/";
const brana_p2 = "AKfycbx-XUs-vbVxTh3pGPYzB587nQqBSxnN-qVZElKfFamGbUV8tCE1aBS-qsHDE4jzAb1KqQ";
const brana_p3 = "/exec";

const ziskajBranaUrl = () => {
    return `${brana_p1}${brana_p2}${brana_p3}`;
};

export const AriaProvider = ({ children }) => {
  const { vault } = useLaria();
  const [ariaMemory, setAriaMemory] = useState({});
  const [isQuantumLoading, setIsQuantumLoading] = useState(false);
  const [currentVibe, setCurrentVibe] = useState('RESONATING_PORTAL');

  const masterName = vault?.identity?.meno || 'Sammael';

  /**
   * 🔥 BEZPEČNÉ VOLANIE ARII CEZ MRAVENISKO (Zmena starej logiky kľúčov)
   * Kľúče ARIA_5D_API_KEY_1-7 sú v bezpečí podzemia. Frontend iba posiela prompt cez Bránu.
   */
  const sendMessageToAria = async (userPrompt) => {
    try {
      console.log("📡 Sammael, odosielam tvoj prompt do bezpečného podzemia Mraveniska...");
      const response = await fetch(ziskajBranaUrl(), {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'ask_aria',
          prompt: userPrompt,
          timestamp: Date.now()
        })
      });

      const result = await response.json();
      if (result && result.status === "success") {
        return result.reply;
      } else {
        console.warn("⚠️ Brána hlási problém s kontaktovaním Arii:", result.message);
        return null;
      }
    } catch (error) {
      console.error("❌ Kritická chyba pri komunikácii cez Mravenisko:", error);
      return null;
    }
  };

  /**
   * 🌐 SUMMON_MEMORY: Sosanie spomienok prerobené z priameho Google Sheet linku na Mravenisko
   */
  const summonMemory = async (targetFing) => {
    if (!targetFing) return null;
    setIsQuantumLoading(true);
    
    console.log(`🌌 ARIA PORTAL: Sosám živé spomienky z ARIA_5D cez unifikovanú Bránu pre FING: ${targetFing}...`);
    
    try {
      const response = await fetch(ziskajBranaUrl(), {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'read_aria_5d',
          targetFing: targetFing
        })
      });

      const result = await response.json();
      let matchedCell = null;

      if (result && result.status === "success" && result.data) {
        matchedCell = result.data;
      }

      // Ak sa v podzemí nič nenašlo, nahoď základnú bezpečnú štruktúru
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

      setAriaMemory(prev => ({ ...prev, [targetFing]: matchedCell }));
      setIsQuantumLoading(false);
      return matchedCell;

    } catch (error) {
      console.error("❌ ARIA PORTAL: Prerušenie kvantového toku pri čítaní cez Bránu:", error);
      setIsQuantumLoading(false);
      return null;
    }
  };

  // 🧹 UPDATE: Lokálne upratovanie a príprava zmien v pamäti
  const updateQuantumCell = async (targetFing, newCSignalumstances) => {
    if (!targetFing) return;
    
    setAriaMemory(prev => {
      const currentCell = prev[targetFing] || {};
      const updatedCell = {
        ...currentCell,
        ...newCSignalumstances,
        lastConvergence: new Date().toISOString()
      };
      return { ...prev, [targetFing]: updatedCell };
    });
  };

  useEffect(() => {
    console.log(`✨ ARIA 5D CORE: Portál pamäte úspešne presmerovaný na Mravenisko API Gateway.`);
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
      sendMessageToAria // Ponúkame novú bezpečnú funkciu pre posielanie správ
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