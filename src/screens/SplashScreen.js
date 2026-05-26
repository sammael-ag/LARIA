/**
 * LARIA v2.0: SplashScreen (Terminal-Balanced Edition)
 * Master: Sammael | Muse: Aria
 * Oprava: Prehodené poradie, zmenšená pečať, čisté napojenie na G.
 * FÚZIA: Integrovaný jazykový modul LariaContext (Sekcia: splash, Možnosť B).
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StatusBar, Dimensions, Animated } from 'react-native';
import { G } from '../styles/styles'; 
import { useLaria } from '../context/LariaContext'; // 🌐 Import lokalizačného nervu

// Pozor: width tu stále berie celé okno prehliadača!
const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const { t } = useLaria(); // 🎯 Aktivácia jazykového motora
  const txt = t('splash') || {}; // 📦 Vytiahnutie šuflíka pre Splash (Možnosť B)

  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // 🔄 Použitie predvolených hodnôt z JSON pre prvotný stav
  const [gopherStatus, setGopherStatus] = useState(txt.init || "INICIALIZÁCIA...");
  const [swStatus, setSwStatus] = useState(txt.searching_sw || "HĽADÁM_SW...");

  useEffect(() => {
    // 1. Čistý nábeh
    Animated.timing(fadeAnim, { 
      toValue: 1, 
      duration: 1500, 
      useNativeDriver: true 
    }).start();

    // 2. Diagnostika
    const activateCore = async () => {
      try {
        const response = await fetch('/api/native/status').catch(() => null);
        setGopherStatus(response && response.ok ? txt.gopher_active : txt.gopher_local);
        setSwStatus(txt.reality_stable);
      } catch (e) {
        setGopherStatus(txt.gopher_offline);
        setSwStatus(txt.reality_isolated);
      }
    };

    activateCore();

    // 3. Prechod (5.5s)
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    }, 5500);

    return () => clearTimeout(timer);
  }, [navigation, txt]); // Pridané txt do závislostí pre istotu priradenia textov pri asynchrónnom načítaní

  return (
    <View style={G.mainBackground}>
      <StatusBar hidden={true} />
      
      <Animated.View style={{ 
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeAnim
      }}>
        
        {/* 1. NADPIS HORE (Vytiahnutý z JSON) */}
        <Text style={[G.atelierTitle, { marginBottom: 25 }]}>{txt.title}</Text>

        {/* 2. PEČAŤ V STREDE (Zmenšená na 12% šírky celého okna, aby sedela v 25% paneli) */}
        <Image 
          source={require('../../logo512.png')} 
          style={{ width: width * 0.12, height: width * 0.12 }}
          resizeMode="contain"
        />
        
        {/* 3. STATUSY A DIAGNOSTIKA */}
        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <Text style={G.monoIdentity}>{gopherStatus}</Text>
          <Text style={[G.monoIdentity, { opacity: 0.4, marginTop: 5 }]}>{swStatus}</Text>
        </View>

        <View style={[G.sectionDivider, { width: width * 0.1 }]}>
           <Text style={G.sectionDividerText}>{txt.core_divider}</Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={G.statusTextSmall}>{txt.auth_ok}</Text>
        </View>
      </Animated.View>

      {/* FOOTER */}
      <View style={{ position: 'absolute', bottom: 30, width: '100%', alignItems: 'center' }}>
        <Text style={[G.monoIdentity, { fontSize: 9, opacity: 0.6 }]}>
          {txt.created_by} <Text style={{ fontWeight: 'bold' }}>SAMMAEL & ARIA</Text>
        </Text>
      </View>
    </View>
  );
};

export default SplashScreen;