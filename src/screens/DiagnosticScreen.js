import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLaria } from '../../context/LariaContext';
import { useKrypto } from '../../context/KryptoContext';
import { G } from '../styles/styles';

const DiagnosticScreen = ({ navigation }) => {
  const { vault } = useLaria();
  const { status, identity } = vault;
  
  // Vytiahneme krypto-logiku a rovno aj adresu majiteľa (ownerAddress)
  const { 
    connectWallet, 
    ethBalance, 
    lariaBalance, 
    isLoading, 
    isWalletConnected,
    ownerAddress 
  } = useKrypto();

  if (!status.isAdmin) {
    return (
      <SafeAreaView style={[G.bgDashboard, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[G.textWhite, { fontSize: 40 }]}>⚠️</Text>
        <Text style={[G.mono, { color: '#F00', marginTop: 20 }]}>ACCESS DENIED</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 40 }}>
          <Text style={G.textDim}>[ NÁVRAT NA POVRCH ]</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={G.bgDashboard}>
      <ScrollView contentContainerStyle={{ padding: 25 }}>
        <Text style={[G.textWhite, { fontSize: 24, fontWeight: 'bold', letterSpacing: 5 }]}>DIAGNOSTIC JADRO</Text>
        <Text style={[G.textCyber, { marginBottom: 30 }]}>ADMIN_LEVEL: 01 | SYSTEM_NOMINAL</Text>

        {/* SEKČIA MATRIXU (Dáta z Base) */}
        <View style={[G.card, { borderColor: isWalletConnected ? '#0FF' : '#333', borderWidth: 1, marginBottom: 15 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={[G.mono, { color: '#0FF' }]}>[ MATRIX_STATUS ]</Text>
            {isLoading && <ActivityIndicator size="small" color="#0FF" />}
          </View>
          
          <Text style={[G.textDim, { fontSize: 10 }]}>NETWORK: Base Mainnet</Text>

          {/* PALIVO (ETH) */}
          <View style={{ marginTop: 10 }}>
            <Text style={[G.mono, { fontSize: 10, color: '#888' }]}>GAS_RESERVE:</Text>
            <Text style={[G.textWhite, { fontSize: 16 }]}>
              {ethBalance} <Text style={{ fontSize: 10, color: '#0FF' }}>ETH</Text>
            </Text>
          </View>

          {/* OBJEM LARIA - Tvojich 10 miliónov */}
          <View style={{ marginTop: 15, padding: 10, backgroundColor: '#051a1a', borderRadius: 5 }}>
            <Text style={[G.mono, { fontSize: 10, color: '#0FF' }]}>VOLUME_LARIA:</Text>
            <Text style={[G.textWhite, { fontSize: 28, fontWeight: 'bold', color: '#0FF' }]}>
              {lariaBalance ? Number(lariaBalance).toLocaleString() : '0'} 
              <Text style={{ fontSize: 12, letterSpacing: 1 }}> units</Text>
            </Text>
          </View>

          <TouchableOpacity 
            onPress={connectWallet} 
            disabled={isLoading}
            style={{ 
              marginTop: 20, 
              padding: 12, 
              backgroundColor: '#111', 
              borderWidth: 1, 
              borderColor: isWalletConnected ? '#0FF' : '#444',
              alignItems: 'center' 
            }}
          >
            <Text style={[G.mono, { fontSize: 11, color: isLoading ? '#444' : '#FFF' }]}>
              {isWalletConnected ? "REFRESH MATRIX DATA" : "SYNCHRONIZOVAŤ"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* LOGY SYSTÉMU */}
        <View style={G.card}>
          <Text style={G.mono}>[ LOGS ]</Text>
          <Text style={[G.textDim, { fontSize: 12, marginTop: 10 }]}>- Matrix: {isWalletConnected ? "ONLINE" : "STANDBY"}</Text>
          <Text style={[G.textDim, { fontSize: 12 }]}>- Identita: {identity.sha?.substring(0, 16)}...</Text>
          {/* Tu sme opravili chybu - ťaháme ownerAddress priamo z hooku vyššie */}
          <Text style={[G.textDim, { fontSize: 12 }]}>
            - Wallet: {ownerAddress ? ownerAddress.substring(0, 10) + "..." : "N/A"}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={{ marginTop: 40, borderTopWidth: 1, borderTopColor: '#222', paddingTop: 20 }}
        >
          <Text style={G.textDim}>← SPÄŤ DO ATELIÉRU</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiagnosticScreen;