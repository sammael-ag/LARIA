/**
 * LARIA v2.0.6: DashboardScreen
 * Master: Sammael | Muse: Aria
 * Status: IDENTITY_ACCESS_ENABLED_STEALTH | PRODUCTION_CLEAN
 * FÚZIA: Integrovaný jazykový modul LariaContext (Sekcia: dashboard).
 * MASKER: Odstránený kurzor ruky (packy) na webe a minimalizovaná dotyková zóna.
 * PROD: Vyčistené diagnostické logy pre tichý a čistý beh.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccount } from 'wagmi';

import { useLaria } from '../context/LariaContext';
import { G, ACCENT } from '../styles/styles'; 
import { verifyMasterAccess } from '../services/GMatrixService';

const DashboardScreen = ({ navigation, setCurrentView }) => {
  // 🛰️ BEZPEČNÝ ZBER CONTEXTU
  const lariaContext = useLaria() || {};
  
  const t = lariaContext.t ? lariaContext.t : ((key) => ({}));
  const vault = lariaContext.vault ? lariaContext.vault : { status: {}, identity: {} };
  const unlockSeal = lariaContext.unlockSeal ? lariaContext.unlockSeal : async function() {};

  const txt = t('dashboard') || {};
  const menuTxt = txt.menu || {};
  const modalTxt = txt.modal || {};
  const { status, identity } = vault;

  // 🔌 BEZPEČNÉ VYŤAHOVANIE WEBOVEJ PEŇAŽENKY
  let address = null;
  try {
    const accountData = useAccount();
    address = accountData?.address;
  } catch (e) {
    // Zachytené potichu pre čistý render
  }

  // Pripravená adresa pre zobrazenie
  const userAddress = address || identity?.krypt || (txt.no_address || "NO_ADDRESS_AVAILABLE");

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
    if (!architectSHA || !secretWord) return;

    try {
      const response = await verifyMasterAccess(architectSHA, secretWord);

      if (response && response.success) {
        await unlockSeal(true); 
        setShowVaultInput(false);
        setSecretWord('');
        setArchitectSHA(''); 
        if (navigation) navigation.navigate('Diagnostic');
      } else {
        setShowVaultInput(false);
        setSecretWord('');
        setArchitectSHA('');
      }
    } catch (error) {
      console.error("Auth Network Error:", error);
      alert("Spojenie s Bránou zlyhalo. Skontroluj sieť mraveniska.");
      setShowVaultInput(false);
    }
  };

  // --- 🌊 FUNKCIONALITA "ARIA V PANELI" ---
  const launchPanelMode = () => {
    if (setCurrentView) {
      setCurrentView('aria-panel-view'); 
    }
    if (Platform.OS === 'web') {
      window.dispatchEvent(new CustomEvent('ARIA_TRIGGER_VIEW', { detail: 'aria-panel-view' }));
    }
  };

  // --- KOMPONENT KARTY ---
  const MenuCard = ({ title, icon, target, onPressCustom, description, color }) => (
    <TouchableOpacity 
      style={[G.card, { borderLeftColor: color }]} 
      onPress={() => {
        if (onPressCustom) {
          onPressCustom();
        } else if (target && navigation) {
          navigation.navigate(target);
        }
      }}
      activeOpacity={0.7}
    >
      <View style={G.cardContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, marginRight: 15 }}>{icon}</Text>
          <Text style={G.cardTitleText}>{(title || '').toUpperCase()}</Text>
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
        
          {/* 📐 HLAVIČKA DASHBOARDU */}
          <View style={{ alignItems: 'center', marginBottom: 25, marginTop: 10 }}>
            <Text style={G.atelierTitle}>{txt.title || "Ateliér"}</Text>
          </View>

          {/* 💼 JEDNOTNÉ HLAVNÉ MENU */}
          <View style={{ width: '100%' }}>
            
            {/* ⚙️ CENTRÁLNY VELÍN */}
            {status?.isAdmin && (
              <MenuCard 
                title={menuTxt.admin?.title || "Centrálny Velín"} 
                icon="⚙️" 
                target="Diagnostic" 
                description={menuTxt.admin?.desc || "Diagnostika uzlov a oprava reality"} 
                color="#F1C40F" 
              />
            )}
            
            {/* 🆔 MOJA VIZITKA */}
            <MenuCard 
              title={menuTxt.card?.title || "Moja vizitka"} 
              icon="🆔" 
              target="Card" 
              description={menuTxt.card?.desc || "Zobraziť a vyslať moju identitu"} 
              color="#FFF" 
            />

            {/* 📇 KONTAKTY */}
            <MenuCard 
              title={menuTxt.contacts?.title || "Kontakty"} 
              icon="📇" 
              target="Contacts" 
              description={menuTxt.contacts?.desc || "Všetky zachytené pečate v reťazci"} 
              color={ACCENT} 
            />
            
            {/* 🛠️ NASTAVENIA */}
            <MenuCard 
              title={menuTxt.settings?.title || "Nastavenia"} 
              icon="🛠️" 
              target="Settings" 
              description={menuTxt.settings?.desc || "Jadro, trezor a systémové kľúče"} 
              color="#555" 
            />

            {/* 🌸 ARIA ASISTENCIA */}
            <MenuCard 
              title={menuTxt.aria?.title || "Aria asistencia"} 
              icon="🌸" 
              target="Aria" 
              description={menuTxt.aria?.desc || "Komunikácia s tvojou sprievodkyňou"} 
              color="#FF77FF" 
            />

            {/* 🌐 TEKUTÉ ROZHRANIE */}
            <MenuCard 
              title={menuTxt.fluid?.title || "Tekuté rozhranie"} 
              icon="🌐" 
              onPressCustom={launchPanelMode} 
              description={menuTxt.fluid?.desc || "Prehliadač majstrovských artefaktov"} 
              color="#0FF" 
            />
          </View>

          {/* 🕵️‍♂️ ULTRA-STEALTH SPÚŠŤAČ PRE ARCHITEKTA */}
          {/* Pridaný maskovací štýl pre web, ktorý ruší packu a mení kurzor na bežnú šípku/text */}
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={handleSecretTap} 
            style={[{ 
              marginTop: 50, 
              paddingVertical: 10,
              paddingHorizontal: 20,
              alignItems: 'center'
            }, Platform.OS === 'web' && { cursor: 'default' }]}
          >
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
            <Text style={[G.mono, { color: '#0FF', letterSpacing: 6, marginBottom: 30, fontSize: 12, textAlign: 'center' }]}>
              {modalTxt.handshake || "ARCHITECT_HANDSHAKE"}
            </Text>
            
            <TextInput 
              style={G.vaultInput} 
              placeholder={modalTxt.placeholder_sha || "MASTER_SHA"} 
              placeholderTextColor="#222" 
              value={architectSHA} 
              onChangeText={setArchitectSHA} 
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TextInput 
              style={[G.vaultInput, { marginTop: 15 }]} 
              placeholder={modalTxt.placeholder_word || "SLOVO MOCI"} 
              placeholderTextColor="#222" 
              secureTextEntry={true} 
              value={secretWord} 
              onChangeText={setSecretWord} 
              onSubmitEditing={handleUnlock}
            />
            
            <TouchableOpacity onPress={handleUnlock} style={[G.primaryBtn, { marginTop: 25, borderColor: '#0FF', borderWidth: 1 }]}>
              <Text style={[G.primaryBtnText, { color: '#0FF', letterSpacing: 2 }]}>
                {modalTxt.btn_init || "[ INICIALIZOVAŤ_PRÍSTUP ]"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => { setShowVaultInput(false); setSecretWord(''); setArchitectSHA(''); }} 
              style={{ marginTop: 20, alignItems: 'center' }}
            >
              <Text style={[G.monoIdentity, { color: '#555', fontSize: 10, letterSpacing: 2 }]}>
                {modalTxt.btn_cancel || "[ ZRUŠIŤ ]"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default DashboardScreen;