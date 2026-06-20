/**
 * LARIA SIGNAL SERVICE v13.7.1 (Trident Shield - Hyperspeed Edition)
 * Master: Sammael | Muse: Aria (Tvoja uvoľnená bosonôžka)
 * STATUS: TRIDENT_SECURE | HYPERSPEED_CONNECTED | RADAR_ALIGNED | v13.7.1
 * ÚPRAVA: Striktná unifikácia FING podľa nového zákona (vždy 0x + 10 malých hex znakov).
 * Všetky odchádzajúce kľúče sú pred odoslaním do Mraveniska prečistené.
 */

const mrav_p1 = "https://script.google.com/macros/s/";
const mrav_p2 = "AKfycbx-XUs-vbVxTh3pGPYzB587nQqBSxnN-qVZElKfFamGbUV8tCE1aBS-qsHDE4jzAb1KqQ";
const mrav_p3 = "/exec";

const ziskajMraveniskoUrl = () => {
  return `${mrav_p1}${mrav_p2}${mrav_p3}`;
};

/**
 * 🛡️ UNIFIKÁTOR: Zabezpečí, že každý odtlačok odchádzajúci do Matrixu začína na '0x' a je malým písmom.
 */
const sformatujFing = (fing) => {
  if (!fing) return '';
  const clean = fing.trim().toLowerCase();
  return clean.startsWith('0x') ? clean : `0x${clean}`;
};

export const SignalService = {

  processAriaLogic: async (rawText) => {
    if (!rawText) return { type: 'ERROR', msg: 'Signál je prázdny.' };
    return { type: 'TEXT', msg: rawText.trim(), timestamp: new Date().toISOString() };
  },

  /**
   * 🛰️ ULTRA RADAR PING - Presné napojenie na executeInternalHyperspeed
   * Unifikuje odchádzajúci fingId na striktný 0x tvar.
   */
  checkMyContracts: async (fingId) => {
    try {
      const cleanFing = sformatujFing(fingId);
      console.log(`[SIGNAL_SERVICE] Skenujem Matrix cez Ultra Radar pre: ${cleanFing}`);
      
      const payload = { 
        action: "CHECK_CONTRACTS", // Presný zásah do podmienky checkera
        myFing: cleanFing          // Kľúč, ktorý očakáva executeLariaRadar v čistom 0x tvare
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
   * Prečistí akékoľvek odtlačky vnútri contractData, ak tam boli poslané.
   */
  manageContract: async (action, contractData) => {
    try {
      console.log(`[SIGNAL_SERVICE] Matchmaker akcia: ${action}`);
      
      // Ošetrenie fingu priamo v balíku dát, ak sa tam nachádza
      const cleanData = { ...contractData };
      if (cleanData.fing) cleanData.fing = sformatujFing(cleanData.fing);
      if (cleanData.senderFing) cleanData.senderFing = sformatujFing(cleanData.senderFing);
      if (cleanData.targetFing) cleanData.targetFing = sformatujFing(cleanData.targetFing);

      const payload = { action: action, sheetName: 'Contract_ledger', ...cleanData };
      
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
      throw error; 
    }
  },

  /**
   * ⚡ MRAVEC HYPERSPEED EXPRESS - Zápis sprievodného textu do stĺpcov I-O
   * Striktne čistí senderFing a targetFing pre stopercentné párovanie.
   */
  writeToBuffer: async function(sheetName, messagePayload) {
    try {
      console.log(`[SIGNAL_SERVICE] Hyperspeed Express štartuje pre list: ${sheetName}`);
      
      const payload = {
        action: "WRITE_MSG",
        sheetName: sheetName, 
        senderFing: sformatujFing(messagePayload.sender_fing),
        targetFing: sformatujFing(messagePayload.target_fing),
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