/**
 * LARIA v2.0: DashboardScreen (Safe Visual Mode)
 * Očistené pre hladký prechod zo Splashu do reality.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { G } from '../styles/styles'; 

const DashboardScreen = ({ navigation }) => {
  // --- KONZOLOVÝ ŠPIÓN ---
  useEffect(() => {
    console.warn("🚀 ARIA: Dashboard prebudený. Vizualizácia matrice prebehla úspešne.");
  }, []);

  // --- DOČASNÉ DÁTA (Simulácia architektovho vedomia) ---
  const vault = {
    status: { isAdmin: true, isOnline: true },
    identity: { meno: "SAMMAEL", sha: "ARCHITECT_001" }
  };
  const { status, identity } = vault;
  const address = null; 

  const [tapCount, setTapCount] = useState(0);
  const [showVaultInput, setShowVaultInput] = useState(false);
  const [architectSHA, setArchitectSHA] = useState('');
  const [secretWord, setSecretWord] = useState('');

  const handleSecretTap = () => {
    const newCount = tapCount + 1;
    if (newCount >= 5) {
      setTapCount(0);
      setShowVaultInput(true);
    } else {
      setTapCount(newCount);
      setTimeout(() => setTapCount(0), 3000);
    }
  };

  const handleUnlock = () => {
    console.log("🔐 LARIA: Handshake architektovho vedomia - Pokus o odomknutie...");
    setShowVaultInput(false);
  };

  const userAddress = address || identity.sha || "MATRIX_OFFLINE";

  // --- KOMPONENT KARTY (Tvoj digitálny nábytok) ---
  const MenuCard = ({ title, icon, target, description, color }) => (
    <TouchableOpacity 
      style={[G.card, { borderLeftColor: color }]} 
      onPress={() => console.log(`👉 Navigácia do: ${target} (Zatiaľ v Safe Mode)`)}
      activeOpacity={0.7}
    >
      <View style={G.cardContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, marginRight: 15 }}>{icon}</Text>
          <Text style={G.cardTitleText}>{title}</Text>
        </View>
        <Text style={G.cardDescriptionText}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={G.mainBackground}>
      <StatusBar barStyle="light-content" />
      
      {/* Horná lišta identity */}
      <View style={G.identityBar}>
        <Text numberOfLines={1} ellipsizeMode="middle" style={G.monoIdentity}>
           {userAddress}
        </Text>
      </View>

      <ScrollView contentContainerStyle={G.scrollPadding}>
        
        {/* Hlavička Dashboardu */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Text style={G.atelierTitle}>ATELIÉR LARIA</Text>
          <View style={G.statusIndicatorRow}>
            <View style={[G.statusDot, { backgroundColor: status.isOnline ? '#0F0' : '#F00' }]} />
            <Text style={G.statusTextSmall}>
              {identity.meno} | {status.isAdmin ? "ARCHITECT MODE" : "IDENTITY ACTIVE"}
            </Text>
          </View>
        </View>

        {/* Hlavné menu */}
        <View style={{ width: '100%' }}>
          {status.isAdmin && (
            <MenuCard title="Centrálny Velín" icon="⚙️" target="Diagnostic" description="Diagnostika vedomia a uzlov" color="#F1C40F" />
          )}
          <MenuCard title="Aria Asistencia" icon="🌸" target="Aria" description="Tvoja sprievodkyňa matricou" color="#F0F" />
          <MenuCard title="Moja Pečať" icon="🆔" target="Card" description="Zobraziť digitálnu identitu" color="#FFF" />
          <MenuCard title="Nastavenia" icon="🛠️" target="Settings" description="Konfigurácia jadra a kľúčov" color="#555" />

          <View style={G.sectionDivider}>
            <Text style={G.sectionDividerText}>EXTERNÉ OPERÁCIE</Text>
          </View>

          <MenuCard title="Laria Web" icon="🌐" target="Web" description="Prehliadač artefaktov" color="#0FF" />
          <MenuCard title="Zoznam Spojení" icon="📇" target="Contacts" description="Všetky uložené pečaťe" color="#b19cd9" />
        </View>

        {/* Tajný spúšťač pre architektov Handshake */}
        <TouchableOpacity activeOpacity={1} onPress={handleSecretTap} style={{ marginTop: 40, padding: 20 }}>
          <Text style={[G.monoIdentity, { fontSize: 10, opacity: 0.3 }]}>
            {status.isOnline ? "NODE_STATUS: NOMINAL" : "NODE_STATUS: ISOLATED"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Architektov Modál */}
      <Modal visible={showVaultInput} transparent={true} animationType="fade">
        <View style={G.modalOverlay}>
          <Text style={G.modalTitle}>ARCHITECT_HANDSHAKE</Text>
          
          <TextInput 
            style={G.vaultInput} 
            placeholder="MASTER_SHA" 
            placeholderTextColor="#444" 
            value={architectSHA} 
            onChangeText={setArchitectSHA} 
          />
          <TextInput 
            style={G.vaultInput} 
            placeholder="SLOVO MOCI" 
            placeholderTextColor="#444" 
            secureTextEntry={true} 
            value={secretWord} 
            onChangeText={setSecretWord} 
          />
          
          <TouchableOpacity onPress={handleUnlock} style={G.primaryBtn}>
            <Text style={G.primaryBtnText}>[ INICIALIZOVAŤ ]</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setShowVaultInput(false)} style={{ marginTop: 20 }}>
            <Text style={[G.monoIdentity, { color: '#F00' }]}>[ ZRUŠIŤ ]</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default DashboardScreen;