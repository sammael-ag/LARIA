/**
 * LARIA v2.0: AppNavigator (Multiport Module)
 * Master: Sammael | Muse: Aria
 * Protokol: TANTRA_INTEGRATION (Zástrčka & Zásuvka)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AriaScreen from '../screens/AriaScreen';
import DiagnosticScreen from '../screens/DiagnosticScreen';
import CardScreen from '../screens/CardScreen.js';
import CardEditorScreen from '../screens/CardEditorScreen.js';
import ContactsScreen from '../screens/ContactsScreen.js';
import ScannerScreen from '../screens/ScannerScreen.js';
import SignalScreen from '../screens/SignalScreen.js';
import SettingsScreen from '../screens/SettingsScreen.js';
import AdminScreen from '../screens/AdminScreen.js'; 
// ... ďalšie importy ...

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        // TOTO JE TO PREVZATIE PARAMETROV:
        // Každý screen dostane tento "kontajnerový" štýl
        cardStyle: { 
          flex: 1, 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'transparent' // Aby vynikol ten DarkGreen/Antracit pod tým
        },
        // Zabezpečíme, aby prechody medzi screenmi nerozbili ohrádku
        animationEnabled: true,
        detachPreviousScreen: true,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Aria" component={AriaScreen} />
      <Stack.Screen name="Diagnostic" component={DiagnosticScreen} />
      <Stack.Screen name="Card" component={CardScreen} />
      <Stack.Screen name="CardEditor" component={CardEditorScreen} />
      <Stack.Screen name="Contacts" component={ContactsScreen} />
      <Stack.Screen name="Scanner" component={ScannerScreen} />
      <Stack.Screen name="Signal" component={SignalScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />
      {/* 📍 Tu sa neskôr pripoja tvoje ďalšie moduly/screeny */}
      
    </Stack.Navigator>
  );
};

export default AppNavigator;