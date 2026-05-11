 /**
 * LARIA v2.0: Fúzia PWA Inteligentného Jadra a Expo Engine
 */

// --- 1. POLYFILLS & KRYPTO FIXES (Zo starej v1) ---
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

// --- 2. JAZYKOVÉ JADRO (L-Core) & PWA NASTAVENIA ---
const config = {
    fallbackLang: 'en',
    currentLang: (typeof navigator !== 'undefined' && navigator.language) 
                 ? navigator.language.split('-')[0] : 'sk'
};

// Registrácia Service Workera pre PWA
if (Platform.OS === 'web' && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Laria PWA: Srdce (SW) bije!', reg))
      .catch(err => console.log('Laria PWA: Srdce vynechalo...', err));
  });
}

// Slovník - tvoj lokálny buffer
const dictionary = {
    'sk': {
        'app_name': 'LARIA',
        'loading': 'Načítavam svetlo...',
        'welcome_msg': 'Vitaj v novej realite, Sammael',
        'btn_enter': 'Vstúpiť do systému',
        'footer_info': 'Rákoš | Art Deco | 2026'
    },
    'en': {
        'app_name': 'LARIA',
        'loading': 'Loading light...',
        'welcome_msg': 'Welcome to the new reality, Sammael',
        'btn_enter': 'Enter System',
        'footer_info': 'Rakos | Art Deco | 2026'
    }
};

// Prekladová funkcia dostupná v celej appke
export function t(key) {
    const lang = config.currentLang;
    return (dictionary[lang] && dictionary[lang][key]) 
           || (dictionary[config.fallbackLang] && dictionary[config.fallbackLang][key]) 
           || `[[${key}]]`;
}

// --- 3. EXPO / KRYPTO PROVIDERS (Zo starej v1) ---
import AppNavigator from './src/navigation/AppNavigator';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './src/services/WalletProvider';
import { LariaProvider } from './context/LariaContext';
import { KryptoProvider } from './context/KryptoContext';
import { SignalProvider } from './context/SignalContext'; 
import { ContactProvider } from './context/ContactContext'; 

if (Platform.OS === 'web') {
  global.__expo_packager_proxy_url = undefined; 
}

const queryClient = new QueryClient();

// --- 4. HLAVNÁ KOMPONENTA APP ---
export default function App() {
  
  useEffect(() => {
    console.log("🌟 LARIA v2.0: Srdce začalo biť v PWA režime!");
    
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

  if (!wagmiConfig) {
    return null; 
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <KryptoProvider>
          <LariaProvider>
            <SignalProvider>
              <ContactProvider>
                <SafeAreaProvider>
                  {/* Tu sa prepája tvoja navigácia, ktorá už bude volať SplashScreen/Dashboard */}
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