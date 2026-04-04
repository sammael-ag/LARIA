import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, StatusBar, ScrollView, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

export default function App() {
  const [showSplash, setShowSplash] = useState(true); // Prepínač medzi Splashom a Webom
  const [messages, setMessages] = useState(["Systém LARIA: Inicializácia..."]);
  const LARIA_CONTRACT = "0xbA7C2cD68b544Cc5c6038771a58581F76Ff7700a";

  useEffect(() => {
    // 1. Časovač na 5 sekúnd pre Splash
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    // 2. Fetch správ z GitHubu
    const fetchMessages = async () => {
      try {
        const url = 'https://raw.githubusercontent.com/sammael-ag/LARIA/main/messages.json';
        const response = await fetch(`${url}?cb=${Date.now()}`);
        const data = await response.json();
        if (data && data.messages) setMessages(data.messages);
      } catch (error) {
        setMessages(["Signál z Rákoša aktívny..."]);
      }
    };

    fetchMessages();
    return () => clearTimeout(timer); // Vyčistenie po zatvorení
  }, []);

  // --- LOGIKA ZOBRAZENIA ---

  // Ak beží Splash (prvých 5 sekúnd)
  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar hidden={true} />
        
        <Image 
          source={require('./assets/cyber-pechat.jpeg')} 
          style={styles.pechat}
          resizeMode="contain"
        />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {/* Skontrolovala som cestu - v tvojom kóde bol icon.png */}
            <Image source={require('./assets/icon.png')} style={styles.lariaIcon} />
          </View>

          <Text style={styles.title}>LARIA</Text>
          <Text style={styles.subtitle}>Vizitkár vedomia</Text>
          <View style={styles.bar} />

          <View style={styles.messageBox}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {messages.map((m, i) => (
                <View key={i} style={styles.messageRow}>
                  <Text style={styles.greenMessage}>{'>'} {m}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>ID: {LARIA_CONTRACT}</Text>
            <Text style={styles.footerText}>connecting to multidimensionality...</Text>
          </View>
        </View>
      </View>
    );
  }

  // Ak už Splash skončil, zobrazíme webové Telo
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" hidden={false} />
      <WebView 
        source={{ uri: 'https://sammael-ag.github.io/LARIA/' }} 
        style={{ flex: 1 }}
        startInLoadingState={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  lariaIcon: {
    width: '100%',
    height: '100%',
  },
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
  messageRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 5,
  },
  greenMessage: {
    color: '#0f0',
    fontSize: 11,
    fontFamily: 'monospace',
    flex: 1,
    flexWrap: 'wrap',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#555',
    fontSize: 9,
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});