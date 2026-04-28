import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLaria } from '../../context/LariaContext';
import { useKrypto } from '../../context/KryptoContext';
import { G } from '../styles/styles';

const DiagnosticScreen = ({ navigation }) => {
  const { vault, lockSeal } = useLaria();
  const { status, identity } = vault;
  
  // Ťaháme nové "admin" premenné z nášho rozdvojovača
  const { 
    syncWalletData, 
    adminEthBalance, 
    adminLariaBalance, 
    isLoading, 
    ownerAddress 
  } = useKrypto();

  // Definitívny Logout mechanizmus
  const handleSecureLogout = () => {
    lockSeal(); 
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    }); 
  };

  // 🛡️ POISTKY A AUTOMATIZÁCIA
  useEffect(() => {
    // 1. Automatický refresh pri vstupe (ťaháme dáta majiteľa)
    syncWalletData(ownerAddress);

    // 2. Poistka na hardvérovú šípku späť (Android)
    const backAction = () => {
      handleSecureLogout();
      return true; // Zastaví predvolený goBack
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  // Ak nie je admin, nepustíme ho ani k vizuálu
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

        {/* SEKČIA MATRIXU (ARCHITECT DATA) */}
        <View style={[G.card, { borderColor: '#0FF', borderWidth: 1, marginBottom: 15 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={[G.mono, { color: '#0FF' }]}>[ ARCHITECT_STORAGE ]</Text>
            {isLoading && <ActivityIndicator size="small" color="#0FF" />}
          </View>
          
          <Text style={[G.textDim, { fontSize: 10 }]}>NETWORK: Base Mainnet</Text>

          {/* PALIVO (ETH) */}
          <View style={{ marginTop: 10 }}>
            <Text style={[G.mono, { fontSize: 10, color: '#888' }]}>OWNER_GAS_RESERVE:</Text>
            <Text style={[G.textWhite, { fontSize: 16 }]}>
              {adminEthBalance} <Text style={{ fontSize: 10, color: '#0FF' }}>ETH</Text>
            </Text>
          </View>

          {/* OBJEM LARIA */}
          <View style={{ marginTop: 15, padding: 15, backgroundColor: '#051a1a', borderRadius: 5, borderLeftWidth: 3, borderLeftColor: '#0FF' }}>
            <Text style={[G.mono, { fontSize: 10, color: '#0FF' }]}>TOTAL_LARIA_RESERVE:</Text>
            <Text style={[G.textWhite, { fontSize: 32, fontWeight: 'bold', color: '#0FF' }]}>
              {adminLariaBalance && adminLariaBalance !== "0" ? Number(adminLariaBalance).toLocaleString() : '0.00'} 
            </Text>
            <Text style={[G.textDim, { fontSize: 9 }]}>Ready for distribution</Text>
          </View>

          <TouchableOpacity 
            onPress={() => syncWalletData(ownerAddress)} 
            disabled={isLoading}
            style={{ 
              marginTop: 20, 
              padding: 12, 
              backgroundColor: '#0FF', 
              alignItems: 'center' 
            }}
          >
            <Text style={[G.mono, { fontSize: 11, color: '#000', fontWeight: 'bold' }]}>
              {isLoading ? "SYNCING..." : "FORCE REFRESH CORE DATA"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* LOGY SYSTÉMU */}
        <View style={G.card}>
          <Text style={G.mono}>[ SYSTEM_LOGS ]</Text>
          <Text style={[G.textDim, { fontSize: 11, marginTop: 10 }]}>- Identity SHA: {identity.sha?.substring(0, 24)}...</Text>
          <Text style={[G.textDim, { fontSize: 11 }]}>
            - Owner Node: {ownerAddress?.substring(0, 20)}...
          </Text>
          <Text style={[G.textCyber, { fontSize: 10, marginTop: 5 }]}>- Status: Full Architect Access Verified</Text>
        </View>

        {/* BEZPEČNOSTNÝ LOGOUT */}
        <TouchableOpacity 
          onPress={handleSecureLogout} 
          style={{ 
            marginTop: 40, 
            borderTopWidth: 1, 
            borderTopColor: '#441111', 
            paddingTop: 20,
            alignItems: 'center'
          }}
        >
          <Text style={[G.mono, { color: '#F44', fontWeight: 'bold', letterSpacing: 2 }]}>[ TERMINATE_ADMIN_SESSION ]</Text>
          <Text style={[G.textDim, { fontSize: 9, marginTop: 5 }]}>WIPE KEYS FROM VOLATILE MEMORY</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={{ marginTop: 20, paddingBottom: 30, alignItems: 'center' }}
        >
          <Text style={[G.textDim, { fontSize: 10 }]}>← BACK TO SURFACE (KEEP SESSION)</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default DiagnosticScreen;