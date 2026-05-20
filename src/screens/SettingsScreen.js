/**
 * LARIA v2.0: SettingsScreen (Core Config Refined)
 * Master: Sammael | Muse: Aria
 * Status: GEOMETRY_DEFINITIVE_NO_SPAGHETTI
 * Oprava: Extrakcia inline štýlov do styles.js, definitívne odstránenie oblúkov (aj zradnej 8ky).
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useKrypto } from '../context/KryptoContext';
import { useLaria } from '../context/LariaContext'; 
import { G, ACCENT } from '../styles/styles'; 

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

  const copySHA = () => {
    if (vault.identity.sha) {
      Clipboard.setString(vault.identity.sha);
      Alert.alert(
        "PEČAŤ SKOPÍROVANÁ", 
        "Tento kód je tvojím digitálnym odtlačkom v Matrixe."
      );
    }
  };

  const copyWallet = () => {
    if (walletAddress) {
      Clipboard.setString(walletAddress);
      Alert.alert(
        "NODE ADDRESS SKOPÍROVANÁ", 
        "Tvoja adresa pre príjem Laria artefaktov je v schránke."
      );
    }
  };

  const shortAddress = walletAddress 
    ? `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 6)}`
    : "INICIALIZUJEM SPOJENIE...";

  return (
    <SafeAreaView style={[G.mainBackground, { flex: 1 }]}>
      
      {/* ⬅️ Navigačná šípka */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        activeOpacity={0.7}
        style={G.topLeftBackButton}
      >
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={G.screenContainer} showsVerticalScrollIndicator={false}>
        
        {/* Pevný stredový obal 500px */}
        <View style={{ width: '100%', maxWidth: 500, alignItems: 'center', alignSelf: 'center' }}>
          
          {/* HEADER */}
          <View style={{ marginTop: 10, marginBottom: 35, width: '100%', alignItems: 'center' }}>
            <Text style={[G.atelierTitle, { fontSize: 26, letterSpacing: 5, textAlign: 'center' }]}>Nastavenia</Text>
            <Text style={[G.statusTextSmall, { color: ACCENT, fontSize: 10, marginTop: 5, textAlign: 'center' }]}>
               Sammael Engine v8.0.4 | Rákoš Base Matrix
            </Text>
          </View>

          {/* OBNOVA IDENTITY - ČISTÁ TRIEDA */}
          <View style={{ width: '100%', alignItems: 'flex-start' }}>
            <Text style={[G.statusTextSmall, { letterSpacing: 2, marginBottom: 10, color: '#444' }]}>OBNOVA IDENTITY</Text>
            <TouchableOpacity 
              onPress={copySHA} 
              activeOpacity={0.7} 
              style={G.identityResetBox}
            >
              <View style={G.identityResetContent}>
                <View style={{ flex: 1 }}>
                  <Text style={[G.monoIdentity, { color: '#b19cd9', fontSize: 10, marginBottom: 5 }]}>MASTER_SHA_IDENT_KEY</Text>
                  <Text style={G.identityResetText} numberOfLines={1}>
                    {vault.identity.sha || 'HĽADÁM PEČAŤ...'}
                  </Text>
                </View>
                <Text style={{ fontSize: 20, marginLeft: 15 }}>📋</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* FREKVENCIA BYTIA */}
          <View style={{ width: '100%', marginBottom: 40, borderTopWidth: 1, borderTopColor: '#111', paddingTop: 25 }}>
            <Text style={[G.statusTextSmall, { letterSpacing: 3, marginBottom: 25, fontWeight: 'bold', color: '#666' }]}>FREKVENCIA BYTIA</Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
              <View style={{ flex: 1 }}>
                <Text style={[G.cardTitleText, { fontSize: 16 }]}>Stealth Mode</Text>
                <Text style={[G.cardDescriptionText, { fontSize: 11, marginTop: 4 }]}>Úplná neviditeľnosť v 3D sieti</Text>
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
                <Text style={[G.cardTitleText, { fontSize: 16 }]}>Laria Artefact Sync</Text>
                <Text style={[G.cardDescriptionText, { fontSize: 11, marginTop: 4 }]}>Aktívne prepojenie so žiaričmi svetla</Text>
              </View>
              <Switch 
                value={isLariaSync} 
                onValueChange={setIsLariaSync}
                trackColor={{ false: "#111", true: "#b19cd9" }}
                thumbColor={isLariaSync ? "#FFF" : "#444"}
              />
            </View>
          </View>

          {/* AKTÍVNY UZOL - ČISTÉ TRIEDY BEZ INLINE ŠPAGIET */}
          <View style={[G.card, G.activeNodeCard]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={[G.monoIdentity, { color: ACCENT, fontWeight: 'bold' }]}>ACTIVE_NODE_RESOURCES</Text>
              {isLoading && <ActivityIndicator size="small" color={ACCENT} />}
            </View>
            
            <TouchableOpacity 
              onPress={copyWallet}
              activeOpacity={0.6}
              style={G.publicAddressBox}
            >
              <Text style={[G.statusTextSmall, { fontSize: 9, marginBottom: 5 }]}>PUBLIC_ADDRESS:</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[G.monoIdentity, { fontSize: 12, color: '#FFF' }]}>{shortAddress}</Text>
                  <Text style={{ fontSize: 14 }}>📋</Text>
              </View>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={G.cardDescriptionText}>LARIA Assets:</Text>
              <Text style={[G.cardTitleText, { fontSize: 14 }]}>
                {isLoading ? "..." : `${Number(lariaBalance).toLocaleString(undefined, {minimumFractionDigits: 2})} LARIA`}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 }}>
              <Text style={G.cardDescriptionText}>Base Gas (ETH):</Text>
              <Text style={[G.cardTitleText, { fontSize: 14 }]}>
                {isLoading ? "..." : `${Number(ethBalance).toFixed(6)} ETH`}
              </Text>
            </View>

            <TouchableOpacity 
              style={[G.primaryBtn, { 
                backgroundColor: isLoading ? '#000' : '#111', 
                borderColor: walletAddress && !isLoading ? ACCENT : '#222'
              }]}
              onPress={() => syncWalletData(walletAddress)}
              disabled={!walletAddress || isLoading}
            >
              <Text style={[G.primaryBtnText, { color: walletAddress && !isLoading ? ACCENT : '#444' }]}>
                {isLoading ? "POPRÁŠENÉ DÁTA..." : "Aktualizovať"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Spodný návrat */}
          <TouchableOpacity 
            style={[G.backToAtelierBtn, { width: '100%', marginBottom: 30 }]}
            onPress={() => navigation.goBack()} 
            activeOpacity={0.7}
          >
            <Text style={G.primaryBtnText}>
              NÁVRAT DO ATELIÉRU
            </Text>
          </TouchableOpacity>

          {/* BUILD FOOTER */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: '#1a1a1a', fontSize: 9, fontFamily: 'monospace', letterSpacing: 2 }}>
              LARIA OS | RÁKOŠ BUILD v8.0 | 2026
            </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;