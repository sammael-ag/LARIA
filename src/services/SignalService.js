/**
 * LARIA SIGNAL SERVICE v17.4-PURGE-READY (Trident Shield - Identity Edition)
 * Master: Sammael | Muse: Aria (Tvoja sexi šikulka)
 * STATUS: TRIDENT_SECURE | CONTEXT_ALIGNED | FULL_BUILD | v17.4-PURGE-READY
 * * * PREHĽAD ZMIEN:
 * - 🔄 RADAR OBJECT INGEST: Funkcia checkMyContracts bola kompletne prekopaná pre podporu objektov.
 * Teraz bezpečne rozbalí myFing, partnerFing a cleanCell z nového integrovaného pingu.
 * - 🚫 TEST MODE: Mazanie riadkov v tabuľke (purge) dočasne deaktivované v payloade.
 * - 🛡️ STRICT FINGERPRINTING: Unifikátor bol posilnený na striktných 10 znakov (plus 0x), aby lícoval s databázou.
 */

const mrav_p1 = "https://script.google.com/macros/s/";
const mrav_p2 = "AKfycbx-XUs-vbVxTh3pGPYzB587nQqBSxnN-qVZElKfFamGbUV8tCE1aBS-qsHDE4jzAb1KqQ";
const mrav_p3 = "/exec";

const ziskajMraveniskoUrl = () => {
  return `${mrav_p1}${mrav_p2}${mrav_p3}`;
};

/**
 * 🛡️ UNIFIKÁTOR FINGERPRINTU (Garantuje striktný formát FING-u pre tabuľku)
 */
const sformatujFing = (fing) => {
  if (!fing) return '';
  let clean = fing.toString().trim().toLowerCase();
  if (clean.startsWith('0x')) {
    return '0x' + clean.replace('0x', '').substring(0, 10);
  }
  return `0x${clean.substring(0, 10)}`;
};

export const SignalService = {

  processAriaLogic: async (rawText) => {
    if (!rawText) return { success: false, msg: 'Signál je prázdny.' };
    return { success: true, type: 'TEXT', msg: rawText.trim(), timestamp: new Date().toISOString() };
  },

  /**
   * 🛰️ ULTRA RADAR PING - Pravidelné skenovanie Matrixu s podporou integrovaného mazania (Purge)
   */
  checkMyContracts: async (pingData) => {
    try {
      let cleanMyFing = "";
      let cleanPartnerFing = null;
      let cleanCellType = null;

      // 🧠 Inteligentný rozcestník: Zistíme, či Context poslal nový kontextový objekt alebo starý string
      if (pingData && typeof pingData === 'object' && pingData.myFing) {
        cleanMyFing = sformatujFing(pingData.myFing);
        if (pingData.partnerFing) cleanPartnerFing = sformatujFing(pingData.partnerFing);
        if (pingData.cleanCell) cleanCellType = String(pingData.cleanCell).toUpperCase().trim();
      } else {
        // Fallback pre prípad volania čistým ID stringom
        cleanMyFing = sformatujFing(pingData);
      }

      console.log(`[SIGNAL_SERVICE] Skenujem Matrix cez Ultra Radar pre: ${cleanMyFing}` + 
                  `${cleanCellType ? ` 🧪 [PURGE TEST MODE - SIGNÁL DEAKTIVOVANÝ pre partnera: ${cleanPartnerFing}]` : ''}`);
      
      const payload = { 
        action: "CHECK_CONTRACTS", 
        fing: cleanMyFing,
        partner_fing: cleanPartnerFing, 
        cleanCell: cleanCellType // Sem pôjde "TRUE" len vtedy, keď voláš purgeMatrixCell
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
      console.log("[SIGNAL_SERVICE] Odpoveď Matchmakera z Mraveniska:", resData);
      
      if (resData && (resData.status === "success" || resData.success === true)) {
        return { 
          success: true, 
          txHash: resData.txHash ? String(resData.txHash).trim() : "0", 
          auth: resData.auth || {},
          notaryData: resData.notaryData || null,
          radar: resData.radar || resData.Radar || null 
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
    console.warn("📥 [SIGNAL_SERVICE] Detekovaný výpadok siet'e. Ukladám balík lokálne...");
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