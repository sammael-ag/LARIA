import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, BackHandler, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLaria } from '../../context/LariaContext';
import { useKrypto } from '../../context/KryptoContext';
import { G } from '../styles/styles';

const DiagnosticScreen = ({ navigation }) => {
  const { vault, lockSeal } = useLaria();
  const { status, identity } = vault;
  
  // Ťaháme dáta priamo z Krypto jadra
  const { 
    syncWalletData, 
    adminEthBalance, 
    adminLariaBalance, 
    isLoading, 
    ownerAddress 
  } = useKrypto();

  // --- BEZPEČNOSTNÝ PROTOKOL: TERMINÁCIA ---
  const handleSecureLogout = () => {
    lockSeal(); // Vymaže isAdmin status v LariaContext
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    }); 
  };

  // --- POISTKY A AUTOMATIZÁCIA ---
  useEffect(() => {
    // 1. Refresh pri vstupe (ťaháme dáta Majiteľa)
    if (ownerAddress) {
      syncWalletData(ownerAddress);
    }

    // 2. Poistka na hardvérový Back (Android) - nútený bezpečný odchod
    const backAction = () => {
      handleSecureLogout();
      return true; 
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [ownerAddress]);

  // --- OCHRANNÁ BARIÉRA ---
  if (!status.isAdmin) {
    return (
      <SafeAreaView style={[G.bg, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{ padding: 40, alignItems: 'center', borderWidth: 2, borderColor: '#F00', borderRadius: 20 }}>
          <Text style={{ fontSize: 60, marginBottom: 20 }}>⚠️</Text>
          <Text style={[G.mono, { color: '#F00', fontSize: 18, fontWeight: 'bold' }]}>ACCESS_DENIED</Text>
          <Text style={[G.textDim, { textAlign: 'center', marginTop: 10 }]}>Nepovolený vstup do diagnostického jadra.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={{ marginTop: 30 }}>
            <Text style={[G.textCyber, { color: '#0FF' }]}>[ NÁVRAT NA POVRCH ]</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={G.bg}>
      <ScrollView contentContainerStyle={{ padding: 25 }}>
        
        {/* HEADER VELÍNA */}
        <View style={{ marginBottom: 30 }}>
          <Text style={[G.textWhite, { fontSize: 24, fontWeight: 'bold', letterSpacing: 5 }]}>DIAGNOSTIC JADRO</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#F1C40F', marginRight: 10 }} />
            <Text style={[G.textCyber, { color: '#F1C40F' }]}>ADMIN_LEVEL: 01 | MASTER_ARCHITECT</Text>
          </View>
        </View>

        {/* REZERVY MATRIXU (Majiteľove dáta) */}
        <View style={[G.card, { borderColor: '#0FF', borderWidth: 1, backgroundColor: 'rgba(0, 255, 255, 0.02)', marginBottom: 20 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={[G.mono, { color: '#0FF', fontWeight: 'bold' }]}>[ ARCHITECT_VAULT ]</Text>
            {isLoading && <ActivityIndicator size="small" color="#0FF" />}
          </View>
          
          <Text style={[G.textDim, { fontSize: 10, letterSpacing: 1 }]}>NETWORK: Base Mainnet (Layer 2)</Text>

          {/* PALIVO PRE TRANSAKCIE (ETH) */}
          <View style={{ marginTop: 20 }}>
            <Text style={[G.mono, { fontSize: 10, color: '#555', marginBottom: 5 }]}>GAS_RESERVE (ETH):</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={[G.textWhite, { fontSize: 22, fontWeight: 'bold' }]}>
                {adminEthBalance || '0.000'}
              </Text>
              <Text style={{ fontSize: 12, color: '#0FF', marginLeft: 8 }}>ETH</Text>
            </View>
          </View>

          {/* LARIA TOKENY PRE DISTRIBÚCIU */}
          <View style={{ marginTop: 20, padding: 15, backgroundColor: '#051a1a', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#0FF' }}>
            <Text style={[G.mono, { fontSize: 10, color: '#0FF', marginBottom: 5 }]}>LARIA_RESERVE (MASTER_POOL):</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={[G.textWhite, { fontSize: 24, fontWeight: 'bold', color: '#0FF' }]}>
                {adminLariaBalance && adminLariaBalance !== "0" ? Number(adminLariaBalance).toLocaleString() : '0.00'} 
              </Text>
              <Text style={{ fontSize: 12, color: '#FFF', marginLeft: 10, opacity: 0.6 }}>LRIA</Text>
            </View>
            <Text style={[G.textDim, { fontSize: 9, marginTop: 8, fontStyle: 'italic' }]}>Pripravené na emisiu do siete...</Text>
          </View>

          <TouchableOpacity 
            onPress={() => syncWalletData(ownerAddress)} 
            disabled={isLoading}
            style={{ 
              marginTop: 25, 
              padding: 15, 
              backgroundColor: '#0FF', 
              borderRadius: 8,
              alignItems: 'center' 
            }}
          >
            <Text style={[G.mono, { fontSize: 12, color: '#000', fontWeight: 'bold' }]}>
              {isLoading ? "SYNCHRONIZUJEM..." : "VYNÚTIŤ OBNOVU JADRA"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SYSTEM LOGS (Technické detaily) */}
        <View style={[G.card, { padding: 15 }]}>
          <Text style={[G.mono, { color: '#AAA', fontSize: 12, marginBottom: 15 }]}>[ NODE_LOGS ]</Text>
          
          <View style={{ gap: 8 }}>
            <Text style={[G.textDim, { fontSize: 11, fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier' }]}>
              {`> IDENTITY_SHA: ${identity.sha?.substring(0, 16)}...`}
            </Text>
            <Text style={[G.textDim, { fontSize: 11, fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier' }]}>
              {`> OWNER_NODE:   ${ownerAddress?.substring(0, 16)}...`}
            </Text>
            <Text style={[G.textDim, { fontSize: 11, fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier' }]}>
              {`> PROTOCOL:     v8.0.2-STABLE`}
            </Text>
            <Text style={[G.textCyber, { fontSize: 10, marginTop: 5, color: '#0F0' }]}>
              {`> STATUS: Full Architect Access Verified`}
            </Text>
          </View>
        </View>

        {/* BEZPEČNOSTNÝ EXIT */}
        <View style={{ marginTop: 40, paddingBottom: 50 }}>
          <TouchableOpacity 
            onPress={handleSecureLogout} 
            style={{ 
              borderWidth: 1, 
              borderColor: '#441111', 
              padding: 20,
              borderRadius: 12,
              alignItems: 'center',
              backgroundColor: 'rgba(255, 0, 0, 0.02)'
            }}
          >
            <Text style={[G.mono, { color: '#F44', fontWeight: 'bold', letterSpacing: 2 }]}>[ TERMINATE_SESSION ]</Text>
            <Text style={[G.textDim, { fontSize: 9, marginTop: 5, color: '#666' }]}>WIPE KEYS FROM VOLATILE MEMORY</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={{ marginTop: 25, alignItems: 'center' }}
          >
            <Text style={[G.textDim, { fontSize: 11, letterSpacing: 2 }]}>← SPÄŤ NA POVRCH (KEEP_ALIVE)</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default DiagnosticScreen;