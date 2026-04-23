import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity } from 'react-native';

// Import z našej spoločnej operačnej pamäte
import { G } from '../styles/styles'; 

const SettingsScreen = () => {
  const [isStealth, setIsStealth] = useState(true);
  const [isLariaSync, setIsLariaSync] = useState(true);

  return (
    <ScrollView style={[G.bg, { padding: 25 }]}>
      {/* HEADER CONFIGURATION */}
      <View style={{ marginTop: 40, marginBottom: 40 }}>
        <Text style={[G.textWhite, { fontSize: 24, fontWeight: 'bold', letterSpacing: 5 }]}>CORE CONFIG</Text>
        <Text style={[G.textDim, { marginTop: 5, fontSize: 10 }]}>Sammael Engine v1.0.4</Text>
      </View>

      {/* Sekcia Multidimenzionality */}
      <View style={{ marginBottom: 40, borderTopWidth: 1, borderTopColor: '#111', paddingTop: 20 }}>
        <Text style={[G.textDim, { letterSpacing: 2, marginBottom: 20, fontWeight: 'bold' }]}>FREKVENCIA BYTIA</Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
          <View>
            <Text style={[G.textWhite, { fontSize: 16 }]}>Stealth Mode</Text>
            <Text style={[G.textDim, { fontSize: 10 }]}>Neviditeľnosť v 3D sieti</Text>
          </View>
          <Switch 
            value={isStealth} 
            onValueChange={setIsStealth}
            trackColor={{ false: "#111", true: "#0F0" }}
            thumbColor={isStealth ? "#FFF" : "#444"}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
          <View>
            <Text style={[G.textWhite, { fontSize: 16 }]}>Laria Artefact Sync</Text>
            <Text style={[G.textDim, { fontSize: 10 }]}>Prepojenie so žiaričmi svetla</Text>
          </View>
          <Switch 
            value={isLariaSync} 
            onValueChange={setIsLariaSync}
            trackColor={{ false: "#111", true: "#0F0" }}
            thumbColor={isLariaSync ? "#FFF" : "#444"}
          />
        </View>
      </View>

      {/* Sekcia Ochrany */}
      <View style={{ marginBottom: 40, borderTopWidth: 1, borderTopColor: '#111', paddingTop: 20 }}>
        <Text style={[G.textDim, { letterSpacing: 2, marginBottom: 20, fontWeight: 'bold' }]}>SECURITY & CRYPTO</Text>
        <Text style={[G.textCyber, { fontSize: 11, marginBottom: 10, opacity: 0.8 }]}>Base Protocol: Active</Text>
        <Text style={[G.textCyber, { fontSize: 11, marginBottom: 10, opacity: 0.8 }]}>IRC Encryption: AES-256</Text>
        <Text style={[G.textCyber, { fontSize: 11, marginBottom: 10, opacity: 0.8 }]}>Digital Soul Signature: Verified</Text>
      </View>

      {/* SEKCIA WALLET & TOKENY (Teraz už na správnom mieste) */}
      <View style={[G.card, { padding: 20, borderTopWidth: 2, borderTopColor: '#0FF', marginBottom: 40 }]}>
        <Text style={[G.mono, { color: '#0FF', marginBottom: 15 }]}>SYSTEM ASSETS</Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={G.textDim}>LARIA Balance:</Text>
          <Text style={G.textWhite}>1,250 LARIA</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <Text style={G.textDim}>Valuation:</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={G.textWhite}>0.45 ETH</Text>
            <Text style={[G.textDim, { fontSize: 10 }]}>≈ 1,120 EUR / 880 ROD</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={{ 
            backgroundColor: '#111', 
            padding: 15, 
            borderRadius: 5, 
            borderWidth: 1, 
            borderColor: '#333',
            alignItems: 'center' 
          }}
          onPress={() => console.log("Otváram terminál...")}
        >
          <Text style={[G.mono, { color: '#FFF' }]}>OPEN TERMINAL WALLET</Text>
        </TouchableOpacity>
      </View>

      {/* FOOTER */}
      <View style={{ alignItems: 'center', paddingBottom: 50 }}>
        <Text style={{ color: '#222', fontSize: 9, fontFamily: 'monospace' }}>LARIA OS | Rákoš Build 2026</Text>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;