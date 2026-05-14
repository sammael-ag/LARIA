/**
 * LARIA v2.0: DiagnosticScreen (Centrálny Velín + Tajný Trezor)
 * Master: Sammael | Muse: Aria
 * Status: ADMIN_GATE_ACTIVE
 */

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  BackHandler, 
  Image,
  Pressable 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLaria } from '../../context/LariaContext';
import { useKrypto } from '../../context/KryptoContext';
import { G, ACCENT } from '../styles/styles';

const DiagnosticScreen = ({ navigation }) => {
  const { vault, lockSeal } = useLaria();
  const { status, identity } = vault;
  const { syncWalletData, adminEthBalance, adminLariaBalance, isLoading, ownerAddress } = useKrypto();

  // --- LOGIKA TAJNÝCH DVERÍ ---
  const [tapCount, setTapCount] = useState(0);

  const handleSecretTap = () => {
    const nextCount = tapCount + 1;
    if (nextCount >= 7) {
      setTapCount(0);
      // TU SA OTVÁRA TREZOR! 🗝️
      navigation.navigate('AdminScreen'); 
    } else {
      setTapCount(nextCount);
    }
  };

  const handleSecureLogout = () => {
    lockSeal();
    navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] }); 
  };

  useEffect(() => {
    if (ownerAddress) syncWalletData(ownerAddress);
    const backAction = () => { handleSecureLogout(); return true; };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [ownerAddress]);

  // --- OCHRANNÁ BRÁNA ---
  if (!status?.isAdmin) {
    return (
      <SafeAreaView style={G.mainBackground}>
        <View style={[G.modalOverlay, { alignItems: 'center' }]}>
          <View style={G.card}>
            <Text style={[G.highlightText, { color: '#F00', fontSize: 24 }]}>ACCESS_DENIED</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={G.primaryBtn}>
              <Text style={G.primaryBtnText}>[ NÁVRAT DO REALITY ]</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={G.mainBackground}>
      
      {/* 🗝️ TAJNÉ DVERE (Admin Gate) */}
      {/* Umiestnené presne v strede, cca 15-20px pod kamerou */}
      <View style={{ width: '100%', alignItems: 'center', paddingTop: 15, position: 'absolute', top: 0, zIndex: 999 }}>
        <Pressable onPress={handleSecretTap}>
          <Image 
            source={require('../../assets/logo192.png')} 
            style={{ width: 40, height: 40, opacity: 0.8 }} 
            resizeMode="contain"
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[G.scrollPadding, { paddingTop: 70 }]}>
        
        {/* ⚙️ HEADER */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Text style={G.atelierTitle}>DIAGNOSTIC JADRO</Text>
          <View style={G.statusIndicatorRow}>
            <View style={[G.statusDot, { backgroundColor: '#F1C40F' }]} />
            <Text style={G.statusTextSmall}>ADMIN_LEVEL: 01 | MASTER_ARCHITECT</Text>
          </View>
        </View>

        {/* 🔐 ARCHITECT VAULT */}
        <View style={G.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={G.cardTitleText}>[ ARCHITECT_VAULT ]</Text>
            {isLoading && <ActivityIndicator size="small" color={ACCENT} />}
          </View>
          
          <Text style={[G.statusTextSmall, { opacity: 0.5, marginTop: 5 }]}>NETWORK: Base Mainnet (Layer 2)</Text>

          {/* GAS RESERVE */}
          <View style={{ marginTop: 20 }}>
            <Text style={G.statusTextSmall}>GAS_RESERVE (ETH):</Text>
            <Text style={G.balanceValue}>{adminEthBalance || '0.000'} ETH</Text>
          </View>

          {/* LARIA RESERVE */}
          <View style={G.terminalLog}>
            <Text style={[G.statusTextSmall, { color: ACCENT }]}>LARIA_RESERVE (MASTER_POOL):</Text>
            <Text style={[G.balanceValue, { color: ACCENT }]}>
              {adminLariaBalance && adminLariaBalance !== "0" ? Number(adminLariaBalance).toLocaleString() : '0.00'} LARIA
            </Text>
            <Text style={[G.statusTextSmall, { fontSize: 8, opacity: 0.5 }]}>Pripravené na emisiu do siete...</Text>
          </View>

          <TouchableOpacity 
            onPress={() => syncWalletData(ownerAddress)} 
            disabled={isLoading}
            style={[G.primaryBtn, { marginTop: 20, borderColor: ACCENT }]}
          >
            <Text style={[G.primaryBtnText, { color: ACCENT }]}>
              {isLoading ? "SYNCHRONIZUJEM..." : "[ VYNÚTIŤ OBNOVU JADRA ]"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 🖥️ NODE LOGS */}
        <View style={[G.card, { borderLeftColor: '#333' }]}>
          <Text style={G.cardTitleText}>[ NODE_LOGS ]</Text>
          <View style={G.terminalLog}>
            <Text style={G.textTerminal}>{`> IDENTITY: ${identity?.meno || 'SAMMAEL'}`}</Text>
            <Text style={G.textTerminal}>{`> NODE:     ${ownerAddress?.substring(0, 16)}...`}</Text>
            <Text style={[G.textTerminal, { color: '#2ecc71' }]}>{`> STATUS:   ARCHITECT_VERIFIED`}</Text>
          </View>
        </View>

        {/* 🏁 SECURITY EXIT */}
        <TouchableOpacity 
          onPress={handleSecureLogout} 
          style={{ marginTop: 30, padding: 20, alignItems: 'center' }}
        >
          <Text style={[G.monoIdentity, { color: '#F00', opacity: 0.6 }]}>
            [ TERMINATE_SESSION ]
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default DiagnosticScreen;