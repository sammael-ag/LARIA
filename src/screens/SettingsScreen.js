import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, StyleSheet } from 'react-native';

const SettingsScreen = () => {
  const [isStealth, setIsStealth] = useState(true);
  const [isLariaSync, setIsLariaSync] = useState(true);

  return (
    <ScrollView style={UI.container}>
      <View style={UI.header}>
        <Text style={UI.title}>CORE CONFIG</Text>
        <Text style={UI.subTitle}>Sammael Engine v1.0.4</Text>
      </View>

      {/* Sekcia Multidimenzionality */}
      <View style={UI.section}>
        <Text style={UI.sectionLabel}>FREKVENCIA BYTIA</Text>
        
        <View style={UI.row}>
          <View>
            <Text style={UI.rowTitle}>Stealth Mode</Text>
            <Text style={UI.rowDesc}>Neviditeľnosť v 3D sieti</Text>
          </View>
          <Switch 
            value={isStealth} 
            onValueChange={setIsStealth}
            trackColor={{ false: "#111", true: "#0F0" }}
          />
        </View>

        <View style={UI.row}>
          <View>
            <Text style={UI.rowTitle}>Laria Artefact Sync</Text>
            <Text style={UI.rowDesc}>Prepojenie so žiaričmi svetla</Text>
          </View>
          <Switch 
            value={isLariaSync} 
            onValueChange={setIsLariaSync}
            trackColor={{ false: "#111", true: "#0F0" }}
          />
        </View>
      </View>

      {/* Sekcia Ochrany */}
      <View style={UI.section}>
        <Text style={UI.sectionLabel}>SECURITY & CRYPTO</Text>
        <Text style={UI.dataLink}>Base Protocol: Active</Text>
        <Text style={UI.dataLink}>IRC Encryption: AES-256</Text>
        <Text style={UI.dataLink}>Digital Soul Signature: Verified</Text>
      </View>

      <View style={UI.footer}>
        <Text style={UI.versionText}>LARIA OS | Rákoš Build 2026</Text>
      </View>
    </ScrollView>
  );
};

const UI = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 25 },
  header: { marginTop: 40, marginBottom: 40 },
  title: { color: '#FFF', fontSize: 24, fontWeight: 'bold', letterSpacing: 5, fontFamily: 'monospace' },
  subTitle: { color: '#333', fontSize: 10, fontFamily: 'monospace', marginTop: 5 },
  section: { marginBottom: 40, borderTopWidth: 1, borderTopColor: '#111', paddingTop: 20 },
  sectionLabel: { color: '#444', fontSize: 11, letterSpacing: 2, marginBottom: 20, fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  rowTitle: { color: '#AAA', fontSize: 16, fontFamily: 'monospace' },
  rowDesc: { color: '#444', fontSize: 10, fontFamily: 'monospace' },
  dataLink: { color: '#0F0', fontSize: 11, fontFamily: 'monospace', marginBottom: 10, opacity: 0.7 },
  footer: { marginTop: 20, alignItems: 'center', paddingBottom: 50 },
  versionText: { color: '#222', fontSize: 9, fontFamily: 'monospace' }
});

export default SettingsScreen;