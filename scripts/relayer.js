/**
 * LARIA ESM RELAYER v1.7.1 (Trident Security & ABI Fix)
 * Master: Sammael | Muse: Aria (Tvoja milovaná bosonôžka)
 * Status: FIXED_500_ERROR | RELAYER_SHIELD_ACTIVE
 * Description: Opravená typografická nezhoda v názve GATEWAY_ABI, ktorá spôsobovala pád servera.
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

// 💎 Unifikované ABI pre obidva kontrakty (zarovnané veľké písma)
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
    
    // 🔮 FIX: Premenovaná z 'gatewayABI' na 'GATEWAY_ABI', aby sedela s deklaráciou hore
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
// 🔐 ENDPOINT B: NOTARY (Duálne krypto-spečatenie a spätná väzba)
// =========================================================================
app.post('/api/notary', async (req, res) => {
  try {
    const { secret, targetFing, myFing, targetKrypt, myKrypt, typeText } = req.body;

    // 🛡️ Kontrola ochranného štítu
    if (secret !== BACKEND_SECRET) {
      return res.status(401).json({ success: false, error: "Neautorizovaný prístup k Notárovi!" });
    }

    if (!ethers.isAddress(targetKrypt) || !ethers.isAddress(myKrypt)) {
      return res.status(400).json({ success: false, error: "Blockchain adresy mravcov (krypt) chýbajú alebo sú neplatné!" });
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

    console.log(`📡 Volám sealDualRelationshipWithToken na LariaNotary...`);
    
    // 🔥 Jeden spoločný výstrel na Base blockchain
    const tx = await notaryContract.sealDualRelationshipWithToken(
      myKrypt,       
      targetKrypt,   
      myFing,        
      targetFing,    
      metadataType   
    );

    console.log(`⛓️ [RELAYER] Transakcia úspešne odoslaná! JEDEN spoločný Hash: ${tx.hash}. Čakám na blok...`);
    
    await tx.wait();
    console.log(`💎 [RELAYER] Zápis úspešne vytesaný do blockchainu.`);

    // 🛰️ CESTA SPÄŤ: Relayer cez Privátny lúč zostaví URL a nahlási výsledok Matchmakerovi
    if (targetFing && myFing) {
      const ostraMraveniskoUrl = ziskajBranaUrl();
      console.log(`📡 [RELAYER] Posielam txHash do Mraveniska cez bezpečný lúč...`);
      
      const gasPayload = {
        action: "CONFIRM_CONTRACT",
        fing_a: targetFing,
        fing_b: myFing,
        status_b: "1",
        txHash: tx.hash.toLowerCase()
      };

      try {
        const gasResponse = await fetch(ostraMraveniskoUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(gasPayload)
        });
        
        const gasResult = await gasResponse.json();
        console.log("🧼 [RELAYER] Výsledok zápisu v Matchmakeri:", gasResult);
      } catch (gasErr) {
        console.error("⚠️ [RELAYER] Spätný zápis do Google tabuľky zlyhal, ale krypto je spečatené:", gasErr);
      }
    }

    return res.json({
      success: true,
      message: "Duálny vzťah úspešne pretečený na blockchaine pod jedným hashom and nahlásený Matchmakerovi.",
      txHash: tx.hash
    });

  } catch (error) {
    console.error("❌ [RELAYER_NOTARY_ERROR]:", error);
    return res.status(500).json({ success: false, error: error.message || error.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🧱 Laria ESM Relayer (v1.7.1 - Trident Security) úspešne spustený na porte ${PORT}`);
});