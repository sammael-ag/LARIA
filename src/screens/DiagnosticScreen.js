import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, BackHandler, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLaria } from '../../context/LariaContext';
import { useKrypto } from '../../context/KryptoContext';
import { G } from '../styles/styles'; // TVOJE GLOBÁLNE ŠTÝLY

const DiagnosticScreen = ({ navigation }) => {
  const { vault, lockSeal } = useLaria();
  const { status, identity } = vault;
  const { syncWalletData, adminEthBalance, adminLariaBalance, isLoading, ownerAddress } = useKrypto();

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

  if (!status.isAdmin) {
    return (
      <SafeAreaView style={[G.bg, G.center]}>
        <View style={[G.card, { borderColor: G.colors?.error || '#F00' }]}>
          <Text style={[G.mono, G.textError, { fontSize: 18 }]}>ACCESS_DENIED</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={G.marginTopSmall}>
            <Text style={G.textCyber}>[ NÁVRAT ]</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={G.bg}>
      <ScrollView contentContainerStyle={G.containerPadding}>
        
        {/* HEADER - Lícujeme na globálny header style */}
        <View style={G.headerMargin}>
          <Text style={G.headerTitle}>DIAGNOSTIC JADRO</Text>
          <View style={G.rowAlignCenter}>
            <View style={[G.statusDot, { backgroundColor: G.colors?.warning || '#F1C40F' }]} />
            <Text style={[G.textCyber, { color: G.colors?.warning || '#F1C40F', fontSize: 11 }]}>
              ADMIN_LEVEL: 01 | MASTER_ARCHITECT
            </Text>
          </View>
        </View>

        {/* ARCHITECT VAULT - Teraz plne prelinkovaný */}
        <View style={[G.card, G.cardCyberBorder]}>
          <View style={[G.rowSpaceBetween, G.marginBottomSmall]}>
            <Text style={G.cardTitle}>[ ARCHITECT_VAULT ]</Text>
            {isLoading && <ActivityIndicator size="small" color={G.colors?.primary || '#0FF'} />}
          </View>
          
          <Text style={G.textDimTiny}>NETWORK: Base Mainnet (Layer 2)</Text>

          {/* GAS RESERVE (ETH) */}
          <View style={G.marginTopMedium}>
            <Text style={G.labelTiny}>GAS_RESERVE (ETH):</Text>
            <View style={G.rowAlignBaseline}>
              <Text style={G.valueSmall}>
                {adminEthBalance || '0.000'}
              </Text>
              <Text style={G.unitTiny}>ETH</Text>
            </View>
          </View>

          {/* LARIA RESERVE - Čistá harmónia */}
          <View style={G.innerBoxDark}>
            <Text style={[G.labelTiny, { color: G.colors?.primary || '#0FF' }]}>LARIA_RESERVE (MASTER_POOL):</Text>
            <View style={G.rowAlignBaseline}>
              <Text style={[G.valueMedium, { color: G.colors?.primary || '#0FF' }]}>
                {adminLariaBalance && adminLariaBalance !== "0" ? Number(adminLariaBalance).toLocaleString() : '0.00'} 
              </Text>
              <Text style={G.unitSmall}>LARIA</Text>
            </View>
            <Text style={G.textDimMicro}>Pripravené na emisiu do siete...</Text>
          </View>

          {/* TLAČIDLO OBNOVY - Používame G.buttonPrimary */}
          <TouchableOpacity 
            onPress={() => syncWalletData(ownerAddress)} 
            disabled={isLoading}
            style={[G.buttonOutline, G.marginTopMedium]}
          >
            <Text style={G.buttonTextPrimary}>
              {isLoading ? "SYNCHRONIZUJEM..." : "[ VYNÚTIŤ OBNOVU JADRA ]"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* NODE LOGS */}
        <View style={[G.card, G.cardDark]}>
          <Text style={G.labelSmall}>[ NODE_LOGS ]</Text>
          <View style={G.gapSmall}>
            <Text style={G.textTerminalSmall}>
              {`> IDENTITY: ${identity.poznamka || 'SAMMAEL'}`}
            </Text>
            <Text style={G.textTerminalSmall}>
              {`> NODE:     ${ownerAddress?.substring(0, 20)}...`}
            </Text>
            <Text style={[G.textCyber, G.textSuccess, { opacity: 0.6 }]}>
              {`> STATUS: ARCHITECT_VERIFIED`}
            </Text>
          </View>
        </View>

        {/* SECURITY EXIT */}
        <View style={G.footerSection}>
          <TouchableOpacity onPress={handleSecureLogout} style={G.center}>
            <Text style={G.textDimTerminal}>[ TERMINATE_SESSION ]</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default DiagnosticScreen;