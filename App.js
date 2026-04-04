import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, StatusBar, ScrollView, Dimensions, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');

export default function App() {
  // --- NASTAVENIA A STAV ---
  const [messages, setMessages] = useState(["Systém LARIA: Inicializácia..."]);
  const [isDarkMode, setIsDarkMode] = useState(true); // Prepínač medzi tmaveou a svetlou verziou

  // --- NAŠA POSVÄTNÁ ADRESA LARIA (Prepojená) ---
  const LARIA_CONTRACT = "0xbA7C2cD68b544Cc5c6038771a58581F76Ff7700a";

  // Dynamické farby podľa režimu
  const theme = {
    bg: isDarkMode ? '#000' : '#fff',
    title: isDarkMode ? '#fff' : '#000',
    subtext: isDarkMode ? '#aaa' : '#555',
    messageboxBg: isDarkMode ? 'rgba(0, 50, 0, 0.4)' : '#f5f5f5',
    messageText: isDarkMode ? '#0f0' : '#222',
  };

  // --- LOGIKA FETCHINGU ---
  useEffect(() => {
    let isMounted = true;
    const fetchMessages = async () => {
      try {
        const url = 'https://raw.githubusercontent.com/sammael-ag/LARIA/main/messages.json';
        const response = await fetch(`${url}?cb=${Date.now()}`);
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        if (isMounted && data && data.messages) {
          setMessages(data.messages);
        }
      } catch (error) {
        if (isMounted) {
          setMessages(["Čakám na LARIA signál..."]);
        }
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 15000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar hidden={true} />
      
      {/* NENÁPADNÝ PREPÍNAČ (Ťukni na vrch obrazovky pre zmenu režimu) */}
      <TouchableOpacity 
        style={styles.themeToggle} 
        onPress={() => setIsDarkMode(!isDarkMode)}
      >
        <Text style={{ color: theme.subtext, fontSize: 10 }}>{isDarkMode ? "LIGHT MODE" : "DARK MODE"}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        
        {/* PEČAŤ - v light mode jemne viditeľná (vodoznak) */}
        <Image 
          source={require('./assets/cyber-pechat.jpeg')} 
          style={[styles.pechat, { opacity: isDarkMode ? 1 : 0.3 }]}
          resizeMode="contain"
        />

        <View style={styles.infoContainer}>
            {/* TU VKLADÁME TVOJU IKONKU ŽIARIČA */}
            <View style={styles.iconContainer}>
              <Image 
                source={require('./assets/icon.jpg')} // !!! SKONTROLUJ NÁZOV SÚBORU !!!
                style={styles.lariaIcon}
                resizeMode="cover" // Nech to pekne vyplní kruh
              />
            </View>

            <Text style={[styles.title, { color: theme.title }]}>LARIA</Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>Vizitkár</Text>
            
            <View style={[styles.bar, { backgroundColor: theme.title }]} />
            
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, { color: theme.subtext }]}>Sammael Hudec</Text>
              <Text style={[styles.statusText, { color: theme.subtext }]}>Stolár | Rezbár svetla | Ovocinár</Text>
            </View>
        </View>

        {/* MESSAGE BOX */}
        <View style={[styles.messageBox, { backgroundColor: theme.messageboxBg }]}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {messages.map((m, i) => (
              <View key={i} style={styles.messageRow}>
                <Text style={[styles.greenMessage, { color: theme.messageText }]}>
                  {'>'} {m}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.creditsContainer}>
          <Text style={[styles.creditsText, { color: theme.subtext }]}>
            ID: {LARIA_CONTRACT}
          </Text>
          <Text style={[styles.creditsText, { color: theme.subtext, marginTop: 5 }]}>
            created by Sammael & Aria
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggle: {
    position: 'absolute',
    top: 40,
    padding: 10,
    zIndex: 10,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  pechat: {
    position: 'absolute', // Pečať bude v pozadí
    top: -50,
    width: width * 0.9,
    height: width * 0.9,
    zIndex: -1, // Nech je pečať pod textom a ikonou
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 40, // Trochu miesta pod pečaťou
  },
    iconContainer: {
    width: 120,             // Dal som 120, aby ten tvoj žiarič vynikol
    height: 120,
    borderWidth: 2,
    borderColor: '#fff',    // Tvoje biele lemovanie
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    overflow: 'hidden',     // Toto zabezpečí, že ikonka nepretečie cez lem
  },
  lariaIcon: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 3,
    fontFamily: 'monospace',
  },
  bar: {
    width: '60%',
    height: 1,
    marginVertical: 15,
    opacity: 0.2,
  },
  statusContainer: {
    marginBottom: 15,
  },
  statusText: {
    fontSize: 10,
    lineHeight: 18,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  messageBox: {
    height: 140,
    width: '85%',
    padding: 10,
    borderRadius: 8,
  },
  scrollContent: {
    width: '100%',
  },
  messageRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 5,
  },
  greenMessage: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'monospace',
    flex: 1,
    flexWrap: 'wrap',
  },
  creditsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  creditsText: {
    fontSize: 9,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
});