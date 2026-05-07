/**
 * LARIA SIGNAL SERVICE v9.3
 * STATUS: ULTIMATE SYNC / FING-KRYPT PROTOCOL
 * FIX: Plná podpora pre Svadbovač v9.2 a Hyperspeed v9.1.
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
   * 2. [BUFFER_MANAGEMENT] - Zápis do Hyperspeed Recyclera
   * RowData: [MSG_ID, sender_fing, target_fing, msg_text, status, timestamp]
   */
  writeToBuffer: async (bufferName, msgData) => {
    try {
      console.log(`[SIGNAL_SERVICE] Zapisujem atóm do Matrixu...`);
      
      const rowData = [
        msgData.rowData?.[0] || `MSG_${Date.now()}`, 
        msgData.rowData?.[1] || msgData.sender_fing || msgData.from_fing, 
        msgData.rowData?.[2] || msgData.target_fing,
        msgData.rowData?.[3] || msgData.msg_text || msgData.msg,
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
      console.error("[SIGNAL_SERVICE] Havária pri zápise:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 3. [CONTRACT_MANAGEMENT] - Pečatenie v Contract_ledger
   * Lícujeme priamo na Svadbovač v9.2 (Address_A, Address_B, target_krypt)
   */
  manageContract: async (action, contractData) => {
    try {
      console.log(`[SIGNAL_SERVICE] Mením status zmluvy: ${action}`);
      
      // Ak posielame dáta z IRCScreenu, použijeme ich priamo, 
      // inak zachováme spätnú kompatibilitu pre INIT
      const response = await axios.post(HYPERSPEED_SCRIPT_URL, {
        action: action, 
        sheetName: 'Contract_ledger',
        data: contractData 
      });

      if (response.data.status === "success") {
        console.log(`[SIGNAL_SERVICE] ${action} úspešne zapísaný.`);
        return { success: true };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("[SIGNAL_SERVICE] Chyba pečatenia:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 4. [DISPOSE_LOGIC] - Recyklácia (Vymazanie správy z buffera)
   */
  disposeMessage: async (bufferName, msgId) => {
    try {
      console.log(`[SIGNAL_SERVICE] Recyklujem záznam ID: ${msgId}`);
      // Lícujeme na params.msgId v Hyperspeed v9.1
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