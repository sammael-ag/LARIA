import React, { useState, useEffect } from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useKrypto } from '../../context/KryptoContext';
import { G } from '../styles/styles'; 

const SettingsScreen = () => {
  const [isStealth, setIsStealth] = useState(true);
  const [isLariaSync, setIsLariaSync] = useState(true);

  // Vytiahneme živé dáta a funkciu na synchronizáciu
  const { 
    lariaBalance, 
    ethBalance, 
    walletAddress, 
    isLoading, 
    syncWalletData 
  } = useKrypto();

  // Automatická synchronizácia pri otvorení obrazovky
  useEffect(() => {
    syncWalletData(); // Ak nemáme adresu, použije sa majiteľ z configu
  }, []);

  // Formátovanie adresy pre zobrazenie (skrátenie)
  const shortAddress = walletAddress 
    ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
    : "Nepripojené";

  return (
    <ScrollView style={[G.bg, { padding: 25 }]}>
      {/* HEADER CONFIGURATION */}
      <View style={{ marginTop: 40, marginBottom: 40 }}>
        <Text style={[G.textWhite, { fontSize: 24, fontWeight: 'bold', letterSpacing: 5 }]}>CORE CONFIG</Text>
        <Text style={[G.textDim, { marginTop: 5, fontSize: 10 }]}>Sammael Engine v1.0.4 | Base Matrix</Text>
      </View>

      {/* Sekcia Multidimenzionality */}
      <View style={{ marginBottom: 40, borderTopWidth: 1, borderTopColor: '#111', paddingTop: 20 }}>
        <Text style={[G.textDim, { letterSpacing: 2, marginBottom: 20, fontWeight: 'bold' }]}>FREKVENCIA BYTIA</Text>
        
        {/* Stealth Mode */}
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

        {/* Laria Sync */}
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

      {/* SEKCIA WALLET & TOKENY */}
      <View style={[G.card, { padding: 20, borderTopWidth: 2, borderTopColor: '#0FF', marginBottom: 40 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <Text style={[G.mono, { color: '#0FF' }]}>SYSTEM ASSETS</Text>
          {isLoading && <ActivityIndicator size="small" color="#0FF" />}
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={G.textDim}>Address:</Text>
          <Text style={[G.textWhite, { fontSize: 12 }]}>{shortAddress}</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={G.textDim}>LARIA Balance:</Text>
          <Text style={[G.textWhite, { fontWeight: 'bold' }]}>
            {isLoading ? "Synchronizujem..." : `${parseFloat(lariaBalance).toLocaleString()} LARIA`}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <Text style={G.textDim}>Base Gas (ETH):</Text>
          <Text style={G.textWhite}>{isLoading ? "..." : `${ethBalance} ETH`}</Text>
        </View>

        <TouchableOpacity 
          style={{ 
            backgroundColor: '#111', 
            padding: 15, 
            borderRadius: 5, 
            borderWidth: 1, 
            borderColor: isLoading ? '#222' : '#0FF',
            alignItems: 'center' 
          }}
          onPress={() => syncWalletData()}
          disabled={isLoading}
        >
          <Text style={[G.mono, { color: isLoading ? '#444' : '#FFF' }]}>
            {isLoading ? "CONNECTING MATRIX..." : "REFRESH SYNC"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sekcia Ochrany */}
      <View style={{ marginBottom: 40, borderTopWidth: 1, borderTopColor: '#111', paddingTop: 20 }}>
        <Text style={[G.textDim, { letterSpacing: 2, marginBottom: 20, fontWeight: 'bold' }]}>SECURITY PROTOCOL</Text>
        <Text style={[G.textCyber, { fontSize: 11, marginBottom: 10, opacity: 0.8 }]}>Base Mainnet: Active</Text>
        <Text style={[G.textCyber, { fontSize: 11, marginBottom: 10, opacity: 0.8 }]}>Gateway: Verified</Text>
      </View>

      {/* FOOTER */}
      <View style={{ alignItems: 'center', paddingBottom: 50 }}>
        <Text style={{ color: '#222', fontSize: 9, fontFamily: 'monospace' }}>LARIA OS | Rákoš Build 2026</Text>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;