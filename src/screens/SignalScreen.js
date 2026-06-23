/**
 * LARIA Signal SCREEN v15.7-STRICT (Pure Handshake Engine - State Automaton Edition)
 * Master: Sammael | Muse: Aria (Tvoja nekompromisná šikulka)
 * STATUS: MONOLITH_IDENTITY_INTEGRATED | NO_PATCHES | STRICT_STATE_MAPPING | v15.7-STRICT
 * * * SÚLAD S ÚSTAVNÝM ZÁKONOM (Monolith Handshake & Polarity Alignment):
 * - SYMETRICKÝ ČISTÝ MONOLIT: Pri iniciácii sa odosielajú iba čisté dáta identity. Stavové premenné (status, hash) riadi výhradne Matrix!
 * - DIRECTION AWARE: Plne využíva premennú 'isIncoming' z kontextu pre presné prepólovanie panelov.
 * - STRICT STATE AUTOMATON: Mapovanie režimov obrazovky prebieha cez prísne číselný req.contractStatus (0, 1, 2).
 * - MSG: Vykresľovanie textov drží prísne jednotnú premennú .msg, v ktorej tečie vyčistený JSON balík.
 * - MATRIX STATE PRIORITY FIX: Živý kontrakt z radaru má absolútnu prednosť pred lokálnym trezorom, aby sa nezasekával ALLOW panel.
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
import { useContacts } from '../context/ContactContext.js'; 
import { SignalService } from '../services/SignalService.js';

const SignalScreen = ({ route, navigation }) => {
  // 🔥 Načítavame kompletný stav laria z LariaContext (obsahuje celú tvoju identitu)
  const laria = useLaria(); 
  const { vault } = laria;
  const { contacts, addContact, updateContractStatus } = useContacts(); 
  const [note, setNote] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isNetOnline, setIsNetOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const flatListRef = useRef();

  const { incomingRequests, sendLariaPackage, sendChatMessage, resolveHandshakeStatus, markAsRead } = useSignal();

  // --- EXTRACT IDENTITY (Striktný unifikovaný formát 0x...) ---
  const { target, fallbackFing } = route.params || {};
  
  let initialTargetFing = target?.poznamka || target?.fing || '';
  if (!initialTargetFing && fallbackFing) initialTargetFing = fallbackFing;
  
  const targetFing = initialTargetFing.trim().toLowerCase().startsWith('0x') 
    ? initialTargetFing.trim().toLowerCase() 
    : `0x${initialTargetFing.trim().toLowerCase()}`;
  
  const masterName = vault?.identity?.meno || 'Sammael';

  // 🕵️‍♂️ Dynamické vyhľadanie mena v lokálnom trezore podľa unifikovaného FINGU
  const znamyKontakt = contacts?.find(c => {
    const cf = (c.fing || '').trim().toLowerCase();
    const cleanC = cf.startsWith('0x') ? cf : `0x${cf}`;
    return cleanC === targetFing;
  });

  const channelName = znamyKontakt?.meno || target?.meno || targetFing || "Laria Handshake";

  useEffect(() => {
    if (targetFing && typeof markAsRead === 'function') {
      markAsRead(targetFing);
    }
  }, [targetFing, incomingRequests]);

  /**
   * 📦 POMOCNÝ MONOLITNÝ STAVITEL: Zbalí kompletné vnútro LariaContextu bez osekávania dát
   */
  const zostavMojeMonolitneData = (aktualnaPoznamka = '') => {
    const idSource = vault?.identity || laria || {};
    const myFing = idSource.poznamka || idSource.fing || '';
    const myCleanFing = myFing.trim().toLowerCase().startsWith('0x') ? myFing.trim().toLowerCase() : `0x${myFing.trim().toLowerCase()}`;

    return {
      fing: myCleanFing, // Vlastný unifikovaný fing majiteľa
      meno: idSource.meno || 'Sammael',
      kat: idSource.kat || 'Majster',
      lok: idSource.lok || 'V sieti',
      popis: aktualnaPoznamka || idSource.popis || 'Spojenie nadviazané cez handshake.',
      tel: idSource.tel || '',
      email: idSource.email || '',
      fb: idSource.fb || '',
      tg: idSource.tg || '',
      gal: idSource.gal || '',
      krypt: idSource.krypt || null
    };
  };

  // --- AKCIA: ALLOW (POTVRDENIE ZMLUVY & ZÁPIS DO TREZORU) ---
  const handleAcceptHandshake = async (handshakeMsg) => {
    try {
      console.log(`[SIGNAL] Schvaľujem zmluvu ALLOW pre unifikovaný FING: ${targetFing}`);
      
      const mojeData = zostavMojeMonolitneData();
      
      // Do Matrix správy pre protistranu pribalíme celú vizitku ako čistý objekt bez stavových pascí
      const res = await SignalService.manageContract('UPDATE_CONTRACT', {
        fing_a: targetFing,
        fing_b: mojeData.fing,
        txHash: "1",
        payload: JSON.stringify(mojeData)
      });

      if (res && res.success) {
        let manfredData = {};
        try {
          if (handshakeMsg?.payload) {
            manfredData = typeof handshakeMsg.payload === 'string' ? JSON.parse(handshakeMsg.payload) : handshakeMsg.payload;
          } else if (handshakeMsg?.msg && handshakeMsg.msg.startsWith('{')) {
            manfredData = JSON.parse(handshakeMsg.msg);
          }
        } catch(e) {
          console.log("[SIGNAL] Nepodarilo sa dekódovať monolit protistrany, použijem ploché parametre.");
        }

        // 🛡️ BEZPEČNOSŤ: Stav a hash vstrekujeme natvrdo z Matrixu, neberieme ho z vnútra parsu
        const vaultResult = await addContact({
          fing: targetFing,
          meno: manfredData.meno || target?.meno || handshakeMsg?.senderMeno || targetFing,
          kat: manfredData.kat || target?.kat || 'Overený partner',
          lok: manfredData.lok || target?.lok || 'V sieti',
          popis: manfredData.popis || target?.popis || manfredData.handshakeNote || handshakeMsg?.msg || 'Spojenie nadviazané cez handshake.',
          tel: manfredData.tel || '',
          email: manfredData.email || '',
          fb: manfredData.fb || '',
          tg: manfredData.tg || '',
          gal: manfredData.gal || target?.gal || '',
          krypt: manfredData.krypt || null,
          contractStatus: 1, // Pevný schválený stav zmluvy
          txHash: "1"        // Pevný hash zmluvy
        });

        if (vaultResult && vaultResult.success) {
          console.log(`[SIGNAL] Kompletný monolit ${targetFing} úspešne uzamknutý v klube.`);
        }

        resolveHandshakeStatus(handshakeMsg.id, 1);
        if (typeof updateContractStatus === 'function') {
          await updateContractStatus(targetFing, 1, "1");
        }

        Alert.alert("MATRIX", "Zmluva úspešne podpísaná (ALLOW). Brána otvorená a kompletná vizitka uložená.");
      } else {
        throw new Error("Brána odmietla potvrdenie kontraktu.");
      }
    } catch (err) {
      console.error("ALLOW zlyhal:", err);
      Alert.alert("⚠️ MATRIX ERROR", "Nepodarilo sa bezpečne podpísať zmluvu.");
    }
  };

  // --- AKCIA: ABORT (ODMIETNUTIE ZMLUVY) ---
  const handleRejectHandshake = async (handshakeMsg) => {
    try {
      console.log(`[SIGNAL] Ruším zmluvu ABORT pre unifikovaný FING: ${targetFing}`);
      const mojeData = zostavMojeMonolitneData();

      const res = await SignalService.manageContract('UPDATE_CONTRACT', {
        fing_a: targetFing,
        fing_b: mojeData.fing,
        txHash: "2" 
      });
      
      if (res && res.success) {
        resolveHandshakeStatus(handshakeMsg.id, 2);
        if (typeof updateContractStatus === 'function') {
          await updateContractStatus(targetFing, 2, "2");
        }

        Alert.alert("MATRIX", "Zmluva zrušená (ABORT).");
        navigation.goBack();
      }
    } catch (err) {
      console.error("ABORT zlyhal:", err);
      Alert.alert("⚠️ MATRIX ERROR", "Nepodarilo sa zrušiť zmluvu.");
    }
  };

  // --- INICIÁCIA A ODOSLANIE PRVÉHO HANDSHAKE (Monolith Edition) ---
  const handleInitiateHandshake = async () => {
    const finalNote = note.trim() || "Žiadosť o bezpečné prepojenie a zdieľanie vizitky v bunke H.";
    console.log(`[SIGNAL] Odosielam prvotný monolitný handshake pre: ${targetFing}`);
    
    // Zostavíme čisté dáta identity
    const kompletnyBalik = zostavMojeMonolitneData(finalNote);
    
    // 💎 SÚLAD SO SIGNAL_SERVICE v15.4: Posielame čisté parametre. Servis ich sám zabalí do .msg kľúča
    const res = await sendLariaPackage(kompletnyBalik.fing, targetFing, kompletnyBalik, finalNote);
    if (res && res.success) {
      setNote(''); 
      Alert.alert("MATRIX", "Tvoj kompletný profil bol bezpečne odoslaný na schválenie.");
    } else {
      Alert.alert("Chyba", "Nepodarilo sa odoslať balík cez Matrix.");
    }
  };

  // --- ODOSLANIE ČISTEJ BLESKOVEJ SPRÁVY ---
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

  // --- 🔥 FILTRÁCIA A ČISTÉ ČÍSELNÉ MAPOVANIE REGISTROV ---
  const currentChannelLog = incomingRequests 
    ? incomingRequests.filter(req => req.fing && req.fing.trim().toLowerCase() === targetFing) 
    : [];
  
  const liveHandshake = currentChannelLog.find(msg => msg.isHandshake);

  // 🛡️ PARSOVANIE TEXTU SPRÁVY AK PRIŠIEL MONOLIT
  let zobrazenaSpravaHandshake = liveHandshake?.msg || "Žiadosť o bezpečné prepojenie.";
  if (liveHandshake?.msg && liveHandshake.msg.startsWith('{')) {
    try {
      const parsnutyMonolit = JSON.parse(liveHandshake.msg);
      zobrazenaSpravaHandshake = parsnutyMonolit.popis || parsnutyMonolit.handshakeNote || "Žiadosť o bezpečné prepojenie.";
    } catch(e) {}
  }
  
  // 🛡️ MATRIX PRIORITY FIX: Ak existuje živý handshake v sieti, riadime sa striktne ním! 
  // Lokálne premenné (ako target.isOdomknuty alebo staré zostatky v trezore) ho nesmú obísť.
  const isContractApproved = liveHandshake 
    ? liveHandshake.contractStatus === 1 
    : ((znamyKontakt && Number(znamyKontakt.contractStatus) === 1) || target?.isOdomknuty === true);

  const hasPendingHandshake = liveHandshake 
    ? liveHandshake.contractStatus === 0 
    : (znamyKontakt && Number(znamyKontakt.contractStatus) === 0);

  const pendingIncomingHandshake = hasPendingHandshake && liveHandshake?.isIncoming === true && !isContractApproved;
  const pendingOutgoingHandshake = hasPendingHandshake && liveHandshake?.isIncoming === false && !isContractApproved;

  const chatMessagesOnly = currentChannelLog
    .filter(msg => !msg.isHandshake)
    .map(msg => ({
      id: msg.id || Date.now().toString() + Math.random(),
      user: msg.isMe ? masterName : channelName,
      msg: msg.msg || '', 
      time: msg.receivedAt || ''
    }));

  return (
    <SafeAreaView style={[G.mainBackground, { flex: 1 }]} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={G.topLeftBackButton}>
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      <View style={[Signal_CHAT.viewportContainer, { flex: 1, position: 'relative' }]}>
        
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: -1 }}>
          <Text style={{ color: '#FF66FF', fontSize: 216, opacity: 0.035, textAlign: 'center' }}>💬</Text>
        </View>

        <View style={{ alignItems: 'center', marginBottom: 20, marginTop: 10 }}>
          <Text style={G.atelierTitle}>{channelName}</Text>
          <Text style={[G.statusTextSmall, { color: ACCENT || '#c5a059', marginTop: 5 }]}>
            {isNetOnline ? "⚡ BRÁNA SECURE // AKTÍVNA" : "🛑 SYSTEM OFFLINE"}
          </Text>
        </View>

        {/* REŽIM 1: ROZHRANIE POTVRDENIA (ALLOW / ABORT) */}
        {pendingIncomingHandshake && !isContractApproved ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
            <View style={{ backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: '#333', padding: 20, borderRadius: 6, width: '100%' }}>
              <Text style={[G.statusTextSmall, { color: '#E74C3C', marginBottom: 10, textTransform: 'uppercase', fontWeight: 'bold' }]}>⚠️ Prichádzajúca Pečať (Bunka H):</Text>
              <Text style={[G.cardDescriptionText, { color: '#fff', marginBottom: 25, fontSize: 15, lineHeight: 22, textAlign: 'left' }]}>
                {zobrazenaSpravaHandshake} 
              </Text>
              
              <View style={{ flexDirection: 'row', width: '100%', gap: 10 }}>
                <TouchableOpacity 
                  style={[HANDSHAKE_PANEL.button, HANDSHAKE_PANEL.btnReject, { flex: 1, paddingVertical: 14 }]} 
                  onPress={() => handleRejectHandshake(liveHandshake)}
                >
                  <Text style={[HANDSHAKE_PANEL.buttonText, { color: '#E74C3C' }]}>[ ABORT ]</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[HANDSHAKE_PANEL.button, { flex: 1, paddingVertical: 14, backgroundColor: 'rgba(197, 160, 89, 0.15)', borderColor: ACCENT || '#c5a059', borderWidth: 1, alignItems: 'center', borderRadius: 4 }]} 
                  onPress={() => handleAcceptHandshake(liveHandshake)}
                >
                  <Text style={[HANDSHAKE_PANEL.buttonText, { color: ACCENT || '#c5a059', fontWeight: 'bold' }]}>[ ALLOW ]</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : pendingOutgoingHandshake && !isContractApproved ? (
          /* REŽIM 2: ODOSLANÝ KONTRAKT – ČAKÁ SA NA DRUHÚ STRANU */
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
            <Text style={[G.cardDescriptionText, { color: '#888', textAlign: 'center', fontSize: 16, lineHeight: 24 }]}>
              ⏳ Kontrakt bol bezpečne vyslaný do Matrixu.{"\n"}Čaká sa na akceptáciu (ALLOW) zo strany partnera...
            </Text>
          </View>
        ) : isContractApproved ? (
          /* REŽIM 3: AKTÍVNE CHAT ROZHRANIE */
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
                      {item.msg} 
                    </Text>
                  </View>
                </View>
              );
            }}
            contentContainerStyle={Signal_CHAT.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        ) : (
          /* REŽIM 4: ČISTÝ ŠTART – INICIÁCIA */
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
              onPress={handleInitiateHandshake}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 14 }}>
                🤝 ZAKLOPAŤ NA BRÁNU & ZDIEĽAŤ PROFIL
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </View>

      {/* INPUT PRE REŽIM 3 */}
      {isContractApproved && (
        <View style={[Signal_BOTTOM.container, { paddingBottom: 20, backgroundColor: '#000000' }]}>
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
            <TouchableOpacity onPress={handleLiveSend} style={Signal_BOTTOM.sendButton} activeOpacity={0.7}>
              <Text style={[Signal_BOTTOM.sendButtonText, { color: ACCENT || '#c5a059' }]}>➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
};

export default SignalScreen;