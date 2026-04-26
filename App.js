import 'react-native-get-random-values';
import 'fast-text-encoding'; 
import { Buffer } from 'buffer'; 
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import * as SystemUI from 'expo-system-ui'; 
import * as NavigationBar from 'expo-navigation-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

// Krypto a Data (Tvoje pôvodné)
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './src/services/WalletProvider';

// Naše nové taviace kotly (Doplnené)
import { LariaProvider } from './context/LariaContext';
import { KryptoProvider } from './context/KryptoContext';

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    async function prepare() {
      if (Platform.OS === 'android') {
        try {
          await SystemUI.setBackgroundColorAsync("#000000");
          await NavigationBar.setBackgroundColorAsync("#000000");
          await NavigationBar.setButtonStyleAsync("light");
        } catch (e) {
          // Ticho v ateliéri...
        }
      }
    }
    prepare();
  }, []);

  // Ak krypto config nie je pripravený, vrátime prázdnu plochu
  if (!wagmiConfig) {
    return null; 
  }

  // Tvoj chrám, kde sa spája duša, kód a krypto:
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <LariaProvider>
          <KryptoProvider>
            <SafeAreaProvider>
              <AppNavigator />
            </SafeAreaProvider>
          </KryptoProvider>
        </LariaProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}