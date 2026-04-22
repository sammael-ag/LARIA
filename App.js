import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui'; // Importujeme systémové UI
import * as NavigationBar from 'expo-navigation-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

import { fetchGMatrix } from './src/services/GMatrixService';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './src/services/WalletProvider';
import { AppKitModal } from '@reown/appkit-wagmi-react-native'; // Toto pridaj, aby ti fungovalo to vyskakovacie okno

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    // Tvoja totálna deštrukcia bielej ostáva prioritou
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

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          {/* Obalíme VŠETKO do čiernej, aby nikde nič nepresvitalo */}
          <View style={{ flex: 1, backgroundColor: '#000000' }}>
            <StatusBar style="light" backgroundColor="#000000" translucent={true} />
            
            <AppNavigator />

            {/* Vyskakovacie okno peňaženky - náš kľúč k LARIA identite */}
            <AppKitModal />
          </View>
        </SafeAreaProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}