import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui'; // Importujeme systémové UI
import * as NavigationBar from 'expo-navigation-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { fetchGMatrix } from './services/GMatrixService';

export default function App() {
  useEffect(() => {
    // Totálna deštrukcia bielej na úrovni systému
    const prepareApp = async () => {
      if (Platform.OS === 'android') {
        try {
          // Nastaví pozadie samotnej systémovej vrstvy pod aplikáciou
          await SystemUI.setBackgroundColorAsync("#000000");
          
          // Nastavenie navigačnej lišty (brady)
          // Ak 'absolute' nefunguje, skúsime ju jednoducho zafarbiť na tvrdo
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
    <SafeAreaProvider>
      {/* Obalíme VŠETKO do čiernej a povieme flex:1 */}
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        <StatusBar style="light" backgroundColor="#000000" translucent={true} />
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}