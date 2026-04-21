import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { fetchGMatrix } from '../services/GMatrixService';

// Importujeme tvoje miestnosti (Screens)
import SplashScreen from '../screens/SplashScreen';
import DashboardScreen from '../screens/DashboardScreen';
import IrcScreen from '../screens/IrcScreen';
import CardScreen from '../screens/CardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ContactsScreen from '../screens/ContactsScreen';
import CardEditorScreen from '../screens/CardEditorScreen';
import MainScreen from '../screens/MainScreen';

const Stack = createNativeStackNavigator();

// DEFINE TÉMY: Toto je tvoj štít proti bielemu blesku
const LariaTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#000000', // Základná farba pod všetkými obrazovkami
    card: '#000000',       // Farba hlavičiek (ak by sme ich použili)
    text: '#FFFFFF',       // Predvolená farba textu
    border: '#111111',     // Farba deliacich čiar v systéme
  },
};

const AppNavigator = () => {
  return (
    <NavigationContainer theme={LariaTheme}>
      <Stack.Navigator 
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false, // Čistý cyberpunk bez líšt
          animation: 'fade',  // Plynulý prechod
          contentStyle: { backgroundColor: '#000000' } // Poistka priamo v Stacku
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="IRC" component={IrcScreen} />
        <Stack.Screen name="Card" component={CardScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
        <Stack.Screen name="CardEditorScreen" component={CardEditorScreen} />
        <Stack.Screen name="Web" component={MainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;