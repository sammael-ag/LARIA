// services/SignalService.js
import axios from 'axios';

/**
 * SIGNAL SERVICE - Hyperspeed Edition
 * Všetka komunikácia ide cez náš dedikovaný Google Apps Script
 */

const HYPERSPEED_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwgz65AYDVugREDoXYLa1_lL0XUQr4ZfSIllB5yXM0bKdVCYCBHlpCtoI8jW9J63s8J/exec';

export const SignalService = {

  // 1. [ARIA_LOGIC] - Rozpoznávanie a spracovanie textu
  processAriaLogic: async (rawText, currentLangPref = 'sk') => {
    console.log("[ARIA_ACTIVE] Dekódujem energetický balík...");
    
    const trimmedText = rawText.trim();
    const isLangSwitch = /^(slovenčina|deutsch|english|magyar)$/i.test(trimmedText);
    
    if (isLangSwitch) {
      const newLang = trimmedText.toLowerCase();
      console.log(`[ARIA] Zmena frekvencie na: ${newLang}`);
      return { 
        type: 'CONFIG', 
        payload: newLang, 
        msg: `Jazyk prepnutý na: ${newLang.toUpperCase()}` 
      };
    }

    return { 
      type: 'TEXT', 
      msg: `[ARIA_VERIFIED]: ${trimmedText}`, 
      lang: currentLangPref 
    };
  },

  // 2. [BUFFER_MANAGEMENT] - Zápis do Signal_Buffer_X
  writeToBuffer: async (bufferName, msgData) => {
    try {
      console.log(`[SIGNAL_SERVICE] Odpaľujem atóm do ${bufferName}...`);
      
      const rowData = [
        msgData.gTabId,
        msgData.sender,
        msgData.original,
        msgData.translated,
        '0',
        new Date().toISOString()
      ];

      const response = await axios.post(HYPERSPEED_SCRIPT_URL, {
        sheetName: bufferName,
        rowData: rowData
      });

      if (response.data.status === "success") {
        console.log("[SIGNAL_SERVICE] Atóm úspešne usadený v Matrixe.");
        return { success: true, id: msgData.gTabId };
      } else {
        throw new Error(response.data.message || "Neznáma chyba skriptu");
      }
    } catch (error) {
      console.error("[SIGNAL_SERVICE] Havária na potrubí:", error);
      return { success: false, error: error.message };
    }
  },

  // 3. [BLOCKCHAIN_SIMULATOR] - Správa kontraktov v Contract_Ledger
  manageContract: async (action, contractData) => {
    try {
      console.log(`[CONTRACT_SIM] Akcia: ${action} pre ${contractData.Address_B}`);
      
      // Posielame akciu a dáta priamo do nášho scriptu
      const response = await axios.post(HYPERSPEED_SCRIPT_URL, {
        action: action, 
        sheetName: 'Contract_Ledger',
        data: contractData
      });

      if (response.data.status === "success") {
        console.log(`[CONTRACT_SIM] ${action} úspešne zapísaný.`);
        return { success: true };
      } else {
        throw new Error(response.data.message || "Chyba pri zápise kontraktu");
      }
    } catch (error) {
      console.error("[CONTRACT_ERROR] Blockchain simulácia zlyhala:", error);
      return { success: false, error: error.message };
    }
  },

  // 4. [DISPOSE_LOGIC] - Vymazanie/Upratovanie
  disposeMessage: async (bufferName, gTabId) => {
    console.log(`[SIGNAL_SERVICE] Príprava na likvidáciu atómu ${gTabId}...`);
    return { success: true };
  }
};