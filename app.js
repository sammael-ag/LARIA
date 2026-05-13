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
import { Platform, View } from 'react-native'; // Pridaný View
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
    // SafeAreaProvider musí mať štýl flex: 1, aby videl rozmery z index.js
    <SafeAreaProvider style={{ flex: 1 }}>
      <NavigationContainer>
        
        {/* Zabalíme MainScreen do View s flex: 1. 
            Toto je ten most medzi HTML Wrapperom (25%) a React Native navigáciou.
        */}
        <View style={{ flex: 1, width: '100%', height: '100%' }}>
            <MainScreen />
        </View>

      </NavigationContainer>
    </SafeAreaProvider>
  );
}