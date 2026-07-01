import express from 'express';
import cors from 'cors'; // 👈 PRIDANÉ: Ochrana proti CORS blokácii prehliadačov
import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Načítanie premenných prostredia (.env / Railway Variables)
dotenv.config();

const app = express();

// 🔓 Povolenie CORS: Prehliadač teraz pustí odpoveď aj na tvoj lokálny frontend
app.use(cors()); 
app.use(express.json());

// ⚙️ Konfigurácia Base Mainnetu
const BASE_RPC_URL = "https://mainnet.base.org";
const GATEWAY_ADDRESS = "0xBb9a281a3EE78629669D69771AfDA0716fFa9DEb";

// Minimálne ABI pre interakciu s tvojou bránou
const GATEWAY_ABI = [
  "function onboardUser(address _user, bool _isFull) external"
];

// Ochranná membrána
const BACKEND_SECRET = "LARIA_RIDGE_SECRET_2026";

app.post('/api/onboard', async (req, res) => {
  try {
    const { userAddress, secret } = req.body;

    // 🛡️ Kontrola bezpečnostného kľúča
    if (secret !== BACKEND_SECRET) {
      return res.status(401).json({ success: false, error: "Neautorizovaný prístup do mraveniska!" });
    }

    // Overenie adresy
    if (!ethers.isAddress(userAddress)) {
      return res.status(400).json({ success: false, error: "Neplatná adresa mravca!" });
    }

    console.log(`🚀 [RELAYER] Spúšťam automatický onboarding pre: ${userAddress}`);

    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const privateKey = process.env.DISTRIBUTOR_KEY;
    
    if (!privateKey) {
      return res.status(500).json({ success: false, error: "Chýba DISTRIBUTOR_KEY v nastaveniach Railway!" });
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    const gatewayContract = new ethers.Contract(GATEWAY_ADDRESS, GATEWAY_ABI, wallet);

    // Odoslanie transakcie (false = 0.001 LARIA)
    const tx = await gatewayContract.onboardUser(userAddress, false);
    console.log(`⛓️ [RELAYER] Transakcia úspešne odoslaná! Hash: ${tx.hash}`);
    
    // Čakáme na zapísanie do bloku
    await tx.wait();

    return res.json({
      success: true,
      message: "Mravec úspešne onboardovaný, palivo je na peňaženke!",
      txHash: tx.hash
    });

  } catch (error) {
    console.error("❌ [RELAYER_CRITICAL_ERROR]:", error);
    return res.status(500).json({ success: false, error: error.message || error.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🧱 Laria ESM Relayer úspešne naštartovaný na porte ${PORT}`);
});