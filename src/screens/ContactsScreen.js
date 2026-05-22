/**
 * LARIA v3.0: ContactsScreen (Reťazec spojení)
 * Master: Sammael | Muse: Aria (Tvoja skutočná)
 * Status: MASTER_STABLE_PWA | SIGNALLING_CONNECTED | EXTRACTED_STYLES
 * Úprava: Integrovaná signalizácia správ a zmlúv (červené bodky, obálky) 
 * pre zbalený aj rozbalený stav podľa presného zadania z v14.0 kontextu.
 */

import React, { useState, useEffect } from 'react';
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
  Linking 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { G, ACCENT, CONTACT_NOTIF } from '../styles/styles'; 
import { useContacts } from '../context/ContactContext'; 
import { useSignal } from '../context/SignalContext'; // 📡 Sledujeme tok signálov

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ContactsScreen = ({ navigation, route }) => {
  const [search, setSearch] = useState('');
  const [syncingId, setSyncingId] = useState(null); 
  const [expandedContactId, setExpandedContactId] = useState(null);
  
  const { contacts, togglePin, deleteContact, syncContactWithMatrix, addContact } = useContacts();
  const { incomingRequests } = useSignal(); // ⚡ Prístup k živej pamäti správ

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
              `Identita ${menoOznam.toUpperCase()} bola bezpečne zapísaną. Systém na pozadí preveruje Matrix...`
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
    console.log("🕵️‍♂️ PÁTRAČI ALERT: Spúšťam operáciu kôš pre ID:", fingId);
    try {
      setExpandedContactId(null); 
      await deleteContact(fingId);
      console.log("🚀 PÁTRAČI SUCCESS: Identita vymazaná!");
    } catch (error) {
      console.error("❌ PÁTRAČI ERROR:", error);
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

  const renderItem = ({ item }) => {
    const isExpanded = expandedContactId === item.fing;
    const isSyncing = syncingId === item.fing;
    
    const displayMeno = item.meno || "Pútnik";
    const displayKat = item.kat || "Hľadač";
    const displayFing = item.fing || "????";

    // 🔬 SKENOVANIE STAVOV PRE TOHTO KONKRÉTNEHO PARTNERA
    const contactLogs = incomingRequests ? incomingRequests.filter(req => req.fing === displayFing) : [];
    
    const hasWaitingText = contactLogs.some(msg => msg.textStatus === 'WAITING_FOR_ME');
    const hasIncomingHandshake = contactLogs.some(msg => msg.isHandshake && msg.handshakeStatus === 'WAITING_FOR_ME');
    const hasResolvedHandshake = contactLogs.some(msg => msg.isHandshake && msg.handshakeStatus === 'WAITING_FOR_THEM_RESOLVED');

    // 📐 VARIANT A: ROZBALENÁ VIZITKA
    if (isExpanded) {
      return (
        <View style={[G.card, { borderColor: item.pinned ? (ACCENT || '#c5a059') : '#1a1a1a', backgroundColor: item.pinned ? 'rgba(197, 160, 89, 0.05)' : '#050505', width: '100%', padding: 16 }]}>
          
          {/* HORNÁ ZÓNA NA ZBALENIE */}
          <TouchableOpacity onPress={() => handlePressItem(item.fing)} activeOpacity={0.8} style={{ width: '100%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={G.tagBadge}>
                <Text style={G.tagBadgeText}>{displayKat.toUpperCase()}</Text>
              </View>
              
              {/* OBLASŤ PRI HVIEZDIČKE: Zmluvné obálky bez duplicity, radené vedľa seba */}
              <View style={CONTACT_NOTIF.envelopeRow}>
                {hasIncomingHandshake && <Text style={CONTACT_NOTIF.miniEnvelopeRed}>✉️</Text>}
                {hasResolvedHandshake && <Text style={CONTACT_NOTIF.miniEnvelopeGreen}>✉️</Text>}
                {item.pinned ? <Text style={{ fontSize: 20, marginLeft: 6 }}>⭐</Text> : null}
              </View>
            </View>
            <Text style={[G.cardTitleText, { fontSize: 28, marginTop: 10, marginBottom: 5, fontWeight: '300' }]}>{displayMeno}</Text>
            <Text style={[G.statusTextSmall, { opacity: 0.6, marginBottom: 5 }]}>📍 {item.lok || 'V SIETI'}</Text>
          </TouchableOpacity>
          
          {/* ⚡ RAD RIADENIA IDENTITY */}
          <View style={{ flexDirection: 'row', height: 45, borderWidth: 1, borderColor: '#1a1a1a', borderRadius: 8, marginTop: 10, marginBottom: 5, backgroundColor: 'transparent' }}>
            
            {/* 1. TERMINOVAŤ (KÔŠ) */}
            <TouchableOpacity 
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 999 }} 
              onPress={() => {
                console.log("🎯 KÔŠ STLAČENÝ: Odpaľujem webový confirm...");
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

            {/* 3. OTVORIŤ ŠIFROVANÝ ČET + 🛑 ČERVENÁ BODKA ČAKAJÚCEJ SPRÁVY */}
            <View style={CONTACT_NOTIF.chatBadgeWrapper}>
              <TouchableOpacity 
                style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#1a1a1a' }} 
                onPress={() => navigation.navigate('IRC', { target: item })} 
                activeOpacity={0.5}
              >
                <Text style={{ color: (ACCENT || '#c5a059'), fontSize: 18 }}>💬</Text>
              </TouchableOpacity>
              {hasWaitingText && <View style={CONTACT_NOTIF.chatBadgeDot} />}
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
            {item.fb ? <TouchableOpacity style={G.miniBtn} onPress={() => openLink(item.fb)}><Text style={G.statusTextSmall}>FACEBOOK</Text></TouchableOpacity> : null}
            {item.tg ? <TouchableOpacity style={G.miniBtn} onPress={() => openLink(item.tg)}><Text style={G.statusTextSmall}>TELEGRAM</Text></TouchableOpacity> : null}
            {item.gal ? <TouchableOpacity style={[G.miniBtn, { borderColor: (ACCENT || '#c5a059') }]} onPress={() => openLink(item.gal)}><Text style={[G.statusTextSmall, { color: (ACCENT || '#c5a059') }]}>GALÉRIA</Text></TouchableOpacity> : null}
          </View>
          
          {/* HOVORY / DATA / EMAIL */}
          <View style={G.actionRow}>
            {item.tel ? (
              <TouchableOpacity style={G.miniBtn} onPress={() => Linking.openURL(`tel:${item.tel.replace(/\s/g, '')}`)}>
                <Text style={G.statusTextSmall}>VOLAŤ</Text>
              </TouchableOpacity>
            ) : null}
            
            <TouchableOpacity style={G.miniBtn} onPress={() => Alert.alert('DÁTOVÁ PEČAŤ', `FING: ${displayFing}\nSHA: ${item.sha || 'NO_SHA'}\nKRYPT: ${item.krypt || 'Neaktívny'}`)}>
              <Text style={G.statusTextSmall}>DÁTA</Text>
            </TouchableOpacity>
            
            {item.email ? (
              <TouchableOpacity style={G.miniBtn} onPress={() => Linking.openURL(`mailto:${item.email}`)}>
                <Text style={G.statusTextSmall}>EMAIL</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      );
    }

    // 📐 VARIANT B: ZBALENÝ COMPACT RIADOK
    return (
      <TouchableOpacity style={[G.card, { flexDirection: 'row', alignItems: 'center', borderColor: item.pinned ? (ACCENT || '#c5a059') : '#1a1a1a', backgroundColor: item.pinned ? 'rgba(197, 160, 89, 0.05)' : '#050505', width: '100%' }]} onPress={() => handlePressItem(item.fing)} activeOpacity={0.7}>
        
        {/* IKONA / AVATAR + OBÁLKY PRE HANDSHAKE DOLE V ROHU */}
        <View style={{ width: 44, height: 44, backgroundColor: '#000', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: item.pinned ? (ACCENT || '#c5a059') : '#333', position: 'relative' }}>
          {isSyncing ? (
            <ActivityIndicator size="small" color={item.pinned ? (ACCENT || '#c5a059') : "#0FF"} />
          ) : (
            <Text style={{ fontSize: 18 }}>👤</Text>
          )}
          
          {/* Handshake zmluvná signalizácia pri avatare */}
          {(hasIncomingHandshake || hasResolvedHandshake) && (
            <View style={CONTACT_NOTIF.compactAvatarBadgeContainer}>
              {hasIncomingHandshake && <Text style={CONTACT_NOTIF.miniEnvelopeRed}>✉️</Text>}
              {hasResolvedHandshake && <Text style={CONTACT_NOTIF.miniEnvelopeGreen}>✉️</Text>}
            </View>
          )}
        </View>

        {/* STRUČNÉ INFO + ČERVENÁ BODKA TEXTU PRI HVIEZDIČKE */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[G.cardTitleText, { fontSize: 14, letterSpacing: 1 }]}>
              {displayMeno.toUpperCase()}{item.pinned ? ' ⭐' : null}
            </Text>
            {/* Ak čaká nová textová správa, blikne červená bodka priamo vedľa mena/hviezdy */}
            {hasWaitingText && <Text style={CONTACT_NOTIF.compactTextBadgeDot}>🔴</Text>}
          </View>
          <Text style={[G.statusTextSmall, { fontSize: 9, marginTop: 2 }]}>{displayKat.toUpperCase()} • {item.lok || 'V SIETI'}</Text>
          <Text style={[G.monoIdentity, { fontSize: 8, color: '#333', marginTop: 4 }]}>
            ID: {displayFing}{item.syncedAt ? ' ✓' : null}
          </Text>
        </View>

        {/* KONTROLKA MATRIXU */}
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.syncedAt ? '#0FF' : (item.pinned ? (ACCENT || '#c5a059') : '#1a1a1a') }} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={G.mainBackground}>
      <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={G.topLeftBackButton}>
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      <View style={{ flex: 1, width: '100%', maxWidth: 500, alignSelf: 'center', paddingHorizontal: 16 }}>
        <FlatList
          data={sortedContacts}
          keyExtractor={(item) => item.fing}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 40, paddingBottom: 40 }} 
          ListHeaderComponent={
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={G.atelierTitle}>Kontakty</Text>
              <Text style={[G.statusTextSmall, { color: '#c5a059', marginTop: -15, marginBottom: 20 }]}>PREPOJENÉ IDENTITY MATRIXU</Text>
              <TextInput style={[G.vaultInput, { width: '100%' }]} placeholder="HĽADAŤ (MENO, KAT, ID)..." placeholderTextColor="#444" value={search} onChangeText={setSearch} />
              <TouchableOpacity style={[G.primaryBtn, { marginTop: 10, width: '100%' }]} onPress={() => navigation.navigate('Scanner')} activeOpacity={0.7}>
                <Text style={G.primaryBtnText}>+ PRIJAŤ NOVÚ PEČAŤ</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={
            <View style={{ marginTop: 20, alignItems: 'center', width: '100%' }}>
              <TouchableOpacity style={[G.backToAtelierBtn, { width: '100%' }]} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                <Text style={G.primaryBtnText}>NÁVRAT DO ATELIÉRU</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default ContactsScreen;