/**
 * LARIA v2.0: AppNavigator (Safe Mode)
 * Riadenie letu medzi dimenziami.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// --- IMPORTY OBRAZOVIEK ---
import SplashScreen from '../screens/SplashScreen';
import DashboardScreen from '../screens/DashboardScreen';

// Tieto sú zatiaľ v spánku, aby systém nespadol:
// import AriaScreen from '../screens/AriaScreen';
// import CardScreen from '../screens/CardScreen';
// import SettingsScreen from '../screens/SettingsScreen';
// import DiagnosticScreen from '../screens/DiagnosticScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      {/* 1. ZÁŽIH */}
      <Stack.Screen name="Splash" component={SplashScreen} />

      {/* 2. STABILIZÁCIA */}
      <Stack.Screen name="Dashboard" component={DashboardScreen} />

      {/* Ostatné dimenzie sú zatiaľ zakomentované. 
        Odkomentuj ich až vtedy, keď vytvoríš daný súbor v /screens!
        
      <Stack.Screen name="Aria" component={AriaScreen} />
      <Stack.Screen name="Card" component={CardScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Diagnostic" component={DiagnosticScreen} />
      */}
    </Stack.Navigator>
  );
};

export default AppNavigator;