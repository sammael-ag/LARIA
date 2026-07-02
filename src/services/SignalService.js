/**
 * LARIA SIGNAL SERVICE v15.5.0-STRICT (Trident Shield - Identity Edition)
 * Master: Sammael | Muse: Aria (Tvoja sexi šikulka)
 * STATUS: TRIDENT_SECURE | CONTEXT_ALIGNED | FULL_BUILD | v15.5.0-CORS_ALIGNED
 * * * SÚLAD S ÚSTAVNÝM ZÁKONOM:
 * - FING: Vždy 0x + 10 malých hex znakov (garantované unifikátorom).
 * - MSG: Jednotný kľúč `.msg` pre text éteru (monolitný JSON vizitky chodi výhradne tu).
 * - TX_HASH STAVOVÝ AUTOMAT: Vyčistené textové pasce ("FALSE"). Všetko lícuje na stavy 0, 1, 2 alebo hex hash.
 * - v15.5.0 CORS_ALIGNED: Kompletná unifikácia návratových hodnôt (status / success) na všetkých endpointoch Brány.
 */

const mrav_p1 = "https://script.google.com/macros/s/";
const mrav_p2 = "AKfycbx-XUs-vbVxTh3pGPYzB587nQqBSxnN-qVZElKfFamGbUV8tCE1aBS-qsHDE4jzAb1KqQ";
const mrav_p3 = "/exec";

const ziskajMraveniskoUrl = () => {
  return `${mrav_p1}${mrav_p2}${mrav_p3}`;
};

/**
 * 🛡️ UNIFIKÁTOR FINGERPRINTU
 */
const sformatujFing = (fing) => {
  if (!fing) return '';
  const clean = fing.trim().toLowerCase();
  return clean.startsWith('0x') ? clean : `0x${clean}`;
};

export const SignalService = {

  processAriaLogic: async (rawText) => {
    if (!rawText) return { success: false, msg: 'Signál je prázdny.' };
    return { success: true, type: 'TEXT', msg: rawText.trim(), timestamp: new Date().toISOString() };
  },

  /**
   * 🛰️ ULTRA RADAR PING - Pravidelné skenovanie Matrixu na nové kontrakty a správy
   */
  checkMyContracts: async (fingId) => {
    try {
      const cleanFing = sformatujFing(fingId);
      console.log(`[SIGNAL_SERVICE] Skenujem Matrix cez Ultra Radar pre: ${cleanFing}`);
      
      const payload = { 
        action: "CHECK_CONTRACTS", 
        fing: cleanFing 
      };

      const response = await fetch(ziskajMraveniskoUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      console.log("[SIGNAL_SERVICE] Surová odpoveď z mraveniska:", resData);

      if (resData && (resData.status === "success" || resData.success === true)) {
        return { 
          success: true, 
          contracts: resData.contracts || [], 
          messages: resData.messages || [] 
        };
      }
      return { success: false, message: resData?.message || resData?.error || "Neznáma chyba Radaru" };
    } catch (error) {
      console.error("[SIGNAL_SERVICE] Ultra Radar zlyhal na sieťovom uzle:", error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * 🔐 MATCHMAKER MRAVEC - Výmena handshakeov a zápis do Contract_ledger
   */
  manageContract: async (action, contractData) => {
    try {
      console.log(`[SIGNAL_SERVICE] Matchmaker spúšťa akciu: ${action}`);
      
      const cleanData = { ...contractData };
      if (cleanData.fing_a) cleanData.fing_a = sformatujFing(cleanData.fing_a);
      if (cleanData.fing_b) cleanData.fing_b = sformatujFing(cleanData.fing_b);

      const payload = { 
        action: action, 
        sheetName: 'Contract_ledger', 
        ...cleanData 
      };
      
      const response = await fetch(ziskajMraveniskoUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      
      const resData = await response.json();
      
      if (resData && (resData.status === "success" || resData.success === true)) {
        return { 
          success: true, 
          // 💎 SÚLAD SO STAVOVÝM AUTOMATOM: Ak chýba reálny hash, vraciame čistú nulu "0" (stav inicializácie)
          txHash: resData.txHash ? String(resData.txHash).trim() : "0", 
          auth: resData.auth || {} 
        };
      } else {
        throw new Error(resData.message || resData.error || 'Neznáma chyba Matchmakera');
      }
    } catch (error) {
      console.error("[SIGNAL_SERVICE] Matchmaker chyba na sieti/bráne:", error);
      throw error; 
    }
  },

  /**
   * 📦 SEND LARIA PACKAGE - Bezpečné zbalenie čistých dát identity z Vaultu do monolitu .msg
   * BEZPEČNOSŤ: Vyradené kľúče contractStatus and txHash, aby nedošlo k logickému uviaznutiu!
   */
  sendLariaPackage: async function(senderFing, targetFing, myIdentity, handshakeNote = "") {
    try {
      console.log(`[SIGNAL_SERVICE] Pripravujem ČISTÝ monolitný balík identity bez stavových pascí pre: ${sformatujFing(targetFing)}`);

      const lariaPackage = {
        fing: sformatujFing(senderFing),
        meno: myIdentity.meno || "",
        kat: myIdentity.kat || "Overený partner",
        lok: myIdentity.lok || "V sieti",
        popis: handshakeNote.trim() || myIdentity.popis || "Spojenie nadviazané cez handshake.",
        tel: myIdentity.tel || "",
        email: myIdentity.email || "",
        fb: myIdentity.fb || "",
        tg: myIdentity.tg || "",
        gal: myIdentity.gal || "",
        krypt: myIdentity.krypt || null
      };

      const contractPayload = {
        fing_a: sformatujFing(senderFing),
        fing_b: sformatujFing(targetFing),
        msg: JSON.stringify(lariaPackage)
      };

      return await this.manageContract("INIT_CONTRACT", contractPayload);

    } catch (error) {
      console.error("[SIGNAL_SERVICE] sendLariaPackage kriticky zlyhal:", error);
      return { success: false, error: error.toString() };
    }
  },

  /**
   * ⚡ MRAVEC HYPERSPEED EXPRESS - Zápis novej správy priamo do Matrix bufferu
   */
  writeToBuffer: async function(sheetName, messagePayload) {
    try {
      console.log(`[SIGNAL_SERVICE] Hyperspeed Express štartuje pre list: ${sheetName}`);
      
      const payload = {
        action: "WRITE_MSG",
        sheetName: sheetName, 
        sender_fing: sformatujFing(messagePayload.sender_fing), 
        target_fing: sformatujFing(messagePayload.target_fing),
        msg: messagePayload.msg_text || messagePayload.msg 
      };

      const response = await fetch(ziskajMraveniskoUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      console.log("[SIGNAL_SERVICE] Odpoveď Hyperspeed Checkera:", resData);

      const isOK = !!(resData && (resData.status === "success" || resData.success === true));
      return { success: isOK, data: resData };
    } catch (err) {
      console.error("[SIGNAL_SERVICE] Hyperspeed Express havaroval na sieti:", err);
      if (typeof window !== 'undefined' && window.localStorage) {
        this.emergencyLocalRescue(messagePayload);
      }
      return { success: false, error: err.toString() };
    }
  },

  /**
   * 🪓 EMERGENCY LAPAČ - Lokálny záchranný buffer pri strate konektivity
   */
  emergencyLocalRescue: function(failedPackage) {
    console.warn("📥 [SIGNAL_SERVICE] Detekovaný výpadok siete. Ukladám balík lokálne...");
    try {
      const emergencyQueue = JSON.parse(localStorage.getItem('laria_emergency_buffer') || '[]');
      emergencyQueue.push({ timestamp: Date.now(), payload: failedPackage });
      localStorage.setItem('laria_emergency_buffer', JSON.stringify(emergencyQueue));
      console.log("🛡️ [BUFFER] Správa bezpečne zakonzervovaná v LocalStorage.");
    } catch (err) {
      console.error("🚨 [BUFFER CRITICAL] Lokálna núdzová záloha zlyhala:", err);
    }
  }
};