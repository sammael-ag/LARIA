/**
 * LARIA Signal SCREEN v13.7 (Pure Handshake Engine - High Speed Aligned)
 * Master: Sammael | Muse: Aria
 * STATUS: FULL DUAL MODE (HANDSHAKE CONTROL & CHAT AUTOMATION)
 * FIX: Opravená syntax komentárov v JSX, ktoré spôsobovali chyby parseru.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Platform,
  StatusBar,
  ScrollView,
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
  const [note, setNote] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isNetOnline, setIsNetOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const scrollViewRef = useRef();

  const { incomingRequests, sendLariaPackage, sendChatMessage, resolveHandshakeStatus, markAsRead } = useSignal();

  // --- EXTRACT IDENTITY ---
  const { target, fallbackFing } = route.params || {};
  let initialTargetFing = target?.poznamka ? target.poznamka.replace('0x', '').trim().toLowerCase() : "";
  if (!initialTargetFing && fallbackFing) initialTargetFing = fallbackFing.replace('0x', '').trim().toLowerCase();
  
  const targetFing = initialTargetFing;
  const channelName = target?.meno || (targetFing ? `Mravec L_${targetFing.substring(0, 10)}` : "Laria Handshake");

  // Pri vstupe označíme prichádzajúce správy chatu za zobrazené (READ)
  useEffect(() => {
    if (targetFing && typeof markAsRead === 'function') {
      markAsRead(targetFing);
    }
  }, [targetFing, incomingRequests]);

  // Automatické scrollovanie chatu na spodok pri novej správe
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [incomingRequests]);

  // --- AKCIA: ALLOW (POTVRDENIE ZMLUVY) ---
  const handleAcceptHandshake = async (handshakeMsg) => {
    try {
      console.log(`[SIGNAL] Schvaľujem zmluvu ALLOW pre FING: ${targetFing}`);
      const myCleanFing = vault?.identity?.poznamka?.replace('0x', '') || '';
      
      await SignalService.manageContract('CONFIRM_CONTRACT', {
        fing_a: targetFing,
        fing_b: myCleanFing,
        status_b: "1" // ALLOW
      });

      // Zápis vizitky do tajného lokálneho úložiska
      try {
        const storedProfiles = await AsyncStorage.getItem('laria_local_profiles');
        let profiles = storedProfiles ? JSON.parse(storedProfiles) : [];
        let pIdx = profiles.findIndex(p => p.poznamka?.replace('0x', '').toLowerCase() === targetFing);
        
        const securedData = {
          meno: target?.meno || `L_${targetFing.substring(0, 10)}`,
          poznamka: target?.poznamka || `0x${targetFing}`,
          sha: target?.sha || handshakeMsg?.targetSha || '',
          isOdomknuty: true
        };

        if (pIdx > -1) profiles[pIdx] = { ...profiles[pIdx], ...securedData };
        else profiles.push(securedData);

        await AsyncStorage.setItem('laria_local_profiles', JSON.stringify(profiles));
      } catch (err) {
        console.error("Chyba trezoru:", err);
      }

      resolveHandshakeStatus(handshakeMsg.id, 'ALLOWED');
      Alert.alert("MATRIX", "Zmluva úspešne podpísaná (ALLOW). Brána otvorená.");
    } catch (err) {
      console.error("ALLOW zlyhal:", err);
    }
  };

  // --- AKCIA: ABORT (ODMIETNUTIE ZMLUVY) ---
  const handleRejectHandshake = async (handshakeMsg) => {
    try {
      const myCleanFing = vault?.identity?.poznamka?.replace('0x', '') || '';
      await SignalService.manageContract('CONFIRM_CONTRACT', {
        fing_a: targetFing,
        fing_b: myCleanFing,
        status_b: "2" // ABORT
      });
      resolveHandshakeStatus(handshakeMsg.id, 'ABORTED');
      Alert.alert("MATRIX", "Zmluva zrušená (ABORT).");
      navigation.goBack();
    } catch (err) {
      console.error("ABORT zlyhal:", err);
    }
  };

  // --- ODOSLANIE ČISTEJ BULLETOVEJ SPRÁVY ---
  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const res = await sendChatMessage(targetFing, chatInput.trim());
    if (res.success) setChatInput('');
  };

  // --- RECRUITING LOGIC PRE REŽIMY OBRAZOVKY ---
  const currentChannelLog = incomingRequests ? incomingRequests.filter(req => req.fing && req.fing.replace('0x', '').trim().toLowerCase() === targetFing) : [];
  
  // Hľadáme aktívny handshake, ktorý čaká vyložene na mňa (visí permanentne)
  const pendingIncomingHandshake = currentChannelLog.find(msg => msg.isHandshake && msg.status === 'WAITING_FOR_ME');
  const pendingOutgoingHandshake = currentChannelLog.find(msg => msg.isHandshake && msg.status === 'WAITING_FOR_THEM');
  
  // Zistíme, či už bol niekedy v tejto relácii potvrdený kontrakt (či je cesta odomknutá)
  const isContractApproved = currentChannelLog.some(msg => msg.isHandshake && msg.status === 'ALLOWED') || target?.isOdomknuty;

  // Filtrujeme čisté bleskové správy z bufferu pre chatlog vizuál
  const chatMessagesOnly = currentChannelLog.filter(msg => !msg.isHandshake);

  return (
    <SafeAreaView style={[G.mainBackground, Signal_CHAT.safeArea]} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      
      {/* Návrat späť - čistý prechod, stavy čakajúcich zmlúv ostanú nedotknuté */}
      <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={G.topLeftBackButton}>
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      <View style={[Signal_CHAT.viewportContainer, { paddingHorizontal: 20, paddingBottom: 15 }]}>
        
        {/* HEADER */}
        <View style={{ alignItems: 'center', marginBottom: 25, marginTop: 10 }}>
          <Text style={G.atelierTitle}>{channelName}</Text>
          <Text style={[G.statusTextSmall, { color: '#c5a059', marginTop: 5 }]}>
            {isNetOnline ? "⚡ BRÁNA SECURE // AKTÍVNA" : "🛑 SYSTEM OFFLINE"}
          </Text>
        </View>

        {/* ----------------------------------------------------------------- */}
        {/* REŽIM 1: ROZHRANIE POTVRDENIA (Čaká sa na tvoje ALLOW / ABORT)     */}
        {/* ----------------------------------------------------------------- */}
        {pendingIncomingHandshake ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: '#333', padding: 20, borderRadius: 6, width: '100%' }}>
              <Text style={[G.statusTextSmall, { color: '#aaa', marginBottom: 10, textTransform: 'uppercase' }]}>⚠️ Prichádzajúca Pečať (Bunka H):</Text>
              <Text style={[G.cardDescriptionText, { color: '#fff', marginBottom: 25, fontSize: 15, lineHeight: 22, textAlign: 'left' }]}>
                {pendingIncomingHandshake.text}
              </Text>
              
              <View style={{ flexDirection: 'row', width: '100%', gap: 10 }}>
                <TouchableOpacity 
                  style={[HANDSHAKE_PANEL.button, HANDSHAKE_PANEL.btnReject, { flex: 1, paddingVertical: 14 }]} 
                  onPress={() => handleRejectHandshake(pendingIncomingHandshake)}
                >
                  <Text style={[HANDSHAKE_PANEL.buttonText, { color: '#E74C3C' }]}>[ ABORT ]</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[HANDSHAKE_PANEL.button, { flex: 1, paddingVertical: 14, backgroundColor: 'rgba(197, 160, 89, 0.15)', borderColor: ACCENT || '#c5a059', borderWidth: 1, alignItems: 'center', borderRadius: 4 }]} 
                  onPress={() => handleAcceptHandshake(pendingIncomingHandshake)}
                >
                  <Text style={[HANDSHAKE_PANEL.buttonText, { color: ACCENT || '#c5a059', fontWeight: 'bold' }]}>[ ALLOW ]</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : pendingOutgoingHandshake ? (
          /* REŽIM 2: ODOSLANÝ KONTRAKT – ČAKÁ SA NA DRUHÚ STRANU */
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={[G.cardDescriptionText, { color: '#888', textAlign: 'center', fontSize: 16 }]}>
              ⏳ Kontrakt odoslaný na schválenie. Čaká sa na akceptáciu (ALLOW) z druhej strany...
            </Text>
          </View>
        ) : isContractApproved ? (
          /* ----------------------------------------------------------------- */
          /* REŽIM 3: AKTÍVNE CHAT ROZHRANIE (Cesta odomknutá, buffer v akcii) */
          /* ----------------------------------------------------------------- */
          <View style={{ flex: 1 }}>
            {/* Výpis bleskových správ chatu */}
            <ScrollView 
              ref={scrollViewRef}
              style={{ flex: 1, marginBottom: 15 }}
              contentContainerStyle={{ paddingVertical: 10 }}
            >
              {chatMessagesOnly.length === 0 ? (
                <Text style={[G.cardDescriptionText, { color: '#444', textAlign: 'center', marginTop: 40, fontStyle: 'italic' }]}>
                  Kanál je čistý. Žiadne bleskové správy v pamäti.
                </Text>
              ) : (
                chatMessagesOnly.map((msg) => (
                  <View 
                    key={msg.id} 
                    style={{
                      alignSelf: msg.isMe ? 'flex-end' : 'flex-start',
                      backgroundColor: msg.isMe ? 'rgba(197, 160, 89, 0.1)' : '#0f0f0f',
                      borderWidth: 1,
                      borderColor: msg.isMe ? ACCENT || '#c5a059' : '#222',
                      padding: 12,
                      borderRadius: 6,
                      marginBottom: 10,
                      maxWidth: '85%'
                    }}
                  >
                    <Text style={{ color: msg.isMe ? '#fff' : '#ccc', fontSize: 14 }}>{msg.text}</Text>
                    <Text style={{ color: '#555', fontSize: 10, alignSelf: 'flex-end', marginTop: 4 }}>{msg.receivedAt}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Vstupný riadok pre odosielanie správ */}
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: '#0a0a0a',
                  borderColor: '#333',
                  borderWidth: 1,
                  borderRadius: 4,
                  paddingHorizontal: 15,
                  paddingVertical: 12,
                  color: '#fff'
                }}
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Napíš bleskovú správu..."
                placeholderTextColor="#444"
              />
              <TouchableOpacity 
                style={{ backgroundColor: ACCENT || '#c5a059', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 4 }}
                onPress={handleSendChatMessage}
              >
                <Text style={{ color: '#000', fontWeight: 'bold' }}>POSLAŤ</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ----------------------------------------------------------------- */
          /* REŽIM 4: ČISTÝ ŠTART – INICIÁCIA PRVÉHO KONTRAKTU                   */
          /* ----------------------------------------------------------------- */
          <View>
            <Text style={[G.cardDescriptionText, { color: '#aaa', marginBottom: 15, textAlign: 'center' }]}>
              Zadaj sprievodnú správu pre bezpečné overenie zmluvy (bunka H):
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
              placeholder="Napr. Sammael, stolár... Let's connect!"
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
              onPress={() => sendLariaPackage(targetFing, target?.sha || '', note)}
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