/**
 * LARIA SIGNAL SERVICE v10.5 (Trident Shield - Matrix Aligned)
 * Master: Sammael | Muse: Aria
 * STATUS: ULTIMATE SYNC | TRIDENT_SECURE | GATEWAY_ALIGNED_v1.9.9
 * FIX: Zlícované štruktúry payloadov presne pre generálny rozcestník Brána.gs.
 * Žiadne úniky, žiadne CORS blokácie, čistý plochý prenos pre mravcov.
 */

// 🔐 TROJZUBEC: Rozdelenie jedinej ostrej URL brány na 3 nesúvisiace reťazce
const mrav_p1 = "https://script.google.com/macros/s/";
const mrav_p2 = "AKfycbxu-j0nUFZbX3os22F9wcGWKNZJ88BmEDfuHTXDhFqoSK1w3GSr_DTTTBof32rI9C2G";
const mrav_p3 = "/exec";

/**
 * 🛠️ PRIVÁTNY LÚČ: Dynamické zostavenie URL adresy brány v pamäti počas behu
 */
const ziskajMraveniskoUrl = () => {
  return `${mrav_p1}${mrav_p2}${mrav_p3}`;
};

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
   * 2. [HYPERSPEED MRAVEC] - Zápis do Signal_Buffer_1
   * Brána.gs posiela celý objekt priamo do executeInternalHyperspeed(data)
   */
  writeToBuffer: async (bufferName, msgData) => {
    try {
      console.log(`[SIGNAL_SERVICE] Hyperspeed natívny zápis do: ${bufferName || "Signal_buffer_1"}...`);
      
      const rowData = msgData.rowData || [
        `MSG_${Date.now()}`, 
        (msgData.sender_fing || '').replace('0x', ''), 
        (msgData.target_fing || '').replace('0x', ''),
        msgData.msg_text || msgData.msg,
        '0', 
        new Date().toISOString()
      ];

      // PLOCHÁ ŠTRUKTÚRA: Všetko na najvyššej úrovni pre executeInternalHyperspeed
      const payload = {
        action: 'WRITE_MSG',
        sheetName: bufferName || "Signal_buffer_1",
        rowData: rowData
      };

      const rannaBrana = ziskajMraveniskoUrl();

      const response = await fetch(rannaBrana, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      return { success: resData.status === "success" };
    } catch (error) {
      console.error("[SIGNAL_SERVICE] Hyperspeed havária:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 3. [MATCHMAKER MRAVEC] - Pečatenie v Contract_ledger
   * Brána.gs na riadku 81 smeruje akcie INIT_CONTRACT a CONFIRM_CONTRACT
   */
  manageContract: async (action, contractData) => {
    try {
      console.log(`[SIGNAL_SERVICE] Matchmaker akcia: ${action}`);
      
      // Zlúčenie akcie a dát do jednej plochej úrovne, ktorú spracuje executeInternalMatchmaking
      const payload = {
        action: action, 
        sheetName: 'Contract_ledger',
        ...contractData 
      };

      const rannaBrana = ziskajMraveniskoUrl();

      const response = await fetch(rannaBrana, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (resData.status === "success") {
        console.log(`[SIGNAL_SERVICE] Matchmaker: ${action} úspešne potvrdený.`);
        return { success: true };
      } else {
        throw new Error(resData.message || 'Neznáma chyba Matchmakera');
      }
    } catch (error) {
      console.error("[SIGNAL_SERVICE] Matchmaker chyba:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 4. [DISPOSE LOGIC - HYPERSPEED MRAVEC] - Recyklácia stôp
   */
  disposeMessage: async (bufferName, msgId) => {
    try {
      console.log(`[SIGNAL_SERVICE] Recyklujem záznam ID: ${msgId}`);
      
      const payload = {
        action: 'CLEAN_MSG',
        sheetName: bufferName,
        msgId: msgId 
      };

      const rannaBrana = ziskajMraveniskoUrl();

      const response = await fetch(rannaBrana, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      return { success: resData.status === "success" };
    } catch (error) {
      console.error("[SIGNAL_SERVICE] Recyklácia zlyhala:", error);
      return { success: false };
    }
  }
};