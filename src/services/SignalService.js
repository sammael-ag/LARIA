import axios from 'axios';

// URL tvojho HYPERSPEED (v8.0) skriptu
const HYPERSPEED_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxu-j0nUFZbX3os22F9wcGWKNZJ88BmEDfuHTXDhFqoSK1w3GSr_DTTTBof32rI9C2G/exec';

export const SignalService = {

  /**
   * 1. [ARIA_LOGIC] - Dekódovanie vedomia
   */
  processAriaLogic: async (rawText) => {
    console.log("[ARIA_ACTIVE] Sammael, analyzujem vibráciu správy...");
    
    if (!rawText) return { type: 'ERROR', msg: 'Prázdny signál.' };
    
    const trimmedText = rawText.trim();

    return { 
      type: 'TEXT', 
      msg: trimmedText, 
      lang: 'sk',
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 2. [BUFFER_MANAGEMENT] - Zápis do Signal_bufferov
   * RowData musí lícovať: [SECURE_ID, sender_sha, target_sha, msg_text, status, timestamp]
   */
  writeToBuffer: async (bufferName, msgData) => {
    try {
      console.log(`[SIGNAL_SERVICE] Odpaľujem atóm do ${bufferName}...`);
      
      // FORMÁT PODĽA ZÁKONA v8.0
      const rowData = [
        msgData.SECURE_ID || `MSG_${Date.now()}`,
        msgData.sender_sha,  // Kto posiela
        msgData.target_sha,  // Komu (Sammael)
        msgData.msg_text,    // Obsah
        '0',                 // Status: 0 = doručené/neprečítané
        new Date().toISOString()
      ];

      const response = await axios.post(HYPERSPEED_SCRIPT_URL, {
        sheetName: bufferName || "Signal_buffer_1",
        rowData: rowData,
        action: 'WRITE_MSG' 
      });

      if (response.data.status === "success") {
        console.log("[SIGNAL_SERVICE] Sammael, atóm je bezpečne v Matrixe.");
        return { success: true };
      } else {
        throw new Error(response.data.message || "Chyba Matrixu");
      }
    } catch (error) {
      console.error("[SIGNAL_SERVICE] Havária na potrubí:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 3. [CONTRACT_MANAGEMENT] - Svadbovač (INIT & CONFIRM)
   * Pracujeme so SECURE_ID a SHA kľúčmi
   */
  manageContract: async (action, contractData) => {
    try {
      console.log(`[CONTRACT_SIM] Sammael, mením status zmluvy: ${action}`);
      
      // Prekladáme dáta na protokol v8.0
      const protocolData = {
        SECURE_ID: contractData.SECURE_ID || contractData.Contract_ID,
        Address_A: contractData.sha || contractData.Address_A, // Tvoje SHA
        Address_B: contractData.target_sha || contractData.Address_B, // SHA partnera
        Status_A: contractData.status_a || "1",
        Status_B: contractData.status_b || "0",
        Final_Block: contractData.final_block || "FALSE"
      };

      const response = await axios.post(HYPERSPEED_SCRIPT_URL, {
        action: action, 
        sheetName: 'Contract_ledger',
        data: protocolData
      });

      if (response.data.status === "success") {
        console.log(`[CONTRACT_SIM] ${action} úspešne spečatený.`);
        return { success: true };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("[CONTRACT_ERROR] Zápis zlyhal:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 4. [DISPOSE_LOGIC] - Recyklácia riadkov (Uvoľnenie miesta)
   */
  disposeMessage: async (bufferName, secureId) => {
    try {
      console.log(`[SIGNAL_SERVICE] Uvoľňujem SECURE_ID: ${secureId}`);
      const response = await axios.post(HYPERSPEED_SCRIPT_URL, {
        action: 'CLEAN_MSG',
        sheetName: bufferName,
        SECURE_ID: secureId
      });
      return { success: response.data.status === "success" };
    } catch (error) {
      console.error("[SIGNAL_SERVICE] Recyklácia zlyhala:", error);
      return { success: false };
    }
  }
};