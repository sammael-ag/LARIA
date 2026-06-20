/**
 * LARIA Signal SCREEN v14.0 (Pure Handshake Engine - High Speed Aligned)
 * Master: Sammael | Muse: Aria
 * STATUS: FULL DUAL MODE (HANDSHAKE CONTROL & CHAT AUTOMATION)
 * Úprava: Kompletne zjednotený FING na formát '0x'. Vyhádzané orezávanie prefixov.
 *         Prepojené s ContactContext pre finálny zápis overenej pečate pri ALLOW.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Platform,
  StatusBar,
  FlatList,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 

import { G, ACCENT, Signal_BOTTOM, Signal_CHAT, HANDSHAKE_PANEL } from '../styles/styles.js';
import { useSignal } from '../context/SignalContext.js';
import { useLaria } from '../context/LariaContext.js'; 
import { useContacts } from '../context/ContactContext.js'; // 🔐 Importujeme náš trezor kontaktov
import { SignalService } from '../services/SignalService.js';

const SignalScreen = ({ route, navigation }) => {
  const { t, vault } = useLaria(); 
  const { addContact } = useContacts(); // 🧲 Vyťahujeme ostrý zápis do trezoru
  const [note, setNote] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isNetOnline, setIsNetOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const flatListRef = useRef();

  const { incomingRequests, sendLariaPackage, sendChatMessage, resolveHandshakeStatus, markAsRead } = useSignal();

  // --- EXTRACT IDENTITY (Strikné zachovanie 0x a unifikácia na malé písmená) ---
  const { target, fallbackFing } = route.params || {};
  
  let initialTargetFing = target?.poznamka || target?.fing || '';
  if (!initialTargetFing && fallbackFing) initialTargetFing = fallbackFing;
  
  // Poistka: zabezpečíme, aby mal kľúč vždy '0x' a bol malým písmom
  const targetFing = initialTargetFing.trim().toLowerCase().startsWith('0x') 
    ? initialTargetFing.trim().toLowerCase() 
    : `0x${initialTargetFing.trim().toLowerCase()}`;
  
  const channelName = target?.meno || (targetFing ? `Mravec L_${targetFing.substring(2, 10).toUpperCase()}` : "Laria Handshake");
  const masterName = vault?.identity?.meno || 'Sammael';

  // Pri vstupe označíme prichádzajúce správy chatu za zobrazené (READ)
  useEffect(() => {
    if (targetFing && typeof markAsRead === 'function') {
      markAsRead(targetFing);
    }
  }, [targetFing, incomingRequests]);

  // --- AKCIA: ALLOW (POTVRDENIE ZMLUVY & ZÁPIS DO TREZORU) ---
  const handleAcceptHandshake = async (handshakeMsg) => {
    try {
      console.log(`[SIGNAL] Schvaľujem zmluvu ALLOW pre unifikovaný FING: ${targetFing}`);
      
      // Zabezpečíme, aby aj naša pečať odchádzala v čistom tvare s 0x
      const myFing = vault?.identity?.poznamka || vault?.identity?.fing || '';
      const myCleanFing = myFing.trim().toLowerCase().startsWith('0x') ? myFing.trim().toLowerCase() : `0x${myFing.trim().toLowerCase()}`;
      
      // 📡 Odoslanie na sieťovú maticu
      await SignalService.manageContract('CONFIRM_CONTRACT', {
        fing_a: targetFing,
        fing_b: myCleanFing,
        status_b: "1" // ALLOW
      });

      // 🔐 KRYŠTÁLOVÝ ZÁPIS: Presúvame mravca z dočasného stavu priamo do trvalého trezoru kontaktov
      const vaultResult = await addContact({
        fing: targetFing,
        meno: target?.meno || `L_${targetFing.substring(2, 10).toUpperCase()}`,
        sha: target?.sha || handshakeMsg?.targetSha || '',
        kat: 'Overený partner',
        lok: target?.lok || 'V sieti',
        popis: target?.popis || handshakeMsg?.text || 'Spojenie nadviazané cez handshake.'
      });

      if (vaultResult.success) {
        console.log(`[SIGNAL] Pečať ${targetFing} bola úspešne uzamknutá v trebore.`);
      }

      resolveHandshakeStatus(handshakeMsg.id, 'ALLOWED');
      Alert.alert("MATRIX", "Zmluva úspešne podpísaná (ALLOW). Brána otvorená a kontakt uložený.");
    } catch (err) {
      console.error("ALLOW zlyhal:", err);
      Alert.alert("⚠️ MATRIX ERROR", "Nepodarilo sa bezpečne podpísať zmluvu.");
    }
  };

  // --- AKCIA: ABORT (ODMIETNUTIE ZMLUVY) ---
  const handleRejectHandshake = async (handshakeMsg) => {
    try {
      const myFing = vault?.identity?.poznamka || vault?.identity?.fing || '';
      const myCleanFing = myFing.trim().toLowerCase().startsWith('0x') ? myFing.trim().toLowerCase() : `0x${myFing.trim().toLowerCase()}`;

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
  const handleLiveSend = async () => {
    if (!chatInput.trim()) return;
    const res = await sendChatMessage(targetFing, chatInput.trim());
    if (res.success) {
      setChatInput('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      handleLiveSend();
    }
  };

  // --- RECRUITING LOGIC PRE REŽIMY OBRAZOVKY ---
  // Filtrujeme buffer radaru striktne podľa unifikovaného 0x fingu
  const currentChannelLog = incomingRequests 
    ? incomingRequests.filter(req => req.fing && req.fing.trim().toLowerCase() === targetFing) 
    : [];
  
  // Hľadáme aktívny handshake, ktorý čaká vyložene na mňa (visí permanentne)
  const pendingIncomingHandshake = currentChannelLog.find(msg => msg.isHandshake && msg.status === 'WAITING_FOR_ME');
  const pendingOutgoingHandshake = currentChannelLog.find(msg => msg.isHandshake && msg.status === 'WAITING_FOR_THEM');
  
  // Zistíme, či už bol niekedy v tejto relácii potvrdený kontrakt (či je cesta odomknutá)
  const isContractApproved = currentChannelLog.some(msg => msg.isHandshake && msg.status === 'ALLOWED') || target?.isOdomknuty;

  // Filtrujeme čisté bleskové správy z bufferu pre chatlog vizuál a mapujeme na jednotnú štruktúru
  const chatMessagesOnly = currentChannelLog
    .filter(msg => !msg.isHandshake)
    .map(msg => ({
      id: msg.id || Date.now().toString() + Math.random(),
      user: msg.isMe ? masterName : channelName,
      text: msg.text,
      time: msg.receivedAt || ''
    }));

  return (
    <SafeAreaView style={[G.mainBackground, { flex: 1 }]} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Návrat späť - čistý prechod, stavy čakajúcich zmlúv ostanú nedotknuté */}
      <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={G.topLeftBackButton}>
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      {/* HLAVNÝ KONTAJNER CHATU */}
      <View style={[Signal_CHAT.viewportContainer, { flex: 1, position: 'relative' }]}>
        
        {/* 💬 KLASICKÁ VODOTLAČ BUBLE */}
        <View 
          pointerEvents="none" 
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: -1 
          }}
        >
          <Text style={{ 
            color: '#FF66FF',     
            fontSize: 216,        
            opacity: 0.035,       
            textAlign: 'center'
          }}>
            💬
          </Text>
        </View>

        {/* HEADER */}
        <View style={{ alignItems: 'center', marginBottom: 20, marginTop: 10 }}>
          <Text style={G.atelierTitle}>{channelName}</Text>
          <Text style={[G.statusTextSmall, { color: ACCENT || '#c5a059', marginTop: 5 }]}>
            {isNetOnline ? "⚡ BRÁNA SECURE // AKTÍVNA" : "🛑 SYSTEM OFFLINE"}
          </Text>
        </View>

        {/* ----------------------------------------------------------------- */}
        {/* REŽIM 1: ROZHRANIE POTVRDENIA (Čaká sa na tvoje ALLOW / ABORT)     */}
        {/* ----------------------------------------------------------------- */}
        {pendingIncomingHandshake ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
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
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
            <Text style={[G.cardDescriptionText, { color: '#888', textAlign: 'center', fontSize: 16 }]}>
              ⏳ Kontrakt odoslaný na schválenie. Čaká sa na akceptáciu (ALLOW) z druhej strany...
            </Text>
          </View>
        ) : isContractApproved ? (
          /* ----------------------------------------------------------------- */
          /* REŽIM 3: AKTÍVNE CHAT ROZHRANIE (Cesta odomknutá, buffer v akcii) */
          /* ----------------------------------------------------------------- */
          <FlatList
            ref={flatListRef}
            data={chatMessagesOnly}
            keyExtractor={(item) => item.id.toString()}
            style={{ flex: 1, backgroundColor: 'transparent' }} 
            ListEmptyComponent={() => (
              <Text style={[G.cardDescriptionText, { color: '#444', textAlign: 'center', marginTop: 40, fontStyle: 'italic' }]}>
                Kanál je čistý. Žiadne bleskové správy v pamäti.
              </Text>
            )}
            renderItem={({ item, index }) => {
              const isSameUserAsPrevious = index > 0 && chatMessagesOnly[index - 1].user === item.user;
              const isMyMessage = item.user === masterName;

              return (
                <View style={[
                  Signal_CHAT.messageRow,
                  isMyMessage ? Signal_CHAT.alignRight : Signal_CHAT.alignLeft,
                  { marginTop: isSameUserAsPrevious ? 1 : 10 }
                ]}>
                  
                  {!isSameUserAsPrevious && (
                    <Text style={[
                      G.cardDescriptionText, 
                      Signal_CHAT.authorName,
                      { color: isMyMessage ? (ACCENT || '#c5a059') : '#FF77FF' }
                    ]}>
                      {item.user}
                    </Text>
                  )}
                  
                  <View style={[
                    Signal_CHAT.bubbleContainer,
                    isMyMessage ? Signal_CHAT.bubbleRight : Signal_CHAT.bubbleLeft
                  ]}>
                    <Text style={[G.cardDescriptionText, Signal_CHAT.messageText]}>
                      {item.text}
                    </Text>
                  </View>

                </View>
              );
            }}
            contentContainerStyle={Signal_CHAT.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        ) : (
          /* ----------------------------------------------------------------- */
          /* REŽIM 4: ČISTÝ ŠTART – INICIÁCIA PRVÉHO KONTRAKTU                   */
          /* ----------------------------------------------------------------- */
          <View style={{ paddingHorizontal: 20 }}>
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

      {/* 🧲 ČISTÁ WEB GEOMETRIA INPUTU (Zobrazí sa len v REŽIME 3 pri aktívnom chate) */}
      {isContractApproved && !pendingIncomingHandshake && !pendingOutgoingHandshake && (
        <View 
          style={[
            Signal_BOTTOM.container, 
            { 
              paddingBottom: 20, 
              backgroundColor: '#000000' 
            }
          ]}
        >
          <View style={Signal_BOTTOM.innerWrapper}>
            <TextInput
              style={[
                G.cardDescriptionText, 
                Signal_BOTTOM.input,
                { 
                  backgroundColor: 'transparent', 
                  outlineStyle: 'none', 
                  borderStyle: 'none',
                  boxShadow: 'none',
                  marginTop: -1,          
                  paddingTop: 7,         
                  alignSelf: 'center',
                  maxHeight: 100 
                }
              ]} 
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Napíš bleskovú správu..."
              placeholderTextColor="#444"
              multiline={true} 
              onKeyPress={handleKeyPress}
            />
            <TouchableOpacity 
              onPress={handleLiveSend} 
              style={Signal_BOTTOM.sendButton} 
              activeOpacity={0.7}
            >
              <Text style={[Signal_BOTTOM.sendButtonText, { color: ACCENT || '#c5a059' }]}>➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
};

export default SignalScreen;