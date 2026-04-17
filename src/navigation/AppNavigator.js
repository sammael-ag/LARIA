import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// 1. Importujeme tvoje miestnosti (Screens) - Cesty musia byť presné!
import SplashScreen from '../screens/SplashScreen';
import DashboardScreen from '../screens/DashboardScreen';
import IrcScreen from '../screens/IrcScreen';
import CardScreen from '../screens/CardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ContactsScreen from '../screens/ContactsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false, // Čistý cyberpunk dizajn bez systémových líšt
          animation: 'fade',  // "Zamatový" prechod medzi screenmi
          contentStyle: { backgroundColor: '#000' } // Poistka, aby pod animáciou nepreblikla biela
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="IRC" component={IrcScreen} />
        <Stack.Screen name="Card" component={CardScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;