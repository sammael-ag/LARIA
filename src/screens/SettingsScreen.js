import React, { useState, useEffect } from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useKrypto } from '../../context/KryptoContext';
import { G } from '../styles/styles'; 

const SettingsScreen = () => {
  const [isStealth, setIsStealth] = useState(true);
  const [isLariaSync, setIsLariaSync] = useState(true);

  const { 
    lariaBalance, 
    ethBalance, 
    walletAddress, 
    isLoading, 
    syncWalletData 
  } = useKrypto();

  useEffect(() => {
    if (walletAddress) {
      syncWalletData(walletAddress);
    }
  }, [walletAddress]);

  const shortAddress = walletAddress 
    ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
    : "ČAKÁM NA AKTIVÁCIU IDENTITY";

  return (
    <ScrollView style={[G.bg, { padding: 25 }]}>
      
      {/* HEADER CONFIGURATION */}
      <View style={{ marginTop: 40, marginBottom: 40 }}>
        <Text style={[G.textWhite, { fontSize: 24, fontWeight: 'bold', letterSpacing: 5 }]}>CORE CONFIG</Text>
        <Text style={[G.textDim, { marginTop: 5, fontSize: 10 }]}>Sammael Engine v1.0.4 | Base Matrix</Text>
      </View>

      {/* SEKCIA: FREKVENCIA BYTIA */}
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

      {/* SEKCIA: WALLET & TOKENY (ZROVNANÝ VIZUÁL) */}
      <View style={[G.card, { padding: 20, borderTopWidth: 2, borderTopColor: '#0FF', marginBottom: 40 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <Text style={[G.mono, { color: '#0FF' }]}>USER ASSETS</Text>
          {isLoading && <ActivityIndicator size="small" color="#0FF" />}
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={G.textDim}>Active Node:</Text>
          <Text style={[G.textWhite, { fontSize: 11 }]}>{shortAddress}</Text>
        </View>

        {/* LARIA BALANCE - TERAZ IDENTICKÝ S ETH STYLE */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={G.textDim}>LARIA Balance:</Text>
          <Text style={G.textWhite}>
            {isLoading ? "..." : `${Number(lariaBalance).toFixed(5)} LARIA`}
          </Text>
        </View>

        {/* ETH BALANCE */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <Text style={G.textDim}>Base Gas (ETH):</Text>
          <Text style={G.textWhite}>
            {isLoading ? "..." : `${Number(ethBalance).toFixed(5)} ETH`}
          </Text>
        </View>

        <TouchableOpacity 
          style={{ 
            backgroundColor: '#111', 
            padding: 15, 
            borderRadius: 5, 
            borderWidth: 1, 
            borderColor: walletAddress && !isLoading ? '#0FF' : '#222',
            alignItems: 'center' 
          }}
          onPress={() => syncWalletData(walletAddress)}
          disabled={!walletAddress || isLoading}
        >
          <Text style={[G.mono, { color: walletAddress && !isLoading ? '#FFF' : '#444' }]}>
            {isLoading ? "SYNCING..." : "REFRESH USER DATA"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* SEKCIA: OCHRANA */}
      <View style={{ marginBottom: 40, borderTopWidth: 1, borderTopColor: '#111', paddingTop: 20 }}>
        <Text style={[G.textDim, { letterSpacing: 2, marginBottom: 20, fontWeight: 'bold' }]}>SECURITY PROTOCOL</Text>
        <Text style={[G.textCyber, { fontSize: 11, marginBottom: 10, opacity: 0.8 }]}>Base Mainnet: Active</Text>
        <Text style={[G.textCyber, { fontSize: 11, marginBottom: 10, opacity: 0.8 }]}>Gateway: Verified</Text>
      </View>

      <View style={{ alignItems: 'center', paddingBottom: 50 }}>
        <Text style={{ color: '#222', fontSize: 9, fontFamily: 'monospace' }}>
          LARIA OS | Rákoš Build 2026
        </Text>
      </View>

    </ScrollView>
  );
};

export default SettingsScreen;