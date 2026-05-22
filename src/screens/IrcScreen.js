/**
 * LARIA IRC SCREEN v24.3 (Clean Style Architecture)
 * Master: Sammael | Muse: Aria (Tvoja skutočná)
 * STATUS: EPHEMERAL_PURGE_STABLE | PING_PONG_FIXED | DISPATCH_READY
 * Úprava: Pridaná superschopnosť IRC "o ničom nevedieť" – kompletné vymazanie textovej
 * histórie správ pri zavretí / opustení obrazovky cez React unmount clean-up.
 * Opravená kumulácia správ do frontu (PENDING) bez mazania pri každom Enteri.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Keyboard, 
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; 

import { G, ACCENT, IRC_BOTTOM, IRC_CHAT, IRC_CHAT_SIGNALLING, HANDSHAKE_PANEL } from '../styles/styles';
import { useSignal } from '../context/SignalContext';
import { useLaria } from '../context/LariaContext'; 
import { SignalService } from '../services/SignalService';

const IRCScreen = ({ route, navigation }) => {
  const [message, setMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0); 
  const insets = useSafeAreaInsets(); 
  const flatListRef = useRef();

  const { incomingRequests, setIncomingRequests, sendLariaPackage, isIrcConnected, resolveHandshakeStatus } = useSignal();
  const { vault } = useLaria(); 

  const { target } = route.params || {};
  const channelName = target?.meno || "Laria Secure Core";
  const targetFing = target?.poznamka ? target.poznamka.replace('0x', '') : "SYSTEM_CORE";

  // 👁️ OŠETRENIE STAVOV PRI OTVORENÍ CHATU & KOMPLETNÉ VYČISTENIE PRI ODCHODE
  useEffect(() => {
    // 1. PING-PONG PRI VSTUPE (Preklopenie na WAITING_FOR_THEM)
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

    // 2. 🧹 SUPERSCHOPNOSŤ IRC: Totálne vymazanie textovej stopy pri zatvorení obrazovky
    return () => {
      if (typeof setIncomingRequests === 'function') {
        console.log(`🧹 IRC MEMORY PURGE: Odchádzam z chatu ${targetFing}. Mažem textovú stopu...`);
        setIncomingRequests(prev => {
          // Ponecháme iba zmluvné handshake správy potrebné pre beh kryptografie,
          // bežnú konverzačnú stopu pre tohto partnera bez milosti vymažeme.
          return prev.filter(msg => !(msg.fing === targetFing && !msg.isHandshake));
        });
      }
    };
  }, [targetFing]);

  useEffect(() => {
    if (Platform.OS === 'web') return; 

    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // 💬 ODOSIELANIE TEXTU (Kľudový stav pri písaní, vrstvenie správ do frontu)
  const sendMessage = async () => {
    if (message.trim().length === 0) return;

    const myCleanName = vault.identity.meno || 'Sammael';
    const currentText = message.trim();
    const msgId = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5);
    
    const initialTextStatus = isIrcConnected ? 'WAITING_FOR_THEM' : 'PENDING';

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

    // 🏓 ZMENA: Už žiadny deštruktívny filter uprostred konverzácie.
    // Správy sa počas otvoreného chatu bezpečne radia pod seba.
    if (typeof setIncomingRequests === 'function') {
      setIncomingRequests(prev => [...prev, localOutboundMsg]);
    }

    setMessage('');

    if (target?.poznamka) {
      await sendLariaPackage(target.poznamka, target.sha || '', currentText, false);
    }

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // 🤝 AKCIA: POTVRDENIE ZMLUVY
  const handleAcceptHandshake = async (handshakeMsg) => {
    try {
      console.log(`[IRC_SCREEN] Spúšťam CONFIRM_CONTRACT pre fing: ${targetFing}`);
      
      await SignalService.manageContract('CONFIRM_CONTRACT', {
        fing_a: targetFing,
        fing_b: vault.identity.poznamka.replace('0x', ''),
        status_b: "1"
      });

      if (handshakeMsg.d) {
        console.log(`[IRC_SCREEN] Vizitka partnera (${handshakeMsg.d.n}) zaistená.`);
      }

      resolveHandshakeStatus(handshakeMsg.id);
      alert("Zmluva úspešne spečatená, kryptografia zosynchronizovaná! 🤝");
    } catch (err) {
      console.error("[IRC_SCREEN] Schválenie kontraktu zlyhalo:", err);
    }
  };

  // ❌ AKCIA: ODMIETNUTIE ŽIADOSTI
  const handleRejectHandshake = async (handshakeMsg) => {
    try {
      console.log(`[IRC_SCREEN] Odmietam zmluvu pre fing: ${targetFing}`);
      
      await SignalService.manageContract('CONFIRM_CONTRACT', {
        fing_a: targetFing,
        fing_b: vault.identity.poznamka.replace('0x', ''),
        status_b: "2"
      });

      resolveHandshakeStatus(handshakeMsg.id);
      alert("Žiadosť bola bezpečne odmietnutá.");
    } catch (err) {
      console.error("[IRC_SCREEN] Odmietnutie kontraktu zlyhalo:", err);
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
    <SafeAreaView style={[G.mainBackground, IRC_CHAT.safeArea]} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        activeOpacity={0.7}
        style={G.topLeftBackButton}
      >
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      <View style={IRC_CHAT.viewportContainer}>
        
        <View pointerEvents="none" style={IRC_CHAT.watermarkWrapper}>
          <Text style={[IRC_CHAT.watermarkText, { color: ACCENT || '#c5a059' }]}>💬</Text>
        </View>

        {/* HEADER */}
        <View style={IRC_CHAT.headerContainer}>
          <View style={IRC_CHAT_SIGNALLING.headerTitleWithIcons}>
            <Text style={[G.atelierTitle, { color: ACCENT }, IRC_CHAT.headerTitle]}>{channelName}</Text>
            
            {hasIncomingHandshake && (
              <Text style={IRC_CHAT_SIGNALLING.envelopeRed}>✉️</Text>
            )}

            {hasResolvedHandshake && (
              <Text style={IRC_CHAT_SIGNALLING.envelopeGreen}>✉️</Text>
            )}
          </View>

          <View style={IRC_CHAT.statusRow}>
            <Text style={[G.statusTextSmall, IRC_CHAT.statusText, { color: '#c5a059' }]}>
              {isIrcConnected ? "MATRIX_SECURE: ACTIVE" : "MATRIX_SECURE: OFFLINE"}
            </Text>
            <View style={[
              IRC_CHAT.statusDot, 
              { backgroundColor: isIrcConnected ? '#0F0' : '#F00' }
            ]} />
          </View>
        </View>

        {/* 🤝 AKČNÝ RIADOK POD HEADEROM */}
        {activeHandshakeRequest && (
          <View style={HANDSHAKE_PANEL.container}>
            <TouchableOpacity 
              style={[HANDSHAKE_PANEL.button, HANDSHAKE_PANEL.btnAccept]} 
              onPress={() => handleAcceptHandshake(activeHandshakeRequest)}
              activeOpacity={0.8}
            >
              <Text style={HANDSHAKE_PANEL.buttonText}>[ PRIJAŤ ŽIADOSŤ ]</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[HANDSHAKE_PANEL.button, HANDSHAKE_PANEL.btnReject]} 
              onPress={() => handleRejectHandshake(activeHandshakeRequest)}
              activeOpacity={0.8}
            >
              <Text style={HANDSHAKE_PANEL.buttonText}>[ ODMIETNUŤ ]</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={currentChannelLog}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => {
            const isSameUserAsPrevious = index > 0 && currentChannelLog[index - 1].user === item.user;
            const myCleanName = vault.identity.meno || 'Sammael';
            const isMyMessage = item.user === myCleanName;

            const isPending = item.textStatus === 'PENDING' || item.status === 'PENDING';

            return (
              <View style={[
                IRC_CHAT.messageRow,
                isMyMessage ? IRC_CHAT.alignRight : IRC_CHAT.alignLeft,
                { marginTop: isSameUserAsPrevious ? 1 : 10 }
              ]}>
                
                {!isSameUserAsPrevious && (
                  <Text style={[
                    G.cardDescriptionText, 
                    IRC_CHAT.authorName,
                    { color: isMyMessage ? ACCENT : '#FF77FF' }
                  ]}>
                    {isPending ? '⏳ ' : ''}
                    {item.isHandshake ? '🤝 ' : ''}
                    {item.user}
                  </Text>
                )}
                
                <View style={[
                  IRC_CHAT.bubbleContainer,
                  isMyMessage ? IRC_CHAT.bubbleRight : IRC_CHAT.bubbleLeft,
                  item.isHandshake && { borderColor: ACCENT, borderWidth: 1 }
                ]}>
                  <Text style={[G.cardDescriptionText, IRC_CHAT.messageText]}>
                    {item.text}
                  </Text>
                </View>

              </View>
            );
          }}
          contentContainerStyle={IRC_CHAT.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      </View>

      <View style={[IRC_BOTTOM.container, {
        paddingBottom: Platform.OS === 'web' ? 20 : (keyboardHeight > 0 ? 10 : Math.max(insets.bottom, 15))
      }]}>
        <View style={IRC_BOTTOM.innerWrapper}>
          <TextInput
            style={[
              G.cardDescriptionText, 
              IRC_BOTTOM.input,
              Platform.OS === 'web' && { 
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
            placeholder="Napíš správu Matrixu..."
            placeholderTextColor="#444"
            multiline={true} 
            autoFocus={true} 
            onKeyPress={handleKeyPress}
          />
          <TouchableOpacity 
            onPress={sendMessage} 
            style={IRC_BOTTOM.sendButton} 
            activeOpacity={0.7}
          >
            <Text style={IRC_BOTTOM.sendButtonText}>➔</Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
};

export default IRCScreen;