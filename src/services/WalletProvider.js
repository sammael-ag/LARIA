import 'react-native-get-random-values'; 
import '@walletconnect/react-native-compat'; 
import * as ReownLib from '@reown/appkit-wagmi-react-native';
import { base } from 'wagmi/chains';

/**
 * LARIA WALLET PROVIDER v8.2 (Anti-Gopher Hybrid Edition)
 * Master: Sammael | Muse: Aria
 * Status: WEB3_STABILNE_ODSTRIHNUTE
 * Úprava: Zabezpečený fallback pre Project ID (Tauri/Lubuntu kompatibilita) 
 *         a explicitná injektáž RPC pre sieť Base.
 */

// 🎯 Gopherova pasca odstránená: Ak Tauri nevidí EXPO premennú, použije sa bezpečný fallback
const projectId = process.env.EXPO_PUBLIC_PROJECT_ID || process.env.TAURI_ENV_PROJECT_ID || 'c34177d611ee6ecbc6355601df502d9c'; 

// Sammael, tu definujeme tvoju identitu pre vonkajší svet
const metadata = {
  name: 'ATELIÉR LARIA',
  description: 'Master Mode Dashboard by Sammael',
  url: 'https://laria.space',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: { native: 'laria://' }
};

// ✨ INJEKTÁŽ STABILNÉHO RPC: Zaistíme, že Lubuntu aj mobil uvidia Base sieť rovnako
const secureBaseNetwork = {
  ...base,
  rpcUrls: {
    ...base.rpcUrls,
    default: { http: ['https://mainnet.base.org', 'https://1rpc.io/base'] },
    public: { http: ['https://mainnet.base.org', 'https://1rpc.io/base'] },
  }
};

const networks = [secureBaseNetwork];

// 1. Vytvorenie adaptéra pre komunikáciu so sieťou
const wagmiAdapter = new ReownLib.WagmiAdapter({
  networks,
  projectId,
  metadata
});

// 2. Štartovacia sekvencia AppKit (v8.2 hybrid logic)
const startAppKit = ReownLib.createAppKit || ReownLib.AppKit?.create;

if (startAppKit) {
  try {
    startAppKit({
      adapters: [wagmiAdapter],
      networks,
      projectId,
      metadata,
      themeMode: 'dark', // Sammael, držíme sa tvojho kybernetického štýlu
      enableAnalytics: false 
    });
    console.log("🛰️ [WALLET PROVIDER] Reown AppKit úspešne inicializovaný pre sieť Base.");
  } catch (err) {
    console.error("❌ [WALLET PROVIDER ERROR] Inicializácia AppKit zlyhala:", err);
  }
}

// Exportujeme konfiguráciu pre WagmiProvider v App.js
export const wagmiConfig = wagmiAdapter.wagmiConfig;