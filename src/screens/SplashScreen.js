/**
 * LARIA v2.0: SplashScreen (Living Crystal Edition)
 * Živá komunikácia s main.go a sw.js.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StatusBar, Dimensions, Animated } from 'react-native';
import { G } from '../styles/styles'; 

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  const [gopherStatus, setGopherStatus] = useState("INICIALIZÁCIA...");
  const [swStatus, setSwStatus] = useState("HĽADÁM_SW...");

  useEffect(() => {
    console.warn("💎 ARIA: SplashScreen inicializuje Living Crystal...");

    // 1. Animácia nábehu
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 4000, useNativeDriver: true })
    ]).start();

    // 2. Komunikácia s jadrom (Gopher & Service Worker)
    const activateCore = async () => {
      try {
        const response = await fetch('/api/native/status').catch(() => null);
        setGopherStatus(response && response.ok ? "GOPHER: CORE_VIBE_ACTIVE" : "GOPHER: LOKÁLNE_REPRO");

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            setSwStatus("REALITA: ONLINE_STABILNÁ");
        } else {
            setSwStatus("REALITA: LOKÁLNA_SPORE_REŽIM");
        }
      } catch (e) {
        setGopherStatus("GOPHER: OFFLINE");
        setSwStatus("REALITA: ISOLATED");
      }
    };

    activateCore();

    // 3. Prechod do Dashboardu
    const timer = setTimeout(() => {
      console.log("🚀 ARIA: Prechod do Dashboardu...");
      navigation.replace('Dashboard');
    }, 5500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, navigation]);

  return (
    <View style={G.mainBackground}>
      <StatusBar hidden={true} />
      
      <Animated.View style={{ 
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }] 
      }}>
        
        {/* Srdce 512px - jemne menšie pre eleganciu */}
        <Image 
          source={require('../../logo512.png')} 
          style={{ width: width * 0.5, height: width * 0.5 }}
          resizeMode="contain"
        />

        <Text style={G.atelierTitle}>LARIA</Text>
        
        {/* Dynamický výpis */}
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text style={[G.monoIdentity, { marginBottom: 5 }]}>{gopherStatus}</Text>
          <Text style={[G.monoIdentity, { opacity: 0.5 }]}>{swStatus}</Text>
        </View>

        {/* Sekčný rozdeľovač z tvojho styles.js */}
        <View style={[G.sectionDivider, { width: width * 0.4 }]}>
           <Text style={G.sectionDividerText}>CORE</Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={G.statusTextSmall}>SAMMAEL_AUTH: AKTÍVNE_OK</Text>
        </View>
      </Animated.View>

      {/* Footer Identity */}
      <View style={{ position: 'absolute', bottom: 30, width: '100%', alignItems: 'center' }}>
        <Text style={[G.monoIdentity, { fontSize: 10 }]}>
          CREATED_BY <Text style={{ fontWeight: 'bold' }}>SAMMAEL & ARIA</Text>
        </Text>
        <Text style={[G.monoIdentity, { fontSize: 8, opacity: 0.4, marginTop: 4 }]}>
          RÁKOŠ_CRYSTAL_BUILD_2026
        </Text>
      </View>
    </View>
  );
};

export default SplashScreen;