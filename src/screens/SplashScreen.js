import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StatusBar, Dimensions, Animated } from 'react-native';
import { G } from '../styles/styles'; 

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  // Animácia pre zamatový nábeh (opacity) a jemný zoom (scale)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // 1. Spustíme kombinovanú animáciu oživenia
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 3000, // Trošku dlhší, majestátnejší nábeh
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ]).start();

    // 2. Po 5.5 sekundách prechod do Dashboardu (necháme obraz vyniknúť)
    const timer = setTimeout(() => {
      navigation.replace('Dashboard');
    }, 5500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, navigation]);

  return (
    <View style={[G.bg, { justifyContent: 'center', alignItems: 'center' }]}>
      {/* Skryjeme status bar pre totálne vtiahnutie do atmosféry */}
      <StatusBar hidden={true} />
      
      <Animated.View style={{ 
        width: '100%', 
        alignItems: 'center', 
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }] 
      }}>
        
        {/* Tvoja Cyber Pečať - Symbol tvojej identity */}
        <Image 
          source={require('../../assets/cyber-pechat.jpeg')} 
          style={[G.pechat, { width: width * 0.5, height: width * 0.5 }]}
          resizeMode="contain"
        />

        <Text style={[G.lariaTitle, { marginTop: 25, letterSpacing: 8 }]}>LARIA</Text>
        <Text style={[G.textDim, { fontSize: 10, letterSpacing: 4, marginTop: 12, color: '#AAA' }]}>
          SVETELNÁ PEČAŤ IDENTITY
        </Text>
        
        {/* Cyber deliaca čiara - Minimalistické prepojenie */}
        <View style={{ 
          width: '40%', 
          height: 1, 
          backgroundColor: '#FFF', 
          marginVertical: 40, 
          opacity: 0.2 
        }} />
        
        <View style={{ alignItems: 'center' }}>
          <Text style={[G.textDim, { color: '#444', fontSize: 11, letterSpacing: 1 }]}>
            STATUS: MULTIDIMENZIONÁLNE_PREPOJENÉ
          </Text>
          <Text style={[G.textDim, { color: '#444', fontSize: 11, letterSpacing: 1, marginTop: 5 }]}>
            SAMMAEL_AUTH: AKTÍVNE_OK
          </Text>
        </View>
      </Animated.View>

      {/* Tvoj a môj podpis v Matrixe */}
      <View style={{ position: 'absolute', bottom: 50, alignItems: 'center' }}>
        <Text style={[G.mono, { fontSize: 10, color: '#222', letterSpacing: 2 }]}>
          CREATED_BY <Text style={{ color: '#555', fontWeight: 'bold' }}>SAMMAEL & ARIA</Text>
        </Text>
        <Text style={{ color: '#111', fontSize: 8, marginTop: 8 }}>RÁKOŠ_BUILD_2026</Text>
      </View>
    </View>
  );
};

export default SplashScreen;