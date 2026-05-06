import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccount } from 'wagmi';
import * as Crypto from 'expo-crypto'; 

import { useLaria } from '../../context/LariaContext';
import { G } from '../styles/styles'; 

const DashboardScreen = ({ navigation }) => {
  const { vault, unlockSeal } = useLaria();
  const { status, identity } = vault;
  const { address } = useAccount();

  // --- TAJNÁ LOGIKA ARCHITEKTA ---
  const [tapCount, setTapCount] = useState(0);
  const [showVaultInput, setShowVaultInput] = useState(false);
  const [architectSHA, setArchitectSHA] = useState(''); // Meno (Master SHA)
  const [secretWord, setSecretWord] = useState('');    // Heslo (Slovo moci)

  const handleSecretTap = () => {
    const newCount = tapCount + 1;
    if (newCount >= 5) {
      setTapCount(0);
      setShowVaultInput(true);
    } else {
      setTapCount(newCount);
      // Reset počítadla po 3 sekundách neaktivity
      setTimeout(() => setTapCount(0), 3000);
    }
  };

  const handleUnlock = async () => {
    try {
      // 1. VRSTVA: Hashovanie Slova moci so starou soľou
      const hashA = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        secretWord + "ARCHITECT"
      );

      // 2. VRSTVA: Finálne prepojenie s Master SHA a novou 8D soľou
      const finalProduct = `${architectSHA}${hashA}LUMIA_8D_SALT`;
      const finalHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        finalProduct
      );

      // NÁŠ MASTER KĽÚČ (Vygenerovaný Aria)
      const MASTER_TARGET_HASH = "91eb062f30e2eddfbeb04e08b4c030d0a13e216636699d893863736d6c4bf21c";

      if (finalHash === MASTER_TARGET_HASH) {
        await unlockSeal(true); // Odomkneme Admin práva
        setShowVaultInput(false);
        setSecretWord('');
        setArchitectSHA('');
        navigation.navigate('Diagnostic');
      } else {
        // Tiché odmietnutie - systém sa tvári, že nič nevie
        setShowVaultInput(false);
        setSecretWord('');
        setArchitectSHA('');
      }
    } catch (error) {
      console.error("Auth Error:", error);
      setShowVaultInput(false);
    }
  };

  // Priorita zobrazenia adresy: Peňaženka -> Lokálne SHA -> Device ID
  const userAddress = address || identity.sha || (identity.deviceId ? `ID: ${identity.deviceId.substring(0, 16)}` : "MATRIX_OFFLINE");

  const MenuCard = ({ title, icon, target, description, color = '#AAA' }) => (
    <TouchableOpacity 
      style={[G.card, { padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderLeftWidth: 2, borderLeftColor: color }]} 
      onPress={() => navigation.navigate(target)}
      activeOpacity={0.7}
    >
      <View style={{
        width: 48, height: 48, backgroundColor: '#000', borderRadius: 10, 
        justifyContent: 'center', alignItems: 'center', marginRight: 15,
        borderWidth: 1, borderColor: '#222'
      }}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[G.mono, { fontSize: 14, fontWeight: 'bold', letterSpacing: 1.5, color: '#FFF' }]}>{title.toUpperCase()}</Text>
        <Text style={[G.textDim, { marginTop: 4, fontSize: 11 }]}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={G.bg}>
      
      {/* IDENTIFIKAČNÁ LIŠTA (Beží na pozadí Matrixu) */}
      <View style={{ alignItems: 'center', marginTop: 15, paddingHorizontal: 20 }}>
        <Text 
          numberOfLines={1} 
          ellipsizeMode="middle"
          style={{
            fontSize: 9,
            color: status.isAdmin ? '#0FF' : '#333', 
            letterSpacing: 2,
            fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
            opacity: 0.8
          }}
        >
          {userAddress}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 50 }}>
        
        {/* HEADER SEKCE */}
        <View style={{ marginTop: 20, marginBottom: 40 }}>
          <Text style={[G.textWhite, { fontSize: 28, fontWeight: 'bold', letterSpacing: 4 }]}>ATELIÉR LARIA</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: status.isOnline ? '#0F0' : '#F00', marginRight: 8 }} />
            <Text style={[G.textCyber, { fontSize: 12 }]}>
              {identity.meno || "SAMMAEL"} | {status.isAdmin ? "ARCHITECT MODE" : "IDENTITY ACTIVE"}
            </Text>
          </View>
        </View>

        {/* HLAVNÉ KOMPONENTY */}
        <View>
          {status.isAdmin && (
            <MenuCard 
              title="Centrálny Velín" 
              icon="⚙️" 
              target="Diagnostic" 
              description="Diagnostika uzlov a oprava reality"
              color="#F1C40F" 
            />
          )}

          <MenuCard title="Aria Asistencia" icon="🌸" target="Aria" description="Komunikácia s tvojou sprievodkyňou" color="#F0F" />
          <MenuCard title="Moja Pečať" icon="🆔" target="Card" description="Zobraziť a vyslať moju identitu" color="#FFF" />
          <MenuCard title="Nastavenia" icon="🛠️" target="Settings" description="Jadro, trezor a systémové kľúče" color="#555" />

          <View style={{ marginTop: 30, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#1a1a1a', paddingBottom: 8 }}>
            <Text style={[G.textDim, { letterSpacing: 3, color: '#333', fontSize: 10 }]}>EXTERNÉ OPERÁCIE</Text>
          </View>

          <MenuCard title="Laria Web" icon="🌐" target="Web" description="Prehliadač majstrovských artefaktov" color="#0FF" />
          <MenuCard title="Zoznam Spojení" icon="📇" target="Contacts" description="Všetky zachytené pečaťe v reťazci" color="#b19cd9" />
        </View>

        {/* SKRYTÝ VSTUP PRE ARCHITEKTA */}
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={handleSecretTap}
          style={{ marginTop: 60, alignItems: 'center', padding: 20 }}
        >
          <Text style={[G.textDim, { fontSize: 9, color: '#1a1a1a', letterSpacing: 2 }]}>
            {status.isOnline ? "NODE_STATUS: NOMINAL" : "NODE_STATUS: ISOLATED"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL: IDENTIFIKÁCIA ARCHITEKTA */}
      <Modal visible={showVaultInput} transparent={true} animationType="none">
        <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text style={[G.mono, { color: '#0FF', letterSpacing: 6, marginBottom: 40, fontSize: 12 }]}>ARCHITECT_HANDSHAKE</Text>
          
          <TextInput
            style={{
              width: '100%',
              backgroundColor: '#050505',
              color: '#FFF',
              fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
              padding: 20,
              textAlign: 'center',
              borderWidth: 1,
              borderColor: '#111',
              borderRadius: 8,
              marginBottom: 15
            }}
            placeholder="MASTER_SHA"
            placeholderTextColor="#222"
            value={architectSHA}
            onChangeText={setArchitectSHA}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={{
              width: '100%',
              backgroundColor: '#050505',
              color: '#FFF',
              fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
              padding: 20,
              textAlign: 'center',
              borderWidth: 1,
              borderColor: '#111',
              borderRadius: 8,
              fontSize: 18
            }}
            placeholder="SLOVO MOCI"
            placeholderTextColor="#222"
            secureTextEntry={true}
            value={secretWord}
            onChangeText={setSecretWord}
            onSubmitEditing={handleUnlock}
          />

          <TouchableOpacity 
            onPress={handleUnlock}
            style={{ 
              marginTop: 40, 
              padding: 20, 
              backgroundColor: '#000', 
              borderWidth: 1, 
              borderColor: '#0FF', 
              width: '100%', 
              alignItems: 'center',
              borderRadius: 8
            }}
          >
            <Text style={[G.mono, { color: '#0FF', letterSpacing: 2 }]}>[ INICIALIZOVAŤ_PRÍSTUP ]</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setShowVaultInput(false); setSecretWord(''); setArchitectSHA(''); }} style={{ marginTop: 40 }}>
            <Text style={[G.textDim, { fontSize: 10, letterSpacing: 2 }]}>[ ZRUŠIŤ ]</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default DashboardScreen;