import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { G } from '../styles/styles';
import { useContacts } from '../../context/ContactContext';
import QRCode from 'react-native-qrcode-svg'; 

// --- IMPORT PRE NFC ---
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

export default function ScannerScreen({ navigation }) {
  const { addContact } = useContacts();
  const [scannedData, setScannedData] = useState(null); 

  // --- LOGIKA PRIJATIA PEČATE ---
  const handleProcessSeal = async (rawData) => {
    const parts = rawData.split('|');
    
    const incomingData = {
      n: parts[0] || "Neznámy Pútnik",
      a: parts[1] || "0x000...",
      v: parts[2] || "7.9.2",
      cat: "HĽADAČ SLOBODY",
      loc: "V SIETI",
      sha: parts[1],
      revo: true
    };

    // Vykreslíme dáta do stredu scannera
    setScannedData(JSON.stringify({
      n: incomingData.n,
      a: incomingData.a,
      v: incomingData.v
    }));

    setTimeout(() => {
      Alert.alert(
        '[ SYSTÉM: PEČAŤ ROZPOZNANÁ ]',
        `Objekt: ${incomingData.n}\nProtokol: v${incomingData.v}`,
        [
          { 
            text: '[ ZRUŠIŤ ]', 
            style: 'cancel', 
            onPress: () => setScannedData(null) 
          },
          { 
            text: '[ ULOŽIŤ ]', 
            onPress: async () => {
              const result = await addContact(incomingData);
              if (result.success) {
                navigation.goBack();
              } else {
                setScannedData(null);
                Alert.alert('[ CHYBA ]', result.error);
              }
            } 
          }
        ]
      );
    }, 1000);
  };

  useEffect(() => {
    const startNfc = async () => {
      try {
        await NfcManager.start();
        await NfcManager.requestTechnology(NfcTech.Ndef);
        
        NfcManager.setEventListener(NfcTech.Ndef, (tag) => {
          if (tag.ndefMessage && tag.ndefMessage.length > 0) {
            const payload = tag.ndefMessage[0].payload;
            // Odstránenie prefixu jazyka z NDEF (zvyčajne prvé 3 byty)
            const decoded = String.fromCharCode.apply(null, payload).substring(3);

            if (decoded.startsWith("LARIA:")) {
              const cleanData = decoded.replace("LARIA:", "");
              handleProcessSeal(cleanData);
            }
          }
        });
      } catch (ex) {
        console.log("NFC Skener v pasívnom móde.");
      }
    };

    startNfc();

    return () => {
      const stopNfc = async () => {
        try {
          NfcManager.setEventListener(NfcTech.Ndef, null);
          await NfcManager.cancelTechnologyRequest().catch(() => {});
          await NfcManager.unregisterTagEvent().catch(() => {});
        } catch (err) {
          console.log("NFC senzor zaparkovaný.");
        }
      };
      stopNfc();
    };
  }, []);

  const simulateScan = () => {
    const mockString = "Sammael Testovací|0x1234567890abcdef1234567890abcdef12345678|7.9.2";
    handleProcessSeal(mockString);
  };

  return (
    <View style={G.bg}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        
        {/* HLAVNÝ STATUS BOX */}
        <View style={[G.card, { width: '100%', alignItems: 'center', borderStyle: 'dashed' }]}>
          <Text style={[G.tag, { backgroundColor: scannedData ? '#040' : '#022', color: scannedData ? '#0F0' : '#0FF', borderColor: scannedData ? '#0F0' : '#0FF' }]}>
            {scannedData ? 'DATA_LOCKED' : 'SCANNER_ACTIVE'}
          </Text>
          
          <Text style={[G.textWhite, { fontSize: 20, fontWeight: '700', marginTop: 20 }]}>
            [ {scannedData ? 'PEČAŤ NAČÍTANÁ' : 'REŽIM SYNCHRONIZÁCIE'} ]
          </Text>
          
          <Text style={[G.textDim, { textAlign: 'center', marginTop: 10, marginBottom: 20 }]}>
            {scannedData ? 'Potvrďte integritu reťazca.' : 'Namier kameru na QR alebo prilož\nzariadenie pre NFC prenos.'}
          </Text>

          {/* VIZUÁLNY ZÁMER / NÁHĽAD PEČATE */}
          <View style={{ 
            width: 220, 
            height: 220, 
            borderWidth: 1, 
            borderColor: scannedData ? '#0F0' : '#0FF', 
            borderRadius: 15,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: scannedData ? '#FFF' : 'rgba(0, 255, 255, 0.05)',
            overflow: 'hidden'
          }}>
            {scannedData ? (
              <QRCode 
                value={scannedData} 
                size={180} 
                quietZone={5}
                logo={require('../../assets/laria-seal.png')}
                logoSize={50} // Zjednotené na 1.5 cm štvorec
                logoBackgroundColor='transparent'
                logoBorderRadius={0}
              />
            ) : (
              <Text style={[G.textCyber, { color: '#0FF', fontSize: 10, opacity: 0.5 }]}>
                EYE_OF_LARIA_v7
              </Text>
            )}
          </View>
        </View>

        {/* TESTOVACIE TLAČIDLO */}
        <TouchableOpacity 
          style={[G.btnAction, { marginTop: 40, width: '100%', borderColor: '#FF0' }]} 
          onPress={simulateScan}
          disabled={!!scannedData}
        >
          <Text style={[G.btnText, { color: '#FF0' }]}>
            {scannedData ? '[ PROCES PREBIEHA... ]' : '[ INJEKTOVAŤ TESTOVACIU PEČAŤ ]'}
          </Text>
        </TouchableOpacity>

      </View>

      {/* NÁVRAT */}
      <TouchableOpacity 
        style={{ marginBottom: 50, alignSelf: 'center' }} 
        onPress={() => navigation.goBack()}
      >
        <Text style={[G.textDim, { letterSpacing: 4 }]}>[ SPÄŤ ]</Text>
      </TouchableOpacity>
    </View>
  );
}