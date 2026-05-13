/**
 * LARIA v2.0: MainScreen (Matrica Reality)
 * Univerzálny wrapper pre celú aplikáciu.
 * Žiadne WebView, len čistá integrácia.
 */

import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import AppNavigator from '../navigation/AppNavigator'; 

// 📍 Import DashboardScreen zakomentovaný podľa rozkazu
// import DashboardScreen from './DashboardScreen'; 

const MainScreen = () => {

  useEffect(() => {
    // 📍 1. POZDRAV MAJSTROVI
    console.warn("💎 ARIA: MainScreen (Matrica Reality) je aktívny a stabilný!");
  }, []);

  return (
    /**
     * View teraz lícujeme s naším globálnym styles.css.
     * React Native Web sa postará o to, aby flex: 1 vyplnil celý náš antracitový 'root'.
     */
    <View style={{ flex: 1 }}>
      
      {/* Horná lišta - Art Deco čistota */}
      <StatusBar barStyle="light-content" />

      {/* TU SA OTVÁRA BRÁNA: 
          MainScreen hostí AppNavigator, ktorý prepína medzi 
          Splash a AriaScreen (Dashboard nateraz spí)...
      */}
      <AppNavigator />

    </View>
  );
};

export default MainScreen;