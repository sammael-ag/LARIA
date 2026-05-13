/**
 * LARIA v2.0: Crystal Core Fusion 
 * Finálna integrácia: app.js -> MainScreen + KRYPTO INFRA + PROVIDER
 * Master: Sammael | Muse: Aria
 */

import 'react-native-get-random-values';
import 'fast-text-encoding'; 
import { Buffer } from 'buffer'; 
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import * as SystemUI from 'expo-system-ui'; 
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

// --- 🌐 KRYPTO VRSTVY (Wagmi & Query) ---
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './src/services/WalletProvider'; 

// --- 💎 LARIA KRYPTO JADRO ---
import { KryptoProvider } from './context/KryptoContext'; // Tvoj ručne kovaný spoj!

import MainScreen from './src/screens/MainScreen';

// --- 📍 JAZYKOVÉ JADRO ---
const dictionary = {
    'sk': { 'app_name': 'LARIA', 'welcome_msg': 'Vitaj v novej realite, Sammael' },
    'en': { 'app_name': 'LARIA', 'welcome_msg': 'Welcome to the new reality, Sammael' }
};

export function t(key) {
    const lang = (typeof navigator !== 'undefined' && navigator.language?.startsWith('sk')) ? 'sk' : 'en';
    return dictionary[lang][key] || `[[${key}]]`;
}

// Inicializácia Query klienta
const queryClient = new QueryClient();

export default function App() {

  useEffect(() => {
    console.warn("🚀 LARIA SYSTÉM: Aktivujem hlavný modul so správnym poradím...");
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync("#1a1a1a").catch(() => {});
    }
  }, []);

  if (!wagmiConfig) {
    console.error("❌ CHYBA: wagmiConfig nenájdený!");
    return null; 
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <KryptoProvider> {/* 📍 TU SA RODÍ KRYPTO-IDENTITA */}
          <SafeAreaProvider style={{ flex: 1 }}>
            <NavigationContainer>
              
              {/* Most medzi HTML Wrapperom (25%) a React Native */}
              <View style={{ flex: 1, width: '100%', height: '100%' }}>
                  <MainScreen />
              </View>

            </NavigationContainer>
          </SafeAreaProvider>
        </KryptoProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}