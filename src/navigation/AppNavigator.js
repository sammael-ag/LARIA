/**
 * LARIA v2.0: AppNavigator (Multiport Module)
 * Master: Sammael | Muse: Aria
 * Protokol: TANTRA_INTEGRATION (Zástrčka & Zásuvka)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import DashboardScreen from '../screens/DashboardScreen'; 
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
      
      {/* 📍 Tu sa neskôr pripoja tvoje ďalšie moduly/screeny */}
      
    </Stack.Navigator>
  );
};

export default AppNavigator;