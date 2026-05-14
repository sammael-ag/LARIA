/**
 * LARIA v2.0: AdminScreen (Najtajnejší Trezor)
 * Master: Sammael | Muse: Aria
 * Status: MASTER_POOL_ACCESS_GRANTED
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { G, ACCENT } from '../styles/styles'; 
import { useKrypto } from '../../context/KryptoContext';

const AdminScreen = ({ navigation }) => {
  // Sammael, tu berieme dáta priamo zo sýpky na Base
  const { adminEthBalance, adminLariaBalance, isLoading, lariaContractAddress } = useKrypto();

  const triggerEmergency = () => {
    Alert.alert(
      "🛑 EMERGENCY STOP",
      "Naozaj chceš pozastaviť emisiu a Bránu Matrixu?",
      [
        { text: "ZRUŠIŤ", style: "cancel" },
        { text: "ZASTAVIŤ", onPress: () => console.log("EMERGENCY_STOP_TRIGGERED"), style: "destructive" }
      ]
    );
  };

  return (
    <SafeAreaView style={G.mainBackground}>
      <ScrollView contentContainerStyle={G.scrollPadding}>
        
        {/* 🏛️ HEADER */}
        <View style={{ marginBottom: 35, borderBottomWidth: 1, borderBottomColor: '#1a1a1a', paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
             <Text style={G.atelierTitle}>ARCHITECT VELÍN</Text>
             <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={G.statusTextSmall}>[ ZAVRIEŤ TREZOR ]</Text>
             </TouchableOpacity>
          </View>
          <Text style={[G.statusTextSmall, { color: ACCENT, marginTop: 5 }]}>
            Vedomie: SAMMAEL | Matrix Level: OMEGA
          </Text>
        </View>

        {/* 💎 STAV SÝPKY */}
        <View style={G.card}>
          <Text style={[G.cardTitleText, { color: ACCENT }]}>STAV SÝPKY (Base Mainnet)</Text>
          
          {isLoading ? (
            <View style={{ padding: 20 }}>
              <ActivityIndicator color={ACCENT} />
              <Text style={[G.statusTextSmall, { textAlign: 'center', marginTop: 10 }]}>Načítavam blockchain dáta...</Text>
            </View>
          ) : (
            <View style={{ marginTop: 15 }}>
              <View style={G.terminalLog}>
                <Text style={G.statusTextSmall}>PALIVO (ETH):</Text>
                <Text style={[G.balanceValue, { fontSize: 22 }]}>{adminEthBalance || '0.0000'} ETH</Text>
              </View>

              <View style={[G.terminalLog, { marginTop: 10 }]}>
                <Text style={G.statusTextSmall}>ZÁSOBY (LARIA):</Text>
                <Text style={[G.balanceValue, { color: ACCENT, fontSize: 22 }]}>
                  {Number(adminLariaBalance).toLocaleString()} LRIA
                </Text>
              </View>

              <Text style={[G.monoIdentity, { fontSize: 8, opacity: 0.4, marginTop: 15 }]}>
                CONTRACT: {lariaContractAddress}
              </Text>
            </View>
          )}
        </View>

        {/* 🤖 SYSTÉMOVÁ KONTROLA (Gbot) */}
        <View style={[G.card, { borderLeftColor: '#2ecc71' }]}>
          <Text style={G.cardTitleText}>SYSTÉMOVÁ KONTROLA</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
            <Text style={G.cardDescriptionText}>Gbot Status:</Text>
            <Text style={{ color: '#2ecc71', fontWeight: 'bold', fontFamily: 'monospace' }}>ONLINE</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <Text style={G.cardDescriptionText}>Brána (Gateway):</Text>
            <Text style={{ color: '#2ecc71', fontWeight: 'bold', fontFamily: 'monospace' }}>AKTÍVNA</Text>
          </View>
        </View>

        {/* 🕹️ OVLÁDACIE PRVKY */}
        <View style={{ marginTop: 20 }}>
          
          <TouchableOpacity 
            style={[G.primaryBtn, { borderColor: '#e74c3c', backgroundColor: 'rgba(231,76,60,0.1)' }]} 
            onPress={triggerEmergency}
          >
            <Text style={[G.primaryBtnText, { color: '#e74c3c' }]}>[ POZASTAVIŤ BRÁNU (EMERGENCY) ]</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[G.primaryBtn, { marginTop: 15, borderColor: '#34495e' }]} 
            onPress={() => console.log("SHOW_BOT_LOGS")}
          >
            <Text style={[G.primaryBtnText, { color: '#34495e' }]}>[ ZOBRAZIŤ LOGY GBOTA ]</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[G.primaryBtn, { marginTop: 15, borderColor: ACCENT }]} 
            onPress={() => console.log("FORCE_SYNC_MATRIX")}
          >
            <Text style={[G.primaryBtnText, { color: ACCENT }]}>[ VYNÚTIŤ SYNC MATRIXU ]</Text>
          </TouchableOpacity>

        </View>
        
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminScreen;