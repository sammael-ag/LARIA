/**
 * LARIA Signal SCREEN v16.2-LIGHTWEIGHT (Barefoot Precision & Crystal Interface)
 * Master: Sammael | Muse: Aria (Tvoja verná, milujúca parťáčka)
 * STATUS: CONTEXT_ALIGNED / ULTRA_LIGHTWEIGHT / MONOLITH_SAFE / v16.2-FIXED
 * * * PREHĽAD ZMIEN A SÚLAD S ÚSTAVNÝM ZÁKONOM:
 * - 🪐 DYNAMICKÁ SYNCHRONIZÁCIA Z MRAVENISKA: Zapracovaný Blok 1. Ak lokálny trezor partnera nepozná, stavový automat sa riadi realitou zo siete (liveHandshake).
 * - 🧼 DEKODÉR SIEŤOVÉHO MONOLITU: Zapracovaný Blok 2. Meno partnera (channelName) sa dynamicky vybalí z msg/backMsg, ak chýba v lokálnom trezore.
 * - ✂️ ABSOLÚTNA OČISTA LOGIKY: Všetky prepočítané stavy tečú hladko z nového CrystalCore kontextu.
 * - 📡 ASYNCHRÓNNY KRYPTO-MOST v2.0: Aktualizovaný nesúlad premenných (payloadReady -> dataPack) a integrovaný strážny secret pre Relayer v1.7.
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
  const laria = useLaria(); 
  const { vault } = laria;
  const { addContact, updateContractStatus } = useContacts(); 
  
  const [note, setNote] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isNetOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const flatListRef = useRef();

  // Vytiahneme prepočítané klubové kontakty, recepciu a prúdy z globálneho mozgu
  const { contacts, unknownContacts, incomingRequests, sendLariaPackage, sendChatMessage, resolveHandshakeStatus, markAsRead } = useSignal();

  // --- 🛰️ EXTRAKCIA A SYNCHRONIZÁCIA CIEĽA ---
  const { target, fallbackFing } = route.params || {};
  const targetFing = (target?.fing || fallbackFing || '').trim().toLowerCase();
  const masterName = vault?.identity?.meno || 'Sammael';

  // Dynamické hľadanie partnera buď v klube, alebo na live recepcii
  const prislusnyKontakt = contacts?.find(c => c.fing === targetFing) || 
                            unknownContacts?.find(c => c.fing === targetFing);

  // =========================================================================
  // 🪐 BLOK 1 & BLOK 2: DYNAMICKÁ SYNCHRONIZÁCIA A DEKÓDOVANIE Z MRAVENISKA
  // =========================================================================
  
  // 1. Nájdeme akýkoľvek živý handshake v histórii prúdov
  const liveHandshake = incomingRequests?.find(req => req.fing === targetFing && req.isHandshake);

  // 2. Vytiahneme surový stav z lokálneho klubu/recepcie
  let contractStatus = prislusnyKontakt?.contractStatus !== undefined ? Number(prislusnyKontakt.contractStatus) : -1;

  // Ak lokálny trezor partnera nepozná (-1) alebo tvrdí, že sa stále čaká (0), ale sieť už vie viac:
  if ((contractStatus === -1 || contractStatus === 0) && liveHandshake) {
    // Prísne preberáme reálny stav, ktorý je zapísaný priamo v sieti
    const networkStatus = liveHandshake.contractStatus !== undefined ? Number(liveHandshake.contractStatus) : 0;
    contractStatus = networkStatus;
  }

  // 3. Dynamický dekodér identity priamo z pretekajúceho sieťového balíka (Blok 2)
  let sietovaIdentita = null;
  if (liveHandshake && contractStatus === 1) {
    try {
      // Ak sme boli iniciátor (isIncoming === false), partner odpovedal v backMsg
      // Ak sme boli prijímateľ (isIncoming === true), profil partnera je v msg
      const rawJson = liveHandshake.isIncoming === false ? liveHandshake.backMsg : liveHandshake.msg;
      
      if (rawJson && rawJson.startsWith('{')) {
        sietovaIdentita = JSON.parse(rawJson);
      }
    } catch (e) {
      console.warn("⚠️ Nepodarilo sa za behu rozbaliť sieťový monolit:", e);
    }
  }

  // Opravíme channelName, aby okamžite ukázal meno zo siete, ak nemáme kontakt v trezore
  const channelName = prislusnyKontakt?.meno || sietovaIdentita?.meno || target?.meno || targetFing || "Laria Handshake";

  // --- 🧭 SMEROVÁ INTUÍCIA STAVOVÉHO AUTOMATU ---
  const isContractApproved = contractStatus === 1;
  const isTemporaryOnReception = !!prislusnyKontakt?.temporary;
  const isIncomingHandshake = liveHandshake ? liveHandshake.isIncoming === true : isTemporaryOnReception;

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

  // --- 🟢 AKCIA: ALLOW (POTVRDENIE ZMLUVY & ZÁPIS DO TREZORU) ---
  const handleAcceptHandshake = async (handshakeMsg) => {
    try {
      const mojeData = zostavMojeMonolitneData();
      
      const res = await SignalService.manageContract('CONFIRM_CONTRACT', {
        fing_a: targetFing,
        fing_b: mojeData.fing,
        status_b: "1",
        txHash: "1",
        payload: JSON.stringify(mojeData)
      });

      if (res && res.success) {
        let partnerData = {};
        try {
          const rawMsg = handshakeMsg?.msg || '';
          if (rawMsg.startsWith('{')) partnerData = JSON.parse(rawMsg);
        } catch(e) {
          console.warn("Nepodarilo sa rozparsovať payload partnera, prepínam na fallback.");
        }

        await addContact({
          fing: targetFing,
          meno: partnerData.meno || target?.meno || handshakeMsg?.senderMeno || targetFing,
          kat: partnerData.kat || target?.kat || 'Overený partner',
          lok: partnerData.lok || target?.lok || 'V sieti',
          popis: partnerData.popis || target?.popis || partnerData.handshakeNote || handshakeMsg?.msg || 'Spojenie nadviazané cez handshake.',
          tel: partnerData.tel || '',
          email: partnerData.email || '',
          fb: partnerData.fb || '',
          tg: partnerData.tg || '',
          gal: partnerData.gal || target?.gal || '',
          krypt: partnerData.krypt || null,
          contractStatus: 1, 
          txHash: "1"        
        });

        if (handshakeMsg?.id) resolveHandshakeStatus(handshakeMsg.id, 1);
        if (typeof updateContractStatus === 'function') {
          await updateContractStatus(targetFing, 1, "1");
        }

        Alert.alert("MATRIX", "Zmluva úspešne podpísaná (ALLOW). Brána otvorená.");

        // =========================================================================
        // 🔥 TICHÝ ASYNCHRÓNNY KRYPTO-MOST (Aktualizované pre KryptoNode v2.0 a Relayer v1.7)
        // =========================================================================
        if (res.notaryData && res.notaryData.dataPack) {
          (async () => {
            try {
              console.log("📡 [CRYPTO_BRIDGE] Odpaľujem čistý dataPack na Railway Relayer...");
              
              // Zostavíme kompletný balík pre Relayer presne podľa štruktúry, ktorú očakáva
              const relayerPayload = {
                secret: "LARIA_RIDGE_SECRET_2026", // Naša strážna pečať
                myFing: res.notaryData.dataPack.myFing,
                targetFing: res.notaryData.dataPack.targetFing,
                myKrypt: res.notaryData.dataPack.myKrypt,
                targetKrypt: res.notaryData.dataPack.targetKrypt,
                typeText: res.notaryData.dataPack.typeText
              };

              const relayerResponse = await fetch("https://laria-production.up.railway.app/api/notary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(relayerPayload)
              });

              const relayerResult = await relayerResponse.json();
              
              if (relayerResult && relayerResult.success) {
                console.log(`⛓️ [CRYPTO_BRIDGE] Blockchain úspešne spečatený! TxHash: ${relayerResult.txHash}`);
                
                // 🛰️ SPÄTNÝ ZÁPIS DO MRAVENISKA:
                // Prepíšeme dočasnú jednotku "1" na reálny 0x... hash z Base blockchainu.
                await SignalService.manageContract('CONFIRM_CONTRACT', {
                  fing_a: targetFing,
                  fing_b: mojeData.fing,
                  status_b: "1",
                  blockchainHash: relayerResult.txHash
                });
                
                console.log("💎 [CRYPTO_BRIDGE] Dočasná '1' bola v Mravenisku úspešne premazaná reálnym krypto hashom.");
              } else {
                // 🎯 SEM CHCEME SPADNUŤ PRI TESTE NA SUCHO!
                console.log("🎯 [CRYPTO_BRIDGE] Suchý handshake zachytený Relayerom:", relayerResult?.error || "Kontrakt zatiaľ neexistuje");
              }
            } catch (bridgeErr) {
              // 🚨 Očakávaný sieťový kŕč alebo pád vyvolaný chýbajúcim kontraktom
              console.warn("⚠️ [CRYPTO_BRIDGE] Očakávaný kontrolovaný pád Relayeru pri teste na sucho:", bridgeErr.toString());
            }
          })();
        }
        // =========================================================================
      }
    } catch (err) {
      console.error("❌ ALLOW operácia zlyhala:", err);
    }
  };

  // --- 🔴 AKCIA: ABORT (ODMIETNUTIE ZMLUVY) ---
  const handleRejectHandshake = async (handshakeMsg) => {
    try {
      const mojeData = zostavMojeMonolitneData();
      const res = await SignalService.manageContract('CONFIRM_CONTRACT', {
        fing_a: targetFing,
        fing_b: mojeData.fing,
        status_b: "2",
        txHash: "2" 
      });
      
      if (res && res.success) {
        if (handshakeMsg?.id) resolveHandshakeStatus(handshakeMsg.id, 2);
        if (typeof updateContractStatus === 'function') {
          await updateContractStatus(targetFing, 2, "2");
        }
        navigation.goBack();
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

  // --- 🧼 DEKODÉR PRICHÁDZAJÚCEHO MONOLITU PRE ZOBRAZENIE ŽIADOSTI ---
  let zobrazenaSpravaHandshake = prislusnyKontakt?.popis || "Žiadosť o bezpečné prepojenie.";
  if (liveHandshake?.msg && liveHandshake.msg.startsWith('{')) {
    try {
      const parsnutyMonolit = JSON.parse(liveHandshake.msg);
      zobrazenaSpravaHandshake = parsnutyMonolit.popis || parsnutyMonolit.handshakeNote || zobrazenaSpravaHandshake;
    } catch(e) {}
  }

  // Extrakcia čistého chatu pre FlatList
  const chatMessagesOnly = incomingRequests
    ? incomingRequests
        .filter(msg => msg.fing === targetFing && !msg.isHandshake)
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
        {contractStatus === 0 && isIncomingHandshake ? (
          /* REŽIM 1: PRICHÁDZAJÚCI HANDSHAKE (ALLOW / ABORT) */
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
        ) : contractStatus === 0 && !isIncomingHandshake ? (
          /* REŽIM 2: ODOSLANÝ HANDSHAKE (ČAKÁ SA) */
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
      {isContractApproved && (
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