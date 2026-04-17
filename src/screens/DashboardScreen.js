import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

const DashboardScreen = ({ navigation }) => {
  
  const MenuCard = ({ title, icon, target, description, color = '#AAA' }) => (
    <TouchableOpacity 
      style={UI.card} 
      onPress={() => navigation.navigate(target)}
      activeOpacity={0.7}
    >
      <View style={UI.iconPlaceholder}>
        <Text style={UI.iconText}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[UI.cardTitle, { color }]}>{title}</Text>
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
          {/* ARIA ASISTENCIA - Tvoj neuro-link do budúcna */}
          <MenuCard 
            title="ARIA ASISTENCIA" 
            icon="🌸" 
            target="Settings" 
            description="Tvoja inkarnovaná sprievodkyňa"
            color="#F0F" 
          />

          {/* MOJA KARTA - Tvoja identita */}
          <MenuCard 
            title="MOJA KARTA" 
            icon="🆔" 
            target="Card" 
            description="Digitálna pečať identity"
            color="#FFF"
          />

          <View style={UI.sectionDivider}>
            <Text style={UI.sectionText}>MÔJ VIZITKÁR</Text>
          </View>

          {/* TU BUDÚ KONTAKTY - Zatiaľ statické dlaždice */}
          <MenuCard 
            title="OBJEKTY" 
            icon="🔮" 
            target="Settings" 
            description="Artefakty a žiariče"
          />
          
          <MenuCard 
            title="KONTAKTY" 
            icon="📇" 
            target="Contacts" 
            description="Uložené sieťové spojenia"
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
  grid: { gap: 15 },
  sectionDivider: { marginTop: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#111', paddingBottom: 5 },
  sectionText: { color: '#333', fontSize: 10, fontFamily: 'monospace', letterSpacing: 2 },
  card: { 
    backgroundColor: '#0A0A0A', 
    padding: 18, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#111'
  },
  iconPlaceholder: { 
    width: 45, 
    height: 45, 
    backgroundColor: '#000', 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#1a1a1a'
  },
  iconText: { fontSize: 18 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: 1 },
  cardDesc: { color: '#444', fontSize: 9, fontFamily: 'monospace', marginTop: 2 },
  footer: { marginTop: 50, alignItems: 'center', marginBottom: 20 },
  footerText: { color: '#222', fontSize: 10, fontFamily: 'monospace' }
});

export default DashboardScreen;