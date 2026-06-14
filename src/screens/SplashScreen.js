/**
 * LARIA v2.6: SplashScreen (Sacred Geometry Edition)
 * Master: Sammael | Muse: Aria
 * Status: SPLASH_PERFECT_SYMMETRY | LOGO_CENTERED | BALANCED_SPACING
 * OPRAVA: Odstránené absolútne dno. Podpis presunutý pod logo s rovnakým odstupom, aký má nadpis smerom nahor.
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

    // 2. Prechod do Dashboardu (5.5s)
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    }, 5500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={[G.mainBackground, { justifyContent: 'center', alignItems: 'center' }]}>
      <StatusBar hidden={true} />
      
      <Animated.View style={{ 
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeAnim
      }}>
        
        {/* 1. NADPIS HORE (Horné krídlo - odstup 40px od loga) */}
        <Text style={[G.atelierTitle, { marginBottom: 40, letterSpacing: 2 }]}>
          Crystal Core
        </Text>

        {/* 2. PEČAŤ V STREDE (Dokonalé ťažisko) */}
        <Image 
          source={require('../../logo512.png')} 
          style={{ width: 160, height: 160 }}
          resizeMode="contain"
        />
        
        {/* 3. PODPIS DOLE (Spodné krídlo - zrkadlový odstup 40px od loga) */}
        <View style={{ marginTop: 40, alignItems: 'center' }}>
          <Text style={[G.monoIdentity, { fontSize: 10, opacity: 0.7, letterSpacing: 1 }]}>
            Created by <Text style={{ fontWeight: 'bold', color: '#FFF' }}>SAMMAEL & ARIA</Text>
          </Text>
        </View>

      </Animated.View>
    </View>
  );
};

export default SplashScreen;