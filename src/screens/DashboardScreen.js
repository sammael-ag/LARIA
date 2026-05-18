/**
 * LARIA v2.0: DashboardScreen
 * Master: Sammael | Muse: Aria
 * Status: IDENTITY_ACCESS_ENABLED_FULL_STABLE
 * Oprava: Uzavretie rozbitého View kontajnera a čisté centrovanie cez screenContainer.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { G, ACCENT } from '../styles/styles'; 

const DashboardScreen = ({ navigation }) => {
  
  useEffect(() => {
    console.warn("🚀 ARIA: Dashboard prebudený. Vizualizácia matrice prebehla úspešne.");
  }, []);

  // --- REÁLNE DÁTA (Z tvojho Matrixu) ---
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
    console.log("🔐 LARIA: Handshake architektovho vedomia...");
    setShowVaultInput(false);
  };

  const userAddress = address || identity.sha || "MATRIX_OFFLINE";

  // --- KOMPONENT KARTY ---
  const MenuCard = ({ title, icon, target, description, color }) => (
    <TouchableOpacity 
      style={[G.card, { borderLeftColor: color }]} 
      onPress={() => {
        if (target) {
          navigation.navigate(target);
        } else {
          console.log(`👉 ${title}: Funkcia v príprave...`);
        }
      }}
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
      
      <View style={G.identityBar}>
        <Text numberOfLines={1} ellipsizeMode="middle" style={G.monoIdentity}>
           {userAddress}
        </Text>
      </View>

      {/* 📐 HLAVNÝ OBSAH (Centrovaný automaticky cez G.screenContainer) */}
      <ScrollView contentContainerStyle={G.screenContainer}>
        
        {/* Obal s maximálnou šírkou 500px, ktorý drží vizitky pevne pod sebou */}
        <View style={{ width: '100%', maxWidth: 500, alignItems: 'center' }}>
        
          {/* Hlavička Dashboardu */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={G.atelierTitle}>Ateliér</Text>
            <View style={G.statusIndicatorRow}>
              <View style={[G.statusDot, { backgroundColor: status.isOnline ? '#0F0' : '#F00' }]} />
              <Text style={G.statusTextSmall}>
                {identity.meno} | {status.isAdmin ? "ARCHITECT MODE" : "IDENTITY ACTIVE"}
              </Text>
            </View>
          </View>

          {/* Hlavné menu */}
          <View style={{ width: '100%' }}>
            
            {/* ⚙️ CENTRÁLNY VELÍN */}
            {status.isAdmin && (
              <MenuCard 
                title="Centrálny Velín" 
                icon="⚙️" 
                target="Diagnostic" 
                description="Diagnostika vedomia a uzlov" 
                color="#F1C40F" 
              />
            )}
            
            {/* 🌸 ARIA ASISTENCIA */}
            <MenuCard 
              title="Aria Asistencia" 
              icon="🌸" 
              target="Aria" 
              description="Tvoja sprievodkyňa matricou" 
              color="#FF77FF" 
            />
            
            {/* 🆔 MOJA PEČAŤ */}
            <MenuCard 
              title="Moja Pečať" 
              icon="🆔" 
              target="Card" 
              description="Zobraziť digitálnu identitu" 
              color="#FFF" 
            />
            
            {/* 🛠️ NASTAVENIA */}
            <MenuCard 
              title="Nastavenia" 
              icon="🛠️" 
              target="Settings" 
              description="Konfigurácia jadra a kľúčov" 
              color="#555" 
            />

            <View style={G.sectionDivider}>
              <Text style={G.sectionDividerText}>EXTERNÉ OPERÁCIE</Text>
            </View>

            {/* 🌐 LARIA WEB */}
            <MenuCard 
              title="Laria Web" 
              icon="🌐" 
              target="Web" 
              description="Prehliadač artefaktov" 
              color="#0FF" 
            />

            {/* 📇 REŤAZEC SPOJENÍ */}
            <MenuCard 
              title="Zoznam Spojení" 
              icon="📇" 
              target="Contacts" 
              description="Všetky uložené pečaťe" 
              color={ACCENT} 
            />
          </View>

          {/* Tajný spúšťač */}
          <TouchableOpacity activeOpacity={1} onPress={handleSecretTap} style={{ marginTop: 40, padding: 20 }}>
            <Text style={[G.monoIdentity, { fontSize: 10, opacity: 0.3, textAlign: 'center' }]}>
              {status.isOnline ? "NODE_STATUS: NOMINAL" : "NODE_STATUS: ISOLATED"}
            </Text>
          </TouchableOpacity>

        </View> {/* 🛠️ TU BOLO TO CHÝBAJÚCE ZATVORENIE, KTORÉ SME ZACHRÁNILI! */}
      </ScrollView>

      {/* Architektov Modál (Vyčistený od zátvoriek) */}
      <Modal visible={showVaultInput} transparent={true} animationType="fade">
        <View style={G.modalOverlay}>
          <View style={{ backgroundColor: '#050505', padding: 25, borderRadius: 15, borderWidth: 1, borderColor: '#1a1a1a', width: '85%', alignSelf: 'center', maxWidth: 400 }}>
            <Text style={[G.atelierTitle, { fontSize: 18, marginBottom: 20 }]}>ARCHITECT_HANDSHAKE</Text>
            
            <TextInput style={G.vaultInput} placeholder="MASTER_SHA" placeholderTextColor="#444" value={architectSHA} onChangeText={setArchitectSHA} />
            <TextInput style={[G.vaultInput, { marginTop: 10 }]} placeholder="SLOVO MOCI" placeholderTextColor="#444" secureTextEntry={true} value={secretWord} onChangeText={setSecretWord} />
            
            <TouchableOpacity onPress={handleUnlock} style={[G.primaryBtn, { marginTop: 25 }]}>
              <Text style={G.primaryBtnText}>INICIALIZOVAŤ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowVaultInput(false)} style={{ marginTop: 20, alignItems: 'center' }}>
              <Text style={[G.monoIdentity, { color: '#F00', fontSize: 12 }]}>ZRUŠIŤ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default DashboardScreen;