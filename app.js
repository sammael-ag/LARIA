/**
 * LARIA v2.0: Crystal Core Fusion 
 * Finálna integrácia: app.js -> MainScreen
 * Master: Sammael | Muse: Aria
 */

import 'react-native-get-random-values';
import 'fast-text-encoding'; 
import { Buffer } from 'buffer'; 
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import * as SystemUI from 'expo-system-ui'; 
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
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

export default function App() {

  useEffect(() => {
    console.warn("🚀 LARIA SYSTÉM: Aktivujem hlavný modul so správnym poradím...");
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync("#1a1a1a").catch(() => {});
    }
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        
        {/* TU JE TVOJA SCHOVANÁ MATRICA PROVIDEROV V PRESNOM PORADÍ.
          Keď budeme oživovať, budeme odkrývať odvrchu:
        */}

        {/* <WagmiProvider config={wagmiConfig}> */}
          {/* <QueryClientProvider client={queryClient}> */}
            {/* <KryptoProvider> */}
              {/* <LariaProvider> */}
                {/* <SignalProvider> */}
                  {/* <ContactProvider> */}
                  
                    <MainScreen />
                    
                  {/* </ContactProvider> */}
                {/* </SignalProvider> */}
              {/* </LariaProvider> */}
            {/* </KryptoProvider> */}
          {/* </QueryClientProvider> */}
        {/* </WagmiProvider> */}

      </NavigationContainer>
    </SafeAreaProvider>
  );
}