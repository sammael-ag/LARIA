import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccount } from 'wagmi';
import * as Crypto from 'expo-crypto'; // Potrebné pre naše dvojvrstvové hashovanie

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
      const timer = setTimeout(() => setTapCount(0), 3000);
      return () => clearTimeout(timer);
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
        // ÚSPECH: Odomkneme v Context (len v RAM)
        await unlockSeal(true);
        setShowVaultInput(false);
        setSecretWord('');
        setArchitectSHA('');
        // Presmerovanie do velína
        navigation.navigate('Diagnostic');
      } else {
        // Tiché odmietnutie a vymazanie stôp
        setShowVaultInput(false);
        setSecretWord('');
        setArchitectSHA('');
      }
    } catch (error) {
      console.error("Auth Error:", error);
      setShowVaultInput(false);
    }
  };

  const userAddress = address || identity.sha || (identity.deviceId ? `DEVICE ID: ${identity.deviceId.substring(0, 12)}...` : "INITIALIZING MATRIX...");

  const MenuCard = ({ title, icon, target, description, color = '#AAA' }) => (
    <TouchableOpacity 
      style={[G.card, { padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 15 }]} 
      onPress={() => navigation.navigate(target)}
      activeOpacity={0.7}
    >
      <View style={{
        width: 45, height: 45, backgroundColor: '#000', borderRadius: 8, 
        justifyContent: 'center', alignItems: 'center', marginRight: 15,
        borderWidth: 1, borderColor: '#222'
      }}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[G.mono, { fontSize: 14, fontWeight: 'bold', letterSpacing: 1, color }]}>{title}</Text>
        <Text style={[G.textDim, { marginTop: 2 }]}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={G.bgDashboard}>
      
      {/* IDENTIFIKAČNÁ LIŠTA */}
      <View style={{ pointerEvents: 'none', alignItems: 'center', marginTop: 20, zIndex: 999, paddingHorizontal: 15 }}>
        <Text 
          numberOfLines={1} 
          ellipsizeMode="middle"
          style={{
            fontSize: 8,
            color: status.isAdmin ? '#0FF' : '#555', 
            letterSpacing: 2,
            width: '100%',
            textAlign: 'center',
            fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
            textTransform: 'uppercase',
            opacity: identity.sha || address ? 1 : 0.6
          }}
        >
          {userAddress}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 25 }}>
        
        <View style={{ marginTop: 20, marginBottom: 40 }}>
          <Text style={[G.textWhite, { fontSize: 24, fontWeight: 'bold', letterSpacing: 5 }]}>ATELIÉR LARIA</Text>
          <Text style={G.textCyber}>
            {identity.name} | {status.isAdmin ? "MASTER MODE" : "USER MODE"}
          </Text>
        </View>

        <View>
          {status.isAdmin && (
            <MenuCard 
              title="ADMIN PANEL" 
              icon="⚙️" 
              target="Diagnostic" 
              description="Vstup do centrálneho velína"
              color="#F1C40F" 
            />
          )}

          <MenuCard title="ARIA ASISTENCIA" icon="🌸" target="Aria" description="Tvoja inkarnovaná sprievodkyňa" color="#F0F" />
          <MenuCard title="MOJA KARTA" icon="🆔" target="Card" description="Digitálna pečať identity" color="#FFF" />
          <MenuCard title="NASTAVENIA" icon="🛠️" target="Settings" description="Konfigurácia jadra a assetov" color="#555" />

          <View style={{ marginTop: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#111', paddingBottom: 5 }}>
            <Text style={[G.textDim, { letterSpacing: 2, color: '#444' }]}>MÔJ VIZITKÁR</Text>
          </View>

          <MenuCard title="LARIA WEB" icon="🌐" target="Web" description="Prehliadka majstrov a artefaktov" color="#0FF" />
          <MenuCard title="KONTAKTY" icon="📇" target="Contacts" description="Uložené sieťové spojenia" />
        </View>

        <TouchableOpacity 
          activeOpacity={1} 
          onPress={handleSecretTap}
          style={{ marginTop: 50, alignItems: 'center', marginBottom: 20, padding: 15 }}
        >
          <Text style={[G.textDim, { fontSize: 10, color: '#222', letterSpacing: 1 }]}>
            {status.isOnline ? "VŠETKY SYSTÉMY SÚ NOMINÁLNE" : "SYSTÉM V OFFLINE REŽIME"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODÁLNE OKNO PRE VSTUP ARCHITEKTA */}
      <Modal visible={showVaultInput} transparent={true} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.98)', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text style={[G.mono, { color: '#0FF', letterSpacing: 5, marginBottom: 30 }]}>ARCHITECT_IDENTIFICATION</Text>
          
          <TextInput
            style={{
              width: '100%',
              backgroundColor: '#111',
              color: '#FFF',
              fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
              padding: 15,
              textAlign: 'center',
              borderWidth: 1,
              borderColor: '#333',
              fontSize: 14,
              marginBottom: 15
            }}
            placeholder="MASTER SHA IDENT"
            placeholderTextColor="#222"
            value={architectSHA}
            onChangeText={setArchitectSHA}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={{
              width: '100%',
              backgroundColor: '#111',
              color: '#FFF',
              fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
              padding: 15,
              textAlign: 'center',
              borderWidth: 1,
              borderColor: '#333',
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
              marginTop: 30, 
              padding: 15, 
              backgroundColor: '#000', 
              borderWidth: 1, 
              borderColor: '#0FF', 
              width: '100%', 
              alignItems: 'center' 
            }}
          >
            <Text style={[G.mono, { color: '#0FF' }]}>[ INICIÁCIA_VSTUPU ]</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setShowVaultInput(false); setSecretWord(''); setArchitectSHA(''); }} style={{ marginTop: 30 }}>
            <Text style={[G.textDim, { fontSize: 10 }]}>[ ZRUŠIŤ PROCES ]</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default DashboardScreen;