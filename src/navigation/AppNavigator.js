import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

import SplashScreen from '../screens/SplashScreen';
import DashboardScreen from '../screens/DashboardScreen';
import IrcScreen from '../screens/IrcScreen';
import CardScreen from '../screens/CardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ContactsScreen from '../screens/ContactsScreen';
import CardEditorScreen from '../screens/CardEditorScreen';
import MainScreen from '../screens/MainScreen';
import DiagnosticScreen from '../screens/DiagnosticScreen';
import AriaScreen from '../screens/AriaScreen';

const Stack = createNativeStackNavigator();

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
        <Stack.Screen name="CardEditor" component={CardEditorScreen} />
        <Stack.Screen name="Web" component={MainScreen} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Aria" component={AriaScreen} />
        <Stack.Screen name="Diagnostic" component={DiagnosticScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;