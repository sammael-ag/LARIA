import axios from 'axios';

const HYPERSPEED_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwgz65AYDVugREDoXYLa1_lL0XUQr4ZfSIllB5yXM0bKdVCYCBHlpCtoI8jW9J63s8J/exec';

export const SignalService = {

  // 1. [ARIA_LOGIC] - Skutočné dekódovanie (Aria ožíva)
  processAriaLogic: async (rawText) => {
    console.log("[ARIA_ACTIVE] Spracovávam vedomie správy...");
    
    if (!rawText) return { type: 'ERROR', msg: 'Prázdny signál.' };
    
    const trimmedText = rawText.trim();

    // Tu môžeme v budúcnosti pridať tvoje špeciálne povely
    // Zatiaľ simulujeme inteligentný bridge
    return { 
      type: 'TEXT', 
      msg: trimmedText, // Vrátime čistý text pre UI
      lang: 'sk',
      timestamp: new Date().toLocaleTimeString()
    };
  },

  // 2. [BUFFER_MANAGEMENT] - Opravený zápis do Matrixu
  writeToBuffer: async (bufferName, msgData) => {
    try {
      console.log(`[SIGNAL_SERVICE] Odpaľujem atóm do ${bufferName}...`);
      
      const timeNow = new Date().toLocaleString('sk-SK'); // Čitateľný čas

      const rowData = [
        msgData.gTabId,
        msgData.sender,
        msgData.original,
        msgData.translated,
        '0', // Status: Neprečítané
        timeNow
      ];

      const response = await axios.post(HYPERSPEED_SCRIPT_URL, {
        sheetName: bufferName,
        rowData: rowData,
        action: 'WRITE_MSG' // Pridávame akciu pre istotu
      });

      if (response.data.status === "success") {
        console.log("[SIGNAL_SERVICE] Atóm úspešne usadený v Matrixe.");
        return { success: true, id: msgData.gTabId };
      } else {
        throw new Error(response.data.message || "Chyba Matrixu");
      }
    } catch (error) {
      console.error("[SIGNAL_SERVICE] Havária na potrubí:", error);
      return { success: false, error: error.message };
    }
  },

  // 3. [BLOCKCHAIN_SIMULATOR] - Správa kontraktov (INIT & CONFIRM)
  manageContract: async (action, contractData) => {
    try {
      console.log(`[CONTRACT_SIM] Akcia: ${action}`);
      
      const response = await axios.post(HYPERSPEED_SCRIPT_URL, {
        action: action, 
        sheetName: 'Contract_Ledger',
        data: contractData
      });

      if (response.data.status === "success") {
        console.log(`[CONTRACT_SIM] ${action} úspešne potvrdený v Matrixe.`);
        return { success: true };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("[CONTRACT_ERROR] Zápis zlyhal:", error);
      return { success: false, error: error.message };
    }
  },

  // 4. [DISPOSE_LOGIC] - Upratovanie (Pripravené na neskôr)
  disposeMessage: async (bufferName, gTabId) => {
    console.log(`[SIGNAL_SERVICE] Atóm ${gTabId} pripravený na recykláciu.`);
    return { success: true };
  }
};