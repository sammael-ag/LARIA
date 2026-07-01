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

// ⚙️ Konfigurácia Base Mainnetu
const BASE_RPC_URL = "https://mainnet.base.org";

// 🏦 Smerujeme späť na tvoj overený Smart Contract brány
const LARIA_GATEWAY_ADDRESS = "0xBb9a281a3EE78629669D69771AfDA0716fFa9DEb";

// Čisté ABI pre volanie funkcie onboardUser z kontraktu LariaGateway
const GATEWAY_ABI = [
  "function onboardUser(address _user, bool _isFull) external"
];

// Ochranná membrána (zostáva rovnaká)
const BACKEND_SECRET = "LARIA_RIDGE_SECRET_2026";

app.post('/api/onboard', async (req, res) => {
  try {
    const { userAddress, secret } = req.body;

    // 🛡️ Kontrola bezpečnostného kľúča
    if (secret !== BACKEND_SECRET) {
      return res.status(401).json({ success: false, error: "Neautorizovaný prístup do mraveniska!" });
    }

    // Overenie adresy mravca
    if (!ethers.isAddress(userAddress)) {
      return res.status(400).json({ success: false, error: "Neplatná adresa mravca!" });
    }

    console.log(`🚀 [RELAYER] Spúšťam onboarding cez Smart Contract brány pre: ${userAddress}`);

    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const privateKey = process.env.DISTRIBUTOR_KEY;
    
    if (!privateKey) {
      return res.status(500).json({ success: false, error: "Chýba DISTRIBUTOR_KEY v nastaveniach Railway!" });
    }
    
    // Peňaženka majiteľa (owner) - podpisuje transakciu kontraktu a platí gas
    const wallet = new ethers.Wallet(privateKey, provider);
    const gatewayContract = new ethers.Contract(LARIA_GATEWAY_ADDRESS, GATEWAY_ABI, wallet);

    console.log(`📡 Volám onboardUser na LariaGateway (isFull = false)...`);
    
    // 🔥 Voláme funkciu na smart kontrakte. 
    // Teraz už prebehne hladko, lebo hlavný token má tradingEnabled = true!
    const tx = await gatewayContract.onboardUser(userAddress, false);
    console.log(`⛓️ [RELAYER] Transakcia odoslaná na blockchain! Hash: ${tx.hash}`);
    
    // Čakáme na potvrdenie sietí Base
    await tx.wait();

    return res.json({
      success: true,
      message: "Mravec úspešne dotovaný cez Smart Contract brány! 100 LARIA sýpka funguje.",
      txHash: tx.hash
    });

  } catch (error) {
    console.error("❌ [RELAYER_CRITICAL_ERROR]:", error);
    return res.status(500).json({ success: false, error: error.message || error.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🧱 Laria ESM Relayer (Smart Contract Verzia) úspešne naštartovaný na porte ${PORT}`);
});