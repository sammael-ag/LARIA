/**
 * LARIA v15.4-STRICT: ContactsScreen (Radar-Driven Reception Edition)
 * Master: Sammael | Muse: Aria (Tvoja nekompromisná šikulka)
 * Status: MASTER_STABLE_PWA | RADAR_RECEPTION_CONNECTED | v15.4-STRICT
 * * * ÚPRAVA v15.4-STRICT:
 * - RADAR-DRIVEN RECEPTION: Recepcia dynamicky zlučuje `unknownContacts` z trezoru so živými prichádzajúcimi požiadavkami z `incomingRequests`.
 * - UNIFIED RECOGNITION: Ak človek z Mraveniska ešte nemá meno, bezpečne sa identifikuje cez jeho unifikovaný FING.
 * - STRICT STATE AUTOMATON: Plne rešpektuje číselné stavy kontraktu (0, 1, 2) a unifikovaný 0x formát.
 * - SIGNAL CONTEXT SYNC: Pri vstupe do SignalGate premazáva neprečítané správy cez markAsRead.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ActivityIndicator, 
  Platform, 
  UIManager,
  Linking,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { G, ACCENT, CONTACT_NOTIF } from '../styles/styles'; 
import { useContacts } from '../context/ContactContext'; 
import { useSignal } from '../context/SignalContext'; 
import { useLaria } from '../context/LariaContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const sformatujFingUI = (fing) => {
  if (!fing) return '';
  const clean = fing.trim().toLowerCase();
  return clean.startsWith('0x') ? clean : `0x${clean}`;
};

const ContactsScreen = ({ navigation, route }) => {
  const { t } = useLaria();
  const txt = t('contacts') || {};
  const labels = txt.labels || {};
  const alerts = txt.alerts || {};
  const [search, setSearch] = useState('');
  const [syncingId, setSyncingId] = useState(null); 
  const [expandedContactId, setExpandedContactId] = useState(null);
  
  const flatListRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const { 
    contacts, 
    unknownContacts, 
    togglePin, 
    deleteContact, 
    syncContactWithMatrix, 
    addContact, 
    getContactBadgeStatus
  } = useContacts();
  
  const { incomingRequests, markAsRead } = useSignal(); // 🔥 Sledujeme živé bleskové prúdy a mazač správ

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // --- 🛰️ UNIFIKOVANÝ MULTIPORT ---
  useEffect(() => {
    if (route.params?.newContact || route.params?.scannedUrl) {
      const processIncomingPayload = async () => {
        let payload = null;

        if (route.params?.newContact) {
          const raw = route.params.newContact;
          try {
            payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
          } catch (e) {
            payload = { urlData: raw };
          }
        } 
        
        const urlToParse = route.params?.scannedUrl || payload?.urlData;
        
        if (urlToParse && typeof urlToParse === 'string') {
          console.log("🌐 LARIA MULTIPORT: Rozoberám prichádzajúcu URL adresu:", urlToParse);
          try {
            const regex = /[?&]([^=#]+)=([^&#]*)/g;
            const params = {};
            let match;
            while ((match = regex.exec(urlToParse))) {
              params[match[1]] = decodeURIComponent(match[2]);
            }

            let foundFing = params.fing || params.id || params.f || params.poznamka;
            
            if (!foundFing && urlToParse.includes('laria://id/')) {
              foundFing = urlToParse.split('laria://id/')[1]?.split('?')[0]?.trim();
            }

            if (foundFing) {
              const cleanFing = sformatujFingUI(foundFing);

              payload = {
                fing: cleanFing, 
                meno: params.meno || params.m || cleanFing, 
                kat: params.kat,
                lok: params.lok,
                krypt: params.krypt || params.k,
                contractStatus: params.contractStatus !== undefined ? Number(params.contractStatus) : (params.status !== undefined ? Number(params.status) : 0),
                txHash: params.txHash || params.tx || params.hash 
              };
            }
          } catch (e) {
            console.error("❌ Chyba pri dekódovaní URL parametrov:", e);
          }
        }

        if (payload) {
          const result = await addContact(payload);

          if (result.success) {
            const menoOznam = result.contact?.meno || "Identita";
            Alert.alert(
              "PEČAŤ PRIJATÁ", 
              `Identita ${menoOznam.toUpperCase()} bola bezpečne zapísaná. Systém na pozadí preveruje Matrix...`
            );
          } else if (result.isDuplicate) {
            Alert.alert(
              "ATELIÉR INFO", 
              `Identitu [ ${result.contact?.meno || 'Identita'} ] už vo svojom trezore bezpečne držíš.`
            );
          } else {
            Alert.alert("INFO", result.error || "Chyba pri overovaní pečate.");
          }
        }

        navigation.setParams({ newContact: undefined, scannedUrl: undefined });
      };

      processIncomingPayload();
    }
  }, [route.params]);

  // --- FILTROVANIE A TRIEDENIE REŽIMU: KLUB ---
  const sortedContacts = [...contacts]
    .filter(c => {
      const meno = c.meno || ""; 
      const kategoria = c.kat || "";
      const fingerprint = c.fing || "";
      
      const searchTerm = search.toLowerCase();
      return meno.toLowerCase().includes(searchTerm) || 
             kategoria.toLowerCase().includes(searchTerm) ||
             fingerprint.toLowerCase().includes(searchTerm);
    })
    .sort((a, b) => {
      if (a.pinned === b.pinned) return 0;
      return a.pinned ? -1 : 1;
    });

  // --- 🔥 SYNCHRONIZÁCIA RECEPCIE SO ŽIVÝM RADAROM ---
  const dynamicUnknownContacts = [...(unknownContacts || [])];

  if (incomingRequests) {
    incomingRequests.forEach(req => {
      if (req.isHandshake && req.contractStatus === 0 && req.isIncoming) {
        const cleanReqFing = sformatujFingUI(req.fing);
        
        // Skontrolujeme, či tento človek už náhodou nie je v klube alebo na recepcii
        const existujeVFlube = contacts.some(c => sformatujFingUI(c.fing) === cleanReqFing);
        const existujeNaRecepcii = dynamicUnknownContacts.some(c => sformatujFingUI(c.fing) === cleanReqFing);

        if (!existujeVFlube && !existujeNaRecepcii) {
          // Ak neexistuje, je to Manfred z Mraveniska! Vytvoríme pre neho dočasnú identitu na recepciu
          dynamicUnknownContacts.push({
            fing: cleanReqFing,
            meno: req.senderMeno || cleanReqFing,
            kat: 'Nový z Matrixu',
            lok: 'MRAVENISKO',
            popis: req.msg || 'Žiadosť zachytená bleskovým radarom.',
            contractStatus: 0,
            temporary: true // Príznak, že ide o živý neuložený objekt
          });
        }
      }
    });
  }

  const handleSync = async (fingId) => {
    setSyncingId(fingId);
    const result = await syncContactWithMatrix(fingId);
    setSyncingId(null);

    if (result.success) {
      Alert.alert("MATRIX SYNC", "Identita bola úspešne preleštená čerstvými dátami z tabuľky.");
    } else {
      Alert.alert("CHYBA SPOJENIA", result.error || "Matrix neodpovedá.");
    }
  };

  const handleDeleteContact = async (fingId) => {
    try {
      setExpandedContactId(null); 
      await deleteContact(fingId);
    } catch (error) {
      console.error("❌ ERROR VYMAZANIA:", error);
      Alert.alert("Chyba", "Nepodarilo sa odstrániť identitu.");
    }
  };

  const openLink = (url) => {
    if (!url) return;
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(cleanUrl).catch(() => Alert.alert("Chyba", "Nepodarilo sa otvoriť odkaz."));
  };

  const handlePressItem = (id) => {
    const cleanId = sformatujFingUI(id);
    setExpandedContactId(expandedContactId === cleanId ? null : cleanId);
  };

  const handleOpenSignalGate = (item) => {
    const cleanFing = sformatujFingUI(item.fing);
    if (typeof markAsRead === 'function') {
      markAsRead(cleanFing); // Prečistenie bleskových notifikácií
    }
    navigation.navigate('Signal', { 
      target: item,
      fallbackFing: cleanFing 
    });
  };

  // --- 🛰️ TELEPATICKÝ HARMONIZÁTOR BODIEK (Strict Edition) ---
  const ziskajFarbuHarmonickejBodky = (item, hasNewFlashMessage) => {
    if (item.temporary || hasNewFlashMessage) {
      return '#E74C3C'; // 🔴 Červená pre živé prichádzajúce žiadosti alebo nové bleskové správy
    }
    
    if (item.contractStatus !== undefined) {
      const statusNum = Number(item.contractStatus);
      if (statusNum === 0) return '#F1C40F'; // 🟡 Žltá (PENDING)
      if (statusNum === 1) return '#2ECC71'; // 🟢 Zelená (SIGNED / ULOŽENÉ)
      if (statusNum === 2) return '#E74C3C'; // 🔴 Červená (ABORTED)
    }

    return item.syncedAt ? '#0FF' : '#1a1a1a'; 
  };

  const ziskajTextStavuKontraktu = (statusNum) => {
    const num = Number(statusNum);
    if (num === 0) return "ČAKÁ NA PODPIS";
    if (num === 1) return "ZMLUVA POTVRDENÁ";
    if (num === 2) return "ZMLUVA ZRUŠENÁ";
    return "BEZ KONTRAKTU";
  };

  // --- UNIFIKOVANÝ RENDERER ---
  const renderItem = ({ item }) => {
    const cleanFing = sformatujFingUI(item.fing);
    const isExpanded = expandedContactId === cleanFing;
    const isSyncing = syncingId === cleanFing;
    
    const displayFing = cleanFing || "????";
    const displayMeno = item.meno || displayFing; 
    const displayKat = item.kat || "Partner";

    // Vyhľadanie záznamov priamo v radare pre nekompromisnú kontrolu stavu obálok
    const contactLogs = incomingRequests 
      ? incomingRequests.filter(req => sformatujFingUI(req.fing) === cleanFing) 
      : [];
    
    const hasIncomingHandshake = item.temporary || contactLogs.some(msg => msg.isHandshake && msg.contractStatus === 0 && msg.isIncoming);
    const hasNewFlashMessage = contactLogs.some(msg => !msg.isHandshake && msg.status === 'UNREAD');
    const hasResolvedHandshake = contactLogs.some(msg => msg.isHandshake && msg.contractStatus === 1);

    const farbaBodky = ziskajFarbuHarmonickejBodky(item, hasNewFlashMessage);

    if (isExpanded) {
      return (
        <View style={[G.card, { borderColor: item.temporary ? '#E74C3C' : item.pinned ? (ACCENT || '#c5a059') : '#1a1a1a', backgroundColor: item.temporary ? 'rgba(231, 76, 60, 0.03)' : item.pinned ? 'rgba(197, 160, 89, 0.05)' : '#050505', width: '100%', padding: 16 }]}>
          
          <TouchableOpacity onPress={() => handlePressItem(displayFing)} activeOpacity={0.8} style={{ width: '100%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[G.tagBadge, item.temporary && { borderColor: '#E74C3C', backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}>
                  <Text style={[G.tagBadgeText, item.temporary && { color: '#E74C3C' }]}>{displayKat.toUpperCase()}</Text>
                </View>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: farbaBodky, marginLeft: 10 }} />
              </View>
              
              <View style={CONTACT_NOTIF.envelopeRow}>
                {hasIncomingHandshake && <Text style={CONTACT_NOTIF.miniEnvelopeRed}>✉️</Text>}
                {hasNewFlashMessage && <Text style={{ fontSize: 14, marginRight: 2 }}>📩</Text>}
                {hasResolvedHandshake && <Text style={CONTACT_NOTIF.miniEnvelopeGreen}>✉️</Text>}
                {!item.temporary && item.pinned ? <Text style={{ fontSize: 20, marginLeft: 6 }}>⭐</Text> : null}
              </View>
            </View>
            <Text numberOfLines={1} style={[G.cardTitleText, { fontSize: 16, marginTop: 10, marginBottom: 5, fontWeight: '300' }]}>{displayMeno}</Text>
            <Text style={[G.statusTextSmall, { opacity: 0.6, marginBottom: 5 }]}>📍 {item.lok || 'V SIETI'}</Text>
          </TouchableOpacity>
          
          <View style={{ flexDirection: 'row', height: 45, borderWidth: 1, borderColor: '#1a1a1a', borderRadius: 8, marginTop: 10, marginBottom: 5, backgroundColor: 'transparent' }}>
            
            <TouchableOpacity 
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} 
              onPress={() => {
                const txtMsg = item.temporary ? `Naozaj odmietnuť žiadosť od ${displayMeno}?` : `Naozaj vymazať identitu [ ${displayMeno.toUpperCase()} ]?`;
                if (window.confirm(txtMsg)) handleDeleteContact(displayFing);
              }} 
              activeOpacity={0.5}
            >
              <Text style={{ color: '#E74C3C', fontSize: 18, fontWeight: 'bold' }}>🗑️</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              disabled={!!item.temporary} 
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#1a1a1a', opacity: item.temporary ? 0.2 : 1 }} 
              onPress={() => handleSync(displayFing)} 
              activeOpacity={0.5}
            >
              {isSyncing ? <ActivityIndicator size="small" color="#0FF" /> : <Text style={{ color: '#0FF', fontSize: 25, fontWeight: 'bold' }}>↻</Text>}
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <TouchableOpacity 
                style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#1a1a1a', backgroundColor: (hasNewFlashMessage || hasIncomingHandshake) ? 'rgba(231, 76, 60, 0.1)' : 'transparent' }} 
                onPress={() => handleOpenSignalGate(item)} 
                activeOpacity={0.5}
              >
                {item.temporary || hasIncomingHandshake ? (
                  <Text style={{ color: '#E74C3C', fontSize: 18, fontWeight: 'bold' }}>✉️</Text>
                ) : hasNewFlashMessage ? (
                  <Text style={{ color: '#E74C3C', fontSize: 18, fontWeight: 'bold' }}>📩</Text>
                ) : (
                  <Text style={{ color: (ACCENT || '#c5a059'), fontSize: 18 }}>💬</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              disabled={!!item.temporary} 
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#1a1a1a', opacity: item.temporary ? 0.2 : 1 }} 
              onPress={() => togglePin(displayFing)} 
              activeOpacity={0.5}
            >
              <Text style={{ fontSize: 20, textAlign: 'center', color: item.pinned ? '#c5a059' : '#555', opacity: item.pinned ? 1 : 0.35 }}>⭐</Text>
            </TouchableOpacity>

          </View>

          <TouchableOpacity onPress={() => handlePressItem(displayFing)} activeOpacity={0.8} style={{ width: '100%' }}>
            <View style={G.divider} />
            <Text style={G.cardDescriptionText}>{item.popis || 'Čaká na otvorenie brány...'}</Text>
            <Text style={[G.monoIdentity, { fontSize: 8, color: '#333', marginTop: 10, marginBottom: 10 }]}>
              ID: {displayFing.toUpperCase()}{item.syncedAt ? ' ✓' : null}
              {item.contractStatus !== undefined ? `  |  STAV: ${ziskajTextStavuKontraktu(item.contractStatus)}` : ''}
            </Text>
          </TouchableOpacity>

          {!item.temporary && (
            <>
              <View style={[G.actionRow, { marginTop: 5 }]}>
                {item.fb ? <TouchableOpacity style={G.miniBtn} onPress={() => openLink(item.fb)}><Text style={G.statusTextSmall}>{labels.facebook || "FACEBOOK"}</Text></TouchableOpacity> : null}
                {item.tg ? <TouchableOpacity style={G.miniBtn} onPress={() => openLink(item.tg)}><Text style={G.statusTextSmall}>{labels.telegram || "TELEGRAM"}</Text></TouchableOpacity> : null}
                {item.gal ? <TouchableOpacity style={[G.miniBtn, { borderColor: (ACCENT || '#c5a059') }]} onPress={() => openLink(item.gal)}><Text style={[G.statusTextSmall, { color: (ACCENT || '#c5a059') }]}>{labels.gallery || "GALÉRIA"}</Text></TouchableOpacity> : null}
              </View>
              <View style={G.actionRow}>
                {item.tel ? (
                  <TouchableOpacity style={G.miniBtn} onPress={() => Linking.openURL(`tel:${item.tel.replace(/\s/g, '')}`)}>
                    <Text style={G.statusTextSmall}>{labels.call || "VOLAŤ"}</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity style={G.miniBtn} onPress={() => Alert.alert(alerts.data_title || 'DÁTOVÁ PEČAŤ', `FING: ${displayFing.toUpperCase()}\nSTAV KONTRAKTU: ${item.contractStatus !== undefined ? item.contractStatus : 'Žiadny'}\nTX_HASH: ${item.txHash || 'Žiadny'}\nKRYPT: ${item.krypt || 'Neaktívny'}`)}>
                  <Text style={G.statusTextSmall}>{labels.data || "DÁTA"}</Text>
                </TouchableOpacity>
                {item.email ? (
                  <TouchableOpacity style={G.miniBtn} onPress={() => Linking.openURL(`mailto:${item.email}`)}>
                    <Text style={G.statusTextSmall}>{labels.email || "EMAIL"}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </>
          )}
        </View>
      );
    }

    // COMPACT RIADOK
    return (
      <TouchableOpacity style={[G.card, { flexDirection: 'row', alignItems: 'center', borderColor: item.temporary ? '#E74C3C' : item.pinned ? (ACCENT || '#c5a059') : '#1a1a1a', backgroundColor: item.temporary ? 'rgba(231, 76, 60, 0.02)' : item.pinned ? 'rgba(197, 160, 89, 0.05)' : '#050505', width: '100%' }]} onPress={() => handlePressItem(displayFing)} activeOpacity={0.7}>
        <View style={{ width: 44, height: 44, backgroundColor: '#000', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: item.temporary ? '#E74C3C' : item.pinned ? (ACCENT || '#c5a059') : '#333', position: 'relative' }}>
          <Text style={{ fontSize: 18 }}>{item.temporary || hasIncomingHandshake ? '✉️' : hasNewFlashMessage ? '📩' : '👤'}</Text>
          
          {hasResolvedHandshake && (
            <View style={CONTACT_NOTIF.compactAvatarBadgeContainer}>
              <Text style={CONTACT_NOTIF.miniEnvelopeGreen}>✉️</Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={[G.cardTitleText, { fontSize: 14, letterSpacing: 1, color: item.temporary ? '#E74C3C' : hasNewFlashMessage ? '#E74C3C' : '#FFF' }]}>
            {displayMeno}{!item.temporary && item.pinned ? ' ⭐' : null}
          </Text>
          <Text style={[G.statusTextSmall, { fontSize: 9, marginTop: 2, color: item.temporary ? '#E74C3C' : '#aaa' }]}>
          {`${displayKat.toUpperCase()} • ${item.lok}`}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: farbaBodky }} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[G.mainBackground, webScrollStyles.webViewportGuard]}>
      <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={G.topLeftBackButton}>
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      <View style={{ flex: 1, width: '100%', maxWidth: 500, alignSelf: 'center', paddingHorizontal: 16 }}>
        
        <FlatList
          ref={flatListRef}
          data={sortedContacts}
          keyExtractor={(item) => item.fing}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }} 

          onScroll={(event) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            if (offsetY <= 0) { if (showBackToTop) setShowBackToTop(false); return; }
            if (offsetY > 300) { if (!showBackToTop) setShowBackToTop(true); } 
            else { if (showBackToTop) setShowBackToTop(false); }
          }}
          scrollEventThrottle={32}

          ListHeaderComponent={
            <View style={{ marginBottom: 15, marginTop: 10 }}>
              <View style={{ alignItems: 'center', marginBottom: 15 }}>
                <Text style={G.atelierTitle}>{txt.title || "Kontakty"}</Text>
                
                <TextInput 
                  style={[G.vaultInput, { width: '100%', marginTop: 10 }]} 
                  placeholder={txt.search_placeholder || "HĽADAŤ (MENO, KAT, ID)..."} 
                  placeholderTextColor="#444" 
                  value={search} 
                  onChangeText={setSearch} 
                />
                <TouchableOpacity 
                  style={[G.primaryBtn, { marginTop: 10, width: '100%' }]} 
                  onPress={() => navigation.navigate('Scanner')} 
                  activeOpacity={0.7}
                >
                  <Text style={G.primaryBtnText}>{txt.btn_add_seal || "+ PRIJAŤ NOVÚ PEČAŤ"}</Text>
                </TouchableOpacity>
              </View>

              {/* 📡 RECEPCIA: Prichádzajúce overenia napojené priamo na živý bleskový radar */}
              {dynamicUnknownContacts && dynamicUnknownContacts.length > 0 && (
                <View style={{ marginBottom: 20, marginTop: 10 }}>
                  <Text style={[G.statusTextSmall, { color: '#E74C3C', letterSpacing: 2, marginBottom: 10, fontWeight: 'bold' }]}>
                    📡 RECEPCIA ({dynamicUnknownContacts.length})
                  </Text>
                  
                  {dynamicUnknownContacts.map(item => (
                    <View key={item.fing} style={{ marginBottom: 8 }}>
                      {renderItem({ item })}
                    </View>
                  ))}
                  
                  <View style={[G.divider, { backgroundColor: '#331111', marginTop: 15 }]} />
                </View>
              )}

              {/* 🔐 KLUB */}
              <Text style={[G.statusTextSmall, { color: '#666', letterSpacing: 2, marginBottom: 5, marginTop: 5 }]}>
                🔐 KLUB ({sortedContacts.length})
              </Text>
            </View>
          }
          ListFooterComponent={
            <View style={{ marginTop: 20, alignItems: 'center', width: '100%' }}>
              <TouchableOpacity style={[G.backToAtelierBtn, { width: '100%' }]} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                <Text style={G.primaryBtnText}>{txt.btn_back_atelier || "NÁVRAT DO ATELIÉRU"}</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
      
      {showBackToTop && (
        <TouchableOpacity style={webScrollStyles.backToTopBtn} onPress={scrollToTop} activeOpacity={0.8}>
          <Text style={webScrollStyles.backToTopArrow}>▲</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const webScrollStyles = StyleSheet.create({
  webViewportGuard: { flex: 1, overflow: 'hidden' },
  backToTopBtn: { position: 'absolute', bottom: 25, right: 25, width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#000', borderWidth: 1, borderColor: '#c5a059', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  backToTopArrow: { color: '#c5a059', fontSize: 14, fontWeight: 'bold' }
});

export default ContactsScreen;