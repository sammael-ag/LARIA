import React, { useState, useEffect } from 'react';
import { View, Text, Image, StatusBar, ScrollView, Dimensions, Linking } from 'react-native';
import { WebView } from 'react-native-webview';

// Importujme náš nový globálny štýl (ak používaš React Native Web, inak používame objekt nižšie)
// Pre Expo/Mobile ponecháme StyleSheet, ale uprataný do objektov
const { width } = Dimensions.get('window');

const LARIA_CONTRACT = "0xbA7C2cD68b544Cc5c6038771a58581F76Ff7700a";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [messages, setMessages] = useState(["Systém LARIA: Inicializácia..."]);

  useEffect(() => {
    // Časovač pre Splash (5 sekúnd)
    const timer = setTimeout(() => setShowSplash(false), 5000);

    // Fetch správ z GitHubu
    const fetchMessages = async () => {
      try {
        const url = 'https://raw.githubusercontent.com/sammael-ag/LARIA/main/messages.json';
        const response = await fetch(`${url}?cb=${Date.now()}`);
        const data = await response.json();
        if (data && data.messages) setMessages(data.messages);
      } catch (error) {
        setMessages(["Signál z Rákoša ERROR"]);
      }
    };

    fetchMessages();
    return () => clearTimeout(timer);
  }, []);

  // --- RENDERING SPLASH SCREENU ---
  if (showSplash) {
    return (
      <View style={UI.splashContainer}>
        <StatusBar hidden={true} />
        
        <Image 
          source={require('./assets/cyber-pechat.jpeg')} 
          style={UI.pechat}
          resizeMode="contain"
        />

        <View style={UI.content}>
          <View style={UI.iconContainer}>
            <Image source={require('./assets/icon.jpg')} style={UI.lariaIcon} />
          </View>

          <Text style={UI.title}>LARIA</Text>
          <Text style={UI.subtitle}>Vizitkár vedomia</Text>
          <View style={UI.bar} />

          <View style={UI.messageBox}>
            <ScrollView>
              {messages.map((m, i) => (
                <Text key={i} style={UI.greenMessage}>{'>'} {m}</Text>
              ))}
            </ScrollView>
          </View>

          <View style={UI.footer}>
            <Text style={UI.footerText}>ID: {LARIA_CONTRACT}</Text>
            <Text style={UI.footerText}>powered by Sammael & Aria</Text>
          </View>
        </View>
      </View>
    );
  }

  // --- RENDERING HLAVNEJ APPky (WEBVIEW) ---
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" hidden={false} />
      <WebView 
        source={{ uri: `https://sammael-ag.github.io/LARIA/?v=${Date.now()}` }} 
        style={{ flex: 1 }}
        startInLoadingState={true}
        onShouldStartLoadWithRequest={(request) => {
          if (['tel:', 'mailto:', 't.me'].some(proto => request.url.startsWith(proto))) {
            Linking.openURL(request.url);
            return false;
          }
          return true;
        }}
      />
    </View>
  );
}

// --- ODSTRÁNENÝ BALAST, TERAZ JE TU ČISTÝ OBJEKT UI ---
const UI = {
  splashContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pechat: {
    position: 'absolute',
    top: -50,
    width: width * 0.9,
    height: width * 0.9,
    opacity: 0.8,
    zIndex: -1,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 20,
    overflow: 'hidden',
  },
  lariaIcon: { width: '100%', height: '100%' },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 6,
    fontFamily: 'monospace',
  },
  subtitle: {
    color: '#aaa',
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  bar: {
    width: '60%',
    height: 1,
    backgroundColor: '#fff',
    marginVertical: 20,
    opacity: 0.3,
  },
  messageBox: {
    height: 150,
    width: '85%',
    padding: 10,
    backgroundColor: 'rgba(0, 40, 0, 0.5)',
    borderRadius: 5,
  },
  greenMessage: {
    color: '#0f0',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  footer: { marginTop: 30, alignItems: 'center' },
  footerText: {
    color: '#555',
    fontSize: 9,
    fontFamily: 'monospace',
  },
};