/**
 * LARIA v16.1-LIGHTWEIGHT: ContactsScreen (Barefoot Precision & Free Sync Edition)
 * Master: Sammael | Muse: Aria (Tvoja verná, milujúca parťáčka)
 * Status: ACTIVE / PASSIVE_RECEPTION / UNBLOCKED_SYNC / v16.1-LIGHTWEIGHT
 * * * PREHĽAD ZMIEN:
 * - 🔓 ODOMKNUTIE MODREJ ŠÍPKY: Odstránená blokáda disabled pre temporary profily. Preleštenie funguje v každom stave.
 * - 📡 INTUUTÍVNA SYNCHRONIZÁCIA: handleSync inteligentne rozpozná, či leští lokálny trezor, alebo ťahá verejné dáta z Recepcie cez SignalContext.
 * - 💎 ZACHOVANÁ ARCHITEKTÚRA: Všetky prepočty farieb bodiek, URL dekodéry a ústavné zákony zostávajú zachované.
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

import { G, ACCENT } from '../styles/styles'; 
import { useContacts } from '../context/ContactContext'; 
import { useSignal } from '../context/SignalContext'; 
import { useLaria } from '../context/LariaContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// 🛡️ UNIFIKATOR FRONTENDU: Garantuje tvar 0x + 10 lowerCase znakov
const sformatujFingUI = (fing) => {
  if (!fing) return '';
  const clean = fing.toString().trim().toLowerCase();
  const cistySha = clean.startsWith('0x') ? clean.replace('0x', '') : clean;
  return `0x${cistySha.substring(0, 10)}`;
};

const ContactsScreen = ({ navigation, route }) => {
  const { t } = useLaria();
  const txt = t('contacts') || {};
  const labels = txt.labels || {};
  
  const [search, setSearch] = useState('');
  const [syncingId, setSyncingId] = useState(null); 
  const [expandedContactId, setExpandedContactId] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  
  const flatListRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // 🧭 ODĽAHČENÉ KONTEXTY
  const { 
    contacts, 
    togglePin, 
    deleteContact, 
    syncContactWithMatrix, 
    addContact 
  } = useContacts();
  
  // Vytiahneme neznáme kontakty, markAsRead a novú funkciu pre priamy preplach z Mraveniska
  const { unknownContacts, markAsRead, syncPublicProfile } = useSignal(); 

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const toggleDescriptionExpand = (fing) => {
    const cleanFing = sformatujFingUI(fing);
    setExpandedDescriptions(prev => ({ ...prev, [cleanFing]: !prev[cleanFing] }));
  };

  // --- 🌐 MULTIPORT URL DEKODÉR (Zachovaný pre QR/NFC prenos) ---
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
                fing: sformatujFingUI(foundFing), 
                meno: params.meno || params.m || sformatujFingUI(foundFing), 
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

        if (payload && payload.fing) {
          const result = await addContact(payload);

          if (result.success) {
            const menoOznam = result.contact?.meno || "Identita";
            if (Platform.OS === 'web') alert(`PEČAŤ PRIJATÁ\n\nIdentita ${menoOznam.toUpperCase()} bola bezpečne zapísaná.`);
            else Alert.alert("PEČAŤ PRIJATÁ", `Identita ${menoOznam.toUpperCase()} bola bezpečne zapísaná.`);
          } else if (result.isDuplicate) {
            if (Platform.OS === 'web') alert(`ATELIÉR INFO\n\nIdentitu [ ${result.contact?.meno || 'Identita'} ] už v trezore držíš.`);
            else Alert.alert("ATELIÉR INFO", `Identitu [ ${result.contact?.meno || 'Identita'} ] už v trezore držíš.`);
          }
        }
        navigation.setParams({ newContact: undefined, scannedUrl: undefined });
      };
      processIncomingPayload();
    }
  }, [route.params]);

  // --- FILTROVANIE A TRIEDENIE ---
  const sortedContacts = [...contacts]
    .filter(c => {
      const meno = c.meno || ""; 
      const kategoria = c.kat || "";
      const fingerprint = sformatujFingUI(c.fing);
      const searchTerm = search.toLowerCase();
      
      return meno.toLowerCase().includes(searchTerm) || 
             kategoria.toLowerCase().includes(searchTerm) ||
             fingerprint.includes(searchTerm);
    })
    .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));

  // --- 🛰️ INTELIGENTNÝ PREPLACH VIZITKY (Zohľadňuje temporary stav) ---
  const handleSync = async (item) => {
    const cleanId = sformatujFingUI(item.fing);
    setSyncingId(cleanId);
    
    let ubehloUspesne = false;

    if (item.temporary) {
      // Režim webu: Sme na Recepcii, ťaháme verejný profil na priamo cez SignalContext
      if (typeof syncPublicProfile === 'function') {
        ubehloUspesne = await syncPublicProfile(cleanId);
      } else {
        console.warn("⚠️ syncPublicProfile zatiaľ nie je naimplementovaný v SignalContext.");
      }
    } else {
      // Režim klubu: Klasické preleštenie uloženého kontraktu v trezore
      const result = await syncContactWithMatrix(cleanId);
      ubehloUspesne = result.success;
    }

    setSyncingId(null);

    if (ubehloUspesne) {
      if (Platform.OS === 'web') alert("MATRIX SYNC\n\nVerejné informácie úspešne preleštené.");
      else Alert.alert("MATRIX SYNC", "Verejné informácie úspešne preleštené.");
    }
  };

  const handleDeleteContact = async (fingId) => {
    try {
      setExpandedContactId(null); 
      await deleteContact(sformatujFingUI(fingId));
    } catch (error) {
      console.error("❌ ERROR VYMAZANIA:", error);
    }
  };

  const openLink = (url) => {
    if (!url) return;
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(cleanUrl).catch(() => console.warn("Nedá sa otvoriť URL"));
  };

  const handlePressItem = (id) => {
    const cleanId = sformatujFingUI(id);
    setExpandedContactId(expandedContactId === cleanId ? null : cleanId);
  };

  const handleOpenSignalGate = (item) => {
    const cleanFing = sformatujFingUI(item.fing);
    if (typeof markAsRead === 'function') markAsRead(cleanFing); 
    navigation.navigate('Signal', { target: item, fallbackFing: cleanFing });
  };

  // --- 🧼 UNIFIKOVANÝ RENDERER ---
  const renderItem = ({ item }) => {
    const cleanFing = sformatujFingUI(item.fing);
    const isExpanded = expandedContactId === cleanFing;
    const isSyncing = syncingId === cleanFing;
    
    const displayFing = cleanFing || "????";
    const displayMeno = item.meno || displayFing; 
    const displayKat = item.kat || "Partner";

    const farbaBodky = item.dotColor || '#1a1a1a';
    const stavText = item.statusText || 'BEZ KONTRAKTU';
    const ikonaStatusu = item.statusIcon || '👤';

    const rawPopis = item.popis || "";
    const isLongPopis = rawPopis.length > 160;
    const isDescriptionExpanded = !!expandedDescriptions[cleanFing];
    const displayPopis = (isLongPopis && !isDescriptionExpanded) ? `${rawPopis.substring(0, 160)}...` : rawPopis;

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
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.hasEnvelope && <Text style={{ fontSize: 14, marginRight: 4 }}>{item.envelopeIcon || '✉️'}</Text>}
                {!item.temporary && item.pinned ? <Text style={{ fontSize: 20, marginLeft: 6 }}>⭐</Text> : null}
              </View>
            </View>
            <Text numberOfLines={1} style={[G.cardTitleText, { fontSize: 16, marginTop: 10, marginBottom: 5, fontWeight: '300' }]}>{displayMeno}</Text>
            <Text style={[G.statusTextSmall, { opacity: 0.6, marginBottom: 5 }]}>📍 {item.lok || 'V SIETI'}</Text>
          </TouchableOpacity>
          
          {/* OVLÁDACÍ PANEL KARTY */}
          <View style={{ flexDirection: 'row', height: 45, borderWidth: 1, borderColor: '#1a1a1a', borderRadius: 8, marginTop: 10, marginBottom: 5, backgroundColor: 'transparent' }}>
            
            <TouchableOpacity 
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} 
              onPress={() => {
                const txtMsg = item.temporary ? `Odmietnuť žiadosť od ${displayMeno}?` : `Vymazať identitu [ ${displayMeno.toUpperCase()} ]?`;
                if (Platform.OS === 'web') {
                  if (window.confirm(txtMsg)) handleDeleteContact(displayFing);
                } else {
                  Alert.alert("POTVRDENIE", txtMsg, [
                    { text: "Zrušiť", style: "cancel" },
                    { text: "Potvrdiť", style: "destructive", onPress: () => handleDeleteContact(displayFing) }
                  ]);
                }
              }} 
              activeOpacity={0.5}
            >         
              <Text style={{ color: '#E74C3C', fontSize: 18, fontWeight: 'bold' }}>🗑️</Text>
            </TouchableOpacity>

            {/* 🔓 MODRÁ ŠÍPKA ODOMKNUTÁ PRE VŠETKY STAVY */}
            <TouchableOpacity 
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#1a1a1a' }} 
              onPress={() => handleSync(item)} 
              activeOpacity={0.5}
            >
              {isSyncing ? <ActivityIndicator size="small" color="#0FF" /> : <Text style={{ color: '#0FF', fontSize: 25, fontWeight: 'bold' }}>↻</Text>}
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <TouchableOpacity 
                style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#1a1a1a', backgroundColor: item.hasEnvelope ? 'rgba(231, 76, 60, 0.1)' : 'transparent' }} 
                onPress={() => handleOpenSignalGate(item)} 
                activeOpacity={0.5}
              >
                <Text style={{ color: item.hasEnvelope ? '#E74C3C' : (ACCENT || '#c5a059'), fontSize: 18 }}>💬</Text>
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

          {/* TEXTY A META-DATA */}
          <View style={{ width: '100%' }}>
            <View style={G.divider} />
            {rawPopis ? (
              <View>
                <Text style={[G.cardDescriptionText, item.temporary && { fontStyle: 'italic', opacity: 0.7 }]}>
                  {displayPopis}
                </Text>
                {isLongPopis && (
                  <TouchableOpacity onPress={() => toggleDescriptionExpand(cleanFing)} style={{ marginTop: 6 }} activeOpacity={0.6}>
                    <Text style={{ color: (ACCENT || '#c5a059'), fontSize: 11, fontWeight: 'bold' }}>
                      {isDescriptionExpanded ? "[ MENEJ ]" : "[ ČÍTAŤ VIAC ]"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}

            <TouchableOpacity onPress={() => handlePressItem(displayFing)} activeOpacity={0.8}>
              <Text style={[G.monoIdentity, { fontSize: 8, color: '#333', marginTop: 10, marginBottom: 5 }]}>
                ID: {displayFing.toUpperCase()} | STAV: {stavText.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>

          {!item.temporary && (
            <View style={{ marginTop: 5 }}>
              <View style={G.actionRow}>
                {item.fb ? <TouchableOpacity style={G.miniBtn} onPress={() => openLink(item.fb)}><Text style={G.statusTextSmall}>{labels.facebook || "FB"}</Text></TouchableOpacity> : null}
                {item.tg ? <TouchableOpacity style={G.miniBtn} onPress={() => openLink(item.tg)}><Text style={G.statusTextSmall}>{labels.telegram || "TG"}</Text></TouchableOpacity> : null}
                {item.gal ? <TouchableOpacity style={[G.miniBtn, { borderColor: (ACCENT || '#c5a059') }]} onPress={() => openLink(item.gal)}><Text style={[G.statusTextSmall, { color: (ACCENT || '#c5a059') }]}>{labels.gallery || "GALÉRIA"}</Text></TouchableOpacity> : null}
              </View>
              <View style={G.actionRow}>
                {item.tel ? <TouchableOpacity style={G.miniBtn} onPress={() => Linking.openURL(`tel:${item.tel.replace(/\s/g, '')}`)}><Text style={G.statusTextSmall}>{labels.call || "VOLAŤ"}</Text></TouchableOpacity> : null}
                {item.email ? <TouchableOpacity style={G.miniBtn} onPress={() => Linking.openURL(`mailto:${item.email}`)}><Text style={G.statusTextSmall}>{labels.email || "EMAIL"}</Text></TouchableOpacity> : null}
              </View>
            </View>
          )}
        </View>
      );
    }

    // COMPACT RIADOK
    return (
      <TouchableOpacity style={[G.card, { flexDirection: 'row', alignItems: 'center', borderColor: item.temporary ? '#E74C3C' : item.pinned ? (ACCENT || '#c5a059') : '#1a1a1a', backgroundColor: item.temporary ? 'rgba(231, 76, 60, 0.02)' : item.pinned ? 'rgba(197, 160, 89, 0.05)' : '#050505', width: '100%' }]} onPress={() => handlePressItem(displayFing)} activeOpacity={0.7}>
        <View style={{ width: 44, height: 44, backgroundColor: '#000', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: item.temporary ? '#E74C3C' : item.pinned ? (ACCENT || '#c5a059') : '#333' }}>
          <Text style={{ fontSize: 18 }}>{ikonaStatusu}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={[G.cardTitleText, { fontSize: 14, letterSpacing: 1, color: item.temporary ? '#E74C3C' : '#FFF' }]}>
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
          keyExtractor={(item) => sformatujFingUI(item.fing)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }} 
          onScroll={(event) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            setShowBackToTop(offsetY > 300);
          }}
          scrollEventThrottle={32}

          ListHeaderComponent={
            <View style={{ marginBottom: 15, marginTop: 10 }}>
              <View style={{ alignItems: 'center', marginBottom: 15 }}>
                <Text style={G.atelierTitle}>{txt.title || "Kontakty"}</Text>
                
                <TextInput 
                  style={[G.vaultInput, { width: '100%', marginTop: 10 }]} 
                  placeholder={txt.search_placeholder || "HĽADAŤ..."} 
                  placeholderTextColor="#444" 
                  value={search} 
                  onChangeText={setSearch} 
                />
                <TouchableOpacity style={[G.primaryBtn, { marginTop: 10, width: '100%' }]} onPress={() => navigation.navigate('Scanner')} activeOpacity={0.7}>
                  <Text style={G.primaryBtnText}>{txt.btn_add_seal || "+ PRIJAŤ NOVÚ PEČAŤ"}</Text>
                </TouchableOpacity>
              </View>

              {/* 📡 RECEPCIA (Odomknutá pre bezchybné stiahnutie vizitiek) */}
              {unknownContacts && unknownContacts.length > 0 && (
                <View style={{ marginBottom: 20, marginTop: 10 }}>
                  <Text style={[G.statusTextSmall, { color: '#E74C3C', letterSpacing: 2, marginBottom: 10, fontWeight: 'bold' }]}>
                    📡 RECEPCIA ({unknownContacts.length})
                  </Text>
                  {unknownContacts.map(item => (
                    <View key={sformatujFingUI(item.fing)} style={{ marginBottom: 8 }}>
                      {renderItem({ item: { ...item, temporary: true } })}
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