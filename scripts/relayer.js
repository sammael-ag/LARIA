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

// 🔥 NOVÉ: Smerujeme priamo na hlavný LARIA token kontrakt
const LARIA_TOKEN_ADDRESS = "0x03652A588A6c2C36f3976107B9C6B1dfE9f12dE3";

// Štandardné ERC-20 ABI pre funkciu transfer
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)"
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

    // Overenie adresy mravca
    if (!ethers.isAddress(userAddress)) {
      return res.status(400).json({ success: false, error: "Neplatná adresa mravca!" });
    }

    console.log(`🚀 [RELAYER] Spúšťam priamu dotáciu tokenov pre: ${userAddress}`);

    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const privateKey = process.env.DISTRIBUTOR_KEY;
    
    if (!privateKey) {
      return res.status(500).json({ success: false, error: "Chýba DISTRIBUTOR_KEY v nastaveniach Railway!" });
    }
    
    // Peňaženka majiteľa (owner) - posiela tokeny aj plyn na transakciu
    const wallet = new ethers.Wallet(privateKey, provider);
    const tokenContract = new ethers.Contract(LARIA_TOKEN_ADDRESS, ERC20_ABI, wallet);

    // Definujeme sumu: 0.001 LARIA (18 desatinných miest)
    const amountToSend = ethers.parseUnits("0.001", 18);

    console.log(`📡 Posielam 0.001 LARIA z peňaženky majiteľa...`);
    
    // 🔥 Priamy transfer z owner peňaženky (obchádza zámok obchodovania!)
    const tx = await tokenContract.transfer(userAddress, amountToSend);
    console.log(`⛓️ [RELAYER] Transakcia odoslaná! Hash: ${tx.hash}`);
    
    // Čakáme na zapísanie do bloku
    await tx.wait();

    return res.json({
      success: true,
      message: "Mravec úspešne dotovaný priamo z hlavnej sýpky, palivo je doma!",
      txHash: tx.hash
    });

  } catch (error) {
    console.error("❌ [RELAYER_CRITICAL_ERROR]:", error);
    return res.status(500).json({ success: false, error: error.message || error.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🧱 Laria ESM Relayer (Priama Linka) úspešne naštartovaný na porte ${PORT}`);
});