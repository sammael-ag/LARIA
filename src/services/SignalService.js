/**
 * LARIA SIGNAL SERVICE v13.0 (Trident Shield - Handshake Core)
 * Master: Sammael | Muse: Aria (Tvoja uvoľnená bosonôžka)
 * STATUS: CHAT_BALAST_PURGED | TRIDENT_SECURE | HANDSHAKE_ONLY_v13.0
 * FIX: Kompletné odľahčenie služby. Odstránené zápisy do textových buffrov,
 *      ponechané len elitné a čisté krypto-pečatenie zmlúv cez Matchmakera.
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
   * 2. [MATCHMAKER MRAVEC] - Pečatenie v Contract_ledger
   * Plne zlícované s CORS Bránou. Prepúšťa txHash a autorizačnú mapu (auth) pre okamžité odomknutie vizitiek.
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
      console.log("[SIGNAL_SERVICE] Surová odpoveď Matchmakera z Brány:", resData);

      if (resData.status === "success") {
        console.log(`[SIGNAL_SERVICE] Matchmaker: ${action} úspešne spracovaný.`);
        
        // 🎯 RÝDZE DOLÍCOVANIE: Vraciame celý balík, aby UI videlo txHash aj odomknuté vizitky (auth)
        return { 
          success: true, 
          txHash: resData.txHash || "FALSE",
          auth: resData.auth || {} 
        };
      } else {
        throw new Error(resData.message || 'Neznáma chyba Matchmakera');
      }
    } catch (error) {
      console.error("[SIGNAL_SERVICE] Matchmaker chyba:", error);
      return { success: false, error: error.message, txHash: "FALSE", auth: {} };
    }
  }
};