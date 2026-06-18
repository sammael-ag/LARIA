/**
 * LARIA SIGNAL SERVICE v13.1 (Trident Shield - Handshake Core)
 * Master: Sammael | Muse: Aria (Tvoja uvoľnená bosonôžka)
 * STATUS: CHAT_BALAST_PURGED | TRIDENT_SECURE | HANDSHAKE_ONLY_v13.1
 * FIX: Vrátená a prekabátená funkcia writeToBuffer. Slúži ako elitný lapač chýb
 *      a zachytávač kokotín z Trojzubcov, aby sa zabránilo kolapsu relácie (Quantum Purge).
 */

// 🔐 TROJZUBEC: Rozdelenie jedinej ostrej URL brány na 3 nesúvisiace reťazce
const mrav_p1 = "https://script.google.com/macros/s/";
const mrav_p2 = "AKfycbx-XUs-vbVxTh3pGPYzB587nQqBSxnN-qVZElKfFamGbUV8tCE1aBS-qsHDE4jzAb1KqQ";
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
      
      // 🚨 POISTKA PRE SEND_LARIA_PACKAGE:
      // Ak kód v pozadí (sendLariaPackage) očakáva zlyhanie cez throw, aby mohol aktivovať writeToBuffer,
      // musíme zabezpečiť, aby táto funkcia v prípade mŕtvej siete existovala a zachytila to.
      return { success: false, error: error.message, txHash: "FALSE", auth: {} };
    }
  },

  /**
   * 🪓 3. [EMERGENCY ZACHYTÁVAČ KOKOTÍN] - writeToBuffer
   * Volaný zo záhrobia, keď zlyhá primárna sieť na Trojzubcoch.
   * Chráni frontend pred fatálnym zhodením relácie (TOTAL QUANTUM PURGE).
   */
  writeToBuffer: function(failedPackage) {
    console.warn("📥 [SIGNAL_SERVICE] EMERGENCY BUFFER AKTIVOVANÝ!");
    console.warn("⚠️ Detegované zlyhanie siete na Trojzubci. Spúšťam záchranu balíka:");
    console.log(JSON.stringify(failedPackage, null, 2));

    try {
      // Zabalíme spadnuté dáta z handshakeu do localStorage prehliadača, aby sme o ne neprišli
      const emergencyQueue = JSON.parse(localStorage.getItem('laria_emergency_buffer') || '[]');
      emergencyQueue.push({
        timestamp: Date.now(),
        payload: failedPackage
      });
      localStorage.setItem('laria_emergency_buffer', JSON.stringify(emergencyQueue));
      
      console.log("🛡️ [BUFFER] Kokotiny úspešne zachytené a zapečatené lokálne. Žiadna likvidácia relácie sa nekoná!");
      return { status: "buffered", message: "Dáta zachránené v lokálnom mravenisku." };

    } catch (err) {
      console.error("🚨 [BUFFER CRITICAL] Lokálny záchranný zápis zlyhal:", err);
      return { status: "error", message: err.toString() };
    }
  }
};