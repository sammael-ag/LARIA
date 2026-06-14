/**
 * LARIA v2.1: ScannerScreen (Pure PWA Web Camera Fusion)
 * Master: Sammael | Muse: Aria
 * Status: GEOMETRY_DEFINITIVE_CLEAN_SCANNER | CAMERA_PWA_ACTIVE | PRIVACY_LOCK_SECURED
 * FÚZIA: Integrovaný jazykový modul LariaContext (Sekcia: scanner).
 */

import React, { useEffect, useState, useRef } from 'react';
import { Text, View, TouchableOpacity, Alert, Platform, ActivityIndicator, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg'; 
import NfcManager from 'react-native-nfc-manager';
// 🛡️ Importujeme hook, ktorý vie, či sme reálne na obrazovke
import { useIsFocused } from '@react-navigation/native';

// 🌐 Importujeme html5-qrcode pre čistokrvné webové skenovanie
import { Html5Qrcode } from 'html5-qrcode';

import { G, ACCENT } from '../styles/styles';
import { useContacts } from '../context/ContactContext';
import { useLaria } from '../context/LariaContext'; 

export default function ScannerScreen({ navigation }) {
  const { t } = useLaria(); 
  const txt = t('scanner') || {}; 
  const isFocused = useIsFocused(); // 📡 Sleduje, či používateľ vidí skener

  const { addContact } = useContacts();
  const [scannedData, setScannedData] = useState(null); 
  const [displayInfo, setDisplayInfo] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const html5QrcodeRef = useRef(null);
  const scannerId = "laria-pwa-video-scanner"; // ID pre HTML element, kde sa vykreslí kamera

  // --- 📡 UNIFIKOVANÝ DEKODÉR (Handshake v9.9.6) ---
  const handleProcessSeal = async (rawData) => {
    let incomingData = null;

    try {
      if (rawData.includes('?id=')) {
        const queryString = rawData.split('?')[1];
        const params = new URLSearchParams(queryString);
        
        incomingData = {
          fing: params.get('id'),
          meno: decodeURIComponent(params.get('m') || (txt.default_traveler || "Pútnik")),
          krypt: params.get('k') || "NO_KRYPT",
          kat: "OBJAVITEĽ",
          v: "9.9.6"
        };
      } 
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
        throw new Error(txt.error_incomplete || "Neúplná pečať");
      }

      // 🛑 AKO NÁHLE MÁME DATA, ZASTAVÍME KAMERU, NECH NEBEŽÍ NA POZADÍ
      stopWebScanner();

      setDisplayInfo(incomingData);
      setScannedData(JSON.stringify({
        m: incomingData.meno,
        f: incomingData.fing,
        k: incomingData.krypt
      }));

      // --- POTVRDENIE ZÁPISU ---
      setTimeout(() => {
        const alertMsg = txt.alert_captured_desc 
          ? txt.alert_captured_desc.replace('{meno}', incomingData.meno).replace('{fing}', incomingData.fing)
          : `Majster: ${incomingData.meno}\nFING: ${incomingData.fing}\n\nChceš túto pečať vtiahnuť do ateliéru?`;

        Alert.alert(
          txt.alert_captured_title || 'IDENTITA ZACHYTENÁ',
          alertMsg,
          [
            { 
              text: txt.btn_cancel || 'ZRUŠIŤ', 
              style: 'cancel', 
              onPress: () => { 
                setScannedData(null); 
                setDisplayInfo(null); 
                // Ak zruší, znova naštartujeme foťák
                startWebScanner();
              } 
            },
            { 
              text: txt.btn_save || 'ULOŽIŤ', 
              onPress: async () => {
                const result = await addContact(incomingData);
                if (result.success) {
                  navigation.navigate('Contacts');
                } else {
                  setScannedData(null);
                  Alert.alert(txt.alert_save_error || 'CHYBA', result.error);
                  startWebScanner();
                }
              } 
            }
          ]
        );
      }, 500);

    } catch (e) {
      Alert.alert(txt.error_decode_title || "CHYBA SIGNÁLU", txt.error_decode_desc || "Matrix nedokáže túto pečať dekódovať.");
      setScannedData(null);
    }
  };

  // --- 📷 INICIALIZÁCIA A ŠTART PWA WEBOVEJ KAMERY ---
  const startWebScanner = () => {
    if (Platform.OS !== 'web') return;
    
    // 🛡️ Poistka: Ak už kamera beží, neštartujeme ju znova, aby sme nezasekli prehliadač
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      return;
    }

    // Počkáme sekundu na vykreslenie divu do DOMu
    setTimeout(() => {
      try {
        const html5QrcodeScanner = new Html5Qrcode(scannerId);
        html5QrcodeRef.current = html5QrcodeScanner;

        html5QrcodeScanner.start(
          { facingMode: "environment" }, // "environment" povie mobilu, že chceme zadnú kameru
          {
            fps: 10,    // Koľko snímkov za sekundu analyzujeme (10 úplne stačí a neprehrieva mobil)
            qrbox: 180  // Veľkosť snímacieho štvorca v px
          },
          (qrCodeMessage) => {
            // Úspešný zásah! Našli sme QR kód
            handleProcessSeal(qrCodeMessage);
          },
          (errorMessage) => {
            // Tichý error pri hľadaní, ignorujeme, kým nenájde kód
          }
        )
        .then(() => {
          setCameraReady(true);
          setCameraError(null);
        })
        .catch((err) => {
          console.error("Chyba štartu kamery:", err);
          setCameraError("Nepodarilo sa získať prístup ku kamere.");
        });
      } catch (e) {
        console.error("Html5Qrcode zlyhal:", e);
      }
    }, 300);
  };

  const stopWebScanner = () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      html5QrcodeRef.current.stop().then(() => {
        console.log("📷 PWA Kamera bezpečne vypnutá.");
        setCameraReady(false);
      }).catch(err => console.log("Chyba pri stopovaní kamery", err));
    }
  };

  // 🛡️ INTELIGENTNÝ STRÁŽCA: Zapína kameru iba keď sme na scéne a vypína ju okamžite pri odchode
  useEffect(() => {
    if (isFocused && !scannedData) {
      startWebScanner();
    } else {
      stopWebScanner();
    }

    return () => {
      stopWebScanner();
    };
  }, [isFocused, scannedData]);

  // --- NFC LISTENER (Ponechaný ako standby pre Android PWA) ---
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

  return (
    <SafeAreaView style={G.mainBackground}>
      
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        activeOpacity={0.7}
        style={G.topLeftBackButton}
      >
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={G.screenContainer}>
        <View style={{ width: '100%', maxWidth: 500, alignItems: 'center' }}>
          
          <View style={{ alignItems: 'center', marginBottom: 25, marginTop: 10 }}>
            <Text style={G.atelierTitle}>
              {scannedData ? (txt.title_ready || 'Hotovo') : (txt.title_scanning || 'QR/NFC sken')}
            </Text>
          </View>

          <Text style={[G.statusTextSmall, { color: '#c5a059', marginBottom: 15, textAlign: 'center' }]}>
            {scannedData ? (txt.signal_locked || '● SIGNAL_LOCKED') : (txt.scanner_active || '○ SCANNER_ACTIVE')}
          </Text>

          <View style={[G.card, { borderColor: scannedData ? ACCENT : '#222', alignItems: 'center', paddingVertical: 40, width: '100%' }]}>
            
            {/* 📐 OKNO PRE KAMERU / QR VÝSTUP */}
            <View style={[G.qrWrapper, { 
              width: 200,
              height: 200,
              borderColor: scannedData ? ACCENT : '#111',
              backgroundColor: scannedData ? '#FFF' : '#0a0a0a',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden' // Aby nám video nepretieklo cez okraj
            }]}>
              {scannedData ? (
                
                <View style={{ width: 180, height: 180, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <QRCode value={scannedData} size={180} />
                  <View style={{ position: 'absolute', width: 44, height: 44, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    <Image 
                      source={require('../assets/laria-seal.png')}
                      style={{ width: 38, height: 38, resizeMode: 'contain' }}
                    />
                  </View>
                </View>

              ) : (
                /* 🎥 REÁLNY WEBOVÝ VIDEO PRÚD PRE KAMERU */
                Platform.OS === 'web' ? (
                  <View style={{ width: '100%', height: '100%', position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
                    
                    {/* Element, do ktorého knižnica vstrekne <video> */}
                    <div id={scannerId} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    
                    {!cameraReady && !cameraError && (
                      <View style={{ position: 'absolute', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={ACCENT} style={{ marginBottom: 15 }} />
                        <Text style={[G.monoIdentity, { fontSize: 10, color: ACCENT }]}>{txt.searching_frequency || 'HĽADÁM FREKVENCIU...'}</Text>
                      </View>
                    )}

                    {cameraError && (
                      <Text style={[G.monoIdentity, { fontSize: 10, color: '#F00', padding: 10, textAlign: 'center' }]}>{cameraError}</Text>
                    )}
                  </View>
                ) : (
                  <View style={{ alignItems: 'center' }}>
                     <ActivityIndicator size="large" color={ACCENT} style={{ marginBottom: 15 }} />
                     <Text style={[G.monoIdentity, { fontSize: 10, color: ACCENT }]}>LEN PRE WEBOVÉ PWA...</Text>
                  </View>
                )
              )}
            </View>

            {displayInfo && (
               <Text style={[G.monoIdentity, { marginTop: 25, color: ACCENT, fontSize: 10 }]}>
                 FING: {displayInfo.fing?.toUpperCase()}
               </Text>
            )}
          </View>

          {/* ↩️ Spodný návrat */}
          <TouchableOpacity 
            style={[G.backToAtelierBtn, { marginTop: 40 }]}
            onPress={() => navigation.goBack()} 
            activeOpacity={0.7}
          >
            <Text style={G.primaryBtnText}>
              {txt.btn_back || 'NÁVRAT DO ATELIÉRU'}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView> 
    </SafeAreaView>
  );
}