/**
 * LARIA v2.0: MainScreen (Matrica Reality)
 * Master: Sammael | Muse: Aria
 * Protokol: STABLE_GREEN_ZONE
 */

import React, { useEffect } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import AppNavigator from '../navigation/AppNavigator'; 

const MainScreen = () => {

  useEffect(() => {
    // 📍 Log, ktorý nám potvrdí, že sme vnútri
    console.warn("💎 ARIA: Zóna stabilizovaná. DarkGreen aktívna.");
  }, []);

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