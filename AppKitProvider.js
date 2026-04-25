import React, { useMemo } from 'react';
import { createAppKit, AppKit } from '@reown/appkit-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base } from 'wagmi/chains';
import { wagmiAdapter, projectId } from './src/services/WalletProvider';

// 1. Definícia metadát (to, čo uvidí svet pri pripájaní)
const metadata = {
  name: 'ATELIÉR LARIA',
  description: 'Multidimensional Artifacts Terminal',
  url: 'https://laria.sk',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'laria://', // Neskôr dôležité pre návrat z peňaženky do appky
  }
};

// 2. Inicializácia AppKitu - izolovaná od hlavného App.js
createAppKit({
  adapters: [wagmiAdapter],
  networks: [base],
  projectId,
  metadata,
  storage: AsyncStorage, // Používame ten náš "Sklad", nech si veci pamätá
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
  themeMode: 'dark', // Nech to ladí s tvojím stealth dizajnom
});

// 3. Provider, ktorý obalí tvoju appku a poskytne jej krypto-funkcie
export const AppKitProvider = ({ children }) => {
  return (
    <>
      {children}
      {/* Nechaj ho zatiaľ zakomentovaný */}
      {/* <AppKit /> */}
    </>
  );
};

export default AppKitProvider; // Zmena na default