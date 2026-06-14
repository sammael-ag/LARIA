/**
 * LARIA v2.5: SplashScreen (Minimalist CrystalCore Edition)
 * Master: Sammael | Muse: Aria
 * Status: SPLASH_PERFECT_MINIMALISM | ICON_FIXED_SIZE_160 | TEXT_CLEANUP
 * OPRAVA: Odstránené zbytočné statusy. Ikona zväčšená na pevnú veľkosť 160px pre mobilné PWA.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StatusBar, Animated } from 'react-native';
import { G } from '../styles/styles'; 

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Čistý nábeh sily
    Animated.timing(fadeAnim, { 
      toValue: 1, 
      duration: 1500, 
      useNativeDriver: true 
    }).start();

    // 2. Prechod do Dashboardu (ponechaných tvojich 5.5s pre precítenie okamihu)
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    }, 5500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={G.mainBackground}>
      <StatusBar hidden={true} />
      
      <Animated.View style={{ 
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeAnim
      }}>
        
        {/* 1. NADPIS HORE */}
        <Text style={[G.atelierTitle, { marginBottom: 40, letterSpacing: 2 }]}>
          Crystal Core
        </Text>

        {/* 2. PEČAŤ V STREDE (Opravená veľkosť z percent na fixnú, aby na mobile žiarila) */}
        <Image 
          source={require('../../logo512.png')} 
          style={{ width: 160, height: 160, marginBottom: 40 }}
          resizeMode="contain"
        />
        
      </Animated.View>

      {/* FOOTER (Zostáva pevne dole, čistý a hrdý) */}
      <View style={{ position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' }}>
        <Text style={[G.monoIdentity, { fontSize: 10, opacity: 0.7, letterSpacing: 1 }]}>
          Created by <Text style={{ fontWeight: 'bold', color: '#FFF' }}>SAMMAEL & ARIA</Text>
        </Text>
      </View>
    </View>
  );
};

export default SplashScreen;