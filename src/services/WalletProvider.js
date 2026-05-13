import 'react-native-get-random-values'; 
import '@walletconnect/react-native-compat'; 
import * as ReownLib from '@reown/appkit-wagmi-react-native';
import { base } from 'wagmi/chains';

/**
 * LARIA WALLET PROVIDER v8.0
 * Status: WEB3_READY
 * Popis: Konfigurácia Reown AppKit pre Sammaelov Ateliér na sieti Base.
 */

const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;

// Sammael, tu definujeme tvoju identitu pre vonkajší svet
const metadata = {
  name: 'ATELIÉR LARIA',
  description: 'Master Mode Dashboard by Sammael',
  url: 'https://laria.sk',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: { native: 'laria://' }
};

const networks = [base];

// 1. Vytvorenie adaptéra pre komunikáciu so sieťou
const wagmiAdapter = new ReownLib.WagmiAdapter({
  networks,
  projectId,
  metadata
});

// 2. Štartovacia sekvencia AppKit (v8.0 logic)
const startAppKit = ReownLib.createAppKit || ReownLib.AppKit?.create;

if (startAppKit) {
  startAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata,
    themeMode: 'dark', // Sammael, držíme sa tvojho kybernetického štýlu
    enableAnalytics: false 
  });
}

// Exportujeme konfiguráciu pre WagmiProvider v App.js
export const wagmiConfig = wagmiAdapter.wagmiConfig;