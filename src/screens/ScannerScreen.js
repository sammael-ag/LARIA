import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { G } from '../styles/styles';
import { useContacts } from '../../context/ContactContext';
import QRCode from 'react-native-qrcode-svg'; 
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

export default function ScannerScreen({ navigation }) {
  const { addContact } = useContacts();
  const [scannedData, setScannedData] = useState(null); 
  const [displayInfo, setDisplayInfo] = useState(null);

  // --- 📡 UNIFIKOVANÝ DEKODÉR (Handshake v9.9.6) ---
  const handleProcessSeal = async (rawData) => {
    let incomingData = null;

    try {
      // PRÍPAD A: Signál z našej novej URL (QR foťák/web štýl)
      if (rawData.includes('?id=')) {
        const queryString = rawData.split('?')[1];
        const params = new URLSearchParams(queryString);
        
        incomingData = {
          fing: params.get('id'),
          meno: decodeURIComponent(params.get('m') || "Pútnik"),
          krypt: params.get('k') || "NO_KRYPT",
          kat: "OBJAVITEĽ",
          v: "9.9.6"
        };
      } 
      // PRÍPAD B: Starší formát alebo čistý reťazec (keby niečo nevyšlo)
      else if (rawData.includes('|')) {
        const parts = rawData.split('|');
        incomingData = {
          meno: parts[0],
          sha: parts[1],
          krypt: parts[2],
          fing: parts[3],
          v: "9.9.6-legacy"
        };
      }

      // --- KONTROLA INTEGRITY ---
      if (!incomingData || !incomingData.fing) {
        throw new Error("Neúplná pečať");
      }

      // Nastavenie vizuálu (Zobrazenie tvojej pečate v skeneri)
      setDisplayInfo(incomingData);
      setScannedData(JSON.stringify({
        m: incomingData.meno,
        f: incomingData.fing,
        k: incomingData.krypt
      }));

      // --- POTVRDENIE ZÁPISU ---
      setTimeout(() => {
        Alert.alert(
          '[ IDENTITA ZACHYTENÁ ]',
          `Majster: ${incomingData.meno}\nFING: ${incomingData.fing}\nChceš túto pečať vtiahnuť do ateliéru?`,
          [
            { text: '[ ZRUŠIŤ ]', style: 'cancel', onPress: () => { setScannedData(null); setDisplayInfo(null); } },
            { 
              text: '[ ULOŽIŤ ]', 
              onPress: async () => {
                const result = await addContact(incomingData);
                if (result.success) {
                  navigation.navigate('Contacts');
                } else {
                  setScannedData(null);
                  Alert.alert('[ CHYBA ]', result.error);
                }
              } 
            }
          ]
        );
      }, 500);

    } catch (e) {
      Alert.alert("[ CHYBA SIGNÁLU ]", "Matrix nedokáže túto pečať dekódovať.");
      setScannedData(null);
    }
  };

  // --- NFC LISTENER (Unifikovaný) ---
  useEffect(() => {
    const startNfc = async () => {
      try {
        await NfcManager.start();
        if (Platform.OS === 'android') {
          await NfcManager.registerTagEvent();
        }
      } catch (ex) { console.log("NFC Standby"); }
    };
    startNfc();
    return () => NfcManager.cancelTechnologyRequest().catch(() => {});
  }, []);

  // --- SIMULÁCIA PRE TESTOVANIE ---
  const simulateScan = () => {
    const mockUrl = "https://sammael-ag.github.io/LARIA/?id=SAM-PRO-777&m=Testovaci%20Majster&k=0xALPHA";
    handleProcessSeal(mockUrl);
  };

  return (
    <View style={G.bg}>
      <View style={G.containerPaddingCenter}>
        
        <View style={[G.card, G.cardCyberBorder, { borderColor: scannedData ? '#0FF' : '#222' }]}>
          <Text style={[G.tag, { color: scannedData ? '#0FF' : '#555' }]}>
            {scannedData ? 'SIGNAL_LOCKED' : 'SCANNER_ACTIVE'}
          </Text>
          
          <Text style={[G.headerTitle, { fontSize: 20, textAlign: 'center', marginTop: 10 }]}>
            {scannedData ? '[ DEKÓDOVANÉ ]' : '[ SYNCHRONIZÁCIA ]'}
          </Text>

          <View style={[G.qrWrapper, { 
            marginTop: 30,
            borderColor: scannedData ? '#0FF' : '#111',
            backgroundColor: scannedData ? '#FFF' : '#050505',
          }]}>
            {scannedData ? (
              <QRCode 
                value={scannedData} 
                size={180} 
                logo={require('../../assets/laria-seal.png')} 
                logoSize={45}
                logoBackgroundColor='white'
              />
            ) : (
              <View style={G.center}>
                 <Text style={{ fontSize: 40, opacity: 0.2 }}>👁️</Text>
                 <Text style={[G.textCyber, { fontSize: 8, marginTop: 10, color: '#0FF' }]}>HĽADÁM FREKVENCIU</Text>
              </View>
            )}
          </View>

          {displayInfo && (
             <Text style={[G.mono, { marginTop: 20, color: '#0FF', fontSize: 10, textAlign: 'center' }]}>
               ID: {displayInfo.fing}
             </Text>
          )}
        </View>

        {!scannedData && (
          <TouchableOpacity style={[G.buttonOutline, { marginTop: 30, borderColor: '#F1C40F' }]} onPress={simulateScan}>
            <Text style={{ color: '#F1C40F', fontWeight: 'bold' }}>[ INJEKTOVAŤ URL TEST ]</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={G.footerSection} onPress={() => navigation.goBack()}>
        <Text style={G.textDimTerminal}>← NÁVRAT</Text>
      </TouchableOpacity>
    </View>
  );
}