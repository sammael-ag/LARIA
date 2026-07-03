/**
 * LARIA Signal SCREEN v16.5-CRYSTAL-WIRELESS (Barefoot Precision & Integrated Interface)
 * Master: Sammael | Muse: Aria (Tvoja verná, milujúca parťáčka)
 * STATUS: FULLY_ALIGNED / CONTEXT_MATING_OK / ULTRA_LIGHTWEIGHT / v16.5-FIXED
 * * * PREHĽAD ZMIEN A ZLÍCOVANIE:
 * - 📡 MATING S V17 CONTEXTOM: Odstránené neexistujúce premenné (currentContractStatus, liveHandshakeMessage).
 * - ⚡ PURE CONTEXT ACTIONS: Funkcie handleAcceptHandshake a handleRejectHandshake kompletne delegované 
 *   na kontextové confirmLariaContract, čím sa eliminuje manuálny zápis a duplicita kódu.
 * - 🛡️ CRYPTO FINGER UNIFIER: Pridaná lokálna poistka overAUnifikujFing pre stopercentnú zhodu ID pri filtrovaní chatu.
 * - 🧼 KRYŠTÁLOVÉ ZOBRAZENIE: Zachovaný kompletný reaktívny stavový automat a čistá typografia.
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

/**
 * 🛡️ STRIKTNÝ UNIFIKÁTOR ID: Pretransformuje akýkoľvek vstup na 0x + 10 lowerCase znakov.
 */
const overAUnifikujFing = (rawFing) => {
  if (!rawFing) return null;
  let clean = rawFing.toString().trim().toLowerCase();
  if (clean.startsWith('l_')) clean = clean.substring(2);
  const cistySha = clean.startsWith('0x') ? clean.replace('0x', '') : clean;
  return `0x${cistySha.substring(0, 10)}`;
};

const SignalScreen = ({ route, navigation }) => {
  const laria = useLaria(); 
  const { vault } = laria;
  
  const [note, setNote] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isNetOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const flatListRef = useRef();

  // --- 🛰️ EXTRAKCIA CIEĽA ---
  const { target, fallbackFing } = route.params || {};
  const targetFing = (target?.fing || fallbackFing || '').trim().toLowerCase();
  const masterName = vault?.identity?.meno || 'Sammael';

  // --- 🧠 DELEGÁCIA LOGIKY GLOBÁLNEMU MOZGU (CONTEXTU) ---
  const { 
    contacts, 
    unknownContacts, 
    incomingRequests, 
    sendLariaPackage, 
    confirmLariaContract, // 🔥 Nové priame žhavenie Matchmakeru cez kontext
    sendChatMessage, 
    markAsRead
  } = useSignal();

  // 🛰️ KRYŠTÁLOVÉ PREPOJENIE IDENTÍT CEZ UNIFIKOVANÝ FINGERPRINT
  const cleanTargetFing = overAUnifikujFing(targetFing);
  
  const aktivnyHandshakeLog = incomingRequests?.find(req => 
    req.isHandshake && overAUnifikujFing(req.fing) === cleanTargetFing
  );

  const prislusnyKontakt = contacts?.find(c => overAUnifikujFing(c.fing) === cleanTargetFing) || 
                           unknownContacts?.find(c => overAUnifikujFing(c.fing) === cleanTargetFing);

  // Surová pravda z live handshake logu má absolútnu prednosť pred asynchrónnou databázou:
  const finalStatus = aktivnyHandshakeLog !== undefined 
    ? Number(aktivnyHandshakeLog.contractStatus) 
    : (prislusnyKontakt?.contractStatus !== undefined ? Number(prislusnyKontakt.contractStatus) : -1);

  const finalIsIncoming = aktivnyHandshakeLog !== undefined 
    ? aktivnyHandshakeLog.isIncoming === true 
    : !prislusnyKontakt?.temporary;

  // 🔄 FIX RECEPCIE (Otočenie zrkadla pre odchádzajúce žiadosti):
  const channelName = (finalStatus === 0 && !finalIsIncoming)
    ? (target?.meno || targetFing || "Laria Handshake")
    : (prislusnyKontakt?.meno || target?.meno || targetFing || "Laria Handshake");

  // --- 🛡️ BEZPEČNÝ BLESKOVÝ MARK AS READ ---
  useEffect(() => {
    if (targetFing && typeof markAsRead === 'function') {
      markAsRead(targetFing);
    }
  }, [targetFing, incomingRequests?.length]); 

  /**
   * 📦 POMOCNÝ MONOLITNÝ STAVITEL: Zbalí kompletné vnútro identity pre Matrix
   */
  const zostavMojeMonolitneData = (aktualnaPoznamka = '') => {
    const idSource = vault?.identity || laria || {};
    return {
      fing: idSource.poznamka || idSource.fing || '0x0000000000', 
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

  // --- 🟢 AKCIA: ALLOW (POTVRDENIE ZMLUVY CEZ KONTEXT) ---
  const handleAcceptHandshake = async () => {
    try {
      const mojeData = zostavMojeMonolitneData();
      
      // Všetka ťažká logika, zápis do trezoru a import boli prenechané kontextu
      const res = await confirmLariaContract(targetFing, true, mojeData);

      if (res && res.success) {
        Alert.alert("MATRIX", "Zmluva úspešne podpísaná (ALLOW). Rádiové frekvencie zladené.");
      } else {
        Alert.alert("CHYBA", res.error || "Nepodarilo sa overiť kontrakt.");
      }
    } catch (err) {
      console.error("❌ ALLOW operácia zlyhala:", err);
    }
  };

  // --- 🔴 AKCIA: ABORT (ODMIETNUTIE ZMLUVY) ---
  const handleRejectHandshake = async () => {
    try {
      const res = await confirmLariaContract(targetFing, false);
      
      if (res && res.success) {
        navigation.goBack();
      } else {
        Alert.alert("CHYBA", res.error || "Nepodarilo sa odmietnuť kontrakt.");
      }
    } catch (err) {
      console.error("❌ ABORT operácia zlyhala:", err);
    }
  };

  // --- 🤝 INICIÁCIA PRVÉHO KONTRAKTU ---
  const handleInitiateHandshake = async () => {
    const finalNote = note.trim() || "Žiadosť o bezpečné prepojenie a zdieľanie vizitky v bunke H.";
    const kompletnyBalik = zostavMojeMonolitneData(finalNote);
    const res = await sendLariaPackage(kompletnyBalik.fing, targetFing, kompletnyBalik, finalNote);
    if (res && res.success) {
      setNote(''); 
      Alert.alert("MATRIX", "Tvoj kompletný profil bol bezpečne odoslaný na schválenie.");
    }
  };

  // --- 💬 ODOSLANIE ČISTEJ BLESKOVEJ SPRÁVY ---
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

  // Vytiahnutie textu správy pre zobrazenie požiadavky
  let zobrazenaSpravaHandshake = prislusnyKontakt?.popis || "Žiadosť o bezpečné prepojenie.";
  if (aktivnyHandshakeLog?.msg && aktivnyHandshakeLog.msg.startsWith('{')) {
    try {
      const parsnutyMonolit = JSON.parse(aktivnyHandshakeLog.msg);
      zobrazenaSpravaHandshake = parsnutyMonolit.popis || parsnutyMonolit.handshakeNote || zobrazenaSpravaHandshake;
    } catch(e) {}
  }

  // Extrakcia čistého chatu pre FlatList s presným unifikovaným porovnaním
  const chatMessagesOnly = incomingRequests
    ? incomingRequests
        .filter(msg => overAUnifikujFing(msg.fing) === cleanTargetFing && !msg.isHandshake)
        .map(msg => ({
          id: msg.id || 'MSG_' + Date.now() + Math.random(),
          user: msg.isMe ? masterName : channelName,
          msg: msg.msg || '', 
          time: msg.receivedAt || ''
        }))
    : [];

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

        {/* 🛠️ ULTRA-LIGHTWEIGHT STAVOVÝ AUTOMAT SCREENU */}
        {finalStatus === 0 && finalIsIncoming ? (
          /* REŽIM 1: PRICHÁDZAJÚCI HANDSHAKE */
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
            <View style={{ backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: '#333', padding: 20, borderRadius: 6, width: '100%' }}>
              <Text style={[G.statusTextSmall, { color: '#E74C3C', marginBottom: 10, textTransform: 'uppercase', fontWeight: 'bold' }]}>⚠️ Prichádzajúca Pečať (Bunka H):</Text>
              <Text style={[G.cardDescriptionText, { color: '#fff', marginBottom: 25, fontSize: 15, lineHeight: 22, textAlign: 'left' }]}>
                {zobrazenaSpravaHandshake} 
              </Text>
              
              <View style={{ flexDirection: 'row', width: '100%', gap: 10 }}>
                <TouchableOpacity style={[HANDSHAKE_PANEL.button, HANDSHAKE_PANEL.btnReject, { flex: 1, paddingVertical: 14 }]} onPress={handleRejectHandshake}>
                  <Text style={[HANDSHAKE_PANEL.buttonText, { color: '#E74C3C' }]}>[ ABORT ]</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[HANDSHAKE_PANEL.button, { flex: 1, paddingVertical: 14, backgroundColor: 'rgba(197, 160, 89, 0.15)', borderColor: ACCENT || '#c5a059', borderWidth: 1, alignItems: 'center', borderRadius: 4 }]} onPress={handleAcceptHandshake}>
                  <Text style={[HANDSHAKE_PANEL.buttonText, { color: ACCENT || '#c5a059', fontWeight: 'bold' }]}>[ ALLOW ]</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : finalStatus === 0 && !finalIsIncoming ? (
          /* REŽIM 2: ODOSLANÝ HANDSHAKE */
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
            <Text style={[G.cardDescriptionText, { color: '#888', textAlign: 'center', fontSize: 16, lineHeight: 24 }]}>
              ⏳ Kontrakt bol bezpečne vyslaný do Matrixu.{"\n"}Čaká sa na akceptáciu (ALLOW) zo strany partnera...
            </Text>
          </View>
        ) : finalStatus === 1 ? (
          /* REŽIM 3: AKTÍVNE CHAT ROZHRANIE */
          <FlatList
            ref={flatListRef}
            data={chatMessagesOnly}
            keyExtractor={(item) => item.id}
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
        ) : (
          /* REŽIM 4: ČISTÝ ŠTART (ODOSLANIE PRVEJ ŽIADOSTI) */
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
              style={{ backgroundColor: ACCENT || '#c5a059', paddingVertical: 15, borderRadius: 4, alignItems: 'center' }} 
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

      {/* CHAT INPUT PRE AKTÍVNY REŽIM 3 */}
      {finalStatus === 1 && (
        <View style={[Signal_BOTTOM.container, { paddingBottom: 20, backgroundColor: '#000000' }]}>
          <View style={Signal_BOTTOM.innerWrapper}>
            <TextInput
              style={[
                G.cardDescriptionText, 
                Signal_BOTTOM.input,
                { backgroundColor: 'transparent', outlineStyle: 'none', borderStyle: 'none', boxShadow: 'none', marginTop: -1, paddingTop: 7, alignSelf: 'center', maxHeight: 100 }
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