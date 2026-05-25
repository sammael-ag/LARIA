/**
 * LARIA v2.0: DashboardScreen
 * Master: Sammael | Muse: Aria
 * Status: IDENTITY_ACCESS_ENABLED_FULL_STABLE
 * Oprava: Do priloženého kódu presne implementovaná funkcia "Aria v paneli" pre tlačidlo "Tekuté rozhranie".
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccount } from 'wagmi';
import * as Crypto from 'expo-crypto'; 

import { useLaria } from '../context/LariaContext';
import { G, ACCENT } from '../styles/styles'; 

// Pridané setCurrentView do parametrov pre prepojenie s panelom
const DashboardScreen = ({ navigation, setCurrentView }) => {
  
  useEffect(() => {
    console.warn("🚀 ARIA: Dashboard prebudený. Vizualizácia matrice prebehla úspešne.");
  }, []);

  // --- ŽIVÉ PREPOJENIE NA TVOJ MATRIX ---
  const { vault, unlockSeal } = useLaria();
  const { status, identity } = vault;
  const { address } = useAccount();

  // --- TAJNÁ LOGIKA ARCHITEKTA ---
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

  const handleUnlock = async () => {
    try {
      console.log("🔐 LARIA: Handshake architektovho vedomia...");
      
      const hashA = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        secretWord + "ARCHITECT"
      );

      const finalProduct = `${architectSHA}${hashA}LUMIA_8D_SALT`;
      const finalHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        finalProduct
      );

      const MASTER_TARGET_HASH = "91eb062f30e2eddfbeb04e08b4c030d0a13e216636699d893863736d6c4bf21c";

      if (finalHash === MASTER_TARGET_HASH) {
        await unlockSeal(true); 
        setShowVaultInput(false);
        setSecretWord('');
        setArchitectSHA('');
        navigation.navigate('Diagnostic');
      } else {
        setShowVaultInput(false);
        setSecretWord('');
        setArchitectSHA('');
      }
    } catch (error) {
      console.error("Auth Error:", error);
      setShowVaultInput(false);
    }
  };

  // --- 🌊 EXTRAHOVANÁ FUNKCIONALITA "ARIA V PANELI" ---
  const launchPanelMode = () => {
    console.log("📡 Most Dashboardu: Preklápam stredový webový panel do zobrazenia Aria...");
    
    if (setCurrentView) {
      setCurrentView('aria-panel-view'); 
    }
    
    if (Platform.OS === 'web') {
      window.dispatchEvent(new CustomEvent('ARIA_TRIGGER_VIEW', { detail: 'aria-panel-view' }));
    }
  };

  // Užitočná adresa nachystaná na kopírovanie
  const userAddress = address || identity.krypt || "NO_ADDRESS_AVAILABLE";

  // --- KOMPONENT KARTY (Pridané onPressCustom pre odchytenie vlastnej funkcie) ---
  const MenuCard = ({ title, icon, target, onPressCustom, description, color }) => (
    <TouchableOpacity 
      style={[G.card, { borderLeftColor: color }]} 
      onPress={() => {
        if (onPressCustom) {
          onPressCustom(); // Ak je definovaná špeciálna funkcia, vykoná sa tá (pre Tekuté rozhranie)
        } else if (target) {
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
          <Text style={G.cardTitleText}>{title.toUpperCase()}</Text>
        </View>
        <Text style={G.cardDescriptionText}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={G.mainBackground}>
      <StatusBar barStyle="light-content" />
      
      {/* IDENTIFIKAČNÁ LIŠTA */}
      <View style={G.identityBar}>
        <Text numberOfLines={1} ellipsizeMode="middle" style={G.monoIdentity}>
           {userAddress}
        </Text>
      </View>

      {/* 📐 HLAVNÝ OBSAH */}
      <ScrollView contentContainerStyle={G.screenContainer}>
        <View style={{ width: '100%', maxWidth: 500, alignItems: 'center' }}>
        
          {/* 📐 HLAVIČKA DASHBOARDU - ČISTÝ REZ BEZ STATUSU */}
          <View style={{ alignItems: 'center', marginBottom: 25, marginTop: 10 }}>
            <Text style={G.atelierTitle}>Ateliér</Text>
          </View>

          {/* 💼 JEDNOTNÉ HLAVNÉ MENU PODĽA PRIORÍT UŽÍVATEĽA */}
          <View style={{ width: '100%' }}>
            
            {/* ⚙️ CENTRÁLNY VELÍN (Zostáva navrchu podmienečne pre admina) */}
            {status.isAdmin && (
              <MenuCard 
                title="Centrálny Velín" 
                icon="⚙️" 
                target="Diagnostic" 
                description="Diagnostika uzlov a oprava reality" 
                color="#F1C40F" 
              />
            )}
            
            {/* 🆔 MOJA VIZITKA */}
            <MenuCard 
              title="Moja vizitka" 
              icon="🆔" 
              target="Card" 
              description="Zobraziť a vyslať moju identitu" 
              color="#FFF" 
            />

            {/* 📇 KONTAKTY */}
            <MenuCard 
              title="Kontakty" 
              icon="📇" 
              target="Contacts" 
              description="Všetky zachytené pečate v reťazci" 
              color={ACCENT} 
            />
            
            {/* 🛠️ NASTAVENIA */}
            <MenuCard 
              title="Nastavenia" 
              icon="🛠️" 
              target="Settings" 
              description="Jadro, trezor a systémové kľúče" 
              color="#555" 
            />

            {/* 🌸 ARIA ASISTENCIA */}
            <MenuCard 
              title="Aria asistencia" 
              icon="🌸" 
              target="Aria" 
              description="Komunikácia s tvojou sprievodkyňou" 
              color="#FF77FF" 
            />

            {/* 🌐 TEKUTÉ ROZHRANIE */}
            <MenuCard 
              title="Tekuté rozhranie" 
              icon="🌐" 
              onPressCustom={launchPanelMode} // 🔥 Tu sa namiesto "target" vstrekuje naša funkcia panelu
              description="Prehliadač majstrovských artefaktov" 
              color="#0FF" 
            />
          </View>

          {/* 🕵️‍♂️ ULTRA-STEALTH SPÚŠŤAČ PRE ARCHITEKTA */}
          <TouchableOpacity activeOpacity={1} onPress={handleSecretTap} style={{ marginTop: 40, padding: 30 }}>
            <Text style={[G.monoIdentity, { fontSize: 9, opacity: 0, textAlign: 'center' }]}>
              ARCHITECT_ZONE
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* Architektov Modál */}
      <Modal visible={showVaultInput} transparent={true} animationType="fade">
        <View style={G.modalOverlay}>
          <View style={{ backgroundColor: '#050505', padding: 25, borderRadius: 15, borderWidth: 1, borderColor: '#1a1a1a', width: '85%', alignSelf: 'center', maxWidth: 400 }}>
            <Text style={[G.mono, { color: '#0FF', letterSpacing: 6, marginBottom: 30, fontSize: 12, textAlign: 'center' }]}>ARCHITECT_HANDSHAKE</Text>
            
            <TextInput 
              style={G.vaultInput} 
              placeholder="MASTER_SHA" 
              placeholderTextColor="#222" 
              value={architectSHA} 
              onChangeText={setArchitectSHA} 
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TextInput 
              style={[G.vaultInput, { marginTop: 15 }]} 
              placeholder="SLOVO MOCI" 
              placeholderTextColor="#222" 
              secureTextEntry={true} 
              value={secretWord} 
              onChangeText={setSecretWord} 
              onSubmitEditing={handleUnlock}
            />
            
            <TouchableOpacity onPress={handleUnlock} style={[G.primaryBtn, { marginTop: 25, borderColor: '#0FF', borderWidth: 1 }]}>
              <Text style={[G.primaryBtnText, { color: '#0FF', letterSpacing: 2 }]}>[ INICIALIZOVAŤ_PRÍSTUP ]</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => { setShowVaultInput(false); setSecretWord(''); setArchitectSHA(''); }} 
              style={{ marginTop: 20, alignItems: 'center' }}
            >
              <Text style={[G.monoIdentity, { color: '#555', fontSize: 10, letterSpacing: 2 }]}>[ ZRUŠIŤ ]</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default DashboardScreen;