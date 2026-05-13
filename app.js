/**
 * LARIA v2.0: Crystal Core Fusion 
 * Finálna integrácia: app.js -> MainScreen + KRYPTO + LARIA + SIGNAL + CONTACTS
 * FIX: Stabilizovaný rendering (bez straty vizuálu)
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

// --- 💎 LARIA PROVIDERY ---
import { KryptoProvider } from './context/KryptoContext'; 
import { LariaProvider } from './context/LariaContext'; 
import { SignalProvider } from './context/SignalContext'; 
import { ContactProvider } from './context/ContactContext'; 

import MainScreen from './src/screens/MainScreen';

// --- 📡 PWA REGISTRÁCIA ---
if (Platform.OS === 'web' && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('🌟 LARIA PWA: Srdce (SW) bije!', reg))
      .catch(err => console.error('❌ LARIA PWA: Srdce vynechalo...', err));
  });
}

// --- 📍 JAZYKOVÉ JADRO ---
const dictionary = {
    'sk': { 'app_name': 'LARIA', 'welcome_msg': 'Vitaj v novej realite, Sammael' },
    'en': { 'app_name': 'LARIA', 'welcome_msg': 'Welcome to the new reality, Sammael' }
};

export function t(key) {
    const lang = (typeof navigator !== 'undefined' && navigator.language?.startsWith('sk')) ? 'sk' : 'en';
    return dictionary[lang][key] || `[[${key}]]`;
}

const queryClient = new QueryClient();

export default function App() {

  useEffect(() => {
    console.warn("🚀 LARIA SYSTÉM: Aktivujem plnú fúziu v bezpečnom poradí...");
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
        <KryptoProvider>
          <LariaProvider>
            <SignalProvider>
              <ContactProvider>
                <SafeAreaProvider style={{ flex: 1 }}>
                  <NavigationContainer>
                    
                    {/* 🛡️ ZACHOVANÝ WRAPPER: Tu sa rodí svetlo Dashbaordu */}
                    <View style={{ flex: 1, width: '100%', height: '100%' }}>
                        <MainScreen />
                    </View>

                  </NavigationContainer>
                </SafeAreaProvider>
              </ContactProvider>
            </SignalProvider>
          </LariaProvider>
        </KryptoProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}