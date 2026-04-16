import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

const DashboardScreen = ({ navigation }) => {
  // Funkcia na vytvorenie dlaždice (aby sme neopakovali kód)
  const MenuCard = ({ title, icon, target, description }) => (
    <TouchableOpacity 
      style={UI.card} 
      onPress={() => navigation.navigate(target)}
      activeOpacity={0.7}
    >
      <View style={UI.iconPlaceholder}>
        <Text style={UI.iconText}>{icon}</Text>
      </View>
      <View>
        <Text style={UI.cardTitle}>{title}</Text>
        <Text style={UI.cardDesc}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={UI.container}>
      <ScrollView contentContainerStyle={UI.scrollContent}>
        <View style={UI.header}>
          <Text style={UI.welcomeText}>ATELIÉR LARIA</Text>
          <Text style={UI.userText}>Sammael | Master Mode</Text>
        </View>

        <View style={UI.grid}>
          <MenuCard 
            title="IRC CHAT" 
            icon="📟" 
            target="IRC" 
            description="Šifrovaná linka do ticha"
          />
          <MenuCard 
            title="MOJA KARTA" 
            icon="🆔" 
            target="Card" 
            description="Digitálna pečať identity"
          />
          <MenuCard 
            title="OBJEKTY" 
            icon="🔮" 
            target="Settings" // Zatiaľ dáme nastavenia, kým nemáme screen
            description="Artefakty a žiariče"
          />
          <MenuCard 
            title="CORE CONFIG" 
            icon="⚙️" 
            target="Settings" 
            description="Nastavenia tvojho bytia"
          />
        </View>

        <View style={UI.footer}>
          <Text style={UI.footerText}>Všetky systémy sú nominálne.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const UI = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  scrollContent: { padding: 25 },
  header: { marginTop: 40, marginBottom: 40 },
  welcomeText: { color: '#FFF', fontSize: 24, fontWeight: 'bold', letterSpacing: 5, fontFamily: 'monospace' },
  userText: { color: '#0F0', fontSize: 10, fontFamily: 'monospace', marginTop: 5, opacity: 0.8 },
  grid: { gap: 20 },
  card: { 
    backgroundColor: '#111', 
    padding: 20, 
    borderRadius: 15, 
    flexDirection: 'row', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a'
  },
  iconPlaceholder: { 
    width: 50, 
    height: 50, 
    backgroundColor: '#000', 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 1,
    borderColor: '#222'
  },
  iconText: { fontSize: 20 },
  cardTitle: { color: '#AAA', fontSize: 16, fontWeight: 'bold', fontFamily: 'monospace' },
  cardDesc: { color: '#444', fontSize: 10, fontFamily: 'monospace', marginTop: 2 },
  footer: { marginTop: 50, alignItems: 'center' },
  footerText: { color: '#222', fontSize: 10, fontFamily: 'monospace' }
});

export default DashboardScreen;