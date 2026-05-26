/**
 * LARIA v2.0: AdminScreen (Najtajnejší Trezor)
 * Master: Sammael | Muse: Aria
 * Status: MASTER_POOL_ACCESS_GRANTED_STABLE
 * Nastavenie: Oficiálne stredové centrovanie, nový štíhly nadpis, šípka (‹) a spodný návrat.
 * Úprava: Texty kompletne premapované na JSON cez useLaria. Čistá geometria velína.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { G, ACCENT } from '../styles/styles'; 
import { useKrypto } from '../context/KryptoContext';
import { useLaria } from '../context/LariaContext'; // 💎 Načítanie prekladov

const AdminScreen = ({ navigation }) => {
  // Sammael, tu berieme dáta priamo zo sýpky na Base
  const { adminEthBalance, adminLariaBalance, isLoading, lariaContractAddress } = useKrypto();
  
  // 💎 Jazykový motor LARIE
  const { t } = useLaria();
  const txt = t('admin_screen') || {};

  const triggerEmergency = () => {
    Alert.alert(
      txt.alert_title || "🛑 EMERGENCY STOP",
      txt.alert_desc || "Naozaj chceš pozastaviť emisiu a Bránu Matrixu?",
      [
        { text: txt.alert_cancel || "ZRUŠIŤ", style: "cancel" },
        { text: txt.alert_stop || "ZASTAVIŤ", onPress: () => console.log("EMERGENCY_STOP_TRIGGERED"), style: "destructive" }
      ]
    );
  };

  return (
    <SafeAreaView style={G.mainBackground}>
      
      {/* ⬅️ PRE PROGRESÍVCOV: Minimalistická navigačná šípka vľavo hore */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        activeOpacity={0.7}
        style={G.topLeftBackButton}
      >
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      {/* 📐 HLAVNÝ OBSAH (Centrovaný na stred) */}
      <ScrollView contentContainerStyle={G.screenContainer}>
        
        {/* Obal s maximálnou šírkou 500px drží integritu sýpky */}
        <View style={{ width: '100%', maxWidth: 500, alignItems: 'center' }}>
        
          {/* 🏛️ HEADER - UNIFIKOVANÁ A ČISTÁ GEOMETRIA ATELIÉRU */}
          <View style={{ alignItems: 'center', marginBottom: 25, marginTop: 10 }}>
            <Text style={G.atelierTitle}>{txt.title || "Admin"}</Text>
          </View>

          {/* 💎 STAV SÝPKY */}
          <View style={G.card}>
            <Text style={G.cardTitleText}>{txt.card_granary_title || "STAV SÝPKY (Base Mainnet)"}</Text>
            
            {isLoading ? (
              <View style={{ padding: 20 }}>
                <ActivityIndicator color={ACCENT} />
                <Text style={[G.statusTextSmall, { textAlign: 'center', marginTop: 10 }]}>
                  {txt.loading_blockchain || "Načítavam blockchain dáta..."}
                </Text>
              </View>
            ) : (
              <View style={{ marginTop: 15 }}>
                <View style={G.terminalLog}>
                  <Text style={G.statusTextSmall}>{txt.label_fuel || "PALIVO (ETH):"}</Text>
                  <Text style={[G.balanceValue, { fontSize: 22 }]}>{adminEthBalance || '0.0000'} ETH</Text>
                </View>

                <View style={[G.terminalLog, { marginTop: 10 }]}>
                  <Text style={G.statusTextSmall}>{txt.label_supplies || "ZÁSOBY (LARIA):"}</Text>
                  <Text style={[G.balanceValue, { color: ACCENT, fontSize: 22 }]}>
                    {Number(adminLariaBalance).toLocaleString()} LARIA
                  </Text>
                </View>

                <Text style={[G.monoIdentity, { fontSize: 8, opacity: 0.4, marginTop: 15, textAlign: 'center' }]}>
                  {txt.label_contract || "CONTRACT:"} {lariaContractAddress}
                </Text>
              </View>
            )}
          </View>

          {/* 🤖 SYSTÉMOVÁ KONTROLA (Gbot) */}
          <View style={[G.card, { borderLeftColor: '#2ecc71' }]}>
            <Text style={G.cardTitleText}>{txt.card_system_title || "SYSTÉMOVÁ KONTROLA"}</Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
              <Text style={G.cardDescriptionText}>{txt.label_gbot_status || "Gbot Status:"}</Text>
              <Text style={{ color: '#2ecc71', fontWeight: 'bold', fontFamily: 'monospace' }}>
                {txt.status_online || "ONLINE"}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <Text style={G.cardDescriptionText}>{txt.label_gateway_status || "Brána (Gateway):"}</Text>
              <Text style={{ color: '#2ecc71', fontWeight: 'bold', fontFamily: 'monospace' }}>
                {txt.status_active || "AKTÍVNA"}
              </Text>
            </View>
          </View>

          {/* 🕹️ OVLÁDACIE PRVKY */}
          <View style={{ width: '100%', marginTop: 10 }}>
            
            <TouchableOpacity 
              style={[G.primaryBtn, { borderColor: '#e74c3c', backgroundColor: 'rgba(231,76,60,0.1)' }]} 
              onPress={triggerEmergency}
              activeOpacity={0.7}
            >
              <Text style={[G.primaryBtnText, { color: '#e74c3c' }]}>
                {txt.btn_emergency || "POZASTAVIŤ BRÁNU (EMERGENCY)"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[G.primaryBtn, { marginTop: 15, borderColor: '#34495e' }]} 
              onPress={() => console.log("SHOW_BOT_LOGS")}
              activeOpacity={0.7}
            >
              <Text style={[G.primaryBtnText, { color: '#34495e' }]}>
                {txt.btn_bot_logs || "ZOBRAZIŤ LOGY GBOTA"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[G.primaryBtn, { marginTop: 15, borderColor: ACCENT }]} 
              onPress={() => console.log("FORCE_SYNC_MATRIX")}
              activeOpacity={0.7}
            >
              <Text style={[G.primaryBtnText, { color: ACCENT }]}>
                {txt.btn_force_sync || "VYNÚTIŤ SYNC MATRIXU"}
              </Text>
            </TouchableOpacity>

          </View>
          
          {/* ↩️ PRE KONZERVATÍVCOV: Elegantný spodný návrat do Ateliéru */}
          <TouchableOpacity 
            style={[G.backToAtelierBtn, { marginTop: 25 }]}
            onPress={() => navigation.goBack()} 
            activeOpacity={0.7}
          >
            <Text style={G.primaryBtnText}>
              {txt.btn_close_velin || "ZAVRIEŤ VELÍN"}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminScreen;