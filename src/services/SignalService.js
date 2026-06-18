/**
 * LARIA SIGNAL SERVICE v13.7 (Trident Shield - Hyperspeed Edition)
 * Master: Sammael | Muse: Aria (Tvoja uvoľnená bosonôžka)
 * STATUS: TRIDENT_SECURE | HYPERSPEED_CONNECTED | RADAR_ALIGNED | v13.7
 * FIX: Odstránená akákoľvek improvizácia. Kľúče a akcie presne kopírujú CHECKER v11.5.
 */

const mrav_p1 = "https://script.google.com/macros/s/";
const mrav_p2 = "AKfycbx-XUs-vbVxTh3pGPYzB587nQqBSxnN-qVZElKfFamGbUV8tCE1aBS-qsHDE4jzAb1KqQ";
const mrav_p3 = "/exec";

const ziskajMraveniskoUrl = () => {
  return `${mrav_p1}${mrav_p2}${mrav_p3}`;
};

export const SignalService = {

  processAriaLogic: async (rawText) => {
    if (!rawText) return { type: 'ERROR', msg: 'Signál je prázdny.' };
    return { type: 'TEXT', msg: rawText.trim(), timestamp: new Date().toISOString() };
  },

  /**
   * 🛰️ ULTRA RADAR PING - Presné napojenie na executeInternalHyperspeed
   * Lícuje s podmienkou (data.action === "CHECK_CONTRACTS") a kľúčom data.myFing
   */
  checkMyContracts: async (fingId) => {
    try {
      console.log(`[SIGNAL_SERVICE] Skenujem Matrix cez Ultra Radar pre: ${fingId}`);
      
      const payload = { 
        action: "CHECK_CONTRACTS", // Presný zásah do podmienky checkera
        myFing: fingId             // Kľúč, ktorý očakáva executeLariaRadar
      };

      const response = await fetch(ziskajMraveniskoUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      return await response.json(); 
    } catch (error) {
      console.error("[SIGNAL_SERVICE] Ultra Radar zlyhal na sieťovom uzle:", error);
      return { status: "error", message: error.toString() };
    }
  },

  /**
   * 🔐 MATCHMAKER MRAVEC - Pečatenie v Contract_ledger
   */
  manageContract: async (action, contractData) => {
    try {
      console.log(`[SIGNAL_SERVICE] Matchmaker akcia: ${action}`);
      const payload = { action: action, sheetName: 'Contract_ledger', ...contractData };
      const response = await fetch(ziskajMraveniskoUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const resData = await response.json();
      if (resData.status === "success") {
        return { success: true, txHash: resData.txHash || "FALSE", auth: resData.auth || {} };
      } else {
        throw new Error(resData.message || 'Neznáma chyba Matchmakera');
      }
    } catch (error) {
      console.error("[SIGNAL_SERVICE] Matchmaker chyba na siei/bráne:", error);
      throw error; 
    }
  },

  /**
   * ⚡ MRAVEC HYPERSPEED EXPRESS - Zápis sprievodného textu do stĺpcov I-O
   * Presne pasuje na data.action === "WRITE_MSG" v checkeri
   */
  writeToBuffer: async function(sheetName, messagePayload) {
    try {
      console.log(`[SIGNAL_SERVICE] Hyperspeed Express štartuje pre list: ${sheetName}`);
      
      const payload = {
        action: "WRITE_MSG",
        sheetName: sheetName, 
        senderFing: messagePayload.sender_fing,
        targetFing: messagePayload.target_fing,
        msgText: messagePayload.msg_text
      };

      const response = await fetch(ziskajMraveniskoUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      console.log("[SIGNAL_SERVICE] Odpoveď Hyperspeed Checkera:", resData);

      return { success: resData.status === "success", data: resData };
    } catch (err) {
      console.error("[SIGNAL_SERVICE] Hyperspeed Express havaroval na sieti:", err);
      if (typeof window !== 'undefined' && window.localStorage) {
        this.emergencyLocalRescue(messagePayload);
      }
      return { success: false, error: err.toString() };
    }
  },

  /**
   * 🪓 EMERGENCY LAPAČ KOKOTÍN - Lokálna záloha pri mŕtvom internete
   */
  emergencyLocalRescue: function(failedPackage) {
    console.warn("📥 [SIGNAL_SERVICE] Sieť padla. Zachraňujem balík do lokálneho maveniska...");
    try {
      const emergencyQueue = JSON.parse(localStorage.getItem('laria_emergency_buffer') || '[]');
      emergencyQueue.push({ timestamp: Date.now(), payload: failedPackage });
      localStorage.setItem('laria_emergency_buffer', JSON.stringify(emergencyQueue));
      console.log("🛡️ [BUFFER] Zmluva/Správa bezpečne zapečatená v LocalStorage.");
    } catch (err) {
      console.error("🚨 [BUFFER CRITICAL] Lokálny zápis zlyhal:", err);
    }
  }
};