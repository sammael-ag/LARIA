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

  // --- LOGIKA PRIJATIA A DEKÓDOVANIA PEČATE ---
  const handleProcessSeal = async (rawData) => {
    // Sammael, predpokladáme formát: Meno | SHA | Krypt | Verzia
    const parts = rawData.split('|');
    
    const incomingData = {
      meno: parts[0] || "Neznámy Pútnik",
      sha: parts[1] || "0x000...",
      krypt: parts[2] || "",
      v: parts[3] || "8.0",
      kat: "POZOROVATEĽ", // Predvolená kategória pre nových
      lok: "V SIETI",
      isVerified: false // Musí prejsť tvojím overením
    };

    // Pripravíme dáta pre vizuálne potvrdenie (skratky m, s, k)
    const displayPayload = JSON.stringify({
      m: incomingData.meno,
      s: incomingData.sha,
      k: incomingData.krypt
    });

    setScannedData(displayPayload);

    setTimeout(() => {
      Alert.alert(
        '[ SYSTÉM: IDENTITA ZACHYTENÁ ]',
        `Objekt: ${incomingData.meno}\nSHA: ${incomingData.sha.substring(0, 10)}...\nProtokol: v${incomingData.v}`,
        [
          { 
            text: '[ ODMIETNUŤ ]', 
            style: 'cancel', 
            onPress: () => setScannedData(null) 
          },
          { 
            text: '[ ULOŽIŤ DO ATELIÉRU ]', 
            onPress: async () => {
              const result = await addContact(incomingData);
              if (result.success) {
                navigation.goBack();
              } else {
                setScannedData(null);
                Alert.alert('[ CHYBA MATRICE ]', result.error);
              }
            } 
          }
        ]
      );
    }, 800);
  };

  // --- NFC LISTENER (Počúvame na priloženie iného mobilu) ---
  useEffect(() => {
    const startNfc = async () => {
      try {
        await NfcManager.start();
        await NfcManager.requestTechnology(NfcTech.Ndef);
        
        NfcManager.setEventListener(NfcTech.Ndef, (tag) => {
          if (tag.ndefMessage && tag.ndefMessage.length > 0) {
            const payload = tag.ndefMessage[0].payload;
            // Odstránenie prefixu (prvé 3 byty sú zvyčajne kód jazyka 'en')
            const decoded = String.fromCharCode.apply(null, payload).substring(3);

            if (decoded.startsWith("LARIA:")) {
              const cleanData = decoded.replace("LARIA:", "");
              handleProcessSeal(cleanData);
            }
          }
        });
      } catch (ex) {
        console.log("NFC Skener čaká na signál...");
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
    // Sammael Test: Meno | SHA | Krypt | Verzia
    const mockString = "Pútnik z Rákoša|SHA-TEST-999|0xKRYPT123|8.0";
    handleProcessSeal(mockString);
  };

  return (
    <View style={G.bg}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        
        {/* HLAVNÝ STATUS BOX */}
        <View style={[G.card, { width: '100%', alignItems: 'center', borderStyle: 'dashed', borderColor: scannedData ? '#0F0' : '#b19cd9' }]}>
          <Text style={[G.tag, { 
            backgroundColor: scannedData ? 'rgba(0, 255, 0, 0.1)' : 'rgba(177, 156, 217, 0.1)', 
            color: scannedData ? '#0F0' : '#b19cd9', 
            borderColor: scannedData ? '#0F0' : '#b19cd9' 
          }]}>
            {scannedData ? 'VÁKUUM_UZAVRETÉ' : 'OKO_LARIA_AKTÍVNE'}
          </Text>
          
          <Text style={[G.textWhite, { fontSize: 22, fontWeight: '700', marginTop: 20, letterSpacing: 2 }]}>
            {scannedData ? '[ PEČAŤ OVERENÁ ]' : '[ SYNCHRONIZÁCIA ]'}
          </Text>
          
          <Text style={[G.textDim, { textAlign: 'center', marginTop: 10, marginBottom: 25, lineHeight: 18 }]}>
            {scannedData 
              ? 'Identita bola úspešne dekódovaná.\nUložte ju do svojho zoznamu.' 
              : 'Namier na QR kód v inom mobile\nalebo prilož zariadenia k sebe.'}
          </Text>

          {/* VIZUÁLNY ZÁCHYT */}
          <View style={{ 
            width: 240, 
            height: 240, 
            borderWidth: 2, 
            borderColor: scannedData ? '#0F0' : '#333', 
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: scannedData ? '#FFF' : 'rgba(0,0,0,0.3)',
            overflow: 'hidden',
            shadowColor: scannedData ? '#0F0' : '#000',
            shadowRadius: 15,
            shadowOpacity: 0.3
          }}>
            {scannedData ? (
              <QRCode 
                value={scannedData} 
                size={200} 
                quietZone={5}
                logo={require('../../assets/laria-seal.png')}
                logoSize={50}
                logoBackgroundColor='transparent'
              />
            ) : (
              <View style={{ alignItems: 'center' }}>
                 <Text style={{ fontSize: 40, marginBottom: 10, opacity: 0.5 }}>👁️</Text>
                 <Text style={[G.textCyber, { color: '#b19cd9', fontSize: 10, letterSpacing: 3 }]}>
                   HĽADÁM SIGNÁL
                 </Text>
              </View>
            )}
          </View>
        </View>

        {/* TESTOVACIA INJEKCIA */}
        {!scannedData && (
          <TouchableOpacity 
            style={[G.btnAction, { marginTop: 40, width: '100%', borderColor: '#f1c40f' }]} 
            onPress={simulateScan}
          >
            <Text style={[G.btnText, { color: '#f1c40f' }]}>
              [ INJEKTOVAŤ TESTOVACIU PEČAŤ ]
            </Text>
          </TouchableOpacity>
        )}

      </View>

      {/* NÁVRAT */}
      <TouchableOpacity 
        style={{ marginBottom: 50, alignSelf: 'center', padding: 10 }} 
        onPress={() => navigation.goBack()}
      >
        <Text style={[G.textDim, { letterSpacing: 5, fontSize: 12 }]}>[ OPUSTIŤ SKENER ]</Text>
      </TouchableOpacity>
    </View>
  );
}