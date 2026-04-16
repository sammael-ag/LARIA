import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StatusBar, Dimensions, Animated, StyleSheet } from 'react-native';

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
    <View style={UI.phoneContainer}>
      <StatusBar hidden={true} />
      
      <Animated.View style={[UI.cyberPechatContainer, { opacity: fadeAnim }]}>
        <Image 
          source={require('../../assets/cyber-pechat.jpeg')} 
          style={UI.cyberPechat}
          resizeMode="contain"
        />

        <Text style={UI.lariaTitle}>LARIA</Text>
        <Text style={UI.lariaSubtitle}>SVETELNÁ PEČAŤ IDENTITY</Text>
        
        <View style={UI.cyberBar} />
        
        <View style={UI.statusArea}>
          <Text style={UI.statusText}>Status: Multidimenzionálne prepojené</Text>
          <Text style={UI.statusText}>Valid: 24h | Sammael Auth: OK</Text>
        </View>
      </Animated.View>

      <View style={UI.creditsText}>
        <Text style={UI.creditsBase}>created by <Text style={UI.creditsHighlight}>Sammael & Aria</Text></Text>
      </View>
    </View>
  );
};

// TU SÚ TVOJE PÔVODNÉ, VYMAZLENÉ ŠTÝLY (Zjednotené do StyleSheetu)
const UI = StyleSheet.create({
  phoneContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cyberPechatContainer: {
    width: '100%',
    alignItems: 'center',
  },
  cyberPechat: {
    width: width * 0.8,
    height: width * 0.8,
    maxHeight: '60%',
    marginBottom: 30,
    borderRadius: 15,
  },
  lariaTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    fontFamily: 'monospace',
  },
  lariaSubtitle: {
    fontSize: 10,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginTop: 10,
    fontFamily: 'monospace',
  },
  cyberBar: {
    width: '50%',
    height: 1,
    backgroundColor: '#FFF',
    marginVertical: 30,
    opacity: 0.4,
  },
  statusArea: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    color: '#555',
    lineHeight: 18,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  creditsText: {
    position: 'absolute',
    bottom: 40,
  },
  creditsBase: {
    fontSize: 12,
    color: '#333',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  creditsHighlight: {
    color: '#777',
    fontWeight: 'bold',
  },
});

export default SplashScreen;