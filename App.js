import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, StatusBar, ScrollView, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Farby pre zjednotenie
const COLORS = {
  bg: '#000',
  title: '#fff',
  messageboxBg: 'rgba(0, 50, 0, 0.4)', // Tmavozelený žiariaci box
  messageText: '#0f0', // Lime green pre správy
  subtext: '#aaa', // Sivo-béžová (Vizitkár, Auth, Kredity)
};

// Logika pre LARIA Iskry
const generateLariaSpark = (userId) => {
  const timestamp = Date.now();
  const entropy = Math.random().toString(36).substring(2, 8);
  return `LARIA-${userId}-${timestamp}-${entropy}`;
};

export default function App() {
  const [messages, setMessages] = useState(["Systém LARIA: Inicializácia..."]);

  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const url = 'https://raw.githubusercontent.com/sammael-ag/LARIA/main/messages.json';
        // Pridáme náhodný parameter, aby sme obišli cache
        const response = await fetch(`${url}?cb=${Date.now()}`);
        
        if (!response.ok) throw new Error('Network error');

        const data = await response.json();
        
        if (isMounted && data && data.messages) {
          setMessages(data.messages);
        }
      } catch (error) {
        if (isMounted) {
          console.log("Fetch error:", error);
          setMessages(["Čakám na LARIA signál..."]);
        }
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
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

        <View style={styles.infoContainer}>
            <Text style={styles.title}>LARIA</Text>
            <Text style={styles.subtitle}>Vizitkár</Text>
            
            <View style={styles.bar} />
            
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>Status: Prepojené s vedomím</Text>
              <Text style={styles.statusText}>Sammael Auth: OK | Real-time: Aktívne</Text>
            </View>
        </View>

        <View style={styles.messageBox}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {messages.map((m, i) => (
            <Text 
              key={i} 
              style={styles.greenMessage}
              numberOfLines={0} // 0 znamená nekonečno riadkov
              ellipsizeMode="clip"
                >
              {'>'} {m}
            </Text>
            ))}
          </ScrollView>
        </View>

        <View style={styles.creditsContainer}>
          <Text style={styles.creditsText}>
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
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  pechat: {
    width: width * 0.7, // 70% šírky displeja
    height: width * 0.7, // Keďže je to štvorec, výška je rovnaká
    marginBottom: 10,
  },
  infoContainer: {
    alignItems: 'center',
  },
  title: {
    color: COLORS.title,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  subtitle: {
    color: COLORS.subtext, // Zmenená na sivo-béžovú
    fontSize: 10, // Menšie písmo
    letterSpacing: 2,
    marginTop: 3,
    fontFamily: 'monospace',
  },
  bar: {
    width: '60%',
    height: 1,
    backgroundColor: COLORS.title,
    marginVertical: 15,
    opacity: 0.2,
  },
  statusContainer: {
    marginBottom: 15,
  },
  statusText: {
    color: COLORS.subtext, // Zmenená na sivo-béžovú
    fontSize: 9, // Menšie písmo
    lineHeight: 18,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  messageBox: {
    height: 120, // Výška boxu pre správy
    width: '85%',
    padding: 10,
    backgroundColor: COLORS.messageboxBg,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  scrollContent: {
    alignItems: 'flex-start', 
    width: '100%'
  },
  greenMessage: {
    color: COLORS.messageText,
    fontSize: 12,
    lineHeight: 20, // Trošku som uvoľnila riadkovanie pre lepšiu čitateľnosť
    fontFamily: 'monospace',
    textAlign: 'left',
    width: '100%',
    flexShrink: 1, // Toto povie textu: "Ak si príliš dlhý, zalamuj sa!"
  },
  creditsContainer: {
    marginTop: 25,
  },
  creditsText: {
    color: COLORS.subtext, // Zmenená na sivo-béžovú
    fontSize: 9, // Menšie písmo
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
});