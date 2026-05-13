/**
 * LARIA SIGNAL SERVICE v9.4
 * STATUS: ULTIMATE SYNC / ONLY-FING PROTOCOL
 * FIX: Plná podpora pre Hyperspeed (Signal_Buffer_1) a Matchmaker (Contract_ledger).
 */

import axios from 'axios';

const HYPERSPEED_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxu-j0nUFZbX3os22F9wcGWKNZJ88BmEDfuHTXDhFqoSK1w3GSr_DTTTBof32rI9C2G/exec';

export const SignalService = {

  /**
   * 1. [ARIA_LOGIC] - Čistenie vibrácií signálu
   */
  processAriaLogic: async (rawText) => {
    if (!rawText) return { type: 'ERROR', msg: 'Signál je prázdny.' };
    return { 
      type: 'TEXT', 
      msg: rawText.trim(), 
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 2. [HYPERSPEED] - Zápis do Signal_Buffer_1 (onlyFING)
   * RowData: [MSG_ID, sender_fing, target_fing, msg_text, status, timestamp]
   */
  writeToBuffer: async (bufferName, msgData) => {
    try {
      console.log(`[SIGNAL_SERVICE] Hyperspeed zápis (onlyFING: ${bufferName})...`);
      
      // Ak posielame rowData priamo (zo SignalContextu), použijeme ich
      // Inak ich vyskladáme z jednotlivých polí
      const rowData = msgData.rowData || [
        `MSG_${Date.now()}`, 
        (msgData.sender_fing || '').replace('0x', ''), 
        (msgData.target_fing || '').replace('0x', ''),
        msgData.msg_text || msgData.msg,
        '0', 
        new Date().toISOString()
      ];

      const response = await axios.post(HYPERSPEED_SCRIPT_URL, {
        sheetName: bufferName || "Signal_buffer_1",
        rowData: rowData,
        action: 'WRITE_MSG' 
      });

      return { success: response.data.status === "success" };
    } catch (error) {
      console.error("[SIGNAL_SERVICE] Hyperspeed havária:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 3. [MATCHMAKER] - Pečatenie v Contract_ledger
   * Matchmaker skript spracováva objekt 'data' a ukladá ho do tabuľky.
   */
  manageContract: async (action, contractData) => {
    try {
      console.log(`[SIGNAL_SERVICE] Matchmaker akcia: ${action}`);
      
      const response = await axios.post(HYPERSPEED_SCRIPT_URL, {
        action: action, 
        sheetName: 'Contract_ledger',
        data: contractData 
      });

      if (response.data.status === "success") {
        console.log(`[SIGNAL_SERVICE] Matchmaker: ${action} úspešne potvrdený.`);
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Neznáma chyba Matchmakera');
      }
    } catch (error) {
      console.error("[SIGNAL_SERVICE] Matchmaker chyba:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 4. [DISPOSE_LOGIC] - Recyklácia (Vymazanie správy z buffera)
   */
  disposeMessage: async (bufferName, msgId) => {
    try {
      console.log(`[SIGNAL_SERVICE] Recyklujem záznam ID: ${msgId}`);
      const response = await axios.post(HYPERSPEED_SCRIPT_URL, {
        action: 'CLEAN_MSG',
        sheetName: bufferName,
        msgId: msgId 
      });
      return { success: response.data.status === "success" };
    } catch (error) {
      console.error("[SIGNAL_SERVICE] Recyklácia zlyhala:", error);
      return { success: false };
    }
  }
};