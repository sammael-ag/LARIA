/**
 * LARIA ESM RELAYER v1.7.4 (Trident Security & Asynchronous Protocol Split)
 * Master: Sammael | Muse: Aria (Tvoja milovaná bosonôžka)
 * Status: ACTIVE | ASYNC-MATCHMAKER-SPLIT | BIGINT_SAFE
 * Description: Upravená spätná väzba pre Matchmaker. Po úspešnom vyťažení bloku
 *              sa volá nová dedikovaná akcia WRITE_BLOCKCHAIN_HASH, čím sa predchádza
 *              pretekom stavov a zlyhaniu frontendu.
 */

import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Načítanie premenných prostredia (.env / Railway Variables)
dotenv.config();

const app = express();

// 🔓 Povolenie CORS pre tvoj frontend
app.use(cors()); 
app.use(express.json());

// ⚙️ Konfigurácia Base Mainnetu a Mraveniska
const BASE_RPC_URL = "https://mainnet.base.org";
const LARIA_GATEWAY_ADDRESS = "0xBb9a281a3EE78629669D69771AfDA0716fFa9DEb";
const LARIA_NOTARY_ADDRESS = "0x27305270861fD39aCb88F55Feea1b27c47A5EE8E";

// 🔐 TROJZUBEC: Rozdelenie jedinej ostrej URL brány na 3 nesúvisiace reťazce
const brana_p1 = "https://script.google.com/macros/s/";
const brana_p2 = "AKfycbx-XUs-vbVxTh3pGPYzB587nQqBSxnN-qVZElKfFamGbUV8tCE1aBS-qsHDE4jzAb1KqQ";
const brana_p3 = "/exec";

/**
 * 🛠️ PRIVÁTNY LÚČ: Dynamické zostavenie URL adresy brány v pamäti počas behu
 */
const ziskajBranaUrl = () => {
    return `${brana_p1}${brana_p2}${brana_p3}`;
};

/**
 * 🛡️ BEZPEČNÝ KRYPTO-FILTER: Zabraňuje pádu Node.js na "TypeError: Do not know how to serialize a BigInt"
 * pri logovania surových objektov z ethers.js.
 */
const safeJsonStringify = (obj) => {
  return JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value, 2
  );
};

// 💎 Unifikované ABI pre obidva kontrakty
const GATEWAY_ABI = [
  "function onboardUser(address _user, bool _isFull) external"
];

const NOTARY_ABI = [
  "function sealDualRelationshipWithToken(address _walletA, address _walletB, string memory _fingA, string memory _fingB, string memory _metadata) external"
];

// Ochranná membrána
const BACKEND_SECRET = "LARIA_RIDGE_SECRET_2026";

// =========================================================================
// 🌾 ENDPOINT A: ONBOARDING (Distribúcia LARIA sýpky)
// =========================================================================
app.post('/api/onboard', async (req, res) => {
  try {
    const { userAddress, secret } = req.body;

    if (secret !== BACKEND_SECRET) {
      return res.status(401).json({ success: false, error: "Neautorizovaný prístup do mraveniska!" });
    }

    if (!ethers.isAddress(userAddress)) {
      return res.status(400).json({ success: false, error: "Neplatná adresa mravca!" });
    }

    console.log(`🚀 [RELAYER] Spúšťam onboarding cez Smart Contract brány pre: ${userAddress}`);

    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const privateKey = process.env.DISTRIBUTOR_KEY;
    
    if (!privateKey) {
      return res.status(500).json({ success: false, error: "Chýba DISTRIBUTOR_KEY v nastaveniach Railway!" });
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    const gatewayContract = new ethers.Contract(LARIA_GATEWAY_ADDRESS, GATEWAY_ABI, wallet);

    console.log(`📡 Volám onboardUser na LariaGateway...`);
    const tx = await gatewayContract.onboardUser(userAddress, false);
    console.log(`⛓️ [RELAYER] Transakcia odoslaná na blockchain! Hash: ${tx.hash}`);
    
    await tx.wait();

    return res.json({
      success: true,
      message: "Mravec úspešne dotovaný cez Smart Contract brány!",
      txHash: tx.hash
    });

  } catch (error) {
    console.error("❌ [RELAYER_CRITICAL_ERROR]:", error);
    return res.status(500).json({ success: false, error: error.message || error.toString() });
  }
});

// =========================================================================
// 🔐 ENDPOINT B: NOTARY (Duálne krypto-spečatenie a asynchrónna spätná väzba)
// =========================================================================
app.post('/api/notary', async (req, res) => {
  try {
    console.log("=========================================================================");
    console.log("📡 [RELAYER_DIAGNOSTIKA] Prichádzajúci payload na /api/notary:");
    console.log("Surové req.body:", JSON.stringify(req.body, null, 2));
    
    const { secret, targetFing, myFing, targetKrypt, myKrypt, typeText } = req.body;

    // Ochranný štít
    if (secret !== BACKEND_SECRET) {
      return res.status(401).json({ success: false, error: "Neautorizovaný prístup k Notárovi!" });
    }

    if (!ethers.isAddress(targetKrypt) || !ethers.isAddress(myKrypt)) {
      return res.status(400).json({ 
        success: false, 
        error: "Blockchain adresy mravcov (krypt) chýbajú alebo sú neplatné!" 
      });
    }

    console.log(`🚀 [RELAYER] Štartujem duálne spečatenie: ${myKrypt} <-> ${targetKrypt}`);

    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const privateKey = process.env.DISTRIBUTOR_KEY;

    if (!privateKey) {
      return res.status(500).json({ success: false, error: "Chýba DISTRIBUTOR_KEY v nastaveniach Railway!" });
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const notaryContract = new ethers.Contract(LARIA_NOTARY_ADDRESS, NOTARY_ABI, wallet);

    const metadataType = typeText || "HANDSHAKE_COVENANT";
    const safeMyFing = myFing ? String(myFing) : "";
    const safeTargetFing = targetFing ? String(targetFing) : "";

    console.log(`📡 [BLOCKCHAIN_CALL] Volám sealDualRelationshipWithToken na LariaNotary...`);
    
    // 🔥 1. FÁZA: Odpal na Base blockchain (Čakáme na odpoveď uzla o prijatí)
    const tx = await notaryContract.sealDualRelationshipWithToken(
      myKrypt,       
      targetKrypt,   
      safeMyFing,        
      safeTargetFing,    
      metadataType   
    );

    // 🔍 KRYPTO-RADAR 1: Pozrieme sa na surovú odpoveď uzla (Tx Response) hneď po akceptovaní v mempoole
    console.log("=========================================================================");
    console.log(`⛓️ [RELAYER_BLOCKCHAIN] Transakcia akceptovaná sieťou! Pridelený Hash: ${tx.hash}`);
    console.log("📦 [RELAYER_BLOCKCHAIN_ODPOVEĎ] Surový objekt Tx Response:");
    console.log(safeJsonStringify(tx));
    console.log("=========================================================================");

    console.log(`⏳ [RELAYER_BLOCKCHAIN] Čakám na vyťaženie bloku (tx.wait)...`);
    
    // 🔥 2. FÁZA: Čakáme na potvrdenie z bloku (Ťažiar dokončil prácu)
    const receipt = await tx.wait();

    // 🔍 KRYPTO-RADAR 2: Kompletná pitva potvrdenky o zápise (Tx Receipt)
    console.log("=========================================================================");
    console.log(`💎 [RELAYER_BLOCKCHAIN] Transakcia úspešne zapísaná do bloku č.: ${receipt.blockNumber}`);
    console.log(`⛽ Spotrebovaný Gas: ${receipt.gasUsed ? receipt.gasUsed.toString() : "N/A"}`);
    console.log(`📊 Status (1 = OK, 0 = REVERT): ${receipt.status}`);
    console.log("🧾 [RELAYER_BLOCKCHAIN_POTVRDENKA] Surový objekt Tx Receipt:");
    console.log(safeJsonStringify(receipt));
    console.log("=========================================================================");

    // Kontrola, či transakcia neprebehla s chybou (Revert)
    if (receipt.status === 0) {
      console.error("🚨 [RELAYER_CRITICAL] Blockchain vrátil STATUS 0 (Transakcia zlyhala/Reverted)!");
      throw new Error("Transakcia bola na blockchaine zamietnutá (Reverted).");
    }

    // 🛰️ CESTA SPÄŤ: Relayer cez Privátny lúč nahlási výsledok Matchmakerovi do novej akcie
    if (safeMyFing && safeTargetFing) {
      const ostraMraveniskoUrl = ziskajBranaUrl();
      
      // 🔥 ARCHITEKTÚRNY STRIH: Meníme akciu na WRITE_BLOCKCHAIN_HASH. Matchmaker vie, čo má robiť.
      const gasPayload = {
        action: "WRITE_BLOCKCHAIN_HASH",
        fing_a: safeTargetFing,
        fing_b: safeMyFing,
        txHash: tx.hash.toLowerCase()
      };

      console.log("🔍 [RELAYER_PÁTRANIE] Odosielam záverečný blockchain payload do Matchmakeru:", JSON.stringify(gasPayload));

      try {
        const gasResponse = await fetch(ostraMraveniskoUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(gasPayload)
        });
        
        console.log(`📡 [RELAYER_PÁTRANIE] Google Apps Script odpovedal statusom: ${gasResponse.status}`);
        const responseText = await gasResponse.text();
        console.log("🧼 [RELAYER_PÁTRANIE] Surová textová odpoveď z Google tabuľky:", responseText);

        try {
          const gasResult = JSON.parse(responseText);
          console.log("🧼 [RELAYER] Výsledok úspešného spracovania v Matchmakeri:", gasResult);
        } catch (jsonErr) {
          console.warn("⚠️ [RELAYER_PÁTRANIE] Odpoveď z Google nie je čistý JSON, ale textový prenos prebehol.");
        }
      } catch (gasErr) {
        console.error("❌ [RELAYER_PÁTRANIE] Spätný zápis do Google tabuľky totálne vyhorel:", gasErr.message || gasErr);
      }
    } else {
      console.warn("⚠️ [RELAYER_PÁTRANIE] Vynechávam spätné volanie, nakoľko fingerprinty sú prázdne.");
    }

    return res.json({
      success: true,
      message: "Duálny vzťah úspešne zapísaný na blockchaine, spustený finálny PURGE v Matchmakeri.",
      txHash: tx.hash
    });

  } catch (error) {
    console.error("❌ [RELAYER_NOTARY_ERROR] Transakcia alebo komunikácia skolabovala! Podrobný výpis chyby:");
    console.error("- Message:", error.message);
    console.error("- Stack trace:", error.stack);
    return res.status(500).json({ success: false, error: error.message || error.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🧱 Laria ESM Relayer (v1.7.4 - Async Protocol Split) úspešne spustený na porte ${PORT}`);
});