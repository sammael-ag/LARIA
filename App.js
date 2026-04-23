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

// Krypto a Data
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './src/services/WalletProvider';

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

  // Ak config nie je pripravený, vrátime prázdnu plochu
  if (!wagmiConfig) {
    return null; 
  }

  // Tvoj chrám v čistej zobáčikovej (JSX) podobe:
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}