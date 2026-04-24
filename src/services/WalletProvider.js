import 'react-native-get-random-values'; 
import '@walletconnect/react-native-compat'; 
// Importujeme všetko ako objekt, aby sme sa vyhli undefined funkciám
import * as ReownLib from '@reown/appkit-wagmi-react-native';
import { base } from 'wagmi/chains';
import { useKrypto } from '../../context/KryptoContext';

const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;

const metadata = {
  name: 'ATELIÉR LARIA',
  description: 'Master Mode Dashboard by Sammael',
  url: 'https://laria.sk',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: { native: 'laria://' }
};

const networks = [base];

// 1. Vytvorenie adaptéra (toto fungovalo)
const wagmiAdapter = new ReownLib.WagmiAdapter({
  networks,
  projectId,
  metadata
});

// 2. Dynamické hľadanie štartovacej funkcie
// Skúsime createAppKit, ak nie, tak AppKit.create
const startAppKit = ReownLib.createAppKit || ReownLib.AppKit?.create;

if (startAppKit) {
  startAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata,
    enableAnalytics: false 
  });
}

export const wagmiConfig = wagmiAdapter.wagmiConfig;