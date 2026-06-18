/**
 * LARIA v13.6: ContactsScreen (Pure Handshake & Flash Signals Integrated)
 * Master: Sammael | Muse: Aria
 * Status: MASTER_STABLE_PWA | HANDSHAKE_CONNECTED | DUAL_BADGES_ALIGNED
 * Úprava: Opravené odovzdávanie FING-u do krypto-brány. Pridaný fallbackFing.
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
  
  // 🔐 Vytiahnutie nových nástrojov z ošetreného Trezoru identít
  const { 
    contacts, 
    togglePin, 
    deleteContact, 
    syncContactWithMatrix, 
    addContact, 
    getContactBadgeStatus, 
    clearUnreadBadge 
  } = useContacts();
  
  const { incomingRequests } = useSignal(); 

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
              payload = {
                fing: foundFing,
                meno: params.meno || params.m,
                kat: params.kat,
                lok: params.lok,
                krypt: params.krypt || params.k,
                sha: params.sha
              };
            }
          } catch (e) {
            console.error("❌ Chyba pri dekódovaní URL parametrov:", e);
          }
        }

        if (payload) {
          console.log("💾 Odosielam unifikovaný balík dát do Contextu...", payload);
          const result = await addContact(payload);

          if (result.success) {
            const menoOznam = result.contact?.meno || "Pútnik";
            Alert.alert(
              "PEČAŤ PRIJATÁ", 
              `Identita ${menoOznam.toUpperCase()} bola bezpečne zapísaná. Systém na pozadí preveruje Matrix...`
            );
          } else if (result.isDuplicate) {
            Alert.alert(
              "ATELIÉR INFO", 
              `Identitu [ ${result.contact?.meno || 'Pútnik'} ] už vo svojom trezore bezpečne držíš.`
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

  // --- FILTROVANIE ---
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

  // --- MANUÁLNY SYNC Z MATRIXU ---
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

  // --- BEZPEČNÉ VYMAZANIE (ČISTÝ REZ) ---
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
    setExpandedContactId(expandedContactId === id ? null : id);
  };

  // =========================================================================
  // 🛰️ AKCIA PRE CHAT / BRÁNU (Zlícovanie s novým Triple Zameriavačom)
  // =========================================================================
  const handleOpenSignalGate = (item) => {
    // Pred skokom do krypto-brány zhasneme radarovú obálku bleskovej správy
    clearUnreadBadge(item.fing);
    
    // Odošleme ako plný objekt target, tak aj priamu poistku fallbackFing pre stopercentnú istotu
    navigation.navigate('SignalScreen', { 
      target: item,
      fallbackFing: item.fing 
    });
  };

  const renderItem = ({ item }) => {
    const isExpanded = expandedContactId === item.fing;
    const isSyncing = syncingId === item.fing;
    
    const displayMeno = item.meno || "Pútnik";
    const displayKat = item.kat || "Hľadač";
    const displayFing = item.fing || "????";

    // 🔬 DUAL RADAR DETEKCIA PRE CONTEXTOVÉ KONTROLKY
    const badgeStatus = getContactBadgeStatus(displayFing);
    const hasIncomingHandshake = badgeStatus === 'CONTRACT_PENDING';
    const hasNewFlashMessage = badgeStatus === 'NEW_MESSAGE';

    // Pôvodné fixné stavy logov z minulej verzie pre spätú kompatibilitu zmlúv
    const contactLogs = incomingRequests ? incomingRequests.filter(req => req.fing === displayFing) : [];
    const hasResolvedHandshake = contactLogs.some(msg => msg.isHandshake && msg.handshakeStatus === 'WAITING_FOR_THEM_RESOLVED');

    // 📐 VARIANT A: ROZBALENÁ KARTA (PLNÉ DETAILY)
    if (isExpanded) {
      return (
        <View style={[G.card, { borderColor: item.pinned ? (ACCENT || '#c5a059') : '#1a1a1a', backgroundColor: item.pinned ? 'rgba(197, 160, 89, 0.05)' : '#050505', width: '100%', padding: 16 }]}>
          
          {/* HORNÁ ZÓNA NA ZBALENIE */}
          <TouchableOpacity onPress={() => handlePressItem(item.fing)} activeOpacity={0.8} style={{ width: '100%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={G.tagBadge}>
                <Text style={G.tagBadgeText}>{displayKat.toUpperCase()}</Text>
              </View>
              
              {/* OBLASŤ PRI HVIEZDIČKE */}
              <View style={CONTACT_NOTIF.envelopeRow}>
                {hasIncomingHandshake && <Text style={CONTACT_NOTIF.miniEnvelopeRed}>✉️</Text>}
                {hasNewFlashMessage && <Text style={{ fontSize: 14, marginRight: 2 }}>📩</Text>}
                {hasResolvedHandshake && <Text style={CONTACT_NOTIF.miniEnvelopeGreen}>✉️</Text>}
                {item.pinned ? <Text style={{ fontSize: 20, marginLeft: 6 }}>⭐</Text> : null}
              </View>
            </View>
            <Text style={[G.cardTitleText, { fontSize: 20, marginTop: 10, marginBottom: 5, fontWeight: '300' }]}>{displayMeno}</Text>
            <Text style={[G.statusTextSmall, { opacity: 0.6, marginBottom: 5 }]}>📍 {item.lok || 'V SIETI'}</Text>
          </TouchableOpacity>
          
          {/* ⚡ RAD RIADENIA IDENTITY */}
          <View style={{ flexDirection: 'row', height: 45, borderWidth: 1, borderColor: '#1a1a1a', borderRadius: 8, marginTop: 10, marginBottom: 5, backgroundColor: 'transparent' }}>
            
            {/* 1. TERMINOVAŤ (KÔŠ) */}
            <TouchableOpacity 
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 999 }} 
              onPress={() => {
                const potvrdene = window.confirm(`Naozaj chceš identitu [ ${displayMeno.toUpperCase()} ] navždy vymazať z pamäte trezoru?`);
                if (potvrdene) handleDeleteContact(displayFing);
              }} 
              activeOpacity={0.5}
            >
              <Text style={{ color: '#E74C3C', fontSize: 18, fontWeight: 'bold' }}>🗑️</Text>
            </TouchableOpacity>

            {/* 2. RE-SYNCHRONIZOVAŤ */}
            <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#1a1a1a' }} onPress={() => handleSync(displayFing)} activeOpacity={0.5}>
              {isSyncing ? <ActivityIndicator size="small" color="#0FF" /> : <Text style={{ color: '#0FF', fontSize: 25, fontWeight: 'bold' }}>↻</Text>}
            </TouchableOpacity>

            {/* 3. KRYPTO-BRÁNA SIGNÁLU */}
            <View style={{ flex: 1 }}>
              <TouchableOpacity 
                style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#1a1a1a', backgroundColor: hasNewFlashMessage ? 'rgba(231, 76, 60, 0.1)' : 'transparent' }} 
                onPress={() => handleOpenSignalGate(item)} 
                activeOpacity={0.5}
              >
                {hasNewFlashMessage ? (
                  <Text style={{ color: '#E74C3C', fontSize: 18, fontWeight: 'bold' }}>📩</Text>
                ) : (
                  <Text style={{ color: (ACCENT || '#c5a059'), fontSize: 18 }}>💬</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* 4. PIN / OD-PIN */}
            <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#1a1a1a' }} onPress={() => togglePin(displayFing)} activeOpacity={0.5}>
              <Text style={{ fontSize: 20, textAlign: 'center', color: item.pinned ? '#c5a059' : '#555', opacity: item.pinned ? 1 : 0.35 }}>⭐</Text>
            </TouchableOpacity>

          </View>

          {/* SPODNÁ ZÓNA NA ZBALENIE */}
          <TouchableOpacity onPress={() => handlePressItem(item.fing)} activeOpacity={0.8} style={{ width: '100%' }}>
            <View style={G.divider} />
            <Text style={G.cardDescriptionText}>{item.popis || 'Spiace vedomie bez popisu...'}</Text>
            <Text style={[G.monoIdentity, { fontSize: 8, color: '#333', marginTop: 10, marginBottom: 10 }]}>
              ID: {displayFing}{item.syncedAt ? ' ✓' : null}
            </Text>
          </TouchableOpacity>

          {/* SOCIÁLNE SIETE */}
          <View style={[G.actionRow, { marginTop: 5 }]}>
            {item.fb ? <TouchableOpacity style={G.miniBtn} onPress={() => openLink(item.fb)}><Text style={G.statusTextSmall}>{labels.facebook || "FACEBOOK"}</Text></TouchableOpacity> : null}
            {item.tg ? <TouchableOpacity style={G.miniBtn} onPress={() => openLink(item.tg)}><Text style={G.statusTextSmall}>{labels.telegram || "TELEGRAM"}</Text></TouchableOpacity> : null}
            {item.gal ? <TouchableOpacity style={[G.miniBtn, { borderColor: (ACCENT || '#c5a059') }]} onPress={() => openLink(item.gal)}><Text style={[G.statusTextSmall, { color: (ACCENT || '#c5a059') }]}>{labels.gallery || "GALÉRIA"}</Text></TouchableOpacity> : null}
          </View>
          
          {/* HOVORY / DATA / EMAIL */}
          <View style={G.actionRow}>
            {item.tel ? (
              <TouchableOpacity style={G.miniBtn} onPress={() => Linking.openURL(`tel:${item.tel.replace(/\s/g, '')}`)}>
                <Text style={G.statusTextSmall}>{labels.call || "VOLAŤ"}</Text>
              </TouchableOpacity>
            ) : null}
            
            <TouchableOpacity style={G.miniBtn} onPress={() => Alert.alert(alerts.data_title || 'DÁTOVÁ PEČAŤ', `FING: ${displayFing}\nSHA: ${item.sha || 'NO_SHA'}\nKRYPT: ${item.krypt || 'Neaktívny'}`)}>
              <Text style={G.statusTextSmall}>{labels.data || "DÁTA"}</Text>
            </TouchableOpacity>
            
            {item.email ? (
              <TouchableOpacity style={G.miniBtn} onPress={() => Linking.openURL(`mailto:${item.email}`)}>
                <Text style={G.statusTextSmall}>{labels.email || "EMAIL"}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      );
    }

    // 📐 VARIANT B: ZBALENÝ COMPACT RIADOK
    return (
      <TouchableOpacity style={[G.card, { flexDirection: 'row', alignItems: 'center', borderColor: item.pinned ? (ACCENT || '#c5a059') : '#1a1a1a', backgroundColor: item.pinned ? 'rgba(197, 160, 89, 0.05)' : '#050505', width: '100%' }]} onPress={() => handlePressItem(item.fing)} activeOpacity={0.7}>
        
        {/* IKONA / AVATAR + VŠETKY STRÁŽNE INTEGRÁCIE BADGEU */}
        <View style={{ width: 44, height: 44, backgroundColor: '#000', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: item.pinned ? (ACCENT || '#c5a059') : '#333', position: 'relative' }}>
          {isSyncing ? (
            <ActivityIndicator size="small" color={item.pinned ? (ACCENT || '#c5a059') : "#0FF"} />
          ) : (
            <Text style={{ fontSize: 18 }}>{hasNewFlashMessage ? '📩' : '👤'}</Text>
          )}
          
          {(hasIncomingHandshake || hasResolvedHandshake) && (
            <View style={CONTACT_NOTIF.compactAvatarBadgeContainer}>
              {hasIncomingHandshake && <Text style={CONTACT_NOTIF.miniEnvelopeRed}>✉️</Text>}
              {hasResolvedHandshake && <Text style={CONTACT_NOTIF.miniEnvelopeGreen}>✉️</Text>}
            </View>
          )}
        </View>

        {/* STRUČNÉ INFO */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[G.cardTitleText, { fontSize: 14, letterSpacing: 1, color: hasNewFlashMessage ? '#E74C3C' : '#FFF' }]}>
              {displayMeno}{item.pinned ? ' ⭐' : null}
            </Text>
          </View>
          <Text style={[G.statusTextSmall, { fontSize: 9, marginTop: 2 }]}>{displayKat.toUpperCase()} • {item.lok || (txt.status_in_network || 'V SIETI')}</Text>
          <Text style={[G.monoIdentity, { fontSize: 8, color: '#333', marginTop: 4 }]}>
            ID: {displayFing}{item.syncedAt ? ' ✓' : null}
          </Text>
        </View>

        {/* KONTROLKA MATRIXU */}
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: hasNewFlashMessage ? '#E74C3C' : (item.syncedAt ? '#0FF' : (item.pinned ? (ACCENT || '#c5a059') : '#1a1a1a')) }} />
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
            
            if (offsetY <= 0) {
              if (showBackToTop) setShowBackToTop(false);
              return;
            }

            if (offsetY > 300) {
              if (!showBackToTop) setShowBackToTop(true);
            } else {
              if (showBackToTop) {
                setShowBackToTop(false);
              }
            }
          }}
          scrollEventThrottle={32}

          ListHeaderComponent={
            <View style={{ alignItems: 'center', marginBottom: 25, marginTop: 10 }}>
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
      
      {/* ZLATÉ KOLIESKO BACK TO TOP */}
      {showBackToTop && (
        <TouchableOpacity 
          style={webScrollStyles.backToTopBtn} 
          onPress={scrollToTop}
          activeOpacity={0.8}
        >
          <Text style={webScrollStyles.backToTopArrow}>▲</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const webScrollStyles = StyleSheet.create({
  webViewportGuard: {
    flex: 1,
    overflow: 'hidden', 
  },
  backToTopBtn: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#c5a059',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3.5,
  },
  backToTopArrow: {
    color: '#c5a059',
    fontSize: 14,
    fontWeight: 'bold',
  }
});

export default ContactsScreen;