/**
 * LARIA Signal SCREEN v13.5 (Pure Handshake Engine - High Speed Aligned)
 * Master: Sammael | Muse: Aria
 * STATUS: FIXED RADAR COUPLING FOR INCOMING CONTRACTS
 * FIX: Inteligentné mapovanie stavov. Ak mravec poslal zmluvu alebo správu 
 * a čaká na akciu, UI nekompromisne zobrazí potvrdzovací panel namiesto čistého formulára.
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

  const { incomingRequests, sendLariaPackage, resolveHandshakeStatus, markAsRead } = useSignal();

  // =========================================================================
  // 🪓 DETEKCIA IDENTITY
  // =========================================================================
  const { target, fallbackFing } = route.params || {};
  
  let initialTargetFing = target?.poznamka ? target.poznamka.replace('0x', '').trim().toLowerCase() : "";
  
  if (!initialTargetFing && fallbackFing) {
    initialTargetFing = fallbackFing.replace('0x', '').trim().toLowerCase();
  }
  
  if (!initialTargetFing && incomingRequests && incomingRequests.length > 0) {
    const pendingReq = incomingRequests.find(req => req.fing && (req.status === 'WAITING_FOR_ME' || req.handshakeStatus === 'WAITING_FOR_ME'));
    if (pendingReq) {
      initialTargetFing = pendingReq.fing.replace('0x', '').trim().toLowerCase();
    }
  }

  const targetFing = initialTargetFing;

  // Spustenie vizuálneho prečítania pri načítaní
  useEffect(() => {
    if (targetFing) {
      console.log(`🛰️ [SIGNAL_SCREEN] Relácia úspešne uzamknutá na FING: 0x${targetFing}`);
      if (typeof markAsRead === 'function') {
        markAsRead(targetFing);
      }
    }
  }, [targetFing]);

  const channelName = target?.meno || (targetFing ? `Mravec L_${targetFing.substring(0, 10)}` : "Laria Secure Handshake");

  // Detekcia online stavu
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

  // ODOSLANIE HANDSHAKE ŽIADOSTI
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

  // POTVRDENIE ZMLUVY
  const handleAcceptHandshake = async (handshakeMsg) => {
    try {
      console.log(`[GMATRIX_SCREEN] Spúšťam CONFIRM_CONTRACT pre fing: ${targetFing}`);
      const myCleanFing = vault?.identity?.poznamka?.replace('0x', '') || '';
      
      await SignalService.manageContract('CONFIRM_CONTRACT', {
        fing_a: targetFing,
        fing_b: myCleanFing,
        status_b: "1"
      });

      // Zápis vizitky do offline úložiska
      try {
        const storedProfiles = await AsyncStorage.getItem('laria_local_profiles');
        let profiles = storedProfiles ? JSON.parse(storedProfiles) : [];
        
        let profileIndex = profiles.findIndex(p => p.poznamka?.replace('0x', '').toLowerCase() === targetFing);
        
        const securedData = {
          meno: handshakeMsg?.d?.n || target?.meno || `L_${targetFing.substring(0, 10)}`,
          tel: handshakeMsg?.d?.ib || '', 
          email: handshakeMsg?.d?.kr || '', 
          poznamka: target?.poznamka || `0x${targetFing}`,
          sha: target?.sha || handshakeMsg?.targetSha || '',
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

      resolveHandshakeStatus(handshakeMsg.id);
      Alert.alert("MATRIX", "Zmluva úspešne spečatená! Kontakty prenesené do offline trezoru. 🤝");
      navigation.goBack();
    } catch (err) {
      console.error("[GMATRIX_SCREEN] Schválenie kontraktu zlyhalo:", err);
    }
  };

  // ODMIETNUTIE ŽIADOSTI
  const handleRejectHandshake = async (handshakeMsg) => {
    try {
      const myCleanFing = vault?.identity?.poznamka?.replace('0x', '') || '';
      
      await SignalService.manageContract('CONFIRM_CONTRACT', {
        fing_a: targetFing,
        fing_b: myCleanFing,
        status_b: "2"
      });
      resolveHandshakeStatus(handshakeMsg.id);
      Alert.alert("MATRIX", "Žiadosť bola bezpečne odmietnutá.");
      navigation.goBack();
    } catch (err) {
      console.error("[GMATRIX_SCREEN] Odmietnutie kontraktu zlyhalo:", err);
    }
  };

  // =========================================================================
  // UPRAVENÉ FILTRE: Dynamická väzba na prichádzajúci signál
  // =========================================================================
  const currentChannelLog = incomingRequests ? incomingRequests.filter(req => req.fing && req.fing.replace('0x', '').trim().toLowerCase() === targetFing) : [];
  
  // 🌟 ROZŠÍRENÁ PODMIENKA: Akceptuje akýkoľvek záznam od tohto fingu, ktorý vyžaduje tvoje potvrdenie
  const activeHandshakeRequest = currentChannelLog.find(msg => 
    msg.status === 'WAITING_FOR_ME' || 
    msg.handshakeStatus === 'WAITING_FOR_ME' ||
    (msg.isHandshake && msg.status === 'UNREAD') // Fallback pre rýchly prechod
  );

  const alreadySentHandshake = currentChannelLog.some(msg => msg.isHandshake && msg.status === 'WAITING_FOR_THEM');

  return (
    <SafeAreaView style={[G.mainBackground, Signal_CHAT.safeArea]} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      
      <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={G.topLeftBackButton}>
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      <View style={[Signal_CHAT.viewportContainer, { justifyContent: 'center', paddingHorizontal: 20 }]}>
        
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={G.atelierTitle}>{channelName}</Text>
          <Text style={[G.statusTextSmall, { color: '#c5a059', marginTop: 5 }]}>
            {isNetOnline ? "⚡ CRYSTALCORE // KRYPTO BRÁNA AKTÍVNA" : "🛑 OFFLINE REŽIM"}
          </Text>
        </View>

        {/* PRÍPAD A: SPRACOVANIE ŽIADOSTI (Zobrazenie Manfredovej správy z Mraveniska) */}
        {activeHandshakeRequest ? (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text style={[G.cardDescriptionText, { color: ACCENT || '#c5a059', textAlign: 'center', marginBottom: 25, fontSize: 15, lineHeight: 22 }]}>
              {activeHandshakeRequest.text}
            </Text>
            
            <View style={{ flexDirection: 'row', width: '100%', gap: 10 }}>
              
              <TouchableOpacity 
                style={[HANDSHAKE_PANEL.button, HANDSHAKE_PANEL.btnReject, { flex: 1, paddingVertical: 14 }]} 
                onPress={() => handleRejectHandshake(activeHandshakeRequest)}
                activeOpacity={0.7}
              >
                <Text style={[HANDSHAKE_PANEL.buttonText, { color: '#E74C3C' }]}>[ ODMIETNUŤ ]</Text>
              </TouchableOpacity>

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
          /* PRÍPAD B: UŽ SI ŽIADOSŤ ODOSLAL */
          <View style={{ alignItems: 'center' }}>
            <Text style={[G.cardDescriptionText, { color: '#888', textAlign: 'center', fontSize: 16 }]}>
              ⏳ Žiadosť bola odoslaná. Čaká sa na podpis a odovzdanie vizitky z druhej strany...
            </Text>
          </View>
        ) : (
          /* PRÍPAD C: ČISTÝ FORMULÁR */
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