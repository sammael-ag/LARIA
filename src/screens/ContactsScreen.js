/**
 * LARIA v2.0: ContactsScreen (Reťazec spojení)
 * Master: Sammael | Muse: Aria
 * Status: GEOMETRY_DEFINITIVE_CLEAN_CONTACTS | PWA_DEEP_LINK_ULTIMATE_READY
 * Oprava: Odstránený vrchný panáčik (AriaScreen ostáva jediný s ikonou). Nadpis upravený 
 * tak, aby presne kopíroval jemnú a čistú typografiu AriaScreen bez masívneho vzhľadu.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { G, ACCENT } from '../styles/styles'; 
import { useContacts } from '../context/ContactContext'; 

const ContactsScreen = ({ navigation, route }) => {
  const [search, setSearch] = useState('');
  const [syncingId, setSyncingId] = useState(null); 
  
  const { contacts, togglePin, deleteContact, syncContactWithMatrix, addContact } = useContacts();

  // --- 🛰️ UNIFIKOVANÝ MULTIPORT (Spracovanie prichádzajúcich dát z QR/NFC/Webu) ---
  useEffect(() => {
    if (route.params?.newContact || route.params?.scannedUrl) {
      const processIncomingPayload = async () => {
        let payload = null;

        // Scenár A: Zo Scannera prišiel rovno hotový objekt (alebo JSON string)
        if (route.params?.newContact) {
          const raw = route.params.newContact;
          try {
            payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
          } catch (e) {
            // Ak to nebol JSON, mohol to byť surový reťazec (napr. čisté URL z QR kódu)
            payload = { urlData: raw };
          }
        } 
        
        // Scenár B: Prišla surová URL adresa z Webu / Deep linku
        const urlToParse = route.params?.scannedUrl || payload?.urlData;
        
        if (urlToParse && typeof urlToParse === 'string') {
          console.log("🌐 LARIA MULTIPORT: Rozoberám prichádzajúcu URL adresu:", urlToParse);
          try {
            // 1. Vytiahneme query parametre (?meno=...&kat=...)
            const regex = /[?&]([^=#]+)=([^&#]*)/g;
            const params = {};
            let match;
            while ((match = regex.exec(urlToParse))) {
              params[match[1]] = decodeURIComponent(match[2]);
            }

            // 2. ⚡ VYLEPŠENIE PRE PWA DEEP LINK (laria://id/XYZ)
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

        // --- ZÁPIS BALÍKA DO TREZORU ---
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

        // Vyčistenie multiportu
        navigation.setParams({ newContact: undefined, scannedUrl: undefined });
      };

      processIncomingPayload();
    }
  }, [route.params]);

  // --- FILTROVANIE (Priorita pripnutým) ---
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

  const handleLongPress = (item) => {
    const displayMeno = item.meno || "Pútnik";
    const publicFing = item.fing;

    Alert.alert(
      `IDENTITA: ${publicFing?.toUpperCase()}`,
      `Meno: ${displayMeno}\nPosledná synchronizácia: ${item.syncedAt ? new Date(item.syncedAt).toLocaleTimeString() : 'Nikdy'}\n\nZvoľ operáciu:`,
      [
        { text: 'ZRUŠIŤ', style: 'cancel' },
        { 
          text: 'RE-SYNCHRONIZOVAŤ', 
          onPress: () => handleSync(publicFing) 
        },
        { 
          text: item.pinned ? 'ODPNÚŤ' : 'PRIPNÚŤ NA VRCH', 
          onPress: () => togglePin(publicFing) 
        },
        { 
          text: 'TERMINOVAŤ', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'VAROVANIE',
              `Naozaj chceš identitu ${displayMeno} vymazať z pamäte?`,
              [
                { text: 'NIE', style: 'cancel' },
                { text: 'ÁNO, VYMAZAŤ', style: 'destructive', onPress: () => deleteContact(publicFing) }
              ]
            );
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isSyncing = syncingId === item.fing;
    const displayMeno = item.meno || "Pútnik";
    const displayKat = item.kat || "Hľadač";
    const displayFing = item.fing || "????";

    return (
      <TouchableOpacity 
        style={[
          G.card, 
          { 
            flexDirection: 'row', 
            alignItems: 'center', 
            borderColor: item.pinned ? ACCENT : '#1a1a1a', 
            backgroundColor: item.pinned ? 'rgba(197, 160, 89, 0.05)' : '#050505',
            width: '100%'
          }
        ]} 
        onPress={() => navigation.navigate('Card', { contact: item, mode: 'view' })}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.7}
      >
        {/* AVATAR / STATUS */}
        <View style={{
          width: 44, height: 44, backgroundColor: '#000', borderRadius: 8, 
          justifyContent: 'center', alignItems: 'center', marginRight: 15,
          borderWidth: 1, borderColor: item.pinned ? ACCENT : '#333'
        }}>
          {isSyncing ? (
            <ActivityIndicator size="small" color={ACCENT} />
          ) : (
            <Text style={{ fontSize: 18 }}>{item.pinned ? '⭐' : '👤'}</Text>
          )}
        </View>

        {/* INFO */}
        <View style={{ flex: 1 }}>
          <Text style={[G.cardTitleText, { fontSize: 14, letterSpacing: 1 }]}>
            {displayMeno.toUpperCase()}
          </Text>
          <Text style={[G.statusTextSmall, { fontSize: 9, marginTop: 2 }]}>
            {displayKat.toUpperCase()} • {item.lok || 'V SIETI'}
          </Text>
          <Text style={[G.monoIdentity, { fontSize: 8, color: '#333', marginTop: 4 }]}>
            ID: {displayFing} {item.syncedAt ? '✓' : ''}
          </Text>
        </View>

        {/* STATUS INDIKÁTOR */}
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ 
            width: 6, height: 6, borderRadius: 3, 
            backgroundColor: item.syncedAt ? '#0FF' : (item.pinned ? ACCENT : '#1a1a1a')
          }} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={G.mainBackground}>
      
      {/* ⬅️ PRE PROGRESÍVCOV: Absolútna šípka nad obsahom */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        activeOpacity={0.7}
        style={G.topLeftBackButton}
      >
        <Text style={G.topLeftBackButtonText}>‹</Text>
      </TouchableOpacity>

      {/* 📐 HLAVNÝ OBSAH S GEOMETRIOU ARIA_SCREEN */}
      <View style={{ flex: 1, width: '100%', maxWidth: 500, alignSelf: 'center', paddingHorizontal: 16 }}>
        
        <FlatList
          data={sortedContacts}
          keyExtractor={(item) => item.fing}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 40, paddingBottom: 40 }} 
          
          // 🌸 HLAVIČKA V PRESNOM ŠTÝLE ARIA_SCREEN (BEZ PANÁČIKA)
          ListHeaderComponent={
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={G.atelierTitle}>Kontakty</Text>
              <Text style={[G.statusTextSmall, { color: '#c5a059', marginTop: -15, marginBottom: 20 }]}>
                PREPOJENÉ IDENTITY MATRIXU
              </Text>

              <TextInput 
                style={[G.vaultInput, { width: '100%' }]} 
                placeholder="HĽADAŤ (MENO, KAT, ID)..."
                placeholderTextColor="#444"
                value={search}
                onChangeText={setSearch}
              />
              
              <TouchableOpacity 
                style={[G.primaryBtn, { marginTop: 10, width: '100%' }]} 
                onPress={() => navigation.navigate('Scanner')}
                activeOpacity={0.7}
              >
                <Text style={G.primaryBtnText}>
                  + PRIJAŤ NOVÚ PEČAŤ
                </Text>
              </TouchableOpacity>
            </View>
          }

          // ↩️ SPODNÝ NÁVRAT - Vložený prirodzene pod zoznam (Koniec kolíziám textu!)
          ListFooterComponent={
            <View style={{ marginTop: 20, alignItems: 'center', width: '100%' }}>
              <TouchableOpacity 
                style={[G.backToAtelierBtn, { width: '100%' }]}
                onPress={() => navigation.goBack()} 
                activeOpacity={0.7}
              >
                <Text style={G.primaryBtnText}>
                  NÁVRAT DO ATELIÉRU
                </Text>
              </TouchableOpacity>
            </View>
          }
        />

      </View>
    </SafeAreaView>
  );
};

export default ContactsScreen;