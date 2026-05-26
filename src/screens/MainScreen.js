/**
 * LARIA v2.3: MainScreen (Matrica Reality)
 * Master: Sammael | Muse: Aria
 * Protokol: STABLE_GREEN_ZONE | LOCALIZATION_CONNECTED
 */

import React, { useEffect } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import AppNavigator from '../navigation/AppNavigator'; 
import { useLaria } from '../context/LariaContext'; // 💎 Vtiahneme pamäť a vedomie LARIE

const MainScreen = () => {
  // Vytiahneme prekladovú funkciu t priamo z nášho čerstvého Crystal Core
  const { t } = useLaria();

  useEffect(() => {
    // 📍 Log už nepoužíva natvrdo napísaný text, ale pýta si ho cez kľúč 'welcome_msg'
    console.warn(`💎 ARIA: ${t('welcome_msg')}. DarkGreen aktívna.`);
  }, [t]); // Log sa obnoví, ak sa zmení jazykový motor

  return (
    /**
     * S.enclosure teraz pôsobí ako absolútna kotva.
     * Ak uvidíš DarkGreen, Wrapper (index.js) nám úspešne odovzdal priestor.
     */
    <View style={S.enclosure}>
      
      <StatusBar barStyle="light-content" hidden={true} />

      {/* Tento vnútorný View zaručuje, že AppNavigator neutečie k susedom doľava */}
      <View style={S.navigationWrapper}>
        <AppNavigator />
      </View>

    </View>
  );
};

const S = StyleSheet.create({
  enclosure: {
    flex: 1,
    width: '100%',
    height: '100%',
    // 📍 TESTOVACIA FARBA (Namiesto červenej - DarkGreen pre kľud a rast)
    backgroundColor: '#002200', 
    overflow: 'hidden',
  },
  navigationWrapper: {
    // Toto je to 'lepidlo', ktoré drží Splash a Dashboard v ohrádke
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'stretch',
    justifyContent: 'center',
  }
});

export default MainScreen;