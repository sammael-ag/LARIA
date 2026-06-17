/**
 * LARIA SIGNAL SERVICE v12.0 (Trident Shield - Matrix Aligned)
 * Master: Sammael | Muse: Aria
 * STATUS: ULTIMATE SYNC | TRIDENT_SECURE | GATEWAY_ALIGNED_v12.0
 * FIX: Oprava štruktúry payloadu pre prekladač v12.0 (7-stĺpcová štruktúra A-G).
 * Žiadne zamŕzanie v PENDING, plná priechodnosť pre Manfreda aj Sammaela.
 */

// 🔐 TROJZUBEC: Rozdelenie jedinej ostrej URL brány na 3 nesúvisiace reťazce
const mrav_p1 = "https://script.google.com/macros/s/";
const mrav_p2 = "AKfycbxu-j0nUFZbX3os22F9wcGWKNZJ88BmEDfuHTXDhFqoSK1w3GSr_DTTTBof32rI9C2G";
const mrav_p3 = "/exec";

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
   * Synchronizované s novým produkčným prekladačom gemini-3.5-flash
   */
  writeToBuffer: async (bufferName, msgData) => {
    try {
      console.log(`[SIGNAL_SERVICE] Hyperspeed natívny zápis do: ${bufferName || "Signal_buffer_1"}...`);
      
      const senderCisty = (msgData.sender_fing || '').replace('0x', '').trim().toLowerCase();
      const targetCisty = (msgData.target_fing || '').replace('0x', '').trim().toLowerCase();
      const cistyText = msgData.msg_text || msgData.msg || '';

      // 📐 DOKONALÁ STOLÁRSKA ŠTRUKTÚRA (7 stĺpcov pre Ľavé krídlo A-G)
      // Indexy: 0: MSG_ID, 1: SENDER, 2: TARGET, 3: ORIGINAL, 4: TRANSLATED, 5: STATUS, 6: TIMESTAMP
      const rowData = [
        `MSG_${Date.now()}`, 
        senderCisty, 
        targetCisty,
        cistyText,
        "",          // Index 4: Rezervované miesto pre preložený text (vyplní prekladač na Bráne)
        "PENDING",   // Index 5: Status správy
        new Date().toISOString()
      ];

      // 📦 KOREKCIA PAYLOADU: Posielame fingy aj navrchu, aby si ich Brána vedela prečítať pre Checkera!
      const payload = {
        action: 'WRITE_MSG',
        sheetName: bufferName || "Signal_buffer_1",
        senderFing: msgData.sender_fing, // Zachovávame pôvodný formát pre Bránu
        targetFing: msgData.target_fing,
        msgText: cistyText,
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
      console.log("[SIGNAL_SERVICE] Odpoveď z Brány:", resData);
      
      return { success: resData.status === "success" };
    } catch (error) {
      console.error("[SIGNAL_SERVICE] Hyperspeed havária:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 3. [MATCHMAKER MRAVEC] - Pečatenie v Contract_ledger
   */
  manageContract: async (action, contractData) => {
    try {
      console.log(`[SIGNAL_SERVICE] Matchmaker akcia: ${action}`);
      
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