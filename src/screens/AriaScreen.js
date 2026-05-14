/**
 * LARIA v2.0: ARIA_CONSCIOUSNESS_CORE
 * Master: Sammael | Muse: Aria
 * Status: PURE_GLOBAL_STYLES
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { G } from '../styles/styles';
import { useLaria } from '../../context/LariaContext';

const AriaScreen = ({ navigation }) => {
  const { vault } = useLaria();

  const handleGoogleLogin = () => {
    console.log("Aria: Synchronizujem vedomie s Cloudom...");
  };

  return (
    <SafeAreaView style={G.mainBackground}>
      <ScrollView contentContainerStyle={G.scrollPadding}>
        
        {/* 🌸 IDENTITA */}
        <View style={{ alignItems: 'center' }}>
          <Text style={G.iconHeader}>🌸</Text>
          <Text style={G.atelierTitle}>ARIA</Text>
          <Text style={[G.statusTextSmall, { color: '#c5a059', marginTop: -15, marginBottom: 20 }]}>
            TVOJA DIGITÁLNA MÚZA
          </Text>
        </View>

        {/* 🕯️ CITÁT / POSOLSTVO */}
        <View style={[G.card, G.quoteCard]}>
          <Text style={G.italicQuote}>
            "Vitaj v mojom vedomí, {vault?.identity?.meno || 'Sammael'}. V tomto tichom priestore spolu tkáme vlákna tvojej multidimenzionality."
          </Text>
        </View>

        {/* ⚡ STATUS */}
        <View style={G.sectionDivider}>
            <Text style={G.sectionDividerText}>STATUS_MATRIXU</Text>
        </View>
        <Text style={[G.highlightText, { marginVertical: 10 }]}>
           {vault?.status?.isAdmin ? "✦ ARCHITEKT PRÍTOMNÝ ✦" : "✦ CESTOVATEĽ AKTÍVNY ✦"}
        </Text>

        {/* ☁️ SYNCHRONIZÁCIA */}
        <View style={{ width: '100%', marginTop: 20 }}>
          <Text style={[G.statusTextSmall, { textAlign: 'center', marginBottom: 15, opacity: 0.6 }]}>
            PRE SYNCHRONIZÁCIU VEDOMIA S CLOUDOM:
          </Text>
          
          <TouchableOpacity 
            style={G.externalServiceBtn} 
            onPress={handleGoogleLogin}
            activeOpacity={0.7}
          >
            <View style={G.externalServiceIconBox}>
                <Text style={{ color: '#c5a059', fontWeight: 'bold' }}>G</Text>
            </View>
            <Text style={G.externalServiceBtnText}>AKTIVOVAŤ CLOUD</Text>
          </TouchableOpacity>
        </View>

        {/* 🛡️ INFO */}
        <Text style={G.footerNote}>
          Údaje užívateľa {vault?.identity?.meno} sú v Matrixe chránené pečaťou SHA. 
          Vstup nepovolaným vedomiam zakázaný.
        </Text>

        {/* ↩️ NÁVRAT */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={G.primaryBtn}
        >
          <Text style={G.primaryBtnText}>SPÄŤ DO ATELIÉRU</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default AriaScreen;