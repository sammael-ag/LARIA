/**
 * LARIA v2.0: DiagnosticScreen (Centrálny Velín + Tajný Trezor)
 * Master: Sammael | Muse: Aria
 * Status: ADMIN_GATE_ACTIVE_HARDLOCKED
 * Oprava: Absolútna bezpečnosť – každý odchod spúšťa okamžité zabudnutie a odhlásenie.
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
  Pressable,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLaria } from '../context/LariaContext';
import { useKrypto } from '../context/KryptoContext';
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

  // --- LOGIKA OKAMŽITÉHO ZABUDNUTIA (Frontová línia) ---
  const handleSecureLogout = () => {
    console.log("🔒 DIAGNOSTIC: Aktivujem okamžité zabudnutie session...");
    lockSeal(); // Vymazanie pečate z pamäteContextu
    navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] }); 
  };

  useEffect(() => {
    if (ownerAddress) syncWalletData(ownerAddress);
    
    // Hardvér gombík "Späť" na Androide taktiež nekompromisne odhlasuje
    const backAction = () => { handleSecureLogout(); return true; };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [ownerAddress]);

  // --- OCHRANNÁ BRÁNA ---
  if (!status?.isAdmin) {
    return (
      <SafeAreaView style={G.mainBackground}>
        <View style={[G.modalOverlay, { alignItems: 'center' }]}>
          <View style={[G.card, { maxWidth: 400, width: '100%' }]}>
            <Text style={[G.highlightText, { color: '#F00', fontSize: 24, marginBottom: 20 }]}>ACCESS_DENIED</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={G.primaryBtn}>
              <Text style={G.primaryBtnText}>NÁVRAT DO REALITY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={G.mainBackground}>
      
      {/* ⬅️ PRE PROGRESÍVCOV: Šípka, ktorá pri stlačení OKAMŽITE uzamkne a ukončí session */}
      <TouchableOpacity 
        onPress={handleSecureLogout} 
        activeOpacity={0.7}
        style={G.topLeftBackButton}
      >
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      {/* 🗝️ TAJNÉ DVERE: Logo vycentrované navrchu, lícujúce s novou výškou šípky */}
      <View style={{ width: '100%', alignItems: 'center', position: 'absolute', top: 45, zIndex: 999 }}>
        <Pressable onPress={handleSecretTap}>
          <Image 
            source={require('../assets/logo192.png')} 
            style={{ width: 32, height: 32, opacity: 0.6 }} 
            resizeMode="contain"
          />
        </Pressable>
      </View>

      {/* 📐 HLAVNÝ OBSAH (Stabilná stredová geometria s horným odstupom kvôli logu) */}
      <ScrollView contentContainerStyle={[G.screenContainer, { paddingTop: 60 }]}>
        
        {/* Obal s maximálnou šírkou 500px */}
        <View style={{ width: '100%', maxWidth: 500, alignItems: 'center' }}>
        
          {/* ⚙️ HEADER */}
          <View style={{ alignItems: 'center', marginBottom: 25 }}>
            <Text style={G.atelierTitle}>DIAGNOSTIC JADRO</Text>
            <View style={G.statusIndicatorRow}>
              <View style={[G.statusDot, { backgroundColor: '#F1C40F' }]} />
              <Text style={G.statusTextSmall}>ADMIN_LEVEL: 01 | MASTER_ARCHITECT</Text>
            </View>
          </View>

          {/* 🔐 ARCHITECT VAULT */}
          <View style={G.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={G.cardTitleText}>ARCHITECT VAULT</Text>
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
              <Text style={[G.statusTextSmall, { fontSize: 8, opacity: 0.5 }]}>Pripravené na emisiu do sieci...</Text>
            </View>

            <TouchableOpacity 
              onPress={() => syncWalletData(ownerAddress)} 
              disabled={isLoading}
              style={[G.primaryBtn, { marginTop: 20, borderColor: ACCENT }]}
              activeOpacity={0.7}
            >
              <Text style={[G.primaryBtnText, { color: ACCENT }]}>
                {isLoading ? "SYNCHRONIZUJEM..." : "VYNÚTIŤ OBNOVU JADRA"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 🖥️ NODE LOGS */}
          <View style={[G.card, { borderLeftColor: '#333' }]}>
            <Text style={G.cardTitleText}>NODE LOGS</Text>
            <View style={G.terminalLog}>
              <Text style={G.textTerminal}>{`> IDENTITY: ${identity?.meno || 'SAMMAEL'}`}</Text>
              <Text style={G.textTerminal}>{`> NODE:     ${ownerAddress?.substring(0, 16)}...`}</Text>
              <Text style={[G.textTerminal, { color: '#2ecc71' }]}>{`> STATUS:   ARCHITECT_VERIFIED`}</Text>
            </View>
          </View>

          {/* ↩️ PRE KONZERVATÍVCOV: Bezpečný gombík, ktorý okamžite TERMINUJE reláciu a odhlasuje */}
          <TouchableOpacity 
            style={[G.backToAtelierBtn, { borderColor: '#F00', marginTop: 40 }]}
            onPress={handleSecureLogout} 
            activeOpacity={0.7}
          >
            <Text style={[G.primaryBtnText, { color: '#F00' }]}>
              UKONČIŤ RELÁCIU (LOGOUT)
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiagnosticScreen;