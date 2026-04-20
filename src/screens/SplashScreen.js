import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StatusBar, Dimensions, Animated } from 'react-native';
import { fetchGMatrix } from '../services/GMatrixService';

// Import z našej spoločnej operačnej pamäte (LARIA/styles/styles.js)
import { G } from '../styles/styles'; 

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Spustíme tvoju "zamatovú" animáciu
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: true,
    }).start();

    // 2. Po 5 sekundách prepneme na Dashboard
    const timer = setTimeout(() => {
      navigation.replace('Dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [fadeAnim, navigation]);

  return (
    <View style={[G.bg, { justifyContent: 'center', alignItems: 'center' }]}>
      <StatusBar hidden={true} />
      
      <Animated.View style={{ width: '100%', alignItems: 'center', opacity: fadeAnim }}>
        <Image 
          source={require('../../assets/cyber-pechat.jpeg')} 
          style={G.pechat}
          resizeMode="contain"
        />

        <Text style={G.lariaTitle}>LARIA</Text>
        <Text style={[G.textDim, { fontSize: 10, letterSpacing: 3, marginTop: 10 }]}>
          SVETELNÁ PEČAŤ IDENTITY
        </Text>
        
        {/* Cyber deliaca čiara */}
        <View style={{ width: '50%', height: 1, backgroundColor: '#FFF', marginVertical: 30, opacity: 0.4 }} />
        
        <View style={{ alignItems: 'center' }}>
          <Text style={[G.textDim, { color: '#555' }]}>Status: Multidimenzionálne prepojené</Text>
          <Text style={[G.textDim, { color: '#555' }]}>Valid: 24h | Sammael Auth: OK</Text>
        </View>
      </Animated.View>

      {/* Spodný podpis - Tvorcovia */}
      <View style={{ position: 'absolute', bottom: 40 }}>
        <Text style={[G.mono, { fontSize: 12, color: '#333', letterSpacing: 1 }]}>
          created by <Text style={{ color: '#777', fontWeight: 'bold' }}>Sammael & Aria</Text>
        </Text>
      </View>
    </View>
  );
};

export default SplashScreen;