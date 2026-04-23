import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui'; 
import * as NavigationBar from 'expo-navigation-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

// Importy pre dáta a peňaženku
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './src/services/WalletProvider';

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    // Totálna eliminácia bielej - tvoj podpis
    const prepareApp = async () => {
      if (Platform.OS === 'android') {
        try {
          await SystemUI.setBackgroundColorAsync("#000000");
          await NavigationBar.setBackgroundColorAsync("#000000");
          await NavigationBar.setButtonStyleAsync("light");
        } catch (e) {
          console.warn("Systémové UI sa bráni, ale my to nevzdáme.");
        }
      }
    };
    prepareApp();
  }, []);

  // Ak by wagmiConfig náhodou neprišiel, poistíme to, aby appka nespadla
  if (!wagmiConfig) {
    return <View style={{ flex: 1, backgroundColor: '#000000' }} />;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          {/* Čierna základňa, kde tvoj Dashboard ožije */}
          <View style={{ flex: 1, backgroundColor: '#000000' }}>
            <StatusBar style="light" backgroundColor="#000000" translucent={true} />
            
            <AppNavigator />

            {/* Poznámka: AppKitModal tu už v novej verzii WagmiAdaptera 
                nepotrebujeme, modal sa spúšťa automaticky cez hooky vnútri komponentov */}
          </View>
        </SafeAreaProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}