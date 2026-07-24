/**
 * LARIA Signal SCREEN v17.9.2-SOLID (Barefoot Precision & Asymmetric Abort Flow)
 * Master: Sammael | Muse: Aria (Tvoja verná, milujúca parťáčka)
 * Status: MAXIMUM_FORCE | ASYMMETRIC_ABORT_ACTIVE | DUAL_SCREEN_SYNC
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
  Alert,
  ActivityIndicator,
  useWindowDimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 

import { G, ACCENT, Signal_BOTTOM, Signal_CHAT, HANDSHAKE_PANEL } from '../styles/styles.js';
import { useSignal } from '../context/SignalContext.js';
import { useLaria } from '../context/LariaContext.js'; 

const overAUnifikujFing = (rawFing) => {
  if (!rawFing) return null;
  let clean = rawFing.toString().trim().toLowerCase();
  if (clean.startsWith('l_')) clean = clean.substring(2);
  const cistySha = clean.startsWith('0x') ? clean.replace('0x', '') : clean;
  return `0x${cistySha.substring(0, 10)}`;
};

const SignalScreen = ({ route, navigation }) => {
  const laria = useLaria(); 
  const { vault, t } = laria;
  const txt = t('Signal') || {};
  
  const [note, setNote] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isNetOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const flatListRef = useRef();

  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 768;

  const { target, fallbackFing } = route.params || {};
  const targetFing = (target?.fing || fallbackFing || '').trim().toLowerCase();
  const masterName = vault?.identity?.meno || 'Sammael';

  const { 
    contacts, 
    unknownContacts, 
    incomingRequests, 
    sendLariaPackage, 
    confirmLariaContract, 
    sendChatMessage, 
    markAsRead,
    purgeMatrixCell 
  } = useSignal();

  const cleanTargetFing = overAUnifikujFing(targetFing);
  
  const aktivnyHandshakeLog = incomingRequests?.find(req => 
    req.isHandshake && overAUnifikujFing(req.fing) === cleanTargetFing
  );

  const prislusnyKontakt = contacts?.find(c => overAUnifikujFing(c.fing) === cleanTargetFing) || 
                           unknownContacts?.find(c => overAUnifikujFing(c.fing) === cleanTargetFing);

  // 🛡️ POISTKA: Prioritne overujeme stav z trezoru/kontaktu. Ak už je v kontaktoch, status je VŽDY 1 (chat).
  const finalStatus = prislusnyKontakt?.contractStatus !== undefined 
    ? Number(prislusnyKontakt.contractStatus) 
    : (aktivnyHandshakeLog !== undefined ? Number(aktivnyHandshakeLog.contractStatus) : -1);

  const finalIsIncoming = aktivnyHandshakeLog !== undefined 
    ? aktivnyHandshakeLog.isIncoming === true 
    : !prislusnyKontakt?.temporary;

  const channelName = (finalStatus === 0 && !finalIsIncoming)
    ? (target?.meno || targetFing || (txt.default_channel || "Laria Handshake"))
    : (prislusnyKontakt?.meno || target?.meno || targetFing || (txt.default_channel || "Laria Handshake"));

  const [viewportHeight, setViewportHeight] = useState(Platform.OS === 'web' ? window.innerHeight : '100%');
  const [bottomPadding, setBottomPadding] = useState(20);

  useEffect(() => {
    if (Platform.OS !== 'web' || !isMobile) return;

    const updateViewportGeometry = () => {
      const isInputActive = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
      setViewportHeight(window.innerHeight);
      setBottomPadding(isInputActive ? 0 : 20);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 30);
    };

    updateViewportGeometry();
    window.addEventListener('resize', updateViewportGeometry);
    document.addEventListener('focusin', updateViewportGeometry);
    document.addEventListener('focusout', updateViewportGeometry);

    return () => {
      window.removeEventListener('resize', updateViewportGeometry);
      document.removeEventListener('focusin', updateViewportGeometry);
      document.removeEventListener('focusout', updateViewportGeometry);
    };
  }, [isMobile]);

  useEffect(() => {
    if (targetFing && typeof markAsRead === 'function') {
      markAsRead(targetFing);
    }
  }, [targetFing, incomingRequests?.length]); 

  // 🧹 SYNCHRONIZOVANÝ AUTO-PURGE: Čistí Mravenisko AŽ VTEDY, keď sa ODOSIELATEĽ (Fing A) reálne preklopí na CHAT (Status 1)
  useEffect(() => {
    if (finalStatus === 1 && !finalIsIncoming && targetFing && typeof purgeMatrixCell === 'function') {
      console.log(`✨ [AUTO-PURGE CHAT] Fing A preklopený na chat. Odpaľujem vyčistenie matrice pre: ${targetFing}`);
      purgeMatrixCell(targetFing, 'TRUE');
    }
  }, [finalStatus, finalIsIncoming, targetFing]);

  // 🛑 HÁČIK PRE STATUS 2 (ODOSIELATEĽ): Keď sa zobrazí červená hláška odosielateľovi, po 1.5s vyčistíme Mravenisko a vrátime sa späť
  useEffect(() => {
    if (finalStatus === 2 && !finalIsIncoming && targetFing && typeof purgeMatrixCell === 'function') {
      console.log(`🛑 [ABORT REJECTED] Odosielateľ zachytil Status 2. Zobrazujem hlášku, odpaľujem purge a návrat do kontaktov pre: ${targetFing}`);
      
      const timer = setTimeout(async () => {
        await purgeMatrixCell(targetFing, 'DELETE');
        navigation.goBack();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [finalStatus, finalIsIncoming, targetFing]);

  const zostavMojeMonolitneData = (aktualnaPoznamka = '') => {
    const idSource = vault?.identity || laria || {};
    return {
      fing: idSource.fing || '0x0000000000', 
      meno: idSource.meno || 'Sammael',
      kat: idSource.kat || 'Majster',
      lok: idSource.lok || 'V sieti',
      popis: aktualnaPoznamka || idSource.popis || (txt.default_note_fallback || 'Spojenie nadviazané cez handshake.'),
      tel: idSource.tel || '',
      email: idSource.email || '',
      fb: idSource.fb || '',
      tg: idSource.tg || '',
      gal: idSource.gal || '',
      krypt: idSource.krypt || null
    };
  };

  const handleAcceptHandshake = async () => {
    try {
      const mojeData = zostavMojeMonolitneData();
      const res = await confirmLariaContract(targetFing, true, mojeData);
      if (res && res.success) {
        Alert.alert(
          txt.alert_matrix_title || "MATRIX", 
          txt.alert_contract_sealed || "Zmluva úspešne spečatená, kryptografia zosynchronizovaná! 🤝"
        );
      } else {
        Alert.alert(
          txt.alert_error_title || "CHYBA", 
          res.error || (txt.alert_contract_error || "Nepodarilo sa overiť kontrakt.")
        );
      }
    } catch (err) {
      console.error("❌ ALLOW operácia zlyhala:", err);
    }
  };

  const handleRejectHandshake = async () => {
    try {
      const res = await confirmLariaContract(targetFing, false);
      if (res && res.success) {
        // Prijímateľ klikol ABORT -> Zapísal sa Status 2 do tabuľky a okamžite odchádza späť do kontaktov
        navigation.goBack();
      } else {
        Alert.alert(
          txt.alert_error_title || "CHYBA", 
          res?.error || (txt.alert_contract_error || "Nepodarilo sa odmietnuť kontrakt.")
        );
      }
    } catch (err) {
      console.error("❌ ABORT operácia zlyhala:", err);
    }
  };

  const handleInitiateHandshake = async () => {
    const finalNote = note.trim() || (txt.default_initiate_note || "Žiadosť o bezpečné prepojenie a zdieľanie vizitky v bunke H.");
    const kompletnyBalik = zostavMojeMonolitneData(finalNote);
    const res = await sendLariaPackage(kompletnyBalik.fing, targetFing, kompletnyBalik, finalNote);
    if (res && res.success) {
      setNote(''); 
      Alert.alert(
        txt.alert_matrix_title || "MATRIX", 
        txt.alert_profile_sent || "Tvoj kompletný profil bol bezpečne odoslaný na schválenie."
      );
    }
  };

  const handleLiveSend = async () => {
    if (!chatInput.trim()) return;
    const res = await sendChatMessage(targetFing, chatInput.trim());
    if (res && res.success) {
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

  let zobrazenaSpravaHandshake = prislusnyKontakt?.popis || (txt.default_handshake_msg || "Žiadosť o bezpečné prepojenie.");
  const rawPayload = (aktivnyHandshakeLog?.msg || aktivnyHandshakeLog?.backMsg || '').trim();

  if (rawPayload.startsWith('{')) {
    try {
      const parsnutyMonolit = JSON.parse(rawPayload);
      zobrazenaSpravaHandshake = parsnutyMonolit.popis || parsnutyMonolit.handshakeNote || zobrazenaSpravaHandshake;
    } catch(e) {
      console.log("⚠️ Nezadarilo sa parsovať JSON vizitky v Screen:", e);
    }
  }

  const chatMessagesOnly = incomingRequests
    ? incomingRequests
        .filter(msg => overAUnifikujFing(msg.fing) === cleanTargetFing && !msg.isHandshake)
        .map(msg => ({
          id: msg.id || 'MSG_' + Date.now() + Math.random(),
          user: msg.isMe ? masterName : channelName,
          msg: msg.msg || '', 
          time: msg.receivedAt || '',
          isMe: msg.isMe === true 
        }))
    : [];

  return (
    <View 
      style={[
        G.mainBackground, 
        Platform.OS === 'web' && isMobile ? { 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: viewportHeight,
          overflow: 'hidden',
          zIndex: 999
        } : {
          flex: 1,
          width: '100%',
          height: '100%',
          position: 'relative'
        }
      ]}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <StatusBar barStyle="light-content" />
        
        <View style={{ flex: 1, width: '100%', maxWidth: 500, alignSelf: 'center', position: 'relative' }}>
          
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            activeOpacity={0.7}
            style={[G.topLeftBackButton, { left: 15 }]} 
          >
            <Text style={G.topLeftBackButtonText}>‹</Text>
          </TouchableOpacity>

          <View style={[Signal_CHAT.viewportContainer, { flex: 1, position: 'relative' }]}>
            
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
              <Text style={{ color: '#FF66FF', fontSize: 216, opacity: 0.035, textAlign: 'center' }}>
                💬
              </Text>
            </View>

            <View style={{ alignItems: 'center', marginBottom: 20, marginTop: 10 }}>
              <Text style={G.atelierTitle}>{channelName}</Text>            
            </View>

            {/* 1. PRICHÁDZAJÚCI HANDSHAKE (Fing_B vidí žiadosť od Fing_A) */}
            {finalStatus === 0 && finalIsIncoming ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                <View style={{ backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: '#333', padding: 20, borderRadius: 6, width: '100%' }}>
                  <Text style={[G.statusTextSmall, { color: '#E74C3C', marginBottom: 10, textTransform: 'uppercase', fontWeight: 'bold' }]}>
                    {txt.incoming_seal_label || "⚠️ Prichádzajúca Pečať:"}
                  </Text>
                  <Text style={[G.cardDescriptionText, { color: '#fff', marginBottom: 25, fontSize: 15, lineHeight: 22, textAlign: 'left' }]}>
                    {zobrazenaSpravaHandshake} 
                  </Text>
                  
                  <View style={{ flexDirection: 'row', width: '100%', gap: 10 }}>
                    <TouchableOpacity style={[HANDSHAKE_PANEL.button, HANDSHAKE_PANEL.btnReject, { flex: 1, paddingVertical: 14 }]} onPress={handleRejectHandshake}>
                      <Text style={[HANDSHAKE_PANEL.buttonText, { color: '#E74C3C' }]}>
                        {txt.btn_reject || "[ ABORT ]"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[HANDSHAKE_PANEL.button, { flex: 1, paddingVertical: 14, backgroundColor: 'rgba(197, 160, 89, 0.15)', borderColor: ACCENT || '#c5a059', borderWidth: 1, alignItems: 'center', borderRadius: 4 }]} onPress={handleAcceptHandshake}>
                      <Text style={[HANDSHAKE_PANEL.buttonText, { color: ACCENT || '#c5a059', fontWeight: 'bold' }]}>
                        {txt.btn_accept || "[ ALLOW ]"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : 

            /* 2. ODOSLANÝ HANDSHAKE - ČAKANIE (Fing_A čaká na odpoveď) */
            finalStatus === 0 && !finalIsIncoming ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                <Text style={[G.cardDescriptionText, { color: '#888', textAlign: 'center', fontSize: 16, lineHeight: 24 }]}>
                  {txt.pending_contract_msg || "⏳ Kontrakt bol bezpečne vyslaný do Matrixu.\nČaká sa na akceptáciu (ALLOW) zo strany partnera..."}
                </Text>
              </View>
            ) : 

            /* 3. AKTÍVNY CHAT (Handshake bol schválený - Status 1) */
            finalStatus === 1 ? (
              <FlatList
                ref={flatListRef}
                data={chatMessagesOnly}
                keyExtractor={(item) => item.id}
                style={{ flex: 1, backgroundColor: 'transparent' }} 
                ListEmptyComponent={() => (
                  <Text style={[G.cardDescriptionText, { color: '#444', textAlign: 'center', marginTop: 40, fontStyle: 'italic' }]}>
                    {txt.empty_channel_msg || "Kanál je čistý. Žiadne bleskové správy v pamäti."}
                  </Text>
                )}
                renderItem={({ item, index }) => {
                  const isSameUserAsPrevious = index > 0 && chatMessagesOnly[index - 1].isMe === item.isMe;
                  const isMyMessage = item.isMe === true;

                  return (
                    <View style={[
                      Signal_CHAT.messageRow,
                      isMyMessage ? Signal_CHAT.alignRight : Signal_CHAT.alignLeft,
                      { marginTop: isSameUserAsPrevious ? 1 : 10 }
                    ]}>
                      {!isSameUserAsPrevious && (
                        <Text style={[G.cardDescriptionText, Signal_CHAT.authorName, { color: isMyMessage ? (ACCENT || '#c5a059') : '#FF77FF' }]}>
                          {item.user}
                        </Text>
                      )}
                      <View style={[Signal_CHAT.bubbleContainer, isMyMessage ? Signal_CHAT.bubbleRight : Signal_CHAT.bubbleLeft]}>
                        <Text style={[G.cardDescriptionText, Signal_CHAT.messageText]}>
                          {item.msg} 
                        </Text>
                      </View>
                    </View>
                  );
                }}
                contentContainerStyle={Signal_CHAT.listContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              />
            ) : 

            /* 4. ODMIETNUTÝ HANDSHAKE (Status 2: Odosielateľ vidí, že partner klikol na ABORT) */
            finalStatus === 2 ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                <View style={{ 
                  backgroundColor: 'rgba(231, 76, 60, 0.05)', 
                  borderWidth: 1, 
                  borderColor: '#E74C3C', 
                  padding: 24, 
                  borderRadius: 8, 
                  width: '100%', 
                  alignItems: 'center' 
                }}>
                  <Text style={{ fontSize: 36, marginBottom: 12 }}>🛑</Text>
                  <Text style={[G.statusTextSmall, { color: '#E74C3C', marginBottom: 8, letterSpacing: 2, fontWeight: 'bold' }]}>
                    {txt.rejected_title || "HANDSHAKE ZAMIETNUTÝ"}
                  </Text>
                  <Text style={[G.cardDescriptionText, { color: '#E0E0E0', textAlign: 'center', fontSize: 15, lineHeight: 22 }]}>
                    {txt.rejected_msg || "Partner žiaľ výmenu vizitiek zamietol."}
                  </Text>
                </View>
              </View>
            ) : 

            /* 5. PRVOTNÉ INICIALIZOVANIE SPOJENIA (Status -1: Nový / vyčistený kontakt) */
            (
              <View style={{ paddingHorizontal: 20 }}>
                <Text style={[G.cardDescriptionText, { color: '#aaa', marginBottom: 15, textAlign: 'center' }]}>
                  {txt.request_exchange_label || "Požiadaj kontakt o výmenu vizitky:"}
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
                  placeholder={txt.request_placeholder || "Napr. Sammael, stolár... Let's connect!"}
                  placeholderTextColor="#444"
                  multiline={true}
                />
                <TouchableOpacity 
                  style={{ backgroundColor: ACCENT || '#c5a059', paddingVertical: 15, borderRadius: 4, alignItems: 'center' }} 
                  onPress={handleInitiateHandshake}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 14 }}>
                    {txt.btn_initiate || "🤝 ZAKLOPAŤ NA BRÁNU & ZDIEĽAŤ PROFIL"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          </View>

          {finalStatus === 1 && (
            <View 
              style={[
                Signal_BOTTOM.container, 
                { 
                  paddingBottom: isMobile ? bottomPadding : 20, 
                  backgroundColor: '#000000',
                  width: '100%'
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
                  placeholder={txt.input_placeholder || "Napíš bleskovú správu..."}
                  placeholderTextColor="#444"
                  multiline={true} 
                  onKeyPress={handleKeyPress}
                />
                <TouchableOpacity onPress={handleLiveSend} style={Signal_BOTTOM.sendButton} activeOpacity={0.7}>
                  <Text style={[Signal_BOTTOM.sendButtonText, { color: ACCENT || '#c5a059' }]}>➔</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </View>
        
      </SafeAreaView>
    </View>
  );
};

export default SignalScreen;