import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { G } from '../styles/styles';
import { useContacts } from '../../context/ContactContext';

export default function ScannerScreen({ navigation }) {
  const { addContact } = useContacts();

  // --- SIMULÁCIA: Toto nahrádza naskenovanie QR kódu ---
  const simulateScan = async () => {
    const mockData = {
      n: "Sammael Testovací",
      cat: "Majster Tesár",
      loc: "Rákoš",
      a: "0x1234567890abcdef1234567890abcdef12345678",
      sha: "sha256-test-seal-001",
      revo: true
    };

    Alert.alert(
      '[ SYSTÉM: PEČAŤ ROZPOZNANÁ ]',
      `Objekt: ${mockData.n}\nID: ${mockData.a}`,
      [
        { text: '[ ZRUŠIŤ ]', style: 'cancel' },
        { 
          text: '[ ULOŽIŤ ]', 
          onPress: async () => {
            const result = await addContact(mockData);
            if (result.success) {
              navigation.goBack();
            } else {
              Alert.alert('[ CHYBA ]', result.error);
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={G.bg}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
        
        {/* Používame tvoje G.textMain a G.textCyber */}
        <Text style={[G.textMain, { color: '#FF0', marginBottom: 10 }]}>
          [ REŽIM SIMULÁCIE OKA ]
        </Text>
        
        <Text style={[G.textDim, { textAlign: 'center', marginBottom: 40 }]}>
          Kamera je dočasne odpojená pre stabilitu systému.{'\n'}
          Simuluj príjem dát pre overenie reťazca.
        </Text>

        <TouchableOpacity 
          style={[G.btnMain, { borderColor: '#FF0', width: '100%' }]} 
          onPress={simulateScan}
        >
          <Text style={[G.textCyber, { color: '#FF0' }]}>
            [ INJEKTOVAŤ TESTOVACIU VIZITKU ]
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tvoj pôvodný spodný návrat cez G štýly */}
      <TouchableOpacity 
        style={[G.btnMain, { position: 'absolute', bottom: 50, alignSelf: 'center', width: 'auto', paddingHorizontal: 30 }]} 
        onPress={() => navigation.goBack()}
      >
        <Text style={G.textCyber}>[ NÁVRAT ]</Text>
      </TouchableOpacity>
    </View>
  );
}