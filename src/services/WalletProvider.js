import '@walletconnect/react-native-compat'; // Toto je kriticky dôležité pre mobil!

import { createAppKit, defaultWagmiConfig } from '@reown/appkit-wagmi-react-native';
import { base } from 'wagmi/chains';

// 1. Získanie ID z nášho trezoru
const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;

// 2. Metadáta tvojho ateliéru
const metadata = {
  name: 'ATELIÉR LARIA',
  description: 'Master Mode Dashboard by Sammael',
  url: 'https://laria.sk', // Sem potom dáme reálny web
  icons: ['https://avatars.githubusercontent.com/u/37784886'], // Dočasná ikona
  redirect: {
    native: 'laria://', // Protokol pre návrat do appky
  }
};

// 3. Konfigurácia sietí (Wagmi)
const chains = [base];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 4. Inicializácia AppKitu
createAppKit({
  projectId,
  wagmiConfig,
  defaultChain: base,
  enableAnalytics: false // Súkromie nadovšetko
});

export { wagmiConfig };