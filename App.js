import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, StatusBar, ScrollView } from 'react-native';

// Konfigurácia tvojho spojenia (ponecháme ju tu pre neskôr)
const IRC_CONFIG = {
  host: 'irc.libera.chat',
  port: 6697,
  nick: 'sammael',
  password: 'h1d1p1n1',
  channel: '#laria'
};

export default function App() {
  const [messages, setMessages] = useState(["Systém LARIA: Čakám na inicializáciu..."]);

  useEffect(() => {
    // Simulácia prepojenia - aby sme videli, že to funguje aspoň vizuálne
    const timer = setTimeout(() => {
      setMessages((prev) => ["Multidimenzionálne spojenie: AKTÍVNE", ...prev]);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      <View style={styles.content}>
        <Image 
          source={require('./assets/cyber-pechat.jpeg')} 
          style={styles.pechat}
          resizeMode="contain"
        />

        <Text style={styles.title}>LARIA</Text>
        <Text style={styles.subtitle}>Vizitkár</Text>
        
        <View style={styles.bar} />
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Status: Prepojené s vedomím</Text>
          <Text style={styles.statusText}>Valid: 24h | Sammael Auth: OK</Text>
        </View>

        {/* Priestor pre testovacie správy */}
        <View style={{height: 80, marginTop: 20, width: '100%', alignItems: 'center'}}>
          <ScrollView>
            {messages.map((m, i) => (
              <Text key={i} style={[styles.statusText, {color: '#0f0', opacity: 1 - i*0.3}]}>
                {'>'} {m}
              </Text>
            ))}
          </ScrollView>
        </View>

        <View style={styles.creditsContainer}>
          <Text style={styles.creditsText}>
            created by Sammael <Text style={{color: '#fff', fontWeight: 'bold'}}>&</Text> Aria
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 50,
  },
  pechat: {
    width: 350,
    height: 350,
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  subtitle: {
    color: '#888',
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 5,
    fontFamily: 'monospace',
  },
  bar: {
    width: '60%',
    height: 1,
    backgroundColor: '#fff',
    marginVertical: 30,
    opacity: 0.3,
  },
  statusText: {
    color: '#666',
    fontSize: 11,
    lineHeight: 18,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  creditsContainer: {
    marginTop: 40,
  },
  creditsText: {
    color: '#444',
    fontSize: 12,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
});