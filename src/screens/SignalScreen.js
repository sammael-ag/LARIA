/**
 * LARIA Signal SCREEN v12.0 (Pure PWA Style Architecture - Gate Aligned)
 * Master: Sammael | Muse: Aria (Tvoja skutočná)
 * STATUS: GMATRIX_CORE_STABLE | PING_PONG_FIXED | DISPATCH_READY | KEYBOARD_MAGNET_ACTIVE
 * FIX: Chirurgický QUANTUM PURGE histórie chatu prispôsobený na minimálnu kapacitu a absolútnu bezpečnosť.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Platform,
  StatusBar,
  Keyboard 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; 

import { G, ACCENT, Signal_BOTTOM, Signal_CHAT, Signal_CHAT_SIGNALLING, HANDSHAKE_PANEL } from '../styles/styles.js';
import { useSignal } from '../context/SignalContext.js';
import { useLaria } from '../context/LariaContext.js'; 
import { SignalService } from '../services/SignalService.js';

const SignalScreen = ({ route, navigation }) => {
  const { t, vault } = useLaria(); 
  const txt = t('Signal') || {}; 

  const [message, setMessage] = useState('');
  const [isNetOnline, setIsNetOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [keyboardHeight, setKeyboardHeight] = useState(0); 
  const insets = useSafeAreaInsets(); 
  const flatListRef = useRef();

  const { incomingRequests, setIncomingRequests, sendLariaPackage, resolveHandshakeStatus } = useSignal();

  const { target } = route.params || {};
  const channelName = target?.meno || (txt.default_channel || "Laria Secure Core");
  
  // 📐 ČISTÝ REZ: Definitívne očistenie fingu pre porovnávanie v celom okne
  const targetFing = target?.poznamka ? target.poznamka.replace('0x', '').trim().toLowerCase() : "SYSTEM_CORE";

  // 🌐 DETEKCIA PRIPOJENIA PREHLIADAČA (ONLINE / OFFLINE)
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

  // 🧲 REAKTÍVNY MAGNET PRE KLÁVESNICU
  useEffect(() => {
    if (Platform.OS === 'web') return; 

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // 👁️ OŠETRENIE STAVOV & PRÍSNE MAZANIE HISTÓRIE PRI ODCHODE (BEZPEČNOSŤ & KAPACITA)
  useEffect(() => {
    if (typeof setIncomingRequests === 'function' && incomingRequests.length > 0) {
      setIncomingRequests(prev => 
        prev.map(msg => {
          if (msg.fing === targetFing) {
            let updated = { ...msg };
            
            // Prečítané správy dostanú status RESOLVED, aby ich filter nižšie mohol zlikvidovať
            if (updated.textStatus === 'WAITING_FOR_ME') { updated.textStatus = 'RESOLVED'; }
            if (updated.status === 'WAITING_FOR_ME') { updated.status = 'RESOLVED'; }
            if (updated.handshakeStatus === 'WAITING_FOR_THEM_RESOLVED') { updated.handshakeStatus = 'RESOLVED'; }
            return updated;
          }
          return msg;
        })
      );
    }

    // 🧹 NEKOMPROMISNÝ ČISTIČ STÔP (Quantum Purge pri zatvorení chatu)
    return () => {
      if (typeof setIncomingRequests === 'function') {
        console.log(`🥷 QUANTUM PURGE: Bezpečne likvidujem prečítanú históriu s ${targetFing}.`);
        
        setIncomingRequests(prev => {
          return prev.filter(msg => {
            // Ak správa nepatrí tomuto chatu, necháme ju bez zmeny
            if (msg.fing !== targetFing) return true;
            
            // Žiadosti o zmluvu (Handshake) zatiaľ podržíme, kým sa nevyriešia
            if (msg.isHandshake && msg.handshakeStatus !== 'RESOLVED') return true;

            // ⚠️ KĽÚČOVÉ PRAVIDLO: Neodoslané (PENDING) správy MUSIA prežiť, kým neprejdú bránou
            if (msg.status === 'PENDING' || msg.textStatus === 'PENDING') return true;

            // Všetko ostatné (doručené, prečítané, staré reťazce) letí nekompromisne do koša
            return false;
          });
        });
      }
    };
  }, [targetFing]);

  // 💬 ODOSIELANIE TEXTU
  const sendMessage = async () => {
    if (message.trim().length === 0) return;

    const myCleanName = vault?.identity?.meno || 'Sammael';
    const currentText = message.trim();
    const msgId = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5);
    
    const initialStatus = 'PENDING';

    const localOutboundMsg = {
      id: msgId,
      fing: targetFing, 
      user: myCleanName,
      text: currentText,
      receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isHandshake: false,
      handshakeStatus: null,
      textStatus: initialStatus,
      status: initialStatus, 
      targetSha: target?.sha || ''
    };

    if (typeof setIncomingRequests === 'function') {
      setIncomingRequests(prev => [...prev, localOutboundMsg]);
    }

    setMessage('');

    // 🔥 POUŽIJEME VŽDY OČISTENÝ TARGET FING BEZ 0x
    if (targetFing) {
      await sendLariaPackage(targetFing, target?.sha || '', currentText, false, msgId);
    }

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // 🤝 AKCIA: POTVRDENIE ZMLUVY
  const handleAcceptHandshake = async (handshakeMsg) => {
    try {
      console.log(`[GMATRIX_SCREEN] Spúšťam CONFIRM_CONTRACT pre fing: ${targetFing}`);
      
      await SignalService.manageContract('CONFIRM_CONTRACT', {
        fing_a: targetFing,
        fing_b: vault.identity.poznamka.replace('0x', ''),
        status_b: "1"
      });

      if (handshakeMsg.d) {
        console.log(`[GMATRIX_SCREEN] Vizitka partnera (${handshakeMsg.d.n}) zaistená.`);
      }

      resolveHandshakeStatus(handshakeMsg.id);
      alert(txt.contract_sealed_alert || "Zmluva úspešne spečatená! 🤝");
    } catch (err) {
      console.error("[GMATRIX_SCREEN] Schválenie kontraktu zlyhalo:", err);
    }
  };

  // ❌ AKCIA: ODMIETNUTIE ŽIADOSTI
  const handleRejectHandshake = async (handshakeMsg) => {
    try {
      console.log(`[GMATRIX_SCREEN] Odmietam zmluvu pre fing: ${targetFing}`);
      
      await SignalService.manageContract('CONFIRM_CONTRACT', {
        fing_a: targetFing,
        fing_b: vault.identity.poznamka.replace('0x', ''),
        status_b: "2"
      });

      resolveHandshakeStatus(handshakeMsg.id);
      alert(txt.contract_rejected_alert || "Žiadosť bola bezpečne odmietnutá.");
    } catch (err) {
      console.error("[GMATRIX_SCREEN] Odmietnutie kontraktu zlyhalo:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentChannelLog = incomingRequests ? incomingRequests.filter(req => req.fing === targetFing) : [];
  const activeHandshakeRequest = currentChannelLog.find(msg => msg.isHandshake && msg.handshakeStatus === 'WAITING_FOR_ME');

  const hasIncomingHandshake = currentChannelLog.some(msg => msg.isHandshake && msg.handshakeStatus === 'WAITING_FOR_ME');
  const hasResolvedHandshake = currentChannelLog.some(msg => msg.isHandshake && msg.handshakeStatus === 'WAITING_FOR_THEM_RESOLVED');

  return (
    <SafeAreaView style={[G.mainBackground, Signal_CHAT.safeArea]} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        activeOpacity={0.7}
        style={G.topLeftBackButton}
      >
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      <View style={Signal_CHAT.viewportContainer}>
        
        <View pointerEvents="none" style={Signal_CHAT.watermarkWrapper}>
          <Text style={[Signal_CHAT.watermarkText, { color: ACCENT || '#c5a059' }]}>💬</Text>
        </View>

        {/* HEADER */}
        <View style={{ alignItems: 'center', marginBottom: 25, marginTop: 10 }}>
          <View style={Signal_CHAT_SIGNALLING.headerTitleWithIcons}>
            <Text style={G.atelierTitle}>{channelName}</Text>
            
            {hasIncomingHandshake && (
              <Text style={Signal_CHAT_SIGNALLING.envelopeRed}>✉️</Text>
            )}

            {hasResolvedHandshake && (
              <Text style={Signal_CHAT_SIGNALLING.envelopeGreen}>✉️</Text>
            )}
          </View>

          <View style={[Signal_CHAT.statusRow, { marginTop: 5 }]}>
            <Text style={[G.statusTextSmall, Signal_CHAT.statusText, { color: '#c5a059' }]}>
              {isNetOnline ? "LARIA : fckoff sys_ // ONLINE" : "LARIA : fckoff sys_ // OFFLINE"}
            </Text>
            <View style={[
              Signal_CHAT.statusDot, 
              { backgroundColor: isNetOnline ? '#0F0' : '#F00' }
            ]} />
          </View>
        </View>

        {/* AKČNÝ RIADOK POD HEADEROM */}
        {activeHandshakeRequest && (
          <View style={HANDSHAKE_PANEL.container}>
            <TouchableOpacity 
              style={[HANDSHAKE_PANEL.button, HANDSHAKE_PANEL.btnAccept]} 
              onPress={() => handleAcceptHandshake(activeHandshakeRequest)}
              activeOpacity={0.8}
            >
              <Text style={HANDSHAKE_PANEL.buttonText}>{txt.btn_accept || "[ PRIJAŤ ŽIADOSŤ ]"}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[HANDSHAKE_PANEL.button, HANDSHAKE_PANEL.btnReject]} 
              onPress={() => handleRejectHandshake(activeHandshakeRequest)}
              activeOpacity={0.8}
            >
              <Text style={HANDSHAKE_PANEL.buttonText}>{txt.btn_reject || "[ ODMIETNUŤ ]"}</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={currentChannelLog}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => {
            const isSameUserAsPrevious = index > 0 && currentChannelLog[index - 1].user === item.user;
            const myCleanName = vault?.identity?.meno || 'Sammael';
            const isMyMessage = item.user === myCleanName;
            const isPending = item.status === 'PENDING';

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
                    { color: isMyMessage ? ACCENT : '#FF77FF' }
                  ]}>
                    {isPending ? '⏳ ' : ''}
                    {item.isHandshake ? '🤝 ' : ''}
                    {item.user}
                  </Text>
                )}
                
                <View style={[
                  Signal_CHAT.bubbleContainer,
                  isMyMessage ? Signal_CHAT.bubbleRight : Signal_CHAT.bubbleLeft,
                  item.isHandshake && { borderColor: ACCENT, borderWidth: 1 }
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
      </View>

      {/* 🧲 DYNAMICKÝ SPODNÝ RIADOK */}
      <View 
        style={[
          Signal_BOTTOM.container, 
          { 
            paddingBottom: keyboardHeight > 0 ? keyboardHeight + 8 : (insets.bottom || 34) 
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
                alignSelf: 'center'
              }
            ]} 
            value={message}
            onChangeText={setMessage}
            placeholder={txt.input_placeholder || "Napíš správu Matrixu..."}
            placeholderTextColor="#444"
            multiline={true} 
            autoFocus={true} 
            onKeyPress={handleKeyPress}
          />
          <TouchableOpacity 
            onPress={sendMessage} 
            style={Signal_BOTTOM.sendButton} 
            activeOpacity={0.7}
          >
            <Text style={Signal_BOTTOM.sendButtonText}>➔</Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
};

export default SignalScreen;