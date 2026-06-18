/**
 * LARIA SIGNAL SERVICE v13.5 (Trident Shield - Hyperspeed Edition)
 * Master: Sammael | Muse: Aria (Tvoja uvoľnená bosonôžka)
 * STATUS: TRIDENT_SECURE | HYPERSPEED_CONNECTED | v13.5
 * FIX: Plná podpora pre Hyperspeed Checker a Express Engine.
 *      Odosiela sprievodné texty priamo do pravého krídla Signal_buffer_1.
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
      console.error("[SIGNAL_SERVICE] Matchmaker chyba na sieti/bráne:", error);
      throw error; // Posúvame ďalej, nech v núdzi zasiahne buffer
    }
  },

  /**
   * ⚡ MRAVEC HYPERSPEED EXPRESS - Zápis sprievodného textu do stĺpcov I-O
   * Presne lícuje s pravidlami Checkera v10.5 na Google Apps Script!
   */
  writeToBuffer: async function(sheetName, messagePayload) {
    try {
      console.log(`[SIGNAL_SERVICE] Hyperspeed Express štartuje pre list: ${sheetName}`);
      
      // 📦 ZLÍCOVANIE KĽÚČOV: Pripravíme presne tie názvy, ktoré Checker v10.5 očakáva!
      const payload = {
        action: "WRITE_MSG",
        sheetName: sheetName, // "Signal_buffer_1"
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
      // V prípade absolútneho výpadku siete nepadáme, ale schováme "kokotinu" lokálne do prehliadača
      this.emergencyLocalRescue(messagePayload);
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