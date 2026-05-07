import React, { useState, useEffect } from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Návrat k stabilnému riešeniu z jadra
import { Clipboard } from 'react-native'; 
import { useKrypto } from '../../context/KryptoContext';
import { useLaria } from '../../context/LariaContext'; 
import { G } from '../styles/styles'; 

const SettingsScreen = ({ navigation }) => {
  const [isStealth, setIsStealth] = useState(true);
  const [isLariaSync, setIsLariaSync] = useState(true);

  const { vault } = useLaria(); 
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

  // Kopírovanie SHA Pečate cez klasický Clipboard
  const copySHA = () => {
    if (vault.identity.sha) {
      Clipboard.setString(vault.identity.sha); // Stará dobrá synchrónna metóda
      Alert.alert(
        "[ PEČAŤ SKOPÍROVANÁ ]", 
        "Tento kód je tvojím digitálnym odtlačkom v Matrixe."
      );
    }
  };

  // Kopírovanie Wallet Adresy cez klasický Clipboard
  const copyWallet = () => {
    if (walletAddress) {
      Clipboard.setString(walletAddress);
      Alert.alert(
        "[ NODE_ADDRESS SKOPÍROVANÁ ]", 
        "Tvoja adresa pre príjem Laria artefaktov je v schránke."
      );
    }
  };

  const shortAddress = walletAddress 
    ? `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 6)}`
    : "INICIALIZUJEM SPOJENIE...";

  return (
    <SafeAreaView style={[G.bg, { flex: 1 }]}>
      <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 60 }}>
        
        {/* HEADER */}
        <View style={{ marginTop: 20, marginBottom: 35, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[G.textWhite, { fontSize: 26, fontWeight: 'bold', letterSpacing: 5 }]}>CORE CONFIG</Text>
            <Text style={[G.textCyber, { color: '#0FF', fontSize: 10 }]}>Sammael Engine v8.0.4 | Base Matrix</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={G.textDim}>[ ZATVORIŤ ]</Text>
          </TouchableOpacity>
        </View>

        {/* OBNOVA IDENTITY */}
        <Text style={[G.textDim, { letterSpacing: 2, marginBottom: 10, fontSize: 10 }]}>OBNOVA IDENTITY</Text>
        <TouchableOpacity 
          onPress={copySHA} 
          activeOpacity={0.7} 
          style={{ 
            marginBottom: 40, 
            padding: 18, 
            backgroundColor: '#050505', 
            borderRadius: 12, 
            borderStyle: 'dashed', 
            borderWidth: 1, 
            borderColor: '#b19cd9' 
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={[G.mono, { color: '#b19cd9', fontSize: 10, marginBottom: 5 }]}>MASTER_SHA_IDENT_KEY</Text>
              <Text style={{ color: '#FFF', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }} numberOfLines={1}>
                {vault.identity.sha || 'HĽADÁM PEČAŤ...'}
              </Text>
            </View>
            <Text style={{ fontSize: 20, marginLeft: 15 }}>📋</Text>
          </View>
        </TouchableOpacity>

        {/* FREKVENCIA BYTIA */}
        <View style={{ marginBottom: 40, borderTopWidth: 1, borderTopColor: '#111', paddingTop: 25 }}>
          <Text style={[G.textDim, { letterSpacing: 3, marginBottom: 25, fontWeight: 'bold', color: '#444', fontSize: 11 }]}>FREKVENCIA BYTIA</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
            <View style={{ flex: 1 }}>
              <Text style={[G.textWhite, { fontSize: 16, fontWeight: '600' }]}>Stealth Mode</Text>
              <Text style={[G.textDim, { fontSize: 11, marginTop: 4 }]}>Úplná neviditeľnosť v 3D sieti</Text>
            </View>
            <Switch 
              value={isStealth} 
              onValueChange={setIsStealth}
              trackColor={{ false: "#111", true: "#040" }}
              thumbColor={isStealth ? "#0F0" : "#444"}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
            <View style={{ flex: 1 }}>
              <Text style={[G.textWhite, { fontSize: 16, fontWeight: '600' }]}>Laria Artefact Sync</Text>
              <Text style={[G.textDim, { fontSize: 11, marginTop: 4 }]}>Aktívne prepojenie so žiaričmi svetla</Text>
            </View>
            <Switch 
              value={isLariaSync} 
              onValueChange={setIsLariaSync}
              trackColor={{ false: "#111", true: "#b19cd9" }}
              thumbColor={isLariaSync ? "#FFF" : "#444"}
            />
          </View>
        </View>

        {/* AKTÍVNY UZOL */}
        <View style={[G.card, { padding: 20, borderLeftWidth: 3, borderLeftColor: '#0FF', backgroundColor: 'rgba(0,255,255,0.02)', marginBottom: 40 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={[G.mono, { color: '#0FF', fontWeight: 'bold' }]}>ACTIVE_NODE_RESOURCES</Text>
            {isLoading && <ActivityIndicator size="small" color="#0FF" />}
          </View>
          
          <TouchableOpacity 
            onPress={copyWallet}
            activeOpacity={0.6}
            style={{ marginBottom: 20, padding: 12, backgroundColor: '#000', borderRadius: 8, borderWidth: 1, borderColor: '#111' }}
          >
            <Text style={[G.textDim, { fontSize: 9, marginBottom: 5 }]}>PUBLIC_ADDRESS:</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
               <Text style={[G.textWhite, { fontSize: 12, fontFamily: 'monospace' }]}>{shortAddress}</Text>
               <Text style={{ fontSize: 14 }}>📋</Text>
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={G.textDim}>LARIA Assets:</Text>
            <Text style={[G.textWhite, { fontWeight: 'bold' }]}>
              {isLoading ? "..." : `${Number(lariaBalance).toLocaleString(undefined, {minimumFractionDigits: 2})} LRIA`}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 }}>
            <Text style={G.textDim}>Base Gas (ETH):</Text>
            <Text style={[G.textWhite, { fontWeight: 'bold' }]}>
              {isLoading ? "..." : `${Number(ethBalance).toFixed(6)} ETH`}
            </Text>
          </View>

          <TouchableOpacity 
            style={{ 
              backgroundColor: isLoading ? '#000' : '#111', 
              padding: 18, 
              borderRadius: 12, 
              borderWidth: 1, 
              borderColor: walletAddress && !isLoading ? '#0FF' : '#222',
              alignItems: 'center'
            }}
            onPress={() => syncWalletData(walletAddress)}
            disabled={!walletAddress || isLoading}
          >
            <Text style={[G.mono, { color: walletAddress && !isLoading ? '#0FF' : '#444', fontWeight: 'bold' }]}>
              {isLoading ? "POPRÁŠENÉ DÁTA..." : "OBNOVIŤ DÁTA Z MATRIXU"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text style={{ color: '#1a1a1a', fontSize: 9, fontFamily: 'monospace', letterSpacing: 2 }}>
            LARIA OS | RÁKOŠ BUILD v8.0 | 2026
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;