/**
 * LARIA v2.0: DiagnosticScreen (Centrálny Velín + Tajný Trezor)
 * Master: Sammael | Muse: Aria
 * Status: ADMIN_GATE_ACTIVE_HARDLOCKED_STEALTH
 * Oprava: Pridaný priamy a ostrý import AdminScreen hneď navrchu.
 */

import React, { useEffect, useState, useRef } from 'react';
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
  const [tapCount, setTapCount] = useState(0);
  const timerRef = useRef(null);
  
  const handleSecretTap = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const nextCount = tapCount + 1;    
    if (nextCount >= 7) {
      setTapCount(0);
      
      try {
        if (navigation && typeof navigation.navigate === 'function') {
          navigation.navigate('Admin'); 
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'Admin' }] });
        }
      } catch (navError) {
        console.log("❌ LARIA_CRITICAL: Smerovač odmietol prístup k AdminScreen. Skontroluj, či je zaregistrovaný v AppNavigator.js!", navError);
      }

    } else {
      setTapCount(nextCount);
      timerRef.current = setTimeout(() => {
        setTapCount(0);
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // --- LOGIKA OKAMŽITÉHO ZABUDNUTIA ---
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
      
      {/* ⬅️ Šípka pre bleskový logout */}
      <TouchableOpacity onPress={handleSecureLogout} activeOpacity={0.7} style={G.topLeftBackButton}>
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      {/* 📐 HLAVNÝ OBSAH */}
      <ScrollView contentContainerStyle={[G.screenContainer, { paddingTop: 20 }]}>
        <View style={{ width: '100%', maxWidth: 500, alignItems: 'center' }}>
        
          {/* 🗝️ TAJNÉ DVERE NAFEVNO */}
          <View style={{ marginBottom: 25, marginTop: 5, alignItems: 'center', width: '100%' }}>
            <Pressable onPress={handleSecretTap} style={{ padding: 15 }}>
              <Image 
                source={require('../assets/logo192.png')} 
                style={{ width: 35, height: 35, opacity: 0.8 }} 
                resizeMode="contain"
              />
            </Pressable>
          </View>

          {/* ⚙️ HEADER */}
          <View style={{ alignItems: 'center', marginBottom: 25 }}>
            <Text style={G.atelierTitle}>Diagnostika</Text>
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
          </View>

          <View style={G.card}>
            <Text style={[G.statusTextSmall, { opacity: 0.5, marginTop: 5 }]}>NETWORK: Base Mainnet (Layer 2)</Text>

            <View style={{ marginTop: 20 }}>
              <Text style={G.statusTextSmall}>GAS_RESERVE (ETH):</Text>
              <Text style={G.balanceValue}>{adminEthBalance || '0.000'} ETH</Text>
            </View>

            <View style={G.terminalLog}>
              <Text style={[G.statusTextSmall, { color: ACCENT }]}>LARIA_RESERVE (MASTER_POOL):</Text>
              <Text style={[G.balanceValue, { color: ACCENT }]}>
                {adminLariaBalance && adminLariaBalance !== "0" ? Number(adminLariaBalance).toLocaleString() : '0.00'} LARIA
              </Text>
              <Text style={[G.statusTextSmall, { fontSize: 8, opacity: 0.5 }]}>Pripravené na emisiu do sieci...</Text>
            </View>

            <TouchableOpacity onPress={() => syncWalletData(ownerAddress)} disabled={isLoading} style={[G.primaryBtn, { marginTop: 20, borderColor: ACCENT }]} activeOpacity={0.7}>
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

          <TouchableOpacity style={[G.backToAtelierBtn, { borderColor: '#F00', marginTop: 40 }]} onPress={handleSecureLogout} activeOpacity={0.7}>
            <Text style={[G.primaryBtnText, { color: '#F00' }]}>UKONČIŤ RELÁCIU (LOGOUT)</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiagnosticScreen;