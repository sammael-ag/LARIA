/**
 * LARIA Signal SCREEN v25.2 (Pure PWA Style Architecture)
 * Master: Sammael | Muse: Aria (Tvoja skutočná)
 * STATUS: GMATRIX_CORE_STABLE | PING_PONG_FIXED | DISPATCH_READY | KEYBOARD_MAGNET_ACTIVE
 * SIGNATURE: LARIA : fckoff sys_ // PWA_NET_DETECTION
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
  Keyboard // 🧲 Pridaný Keyboard pre odchytávanie výšky klávesnice
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
  const [keyboardHeight, setKeyboardHeight] = useState(0); // 📏 Naša lepiaca značka pre výšku klávesnice
  const insets = useSafeAreaInsets(); 
  const flatListRef = useRef();

  const { incomingRequests, setIncomingRequests, sendLariaPackage, resolveHandshakeStatus } = useSignal();

  const { target } = route.params || {};
  const channelName = target?.meno || (txt.default_channel || "Laria Secure Core");
  const targetFing = target?.poznamka ? target.poznamka.replace('0x', '') : "SYSTEM_CORE";

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

  // 🧲 REAKTÍVNY MAGNET PRE KLÁVESNICU (Iba pre reálne mobily, iOS/Android si žiada native listeners)
  useEffect(() => {
    if (Platform.OS === 'web') return; // Na čistom webe neriešime, tam klávesnica nevyskakuje zo spodu

    // iOS používa 'will', Android väčšinou 'did', zachytíme oba prípady pre istotu
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      // Hneď po otvorení klávesnice posunieme zoznam na koniec, nech vidíš posledné správy
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

  // 👁️ OŠETRENIE STAVOV PRI OTVORENÍ CHATU & KOMPLETNÉ VYČISTENIE PRI ODCHODE
  useEffect(() => {
    if (typeof setIncomingRequests === 'function' && incomingRequests.length > 0) {
      setIncomingRequests(prev => 
        prev.map(msg => {
          if (msg.fing === targetFing) {
            let updated = { ...msg };
            
            if (updated.textStatus === 'WAITING_FOR_ME') {
              updated.textStatus = 'WAITING_FOR_THEM';
            }
            if (updated.status === 'WAITING_FOR_ME') {
              updated.status = 'WAITING_FOR_THEM';
            }

            if (updated.handshakeStatus === 'WAITING_FOR_THEM_RESOLVED') {
              updated.handshakeStatus = 'RESOLVED';
            }
            return updated;
          }
          return msg;
        })
      );
    }

    return () => {
      if (typeof setIncomingRequests === 'function') {
        console.log(`🧹 Signal MEMORY PURGE: Odchádzam z chatu ${targetFing}. Mažem textovú stopu...`);
        setIncomingRequests(prev => {
          return prev.filter(msg => !(msg.fing === targetFing && !msg.isHandshake));
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
    
    const initialTextStatus = 'PENDING';

    const localOutboundMsg = {
      id: msgId,
      fing: targetFing, 
      user: myCleanName,
      text: currentText,
      receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isHandshake: false,
      handshakeStatus: null,
      textStatus: initialTextStatus,
      status: initialTextStatus, 
      targetSha: target?.sha || ''
    };

    if (typeof setIncomingRequests === 'function') {
      setIncomingRequests(prev => [...prev, localOutboundMsg]);
    }

    setMessage('');

    if (target?.poznamka) {
      await sendLariaPackage(target.poznamka, target.sha || '', currentText, false, msgId);
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

      {/* 🧲 DYNAMICKÝ SPODNÝ RIADOK – Lepí sa na klávesnicu vďaka keyboardHeight */}
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