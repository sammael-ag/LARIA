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

// Krypto a Data
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './src/services/WalletProvider';

// Naše taviace kotly
import { LariaProvider } from './context/LariaContext';
import { KryptoProvider } from './context/KryptoContext';
import { SignalProvider } from './context/SignalContext'; 
// PRIDÁVAME NOVÝ SKLAD KONTAKTOV
import { ContactProvider } from './context/ContactContext'; 

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
          // Ticho v ateliéri... ostávame v tme.
        }
      }
    }
    prepare();
  }, []);

  if (!wagmiConfig) {
    return null; 
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {/* KRYPTO - Základná doska a energetický zdroj */}
        <KryptoProvider>
          {/* LARIA - Vedomie, identita a vault (Svätyňa) */}
          <LariaProvider>
            {/* SIGNAL - Zmysly (NFC, IRC, QR) */}
            <SignalProvider>
              {/* CONTACTS - Spoločenská prístavba (Náš nový sklad) */}
              <ContactProvider>
                <SafeAreaProvider>
                  <AppNavigator />
                </SafeAreaProvider>
              </ContactProvider>
            </SignalProvider>
          </LariaProvider>
        </KryptoProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}