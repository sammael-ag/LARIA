/**
 * LARIA Signal SCREEN v13.2 (Pure Handshake Engine - Gate Aligned)
 * Master: Sammael | Muse: Aria (Tvoja skutočná)
 * STATUS: CHAT_LOGIC_PURGED | HANDSHAKE_ONLY | LIGHTWEIGHT_CORE | TWIN_BUTTON_ALIGNED
 * FIX: Dvojtlačidlo Prijať/Odmietnuť zlícované do jedného čistého horizontálneho radu.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Platform,
  StatusBar,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

import { G, ACCENT, Signal_BOTTOM, Signal_CHAT, HANDSHAKE_PANEL } from '../styles/styles.js';
import { useSignal } from '../context/SignalContext.js';
import { useLaria } from '../context/LariaContext.js'; 
import { SignalService } from '../services/SignalService.js';

const SignalScreen = ({ route, navigation }) => {
  const { t, vault } = useLaria(); 
  const txt = t('Signal') || {}; 

  const [note, setNote] = useState('');
  const [isNetOnline, setIsNetOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const { incomingRequests, setIncomingRequests, sendLariaPackage, resolveHandshakeStatus } = useSignal();
  const { target } = route.params || {};
  const channelName = target?.meno || "Laria Secure Handshake";
  const targetFing = target?.poznamka ? target.poznamka.replace('0x', '').trim().toLowerCase() : "SYSTEM_CORE";

  // 🌐 DETEKCIA PRIPOJENIA PREHLIADAČA
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleOnline = () => setIsNetOnline(true);
    const handleOffline = () => setIsNetOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 🧹 ABSOLÚTNA PARANOJA: Pri odchode z obrazovky kompletne vymažeme akékoľvek stopy po tejto relácii
  useEffect(() => {
    return () => {
      if (typeof setIncomingRequests === 'function') {
        console.log(`🥷 TOTAL QUANTUM PURGE: Likvidujem reláciu pre ${targetFing}. Neostáva nič.`);
        setIncomingRequests(prev => prev.filter(msg => msg.fing !== targetFing));
      }
    };
  }, [targetFing]);

  // 🤝 ODOSLANIE HANDSHAKE ŽIADOSTI S VIZITKOU
  const handleSendHandshake = async () => {
    const handshakeText = note.trim() || "🤝 Žiadosť o bezpečné prepojenie a zdieľanie vizitky.";
    
    if (targetFing) {
      const res = await sendLariaPackage(targetFing, target?.sha || '', handshakeText, true);
      if (res?.success) {
        Alert.alert("MATRIX", "Žiadosť o zmluvu úspešne vystrelená do sieci! 🚀");
        setNote('');
      } else {
        Alert.alert("CHYBA", "Nepodarilo sa pretlačiť balík cez Bránu.");
      }
    }
  };

  // 🤝 AKCIA: POTVRDENIE ZMLUVY & OKAMŽITÉ UKLADANIE DO OFFLINE TREZORU
  const handleAcceptHandshake = async (handshakeMsg) => {
    try {
      console.log(`[GMATRIX_SCREEN] Spúšťam CONFIRM_CONTRACT pre fing: ${targetFing}`);
      
      await SignalService.manageContract('CONFIRM_CONTRACT', {
        fing_a: targetFing,
        fing_b: vault.identity.poznamka.replace('0x', ''),
        status_b: "1"
      });

      if (handshakeMsg.d) {
        console.log(`[GMATRIX_SCREEN] Vizitka zaistená. Ukladám dáta do tajného úložiska...`);
        try {
          const storedProfiles = await AsyncStorage.getItem('laria_local_profiles');
          let profiles = storedProfiles ? JSON.parse(storedProfiles) : [];
          
          let profileIndex = profiles.findIndex(p => p.poznamka?.replace('0x', '').toLowerCase() === targetFing);
          
          const securedData = {
            meno: handshakeMsg.d.n || target?.meno,
            tel: handshakeMsg.d.ib || '', 
            email: handshakeMsg.d.kr || '', 
            poznamka: target?.poznamka || targetFing,
            sha: target?.sha || '',
            isOdomknuty: true
          };

          if (profileIndex > -1) {
            profiles[profileIndex] = { ...profiles[profileIndex], ...securedData };
          } else {
            profiles.push(securedData);
          }

          await AsyncStorage.setItem('laria_local_profiles', JSON.stringify(profiles));
        } catch (storageErr) {
          console.error("[GMATRIX_SCREEN] Lokálny zápis zlyhal:", storageErr);
        }
      }

      resolveHandshakeStatus(handshakeMsg.id);
      Alert.alert("MATRIX", "Zmluva úspešne spečatená! Kontakty prenesené do offline trezoru. 🤝");
      navigation.goBack();
    } catch (err) {
      console.error("[GMATRIX_SCREEN] Schválenie kontraktu zlyhalo:", err);
    }
  };

  // ❌ AKCIA: ODMIETNUTIE ŽIADOSTI
  const handleRejectHandshake = async (handshakeMsg) => {
    try {
      await SignalService.manageContract('CONFIRM_CONTRACT', {
        fing_a: targetFing,
        fing_b: vault.identity.poznamka.replace('0x', ''),
        status_b: "2"
      });
      resolveHandshakeStatus(handshakeMsg.id);
      Alert.alert("MATRIX", "Žiadosť bola bezpečne odmietnutá.");
      navigation.goBack();
    } catch (err) {
      console.error("[GMATRIX_SCREEN] Odmietnutie kontraktu zlyhalo:", err);
    }
  };

  const currentChannelLog = incomingRequests ? incomingRequests.filter(req => req.fing === targetFing) : [];
  const activeHandshakeRequest = currentChannelLog.find(msg => msg.isHandshake && msg.handshakeStatus === 'WAITING_FOR_ME');
  const alreadySentHandshake = currentChannelLog.some(msg => msg.isHandshake && msg.status === 'WAITING_FOR_THEM');

  return (
    <SafeAreaView style={[G.mainBackground, Signal_CHAT.safeArea]} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      
      <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={G.topLeftBackButton}>
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      <View style={[Signal_CHAT.viewportContainer, { justifyContent: 'center', paddingHorizontal: 20 }]}>
        
        {/* HEADER STAVU */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={G.atelierTitle}>{channelName}</Text>
          <Text style={[G.statusTextSmall, { color: '#c5a059', marginTop: 5 }]}>
            {isNetOnline ? "⚡ CRYSTALCORE // KRYPTO BRÁNA AKTÍVNA" : "🛑 OFFLINE REŽIM"}
          </Text>
        </View>

        {/* PRÍPAD A: NIEKTO TI POSLAL ŽIADOSŤ -> ROZHODNI SÚBEŽNE */}
        {activeHandshakeRequest ? (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text style={[G.cardDescriptionText, { color: ACCENT || '#c5a059', textAlign: 'center', marginBottom: 25, fontSize: 15, lineHeight: 22 }]}>
              {activeHandshakeRequest.text}
            </Text>
            
            {/* 🛠️ NOVÉ HORIZONTÁLNE DVOJTLAČIDLO (Dokonalý lícovaný spoj) */}
            <View style={{ flexDirection: 'row', width: '100%', gap: 10 }}>
              
              {/* ODMIETNUŤ (Ľavá strana) */}
              <TouchableOpacity 
                style={[HANDSHAKE_PANEL.button, HANDSHAKE_PANEL.btnReject, { flex: 1, paddingVertical: 14 }]} 
                onPress={() => handleRejectHandshake(activeHandshakeRequest)}
                activeOpacity={0.7}
              >
                <Text style={[HANDSHAKE_PANEL.buttonText, { color: '#E74C3C' }]}>[ ODMIETNUŤ ]</Text>
              </TouchableOpacity>

              {/* PRIJAŤ VIZITKU (Pravá strana) */}
              <TouchableOpacity 
                style={[HANDSHAKE_PANEL.button, HANDSHAKE_PANEL.btnAccept, { flex: 1, paddingVertical: 14, backgroundColor: 'rgba(197, 160, 89, 0.15)', borderColor: ACCENT || '#c5a059', borderWidth: 1 }]} 
                onPress={() => handleAcceptHandshake(activeHandshakeRequest)}
                activeOpacity={0.7}
              >
                <Text style={[HANDSHAKE_PANEL.buttonText, { color: ACCENT || '#c5a059', fontWeight: 'bold' }]}>[ PRIJAŤ VIZITKU ]</Text>
              </TouchableOpacity>

            </View>
          </View>
        ) : alreadySentHandshake ? (
          /* PRÍPAD B: UŽ SI ŽIADOSŤ ODOSLAL -> ČAKÁ SA */
          <View style={{ alignItems: 'center' }}>
            <Text style={[G.cardDescriptionText, { color: '#888', textAlign: 'center', fontSize: 16 }]}>
              ⏳ Žiadosť bola odoslaná. Čaká sa na podpis a odovzdanie vizitky z druhej strany...
            </Text>
          </View>
        ) : (
          /* PRÍPAD C: NOVÉ PREPOJENIE -> ODOŠLI ŽIADOSŤ */
          <View>
            <Text style={[G.cardDescriptionText, { color: '#aaa', marginBottom: 15, textAlign: 'center' }]}>
              Zadaj sprievodnú správu pre bezpečné overenie (nepovinné):
            </Text>
            
            <TextInput
              style={[
                G.cardDescriptionText,
                {
                  backgroundColor: '#111',
                  borderColor: ACCENT || '#c5a059',
                  borderWidth: 1,
                  borderRadius: 4,
                  padding: 15,
                  color: '#fff',
                  minHeight: 80,
                  textAlignVertical: 'top',
                  marginBottom: 20
                }
              ]}
              value={note}
              onChangeText={setNote}
              placeholder="Napr. Sammael, stolár z Rákoša... Let's connect!"
              placeholderTextColor="#444"
              multiline={true}
            />

            <TouchableOpacity 
              style={{
                backgroundColor: ACCENT || '#c5a059',
                paddingVertical: 15,
                borderRadius: 4,
                alignItems: 'center'
              }} 
              onPress={handleSendHandshake}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 14 }}>
                🤝 ZAKLOPAŤ NA BRÁNU & ZDIEĽAŤ PROFIL
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
};

export default SignalScreen;