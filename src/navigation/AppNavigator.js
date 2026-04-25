import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

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

// Tvoj špecifický vizuálny štýl - tma, z ktorej vychádza svetlo
const LariaTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#000000',
    card: '#000000',
    text: '#FFFFFF',
    border: '#111111',
  },
};

const AppNavigator = () => {
  return (
    <NavigationContainer theme={LariaTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#000000' }
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="IRC" component={IrcScreen} />
        <Stack.Screen name="Card" component={CardScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
        <Stack.Screen name="CardEditor" component={CardEditorScreen} />
        <Stack.Screen name="Web" component={MainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;