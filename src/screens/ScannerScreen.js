/**
 * LARIA v2.0: ScannerScreen
 * Master: Sammael | Muse: Aria
 * Status: GEOMETRY_DEFINITIVE_CLEAN_SCANNER
 * Oprava: Kompletne odstránených 16 km Base64 kódu. Nasadené čisté statické načítanie 
 * pečate z assets cez require(). Nadpisy unifikované podľa jemnej geometrie AriaScreen.
 */

import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Alert, Platform, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg'; 
import NfcManager from 'react-native-nfc-manager';

import { G, ACCENT } from '../styles/styles';
import { useContacts } from '../context/ContactContext';

export default function ScannerScreen({ navigation }) {
  const { addContact } = useContacts();
  const [scannedData, setScannedData] = useState(null); 
  const [displayInfo, setDisplayInfo] = useState(null);

  // --- 📡 UNIFIKOVANÝ DEKODÉR (Handshake v9.9.6) ---
  const handleProcessSeal = async (rawData) => {
    let incomingData = null;

    try {
      // PRÍPAD A: Signál z URL (QR/Web)
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
      // PRÍPAD B: Legacy formát
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

      if (!incomingData || !incomingData.fing) {
        throw new Error("Neúplná pečať");
      }

      setDisplayInfo(incomingData);
      setScannedData(JSON.stringify({
        m: incomingData.meno,
        f: incomingData.fing,
        k: incomingData.krypt
      }));

      // --- POTVRDENIE ZÁPISU ---
      setTimeout(() => {
        Alert.alert(
          'IDENTITA ZACHYTENÁ',
          `Majster: ${incomingData.meno}\nFING: ${incomingData.fing}\n\nChceš túto pečať vtiahnuť do ateliéru?`,
          [
            { 
              text: 'ZRUŠIŤ', 
              style: 'cancel', 
              onPress: () => { setScannedData(null); setDisplayInfo(null); } 
            },
            { 
              text: 'ULOŽIŤ', 
              onPress: async () => {
                const result = await addContact(incomingData);
                if (result.success) {
                  navigation.navigate('Contacts');
                } else {
                  setScannedData(null);
                  Alert.alert('CHYBA', result.error);
                }
              } 
            }
          ]
        );
      }, 500);

    } catch (e) {
      Alert.alert("CHYBA SIGNÁLU", "Matrix nedokáže túto pečať dekódovať.");
      setScannedData(null);
    }
  };

  // --- NFC LISTENER ---
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

  // --- SIMULÁCIA ---
  const simulateScan = () => {
    const mockUrl = "https://sammael-ag.github.io/LARIA/?id=SAM-PRO-777&m=Testovaci%20Majster&k=0xALPHA";
    handleProcessSeal(mockUrl);
  };

  return (
    <SafeAreaView style={G.mainBackground}>
      
      {/* ⬅️ PRE PROGRESÍVCOV: Navigačná šípka */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        activeOpacity={0.7}
        style={G.topLeftBackButton}
      >
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      <View style={G.containerPaddingCenter}>
        
        {/* 📐 Obal s maximálnou šírkou 500px pre dokonalú geometriu */}
        <View style={{ width: '100%', maxWidth: 500, alignItems: 'center' }}>
          
          {/* 🌸 IDENTITA BAR V JEMNOM ŠTÝLE ARIA_SCREEN */}
          <View style={{ alignItems: 'center' }}>
            <Text style={G.atelierTitle}>
              {scannedData ? 'Hotovo' : 'QR/NFC sken'}
            </Text>
            <Text style={[G.statusTextSmall, { color: '#c5a059', marginTop: -15, marginBottom: 25 }]}>
              {scannedData ? '● SIGNAL_LOCKED' : '○ SCANNER_ACTIVE'}
            </Text>
          </View>

          <View style={[G.card, { borderColor: scannedData ? ACCENT : '#222', alignItems: 'center', paddingVertical: 40, width: '100%' }]}>
            
            {/* 📐 OKNO NAČÍTAVANIA: Presne o 20px väčšie ako QR kód (200x200) */}
            <View style={[G.qrWrapper, { 
              width: 200,
              height: 200,
              borderColor: scannedData ? ACCENT : '#111',
              backgroundColor: scannedData ? '#FFF' : '#0a0a0a',
              justifyContent: 'center',
              alignItems: 'center'
            }]}>
              {scannedData ? (
                
                /* Pozíciovacie vnútro pre QR a absolútne vrstvené logo */
                <View style={{ width: 180, height: 180, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  
                  <QRCode 
                    value={scannedData} 
                    size={180} 
                  />

                  {/* ⬛️ PRÍSNY BIELY ŠTVOREC LOGA V STREDE */}
                  <View style={{ position: 'absolute', width: 44, height: 44, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    <Image 
                      source={require('../assets/laria-seal.png')}
                      style={{
                        width: 38,
                        height: 38,
                        resizeMode: 'contain',
                      }}
                    />
                  </View>

                </View>

              ) : (
                <View style={{ alignItems: 'center' }}>
                   <ActivityIndicator size="large" color={ACCENT} style={{ marginBottom: 15 }} />
                   <Text style={[G.monoIdentity, { fontSize: 10, color: ACCENT }]}>HĽADÁM FREKVENCIU...</Text>
                </View>
              )}
            </View>

            {displayInfo && (
               <Text style={[G.monoIdentity, { marginTop: 25, color: ACCENT, fontSize: 10 }]}>
                 FING: {displayInfo.fing?.toUpperCase()}
               </Text>
            )}
          </View>

          {!scannedData && (
            <TouchableOpacity style={[G.primaryBtn, { marginTop: 30, borderColor: '#F1C40F' }]} onPress={simulateScan} activeOpacity={0.7}>
              <Text style={[G.primaryBtnText, { color: '#F1C40F' }]}>INJEKTOVAŤ URL TEST</Text>
            </TouchableOpacity>
          )}

          {/* ↩️ PRE KONZERVATÍVCOV: Spodný návrat */}
          <TouchableOpacity 
            style={[G.backToAtelierBtn, { marginTop: 20 }]}
            onPress={() => navigation.goBack()} 
            activeOpacity={0.7}
          >
            <Text style={G.primaryBtnText}>
              NÁVRAT DO ATELIÉRU
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}